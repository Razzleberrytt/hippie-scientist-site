#!/usr/bin/env node
/**
 * AI source-gap audit
 *
 * Complements Bing AI Performance telemetry with a repeatable audit of major
 * questions tested in answer/search assistants. It records which sources win,
 * why they appear structurally useful, what facts our canonical source page is
 * missing, and which EXISTING Hippie Scientist page should be improved.
 *
 * Input: data-sources/ai-source-audits/*.csv
 * Output: ops/reports/ai-source-gaps.json + .md
 * History: ops/ai-citations/source-gap-history/<label>.json
 *
 * This tool never recommends AI-specific doorway pages. Unmapped questions are
 * explicitly queued for canonical-source mapping instead.
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
        if (content[i + 1] === '"') {
          field += '"'
          i += 1
        } else quoted = false
      } else field += char
      continue
    }
    if (char === '"') quoted = true
    else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (char !== '\r') field += char
  }
  if (field.length || row.length) {
    row.push(field)
    rows.push(row)
  }
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

function headerMap(header) {
  const normalized = header.map((value) => String(value ?? '').trim().toLowerCase())
  const indexes = {}
  for (const [key, aliases] of Object.entries(ALIASES)) {
    const index = normalized.findIndex((value) => aliases.includes(value))
    if (index >= 0) indexes[key] = index
  }
  return indexes
}

function clean(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

function cell(cells, index, key) {
  return index[key] === undefined ? '' : clean(cells[index[key]])
}

function normalizeUrl(value) {
  const text = clean(value)
  if (!text) return ''
  try {
    const url = new URL(text.startsWith('http') ? text : `https://${text.replace(/^\/+/, '')}`)
    url.hash = ''
    return url.toString()
  } catch {
    return text
  }
}

function domainOf(value) {
  const text = normalizeUrl(value)
  if (!text) return ''
  try {
    return new URL(text).hostname.toLowerCase().replace(/^www\./, '')
  } catch {
    return ''
  }
}

function isOwnUrl(value) {
  const domain = domainOf(value)
  return domain === OWN_HOST || domain.endsWith(`.${OWN_HOST}`)
}

const STOPWORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'do', 'does', 'can', 'should', 'for', 'of', 'to',
  'in', 'on', 'with', 'and', 'or', 'what', 'how', 'when', 'why', 'best', 'take',
  'taking', 'use', 'using', 'supplement', 'supplements', 'does', 'work', 'better',
])

function inferTopic(question) {
  const tokens = clean(question)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOPWORDS.has(token))
  return [...new Set(tokens)].slice(0, 4).join(' ') || 'unclassified'
}

function loadRows() {
  if (!existsSync(INPUT_DIR)) return []
  const rows = []
  for (const file of readdirSync(INPUT_DIR).filter((name) => /\.csv$/i.test(name)).sort()) {
    const parsed = parseCsv(readFileSync(path.join(INPUT_DIR, file), 'utf8'))
    if (parsed.length < 2) continue
    const index = headerMap(parsed[0])
    if (index.question === undefined || index.citedUrl === undefined) continue
    for (const cells of parsed.slice(1)) {
      const question = cell(cells, index, 'question')
      const citedUrl = normalizeUrl(cell(cells, index, 'citedUrl'))
      if (!question || !citedUrl) continue
      const explicitTopic = cell(cells, index, 'topic')
      rows.push({
        sourceFile: file,
        question,
        assistant: cell(cells, index, 'assistant') || 'unspecified',
        citedUrl,
        citedDomain: domainOf(citedUrl),
        ownCitation: isOwnUrl(citedUrl),
        topic: explicitTopic || inferTopic(question),
        targetUrl: normalizeUrl(cell(cells, index, 'targetUrl')),
        missingFact: cell(cells, index, 'missingFact'),
        structureGap: cell(cells, index, 'structureGap'),
        notes: cell(cells, index, 'notes'),
        observedAt: cell(cells, index, 'observedAt'),
      })
    }
  }
  return rows
}

function loadHistory() {
  if (!existsSync(HISTORY_DIR)) return []
  return readdirSync(HISTORY_DIR)
    .filter((name) => name.endsWith('.json'))
    .sort()
    .flatMap((name) => {
      try {
        return [{ file: name, ...JSON.parse(readFileSync(path.join(HISTORY_DIR, name), 'utf8')) }]
      } catch {
        return []
      }
    })
}

function normalizeQuestion(value) {
  return clean(value).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function groupByQuestion(rows) {
  const groups = new Map()
  for (const row of rows) {
    const key = `${row.assistant.toLowerCase()}|${normalizeQuestion(row.question)}`
    const current = groups.get(key) || {
      assistant: row.assistant,
      question: row.question,
      topic: row.topic,
      citations: [],
      ownCited: false,
      targetUrls: new Set(),
      missingFacts: new Set(),
      structureGaps: new Set(),
    }
    current.citations.push({ url: row.citedUrl, domain: row.citedDomain, own: row.ownCitation })
    current.ownCited ||= row.ownCitation
    if (row.targetUrl) current.targetUrls.add(row.targetUrl)
    if (row.missingFact) current.missingFacts.add(row.missingFact)
    if (row.structureGap) current.structureGaps.add(row.structureGap)
    groups.set(key, current)
  }
  return [...groups.values()].map((group) => ({
    ...group,
    targetUrls: [...group.targetUrls],
    missingFacts: [...group.missingFacts],
    structureGaps: [...group.structureGaps],
  }))
}

function buildTopics(questionGroups, previous) {
  const topics = new Map()
  for (const group of questionGroups) {
    const current = topics.get(group.topic) || {
      topic: group.topic,
      questions: 0,
      ownCitedQuestions: 0,
      competitorCitations: 0,
      gapSignals: 0,
      mappedTargets: new Set(),
      competitorDomains: new Map(),
    }
    current.questions += 1
    if (group.ownCited) current.ownCitedQuestions += 1
    current.gapSignals += group.missingFacts.length + group.structureGaps.length
    for (const target of group.targetUrls) current.mappedTargets.add(target)
    for (const citation of group.citations) {
      if (!citation.own && citation.domain) {
        current.competitorCitations += 1
        current.competitorDomains.set(citation.domain, (current.competitorDomains.get(citation.domain) || 0) + 1)
      }
    }
    topics.set(group.topic, current)
  }

  const priorTopics = new Map((previous?.topics || []).map((topic) => [topic.topic, topic]))
  return [...topics.values()].map((topic) => {
    const rate = topic.questions ? topic.ownCitedQuestions / topic.questions : 0
    const prior = priorTopics.get(topic.topic)
    const priorRate = prior?.ownCitationRate ?? 0
    const rateDelta = rate - priorRate
    const doubleDownScore = Math.round(
      topic.ownCitedQuestions * 12
      + Math.max(0, rateDelta) * 100
      + Math.min(25, topic.mappedTargets.size * 5)
      + Math.min(20, topic.gapSignals * 2)
    )
    return {
      topic: topic.topic,
      questions: topic.questions,
      ownCitedQuestions: topic.ownCitedQuestions,
      ownCitationRate: Number(rate.toFixed(4)),
      previousOwnCitationRate: Number(priorRate.toFixed(4)),
      ownCitationRateDelta: Number(rateDelta.toFixed(4)),
      competitorCitations: topic.competitorCitations,
      gapSignals: topic.gapSignals,
      mappedTargetUrls: [...topic.mappedTargets],
      topCompetitorDomains: [...topic.competitorDomains.entries()]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, 5)
        .map(([domain, citations]) => ({ domain, citations })),
      doubleDownScore,
    }
  }).sort((a, b) => b.doubleDownScore - a.doubleDownScore || b.ownCitedQuestions - a.ownCitedQuestions)
}

function buildCompetitors(rows) {
  const domains = new Map()
  for (const row of rows) {
    if (row.ownCitation || !row.citedDomain) continue
    const current = domains.get(row.citedDomain) || { domain: row.citedDomain, citations: 0, questions: new Set(), topics: new Set(), urls: new Map() }
    current.citations += 1
    current.questions.add(normalizeQuestion(row.question))
    current.topics.add(row.topic)
    current.urls.set(row.citedUrl, (current.urls.get(row.citedUrl) || 0) + 1)
    domains.set(row.citedDomain, current)
  }
  return [...domains.values()]
    .map((entry) => ({
      domain: entry.domain,
      citations: entry.citations,
      distinctQuestions: entry.questions.size,
      topics: [...entry.topics].sort(),
      topUrls: [...entry.urls.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([url, citations]) => ({ url, citations })),
    }))
    .sort((a, b) => b.distinctQuestions - a.distinctQuestions || b.citations - a.citations)
}

function buildImprovementQueue(groups) {
  return groups
    .filter((group) => !group.ownCited || group.missingFacts.length || group.structureGaps.length)
    .map((group) => {
      const competitorDomains = [...new Set(group.citations.filter((citation) => !citation.own).map((citation) => citation.domain).filter(Boolean))]
      const targetUrl = group.targetUrls.find(isOwnUrl) || ''
      const priority = (group.ownCited ? 0 : 25) + Math.min(30, competitorDomains.length * 8) + Math.min(25, group.missingFacts.length * 10) + Math.min(20, group.structureGaps.length * 8)
      return {
        priority,
        assistant: group.assistant,
        topic: group.topic,
        question: group.question,
        ownCited: group.ownCited,
        targetUrl,
        mappingStatus: targetUrl ? 'improve_existing_source' : 'map_to_existing_canonical_source',
        competitorDomains,
        missingFacts: group.missingFacts,
        structureGaps: group.structureGaps,
        action: targetUrl
          ? 'Improve the mapped canonical source page; do not create an AI-specific doorway page.'
          : 'Choose the best existing canonical Hippie Scientist page before editing; do not create a doorway page solely for this audit row.',
      }
    })
    .sort((a, b) => b.priority - a.priority || a.question.localeCompare(b.question))
}

function renderMarkdown(report) {
  const pct = (value) => `${(value * 100).toFixed(1)}%`
  const lines = [
    '# AI citation source-gap audit',
    '',
    `Snapshot: **${report.label}**`,
    '',
    `- Distinct assistant-question checks: **${report.summary.questions}**`,
    `- Questions citing The Hippie Scientist: **${report.summary.ownCitedQuestions}** (${pct(report.summary.ownCitationRate)})`,
    `- External citation rows: **${report.summary.competitorCitationRows}**`,
    `- Competing cited domains: **${report.summary.competitorDomains}**`,
    `- Existing-source improvement rows: **${report.summary.improvementRows}**`,
    '',
    '> Guardrail: this report improves mapped canonical source pages. It does not recommend AI-specific doorway pages.',
    '',
    '## Repeated competing sources',
    '',
    '| Domain | Distinct questions won | Citation rows | Topics |',
    '| --- | ---: | ---: | --- |',
    ...report.competitors.slice(0, 25).map((row) => `| ${row.domain} | ${row.distinctQuestions} | ${row.citations} | ${row.topics.join(', ')} |`),
    '',
    '## Topics to double down on',
    '',
    '| Topic | Our citation rate | Δ | Our cited questions | Score |',
    '| --- | ---: | ---: | ---: | ---: |',
    ...report.topics.slice(0, 25).map((row) => `| ${row.topic} | ${pct(row.ownCitationRate)} | ${(row.ownCitationRateDelta * 100).toFixed(1)} pp | ${row.ownCitedQuestions} | ${row.doubleDownScore} |`),
    '',
    '## Source-page improvement queue',
    '',
  ]

  if (!report.improvementQueue.length) {
    lines.push('No audited source gaps yet. Add a CSV under `data-sources/ai-source-audits/`.', '')
  } else {
    for (const row of report.improvementQueue.slice(0, 100)) {
      lines.push(`### ${row.priority} · ${row.question}`)
      lines.push('')
      lines.push(`- Assistant: ${row.assistant}`)
      lines.push(`- Topic: ${row.topic}`)
      lines.push(`- Canonical source: ${row.targetUrl || '**mapping required**'}`)
      lines.push(`- Competitors cited: ${row.competitorDomains.join(', ') || 'none recorded'}`)
      if (row.missingFacts.length) lines.push(`- Missing facts: ${row.missingFacts.join(' · ')}`)
      if (row.structureGaps.length) lines.push(`- Structure gaps: ${row.structureGaps.join(' · ')}`)
      lines.push(`- Action: ${row.action}`)
      lines.push('')
    }
  }
  return `${lines.join('\n')}\n`
}

const rows = loadRows()
const questions = groupByQuestion(rows)
const history = loadHistory()
const previous = history.at(-1)
const topics = buildTopics(questions, previous)
const competitors = buildCompetitors(rows)
const improvementQueue = buildImprovementQueue(questions)
const ownCitedQuestions = questions.filter((question) => question.ownCited).length
const competitorCitationRows = rows.filter((row) => !row.ownCitation).length

const report = {
  version: 1,
  generatedAt: new Date().toISOString(),
  label: LABEL,
  inputDirectory: path.relative(ROOT, INPUT_DIR),
  previousSnapshot: previous?.label || previous?.file || null,
  summary: {
    sourceRows: rows.length,
    questions: questions.length,
    ownCitedQuestions,
    ownCitationRate: questions.length ? Number((ownCitedQuestions / questions.length).toFixed(4)) : 0,
    competitorCitationRows,
    competitorDomains: competitors.length,
    improvementRows: improvementQueue.length,
  },
  competitors,
  topics,
  improvementQueue,
  auditedQuestions: questions,
}

mkdirSync(REPORTS_DIR, { recursive: true })
mkdirSync(HISTORY_DIR, { recursive: true })
writeFileSync(JSON_PATH, `${JSON.stringify(report, null, 2)}\n`)
writeFileSync(MD_PATH, renderMarkdown(report))
writeFileSync(path.join(HISTORY_DIR, `${LABEL}.json`), `${JSON.stringify({
  version: report.version,
  generatedAt: report.generatedAt,
  label: report.label,
  summary: report.summary,
  topics: report.topics,
}, null, 2)}\n`)

console.log('\nAI citation source-gap audit')
console.log('='.repeat(72))
console.log(`Audit rows             ${report.summary.sourceRows}`)
console.log(`Question checks        ${report.summary.questions}`)
console.log(`THS cited questions    ${report.summary.ownCitedQuestions}`)
console.log(`Citation rate          ${(report.summary.ownCitationRate * 100).toFixed(1)}%`)
console.log(`Competitor domains     ${report.summary.competitorDomains}`)
console.log(`Improvement queue      ${report.summary.improvementRows}`)
console.log('Report                 ops/reports/ai-source-gaps.md')
console.log('History                ops/ai-citations/source-gap-history/<label>.json')

if (!rows.length) {
  console.log('\nNo audit CSV rows found. The weekly process remains valid; add observations under data-sources/ai-source-audits/.')
}
