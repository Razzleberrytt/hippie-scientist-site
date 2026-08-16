#!/usr/bin/env node
/**
 * AI opportunity priority queue.
 *
 * This is deliberately NOT another scientific evidence score. It joins the
 * canonical AI citation-readiness report with observed citation/source-gap and
 * search-demand reports to decide which existing canonical pages deserve work
 * first. Missing inputs simply reduce the available prioritization signals.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { REPORTS_DIR, ROOT } from '../lib/profile-corpus.mjs'

const READINESS_PATH = path.join(ROOT, 'reports', 'ai-citation-readiness.json')
const CITATIONS_PATH = path.join(REPORTS_DIR, 'ai-citations.json')
const SOURCE_GAPS_PATH = path.join(REPORTS_DIR, 'ai-source-gaps.json')
const SEARCH_PATH = path.join(REPORTS_DIR, 'search-opportunities.json')
const JSON_PATH = path.join(REPORTS_DIR, 'ai-opportunity-priority.json')
const MD_PATH = path.join(REPORTS_DIR, 'ai-opportunity-priority.md')
const OWN_HOST = 'thehippiescientist.net'

function readJson(file) {
  if (!existsSync(file)) return null
  try { return JSON.parse(readFileSync(file, 'utf8')) }
  catch { return null }
}

function canonicalPath(value) {
  if (!value) return ''
  try {
    const url = value.startsWith('http') ? new URL(value) : new URL(value, `https://${OWN_HOST}`)
    let pathname = url.pathname || '/'
    if (pathname !== '/' && !pathname.endsWith('/')) pathname += '/'
    return pathname
  } catch {
    return ''
  }
}

function pathFromReadiness(row) {
  if (row.researchUrl) return canonicalPath(row.researchUrl)
  if (row.kind === 'herb') return `/herbs/${row.slug}/`
  if (row.kind === 'compound') return `/compounds/${row.slug}/`
  return ''
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value))
}

function logScale(value, cap) {
  if (!value || value <= 0) return 0
  return clamp(Math.log10(value + 1) / Math.log10(cap + 1), 0, 1)
}

function buildSearchMap(report) {
  const map = new Map()
  for (const row of report?.pages || []) {
    const key = canonicalPath(row.url || row.page || row.path)
    if (!key) continue
    map.set(key, {
      clicks: Number(row.clicks || 0),
      impressions: Number(row.impressions || 0),
      position: Number(row.position || row.avgPosition || 0) || null,
      opportunityScore: Number(row.opportunityScore || row.score || 0),
    })
  }
  return map
}

function buildCitationMap(report) {
  const map = new Map()
  for (const row of report?.urls || report?.topCited || []) {
    const key = canonicalPath(row.url)
    if (!key) continue
    map.set(key, {
      citations: Number(row.citations || 0),
      delta: row.delta == null ? null : Number(row.delta),
      clicks: Number(row.clicks || 0),
      topQueries: Array.isArray(row.topQueries) ? row.topQueries : [],
    })
  }
  return map
}

function buildSourceGapMap(report) {
  const map = new Map()
  for (const topic of report?.improvementQueue || []) {
    for (const target of topic.mappedTargetUrls || []) {
      const key = canonicalPath(target)
      if (!key) continue
      const current = map.get(key) || {
        pressure: 0,
        competitorCitations: 0,
        questions: 0,
        topics: [],
        missingFacts: new Set(),
        structureGaps: new Set(),
      }
      current.pressure = Math.max(current.pressure, Number(topic.priorityScore || 0))
      current.competitorCitations += Number(topic.competitorCitations || 0)
      current.questions += Number(topic.questions || 0)
      current.topics.push(topic.topic)
      for (const value of topic.missingFacts || []) current.missingFacts.add(value)
      for (const value of topic.structureGaps || []) current.structureGaps.add(value)
      map.set(key, current)
    }
  }
  return map
}

function reasonList({ readiness, citations, sourceGap, search }) {
  const reasons = []
  if (readiness && readiness.score < 50) reasons.push('high-priority citation-readiness repair')
  else if (readiness && readiness.score < 70) reasons.push('citation-readiness repair')
  if (readiness?.contradiction) reasons.push('contradictory extractable claims')
  if (readiness?.gaps?.some((gap) => /unsupported|dangling source/i.test(gap))) reasons.push('claim/source integrity gap')
  if (readiness?.gaps?.some((gap) => /over-dependent|one study|single-study/i.test(gap))) reasons.push('study-dependence gap')
  if (readiness?.gaps?.some((gap) => /narrative-review/i.test(gap))) reasons.push('narrative-review dominance')
  if (sourceGap?.competitorCitations > 0) reasons.push('competitors are winning AI citations')
  if (sourceGap?.pressure >= 50) reasons.push('high observed source-gap pressure')
  if (citations?.citations > 0) reasons.push('already cited by AI')
  if (citations?.delta > 0) reasons.push('AI citations rising')
  if (citations?.delta < 0) reasons.push('AI citations falling')
  if (search?.impressions >= 100) reasons.push('meaningful organic search demand')
  if (search?.opportunityScore >= 50) reasons.push('high Search Console opportunity')
  return reasons
}

function main() {
  const readiness = readJson(READINESS_PATH)
  const citations = readJson(CITATIONS_PATH)
  const sourceGaps = readJson(SOURCE_GAPS_PATH)
  const search = readJson(SEARCH_PATH)

  const inputStatus = {
    citationReadiness: Boolean(readiness),
    aiCitations: Boolean(citations),
    aiSourceGaps: Boolean(sourceGaps),
    searchOpportunities: Boolean(search),
  }

  if (!readiness) {
    console.log('[ai-opportunity-priority] citation-readiness report missing; run npx tsx scripts/ci/audit-ai-citation-topology.ts first')
  }

  const searchMap = buildSearchMap(search)
  const citationMap = buildCitationMap(citations)
  const sourceGapMap = buildSourceGapMap(sourceGaps)
  const candidates = new Map()

  for (const row of readiness?.profiles || []) {
    const key = pathFromReadiness(row)
    if (key) candidates.set(key, { path: key, readiness: row })
  }
  for (const key of citationMap.keys()) if (!candidates.has(key)) candidates.set(key, { path: key, readiness: null })
  for (const key of sourceGapMap.keys()) if (!candidates.has(key)) candidates.set(key, { path: key, readiness: null })
  for (const key of searchMap.keys()) if (!candidates.has(key)) candidates.set(key, { path: key, readiness: null })

  const rows = [...candidates.values()].map((candidate) => {
    const citation = citationMap.get(candidate.path) || null
    const sourceGapRaw = sourceGapMap.get(candidate.path) || null
    const sourceGap = sourceGapRaw ? {
      pressure: sourceGapRaw.pressure,
      competitorCitations: sourceGapRaw.competitorCitations,
      questions: sourceGapRaw.questions,
      topics: [...new Set(sourceGapRaw.topics)],
      missingFacts: [...sourceGapRaw.missingFacts],
      structureGaps: [...sourceGapRaw.structureGaps],
    } : null
    const organic = searchMap.get(candidate.path) || null

    const readinessDeficit = candidate.readiness ? (100 - candidate.readiness.score) / 100 : 0
    const competitorPressure = sourceGap ? clamp(sourceGap.pressure / 100, 0, 1) : 0
    const citationDemand = citation ? logScale(citation.citations, 1000) : 0
    const citationMomentum = citation?.delta == null ? 0 : clamp(Math.abs(citation.delta) / 50, 0, 1)
    const organicDemand = organic ? Math.max(logScale(organic.impressions, 100000), clamp(organic.opportunityScore / 100, 0, 1)) : 0
    const integrityBoost = candidate.readiness?.contradiction ? 0.2 : candidate.readiness?.gaps?.some((gap) => /unsupported|dangling source/i.test(gap)) ? 0.12 : 0

    // ROI triage only. Scientific validity still comes from the canonical research pipeline.
    const priorityScore = Math.round(clamp((
      readinessDeficit * 35 +
      competitorPressure * 25 +
      citationDemand * 15 +
      citationMomentum * 5 +
      organicDemand * 20 +
      integrityBoost * 100
    ), 0, 100))

    return {
      path: candidate.path,
      priorityScore,
      readinessScore: candidate.readiness?.score ?? null,
      readinessGaps: candidate.readiness?.gaps || [],
      aiCitations: citation?.citations ?? 0,
      citationDelta: citation?.delta ?? null,
      competitorCitations: sourceGap?.competitorCitations ?? 0,
      sourceGapPressure: sourceGap?.pressure ?? 0,
      sourceGapTopics: sourceGap?.topics ?? [],
      missingFactsToVerify: sourceGap?.missingFacts ?? [],
      structureGaps: sourceGap?.structureGaps ?? [],
      searchImpressions: organic?.impressions ?? null,
      searchClicks: organic?.clicks ?? null,
      searchOpportunityScore: organic?.opportunityScore ?? null,
      reasons: reasonList({ readiness: candidate.readiness, citations: citation, sourceGap, search: organic }),
    }
  })
    .filter((row) => row.priorityScore > 0)
    .sort((a, b) => b.priorityScore - a.priorityScore || a.path.localeCompare(b.path))

  const report = {
    generatedAt: new Date().toISOString(),
    purpose: 'ROI prioritization over canonical research/AI readiness and observed demand; not an evidence grade',
    inputStatus,
    summary: {
      candidates: rows.length,
      priority80Plus: rows.filter((row) => row.priorityScore >= 80).length,
      priority60Plus: rows.filter((row) => row.priorityScore >= 60).length,
      withObservedCompetitorPressure: rows.filter((row) => row.competitorCitations > 0).length,
      withAiCitations: rows.filter((row) => row.aiCitations > 0).length,
      withSearchDemand: rows.filter((row) => (row.searchImpressions || 0) > 0).length,
    },
    queue: rows,
  }

  mkdirSync(REPORTS_DIR, { recursive: true })
  writeFileSync(JSON_PATH, `${JSON.stringify(report, null, 2)}\n`)
  writeFileSync(MD_PATH, renderMarkdown(report))
  console.log(`[ai-opportunity-priority] candidates=${report.summary.candidates} priority>=80=${report.summary.priority80Plus} priority>=60=${report.summary.priority60Plus}`)
  console.log(`[ai-opportunity-priority] inputs=${Object.entries(inputStatus).filter(([, value]) => value).map(([key]) => key).join(', ') || 'none'}`)
  console.log(`[ai-opportunity-priority] report=${path.relative(ROOT, JSON_PATH)}`)
}

function renderMarkdown(report) {
  const lines = [
    '# AI SEO opportunity priority', '',
    '> ROI prioritization only. Scientific evidence/support decisions remain governed by the canonical research-quality pipeline.', '',
    `Candidates: **${report.summary.candidates}** · priority ≥80: **${report.summary.priority80Plus}** · priority ≥60: **${report.summary.priority60Plus}**.`, '',
    '## Highest-priority existing pages', '',
    '| Priority | Page | Readiness | AI citations | Competitor citations | Search impressions | Why now |',
    '| ---: | --- | ---: | ---: | ---: | ---: | --- |',
  ]
  for (const row of report.queue.slice(0, 100)) {
    lines.push(`| ${row.priorityScore} | \`${row.path}\` | ${row.readinessScore ?? '—'} | ${row.aiCitations} | ${row.competitorCitations} | ${row.searchImpressions ?? '—'} | ${row.reasons.join('; ') || 'combined opportunity signals'} |`)
  }
  lines.push('', '## Operating rule', '', 'Fix correctness/claim-source integrity first. Then improve the existing canonical page that owns the observed intent. Do not create AI-only doorway pages from this queue.', '')
  return `${lines.join('\n')}\n`
}

main()
