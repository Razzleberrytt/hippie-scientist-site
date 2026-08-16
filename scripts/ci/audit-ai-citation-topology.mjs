#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const ENTITY_ROOT = path.join(ROOT, 'public', 'data', 'ai-entities')
const OUTPUT = path.join(ROOT, 'reports', 'ai-citation-readiness.json')
const strict = process.argv.includes('--strict')

const WEAK = /preliminary|mixed evidence|limited evidence|insufficient|unclear|weak evidence|theoretical|animal evidence|in[- ]vitro|mechanistic only|research pending/i
const STRONG = /\b(?:grade\s*)?a\b|strong human evidence|high confidence|well[- ]established|robust evidence/i
const POSITIVE = /effective|efficacious|clinically proven|proven to|shown to improve|strong evidence for|supports the use/i
const NEGATIVE = /not supported|unsupported|no good evidence|insufficient evidence|does not support|failed to show|no clear benefit/i

function filesUnder(dir, out = []) {
  if (!existsSync(dir)) return out
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) filesUnder(full, out)
    else if (entry.name.endsWith('.json') && entry.name !== 'manifest.json') out.push(full)
  }
  return out
}
function readJson(file) { try { return JSON.parse(readFileSync(file, 'utf8')) } catch { return null } }
function graph(doc) { return Array.isArray(doc?.['@graph']) ? doc['@graph'] : Array.isArray(doc) ? doc : doc ? [doc] : [] }
function strings(value, out = []) {
  if (value == null) return out
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') { out.push(String(value)); return out }
  if (Array.isArray(value)) { for (const item of value) strings(item, out); return out }
  if (typeof value === 'object') for (const item of Object.values(value)) strings(item, out)
  return out
}
function types(node) { const value = node?.['@type']; return Array.isArray(value) ? value.map(String) : value ? [String(value)] : [] }
function isClaim(node) { const t = types(node).join(' ').toLowerCase(); return /claim|statement|observation/.test(t) || /claim/i.test(String(node?.['@id'] || '')) || node?.evidenceGrade || node?.evidenceClass }
function isSource(node) { const t = types(node).join(' ').toLowerCase(); return /scholarlyarticle|medicalscholarlyarticle|article|creativework|report/.test(t) || node?.pmid || node?.doi || node?.studyType }
function sourceIds(node) {
  const ids = []
  for (const value of [node?.citation, node?.citations, node?.source, node?.sources, node?.sourceIds, node?.sourceRefs, node?.primaryPmids, node?.pmids]) {
    for (const s of strings(value)) if (s.trim()) ids.push(s.trim())
  }
  return [...new Set(ids)]
}
function sourceClass(node) {
  const blob = strings([node?.studyType, node?.evidenceClass, node?.name, node?.description]).join(' ').toLowerCase()
  if (/narrative review|review article|overview/.test(blob) && !/systematic|meta-analysis/.test(blob)) return 'narrative-review'
  if (/systematic review|meta-analysis|meta analysis/.test(blob)) return 'systematic-review'
  if (/randomi[sz]ed|controlled trial|clinical trial|cohort|case-control|cross-sectional|human study|participants?|patients?/.test(blob)) return 'primary-human'
  if (/animal|mouse|mice|rat|in vivo/.test(blob)) return 'animal'
  if (/in vitro|cell|assay/.test(blob)) return 'in-vitro'
  return 'other'
}
function clamp(n) { return Math.max(0, Math.min(100, Math.round(n))) }

const rows = []
for (const file of filesUnder(ENTITY_ROOT)) {
  const doc = readJson(file)
  if (!doc) continue
  const nodes = graph(doc)
  const claims = nodes.filter(isClaim)
  const sources = nodes.filter(isSource)
  const allText = strings(nodes).join(' | ')
  const slug = path.basename(file, '.json')

  const linkedClaims = claims.filter((claim) => sourceIds(claim).length > 0).length
  const oneSourceClaims = claims.filter((claim) => sourceIds(claim).length === 1).length
  const sourceClasses = sources.map(sourceClass)
  const primaryHuman = sourceClasses.filter((x) => x === 'primary-human').length
  const systematic = sourceClasses.filter((x) => x === 'systematic-review').length
  const narrative = sourceClasses.filter((x) => x === 'narrative-review').length
  const humanRelevant = primaryHuman + systematic + narrative

  const frequency = new Map()
  for (const claim of claims) for (const id of sourceIds(claim)) frequency.set(id, (frequency.get(id) || 0) + 1)
  const maxFrequency = Math.max(0, ...frequency.values())
  const concentration = claims.length ? maxFrequency / claims.length : 0

  const contradiction = (STRONG.test(allText) && WEAK.test(allText)) || (POSITIVE.test(allText) && NEGATIVE.test(allText))
  const citationCompleteness = claims.length ? linkedClaims / claims.length : sources.length ? 0.6 : 0
  const primaryCoverage = humanRelevant ? (primaryHuman + systematic) / humanRelevant : 0
  const independence = claims.length ? 1 - Math.min(1, concentration) : 0
  const sourceDepth = Math.min(1, sources.length / 5)
  const freshnessSignal = /dateModified|datePublished|lastReviewed|reviewedAt|modifiedAt|review date/i.test(allText) ? 1 : 0
  const safetySignal = /safety|contraindication|interaction|adverse|pregnan|warning|caution/i.test(allText) ? 1 : 0
  const answerSignal = /summary|description|bottom line|quick answer|verdict|evidence summary/i.test(allText) ? 1 : 0

  const score = clamp(
    citationCompleteness * 25 +
    primaryCoverage * 20 +
    independence * 15 +
    sourceDepth * 10 +
    freshnessSignal * 10 +
    safetySignal * 10 +
    answerSignal * 10 -
    (contradiction ? 35 : 0)
  )

  const gaps = []
  if (contradiction) gaps.push('contradictory extractable claims')
  if (claims.length && citationCompleteness < 1) gaps.push(`${claims.length - linkedClaims} claim(s) without source links`)
  if (claims.length && oneSourceClaims / claims.length >= 0.5) gaps.push('majority of claims depend on one source each')
  if (concentration >= 0.75 && claims.length >= 3) gaps.push('one source dominates the claim graph')
  if (humanRelevant >= 2 && narrative > primaryHuman + systematic) gaps.push('narrative-review dominated')
  if (humanRelevant && primaryCoverage < 0.5) gaps.push('low primary/systematic human coverage')
  if (!freshnessSignal) gaps.push('no explicit freshness signal')
  if (!safetySignal) gaps.push('no obvious safety signal')

  rows.push({ slug, score, claims: claims.length, sources: sources.length, citationCompleteness: Number(citationCompleteness.toFixed(3)), primaryHuman, systematicReviews: systematic, narrativeReviews: narrative, sourceConcentration: Number(concentration.toFixed(3)), contradiction, gaps })
}

rows.sort((a, b) => a.score - b.score || b.gaps.length - a.gaps.length || a.slug.localeCompare(b.slug))
const summary = {
  generatedAt: new Date().toISOString(),
  profiles: rows.length,
  averageScore: rows.length ? Math.round(rows.reduce((sum, row) => sum + row.score, 0) / rows.length) : 0,
  below50: rows.filter((row) => row.score < 50).length,
  below70: rows.filter((row) => row.score < 70).length,
  contradictions: rows.filter((row) => row.contradiction).length,
}
mkdirSync(path.dirname(OUTPUT), { recursive: true })
writeFileSync(OUTPUT, JSON.stringify({ summary, profiles: rows }, null, 2) + '\n')
console.log(`[audit-ai-citation-topology] profiles=${summary.profiles} average=${summary.averageScore} below50=${summary.below50} below70=${summary.below70} contradictions=${summary.contradictions}`)
for (const row of rows.slice(0, 50)) console.log(`${String(row.score).padStart(3)} ${row.slug}: ${row.gaps.join('; ') || 'no major gaps detected'}`)
console.log(`[audit-ai-citation-topology] report: ${path.relative(ROOT, OUTPUT)}`)
if (!existsSync(ENTITY_ROOT)) console.log('[audit-ai-citation-topology] entity artifacts missing; run the runtime/entity build first')
if (strict && (summary.contradictions > 0 || summary.below50 > 0)) process.exit(1)
