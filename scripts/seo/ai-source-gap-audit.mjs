#!/usr/bin/env node
/**
 * Vendor-neutral AI source-gap audit.
 *
 * Observations describe which sources answer engines cite for important queries,
 * which existing THS page should own the intent, and what evidence/structure
 * requires verification or improvement. It never recommends AI-only doorway pages.
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { REPORTS_DIR, ROOT } from '../lib/profile-corpus.mjs'

const argv = process.argv.slice(2)
const flag = (name, fallback) => {
  const hit = argv.find((arg) => arg === `--${name}` || arg.startsWith(`--${name}=`))
  if (!hit) return fallback
  const [, value] = hit.split('=')
  return value === undefined ? true : value
}

const INPUT_DIR = path.resolve(ROOT, String(flag('dir', 'data-sources/ai-source-audits')))
const HISTORY_DIR = path.join(ROOT, 'ops', 'ai-citations', 'source-gap-history')
const JSON_PATH = path.join(REPORTS_DIR, 'ai-source-gaps.json')
const MD_PATH = path.join(REPORTS_DIR, 'ai-source-gaps.md')
const LABEL = String(flag('label', new Date().toISOString().slice(0, 10)))
const OWN_HOST = 'thehippiescientist.net'

function parseCsv(content) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  for (let i = 0; i < content.length; i += 1) {
    const char = content[i]
    if (quoted) {
      if (char === '"') {
        if (content[i + 1] === '"') { field += '"'; i += 1 }
        else quoted = false
      } else field += char
      continue
    }
    if (char === '"') quoted = true
    else if (char === ',') { row.push(field); field = '' }
    else if (char === '\n') { row.push(field); rows.push(row); row = []; field = '' }
    else if (char !== '\r') field += char
  }
  if (field.length || row.length) { row.push(field); rows.push(row) }
  if (rows.length) rows[0][0] = String(rows[0][0] ?? '').replace(/^\uFEFF/, '')
  return rows.filter((candidate) => candidate.some((cell) => String(cell ?? '').trim()))
}

const ALIASES = {
  question: ['question', 'query', 'prompt', 'grounding query'],
  assistant: ['assistant', 'engine', 'platform', 'answer engine'],
  citedUrl: ['cited url', 'cited_url', 'source url', 'source_url', 'citation url', 'url'],
  topic: ['topic', 'theme', 'cluster'],
  targetUrl: ['target url', 'target_url', 'hippie url', 'hippie_url', 'source page', 'page to improve'],
  missingFact: ['missing fact', 'missing_fact', 'fact gap', 'fact_gap', 'content gap', 'content_gap'],
  structureGap: ['structure gap', 'structure_gap', 'information structure gap', 'format gap'],
  notes: ['notes', 'note'],
  observedAt: ['date', 'observed at', 'observed_at'],
}

const clean = (value) => String(value ?? '').replace(/\s+/g, ' ').trim()

function headerMap(header) {
  const normalized = header.map((value) => clean(value).toLowerCase())
  const indexes = {}
  for (const [key, aliases] of Object.entries(ALIASES)) {
    const index = normalized.findIndex((value) => aliases.includes(value))
    if (index >= 0) indexes[key] = index
  }
  return indexes
}

function cell(cells, indexes, key) {
  return indexes[key] === undefined ? '' : clean(cells[indexes[key]])
}

function normalizeUrl(value) {
  const raw = clean(value)
  if (!raw) return ''
  try {
    const url = new URL(raw.startsWith('http') ? raw : `https://${raw.replace(/^\/+/, '')}`)
    url.hash = ''
    url.search = ''
    if (url.hostname === OWN_HOST || url.hostname === `www.${OWN_HOST}`) {
      url.hostname = OWN_HOST
      if (!url.pathname.endsWith('/')) url.pathname += '/'
    }
    return url.toString()
  } catch {
    return raw
  }
}

function domainOf(value) {
  try { return new URL(normalizeUrl(value)).hostname.toLowerCase().replace(/^www\./, '') }
  catch { return '' }
}

function isOwnUrl(value) {
  const domain = domainOf(value)
  return domain === OWN_HOST || domain.endsWith(`.${OWN_HOST}`)
}

const STOPWORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'do', 'does', 'can', 'should', 'for', 'of', 'to',
  'in', 'on', 'with', 'and', 'or', 'what', 'how', 'when', 'why', 'best', 'take',
  'taking', 'use', 'using', 'supplement', 'supplements', 'work', 'better',
])

function inferTopic(question) {
  const tokens = clean(question).toLowerCase().replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/).filter((token) => token.length > 2 && !STOPWORDS.has(token))
  return [...new Set(tokens)].slice(0, 4).join(' ') || 'unclassified'
}

function loadRows() {
  if (!existsSync(INPUT_DIR)) return []
  const rows = []
  for (const file of readdirSync(INPUT_DIR).filter((name) => /\.csv$/i.test(name)).sort()) {
    const parsed = parseCsv(readFileSync(path.join(INPUT_DIR, file), 'utf8'))
    if (parsed.length < 2) continue
    const indexes = headerMap(parsed[0])
    if (indexes.question === undefined || indexes.citedUrl === undefined) continue
    for (const cells of parsed.slice(1)) {
      const question = cell(cells, indexes, 'question')
      const citedUrl = normalizeUrl(cell(cells, indexes, 'citedUrl'))
      if (!question || !citedUrl) continue
      rows.push({
        sourceFile: file,
        question,
        assistant: cell(cells, indexes, 'assistant') || 'unspecified',
        citedUrl,
        citedDomain: domainOf(citedUrl),
        ownCitation: isOwnUrl(citedUrl),
        topic: cell(cells, indexes, 'topic') || inferTopic(question),
        targetUrl: normalizeUrl(cell(cells, indexes, 'targetUrl')),
        missingFact: cell(cells, indexes, 'missingFact'),
        structureGap: cell(cells, indexes, 'structureGap'),
        notes: cell(cells, indexes, 'notes'),
        observedAt: cell(cells, indexes, 'observedAt'),
      })
    }
  }
  return rows
}

function loadPrevious() {
  if (!existsSync(HISTORY_DIR)) return null
  const files = readdirSync(HISTORY_DIR).filter((name) => name.endsWith('.json')).sort()
  const previous = files.at(-1)
  if (!previous) return null
  try { return JSON.parse(readFileSync(path.join(HISTORY_DIR, previous), 'utf8')) }
  catch { return null }
}

function canonicalPath(value) {
  try { return new URL(value).pathname.replace(/\/$/, '') || '/' }
  catch { return '' }
}

function targetExists(value) {
  if (!value || !isOwnUrl(value)) return false
  const pathname = canonicalPath(value)
  if (!pathname || pathname === '/') return true
  const parts = pathname.split('/').filter(Boolean)
  const candidates = [
    path.join(ROOT, 'app', ...parts, 'page.tsx'),
    path.join(ROOT, 'app', ...parts, 'page.mdx'),
  ]
  // Dynamic herb/compound pages are backed by governed data and are valid mappings.
  if (parts[0] === 'herbs' || parts[0] === 'compounds') return parts.length === 2
  return candidates.some(existsSync)
}

function groupQuestions(rows) {
  const groups = new Map()
  for (const row of rows) {
    const key = `${row.assistant.toLowerCase()}|${row.question.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()}`
    const item = groups.get(key) || {
      assistant: row.assistant, question: row.question, topic: row.topic,
      citations: [], targets: new Set(), missingFacts: new Set(), structureGaps: new Set(), ownCited: false,
    }
    item.citations.push({ url: row.citedUrl, domain: row.citedDomain, own: row.ownCitation })
    item.ownCited ||= row.ownCitation
    if (row.targetUrl) item.targets.add(row.targetUrl)
    if (row.missingFact) item.missingFacts.add(row.missingFact)
    if (row.structureGap) item.structureGaps.add(row.structureGap)
    groups.set(key, item)
  }
  return [...groups.values()].map((item) => ({
    ...item,
    targets: [...item.targets],
    missingFacts: [...item.missingFacts],
    structureGaps: [...item.structureGaps],
  }))
}

function buildTopics(questionGroups, previous) {
  const prior = new Map((previous?.topics || []).map((topic) => [topic.topic, topic]))
  const map = new Map()
  for (const group of questionGroups) {
    const item = map.get(group.topic) || {
      topic: group.topic, questions: 0, ownCitedQuestions: 0, competitorCitations: 0,
      targets: new Set(), missingFacts: new Set(), structureGaps: new Set(), competitorDomains: new Map(),
    }
    item.questions += 1
    if (group.ownCited) item.ownCitedQuestions += 1
    group.targets.forEach((value) => item.targets.add(value))
    group.missingFacts.forEach((value) => item.missingFacts.add(value))
    group.structureGaps.forEach((value) => item.structureGaps.add(value))
    for (const citation of group.citations) {
      if (!citation.own && citation.domain) {
        item.competitorCitations += 1
        item.competitorDomains.set(citation.domain, (item.competitorDomains.get(citation.domain) || 0) + 1)
      }
    }
    map.set(group.topic, item)
  }

  return [...map.values()].map((item) => {
    const rate = item.questions ? item.ownCitedQuestions / item.questions : 0
    const previousRate = prior.get(item.topic)?.ownCitationRate ?? 0
    const gapRate = 1 - rate
    const mappedTargets = [...item.targets]
    const invalidTargets = mappedTargets.filter((url) => !targetExists(url))
    const priorityScore = Math.round(
      gapRate * 45 +
      Math.min(25, item.competitorCitations * 4) +
      Math.min(15, item.missingFacts.size * 3) +
      Math.min(10, item.structureGaps.size * 2) +
      (mappedTargets.length ? 0 : 5),
    )
    return {
      topic: item.topic,
      questions: item.questions,
      ownCitedQuestions: item.ownCitedQuestions,
      ownCitationRate: Number(rate.toFixed(4)),
      previousOwnCitationRate: Number(previousRate.toFixed(4)),
      ownCitationRateDelta: Number((rate - previousRate).toFixed(4)),
      competitorCitations: item.competitorCitations,
      competitorDomains: [...item.competitorDomains.entries()].sort((a, b) => b[1] - a[1]).map(([domain, citations]) => ({ domain, citations })),
      mappedTargetUrls: mappedTargets,
      invalidTargetUrls: invalidTargets,
      missingFacts: [...item.missingFacts],
      structureGaps: [...item.structureGaps],
      priorityScore,
    }
  }).sort((a, b) => b.priorityScore - a.priorityScore || b.competitorCitations - a.competitorCitations)
}

function renderMarkdown(report) {
  const lines = [
    '# AI source-gap audit', '',
    `Snapshot \`${report.label}\`: **${report.summary.questions}** tested questions · **${report.summary.ownCitationRatePct}%** own-source citation rate · **${report.summary.competitorCitations}** competitor citations.`, '',
    '## Canonical source improvement queue', '',
    '| Topic | Priority | THS citation rate | Competitor citations | Existing target(s) |',
    '| --- | ---: | ---: | ---: | --- |',
  ]
  for (const topic of report.improvementQueue.slice(0, 50)) {
    lines.push(`| ${topic.topic} | ${topic.priorityScore} | ${(topic.ownCitationRate * 100).toFixed(0)}% | ${topic.competitorCitations} | ${topic.mappedTargetUrls.map((u) => `\`${u}\``).join('<br>') || 'map to canonical page'} |`)
  }
  if (report.unmappedQuestions.length) {
    lines.push('', '## Questions needing canonical-source mapping', '')
    for (const group of report.unmappedQuestions.slice(0, 50)) lines.push(`- **${group.topic}:** ${group.question}`)
  }
  lines.push('', '## Rules', '', '- Verify missing facts against primary/authoritative sources before editing.', '- Improve existing canonical pages before considering any genuinely new page.', '- Never copy competitor wording or create AI-only doorway pages.', '')
  return `${lines.join('\n')}\n`
}

function main() {
  const rows = loadRows()
  mkdirSync(INPUT_DIR, { recursive: true })
  if (!rows.length) {
    console.log('[ai-source-gap] no CSV observations found; input directory is ready')
    return
  }

  const previous = loadPrevious()
  const questions = groupQuestions(rows)
  const topics = buildTopics(questions, previous)
  const totalQuestions = questions.length
  const ownCitedQuestions = questions.filter((q) => q.ownCited).length
  const competitorCitations = rows.filter((row) => !row.ownCitation).length
  const unmappedQuestions = questions.filter((q) => !q.targets.length && !q.ownCited)
  const improvementQueue = topics.filter((topic) => topic.ownCitationRate < 1 || topic.missingFacts.length || topic.structureGaps.length)

  const report = {
    label: LABEL,
    generatedAt: new Date().toISOString(),
    inputDir: path.relative(ROOT, INPUT_DIR),
    summary: {
      observations: rows.length,
      questions: totalQuestions,
      ownCitedQuestions,
      ownCitationRate: totalQuestions ? Number((ownCitedQuestions / totalQuestions).toFixed(4)) : 0,
      ownCitationRatePct: totalQuestions ? Number(((ownCitedQuestions / totalQuestions) * 100).toFixed(1)) : 0,
      competitorCitations,
      topics: topics.length,
      unmappedQuestions: unmappedQuestions.length,
      invalidMappedTargets: topics.reduce((sum, topic) => sum + topic.invalidTargetUrls.length, 0),
    },
    improvementQueue,
    unmappedQuestions,
    topics,
    questions,
  }

  mkdirSync(REPORTS_DIR, { recursive: true })
  mkdirSync(HISTORY_DIR, { recursive: true })
  writeFileSync(JSON_PATH, `${JSON.stringify(report, null, 2)}\n`)
  writeFileSync(MD_PATH, renderMarkdown(report))
  writeFileSync(path.join(HISTORY_DIR, `${LABEL}.json`), `${JSON.stringify({ label: LABEL, generatedAt: report.generatedAt, summary: report.summary, topics }, null, 2)}\n`)

  console.log(`[ai-source-gap] questions=${totalQuestions} ownCitationRate=${report.summary.ownCitationRatePct}% competitorCitations=${competitorCitations} unmapped=${unmappedQuestions.length}`)
  console.log(`[ai-source-gap] improvement queue=${improvementQueue.length}; report=${path.relative(ROOT, JSON_PATH)}`)
}

main()
