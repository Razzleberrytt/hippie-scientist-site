#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const LLMS = path.join(ROOT, 'public', 'llms.txt')
const ROBOTS = path.join(ROOT, 'app', 'robots.ts')
const MANIFEST = path.join(ROOT, 'public', 'data', 'ai-entities', 'manifest.json')
const SCHEMA = path.join(ROOT, 'components', 'seo', 'SchemaGraphScript.tsx')
const CITATION_SUMMARY = path.join(ROOT, 'components', 'seo', 'CitationReadySummary.tsx')
const ANSWER_TABLE = path.join(ROOT, 'components', 'seo', 'AnswerEngineTable.tsx')
const EVIDENCE_BADGE = path.join(ROOT, 'components', 'ui', 'EvidenceScoreBadge.tsx')
const SAFETY_GAUGE = path.join(ROOT, 'components', 'ui', 'SafetyGaugeMeter.tsx')
const VERDICT_CARD = path.join(ROOT, 'components', 'editorial', 'ScientificVerdictCard.tsx')
const PROFILE_DECISION = path.join(ROOT, 'components', 'editorial', 'ProfileDecisionPanel.tsx')
const LAST_UPDATED = path.join(ROOT, 'src', 'components', 'editorial', 'LastUpdatedBadge.tsx')
const LICENSING_PAGE = path.join(ROOT, 'app', 'info', 'content-licensing', 'page.tsx')
const APP = path.join(ROOT, 'app')
const strict = process.argv.includes('--strict')

const findings = []
const add = (severity, area, message) => findings.push({ severity, area, message })
const text = (file) => existsSync(file) ? readFileSync(file, 'utf8') : ''

function walk(dir, out = []) {
  if (!existsSync(dir)) return out
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else if (/\.(?:tsx|ts|mdx)$/.test(entry.name)) out.push(full)
  }
  return out
}

function requireSignals(file, area, component, signals) {
  const source = text(file)
  if (!source) {
    add('error', area, `${component} is missing`)
    return
  }
  for (const [signal, label] of signals) {
    if (!source.includes(signal)) add('error', area, `${component} missing ${label}`)
  }
}

function auditDiscovery() {
  const llms = text(LLMS)
  if (!llms) add('error', 'discovery', 'public/llms.txt is missing')
  else {
    for (const signal of ['Answer-engine retrieval policy', 'Query-to-source routing', 'Entity resolution rules', 'Evidence and temporal semantics']) {
      if (!llms.includes(signal)) add('error', 'discovery', `llms.txt missing ${signal}`)
    }
    if (!llms.includes('/data/ai-entities/manifest.json')) add('error', 'discovery', 'llms.txt does not advertise the AI entity manifest')
    if (!llms.includes('/info/methodology/')) add('error', 'discovery', 'llms.txt does not advertise methodology')
    if (!llms.includes('/info/content-licensing/')) add('warn', 'attribution', 'llms.txt does not advertise content attribution/reuse guidance')
  }

  const robots = text(ROBOTS)
  if (!robots) add('error', 'crawlability', 'app/robots.ts is missing')
  else {
    if (!robots.includes("'/data/ai-entities/'")) add('error', 'crawlability', 'robots does not explicitly allow AI entity artifacts')
    if (!robots.includes('sitemap.xml')) add('error', 'crawlability', 'robots does not advertise sitemap.xml')
  }
}

function auditMachineReadable() {
  const schema = text(SCHEMA)
  if (!schema) add('error', 'structured-data', 'SchemaGraphScript.tsx is missing')
  else {
    if (!schema.includes('Dataset')) add('error', 'structured-data', 'profile schema graph does not expose Dataset nodes')
    if (!schema.includes('subjectOf')) add('warn', 'structured-data', 'profile entity graph does not visibly connect entity to dataset with subjectOf')
  }

  if (!existsSync(MANIFEST)) {
    add('warn', 'entity-data', 'AI entity manifest is not present in the checkout; run the runtime data build before release')
  } else {
    try {
      const parsed = JSON.parse(text(MANIFEST))
      const serialized = JSON.stringify(parsed)
      if (!serialized.includes('herb') || !serialized.includes('compound')) add('warn', 'entity-data', 'entity manifest may not expose both herb and compound collections')
      if (statSync(MANIFEST).size < 100) add('error', 'entity-data', 'entity manifest is unexpectedly small')
    } catch {
      add('error', 'entity-data', 'AI entity manifest is not valid JSON')
    }
  }
}

function auditSharedExtractionPrimitives() {
  requireSignals(CITATION_SUMMARY, 'extractability', 'CitationReadySummary', [
    ['data-answer-engine-summary', 'answer-engine summary marker'],
    ['data-claim', 'claim marker'],
    ['data-evidence', 'evidence marker'],
    ['data-limitation', 'limitation marker'],
    ['data-citation-sources', 'claim-adjacent source marker'],
    ['aria-labelledby', 'accessible stable heading relationship'],
    ['href={`#${id}`}', 'stable permanent answer link'],
    ['toCitationReadySummary(answer)', 'canonical citation-ready text normalizer'],
  ])

  const table = text(ANSWER_TABLE)
  if (!table) add('warn', 'extractability', 'AnswerEngineTable semantic research-table primitive is missing')
  else {
    for (const signal of ['data-answer-engine-table', '<caption', 'scope="col"', 'scope="row"', 'id={id}']) {
      if (!table.includes(signal)) add('error', 'extractability', `AnswerEngineTable missing semantic signal: ${signal}`)
    }
  }

  if (!existsSync(LICENSING_PAGE)) add('warn', 'attribution', 'public content licensing/attribution policy page is missing')
}

function auditProfilePrimitives() {
  requireSignals(EVIDENCE_BADGE, 'profile-semantics', 'EvidenceScoreBadge', [
    ['data-evidence="true"', 'evidence marker'],
    ['data-evidence-grade={canonicalGrade}', 'canonical evidence-grade value'],
  ])
  requireSignals(SAFETY_GAUGE, 'profile-semantics', 'SafetyGaugeMeter', [
    ['data-safety-context="true"', 'safety-context marker'],
    ['data-safety-label={label}', 'qualitative safety label'],
  ])
  if (text(SAFETY_GAUGE).includes('data-safety-score=')) {
    add('error', 'profile-semantics', 'SafetyGaugeMeter exposes a derived visual gauge as a machine-readable clinical-looking score')
  }
  requireSignals(LAST_UPDATED, 'profile-semantics', 'LastUpdatedBadge', [
    ['data-editorial-provenance="true"', 'editorial-provenance marker'],
    ['data-last-reviewed=', 'last-reviewed value'],
    ['itemProp="dateModified"', 'dateModified semantic'],
  ])
  requireSignals(VERDICT_CARD, 'profile-semantics', 'ScientificVerdictCard', [
    ['data-answer-engine-decision="true"', 'decision marker'],
    ['data-recommendation=', 'recommendation value'],
    ['data-claim="true"', 'bottom-line claim marker'],
    ['data-limitation="true"', 'limitation marker'],
    ['data-safety-context="true"', 'safety marker'],
    ['data-evidence="true"', 'evidence marker'],
  ])
  const decision = text(PROFILE_DECISION)
  if (!decision.includes('id="decision-summary"')) add('error', 'profile-semantics', 'ProfileDecisionPanel does not give curated verdicts a stable decision-summary anchor')
}

function auditExtractability() {
  const files = walk(APP)
  const candidates = files.filter((file) => /(?:herbs|compounds|guides|articles)/.test(file))
  let quick = 0
  let evidence = 0
  let references = 0
  let schema = 0
  let safety = 0
  let freshness = 0

  for (const file of candidates) {
    const source = text(file)
    if (/quick answer|CitationReadySummary|TL;DR/i.test(source)) quick++
    if (/Evidence Summary|evidence grade|EvidenceGrade|EvidenceBadge/i.test(source)) evidence++
    if (/References|Citations|CompareCitations|Sources/i.test(source)) references++
    if (/SchemaGraphScript|JsonLd|JSON-LD|AuthorityJsonLd|CompareSchema/i.test(source)) schema++
    if (/Safety|contraindication|interaction/i.test(source)) safety++
    if (/dateModified|last reviewed|updated/i.test(source)) freshness++
  }

  const total = candidates.length || 1
  const metric = (name, count, floor) => {
    const pct = Math.round((count / total) * 100)
    if (pct < floor) add('warn', 'extractability', `${name} signal appears in ${count}/${candidates.length} candidate source files (${pct}%)`)
  }

  metric('quick-answer', quick, 8)
  metric('evidence', evidence, 12)
  metric('references', references, 10)
  metric('schema', schema, 8)
  metric('safety', safety, 12)
  metric('freshness', freshness, 6)
}

function auditAntiPatterns() {
  for (const file of walk(APP)) {
    const source = text(file)
    const rel = path.relative(ROOT, file)
    if (/AggregateRating/.test(source) && !/ratingCount|reviewCount/.test(source)) add('warn', 'trust', `${rel}: AggregateRating requires verified visible rating provenance`)
    if (/\bclinically proven\b/i.test(source)) add('warn', 'claim-discipline', `${rel}: contains “clinically proven”; verify the wording is justified and qualified`)
    if (/\bguaranteed\b/i.test(source) && /supplement|herb|compound|treat|benefit/i.test(source)) add('warn', 'claim-discipline', `${rel}: contains potentially absolute health-benefit language`)
  }
}

auditDiscovery()
auditMachineReadable()
auditSharedExtractionPrimitives()
auditProfilePrimitives()
auditExtractability()
auditAntiPatterns()

const order = { error: 0, warn: 1 }
findings.sort((a, b) => order[a.severity] - order[b.severity] || a.area.localeCompare(b.area) || a.message.localeCompare(b.message))

console.log(`[ai-answer-engine] ${findings.length ? `${findings.length} finding(s)` : 'PASS'}`)
for (const item of findings) console.log(`- ${item.severity.toUpperCase()} [${item.area}] ${item.message}`)

const errors = findings.filter((item) => item.severity === 'error').length
const warnings = findings.filter((item) => item.severity === 'warn').length
console.log(`[ai-answer-engine] errors=${errors} warnings=${warnings} mode=${strict ? 'strict' : 'advisory'}`)

if (errors || (strict && warnings)) process.exit(1)
