#!/usr/bin/env node
/**
 * Discover recent PubMed records for priority canonical entities and place them
 * in a review queue. This script never mutates evidence grades or public claims.
 *
 * NCBI E-utilities policy: include tool + email on every request. Requests are
 * intentionally throttled below 3/second even when an API key is configured.
 */
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const prioritiesPath = path.resolve(process.argv[2] || 'data/research/pubmed-priorities.json')
const decisionsPath = path.resolve(process.env.RESEARCH_DECISIONS || 'data/research/review-decisions.jsonl')
const outputPath = path.resolve(process.env.PUBMED_REVIEW_QUEUE || 'artifacts/research-intake/pubmed-review-queue.json')
const email = (process.env.NCBI_EMAIL || '').trim()
const apiKey = (process.env.NCBI_API_KEY || '').trim()
const toolName = (process.env.NCBI_TOOL || 'hippie_scientist_research').trim().replace(/\s+/g, '_')
const relativeDays = Math.max(1, Number(process.env.PUBMED_RELDATE_DAYS || 35))
const perEntity = Math.min(50, Math.max(1, Number(process.env.PUBMED_RESULTS_PER_ENTITY || 15)))
const base = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils'

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return fallback }
}
function readDecisions(file) {
  if (!fs.existsSync(file)) return []
  return fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean).flatMap((line) => {
    try { return [JSON.parse(line)] } catch { return [] }
  })
}
function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`)
}
function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)) }
function decode(value) {
  return String(value || '')
    .replaceAll('&quot;', '"').replaceAll('&#39;', "'").replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<').replaceAll('&gt;', '>')
    .replace(/<[^>]+>/g, '')
    .trim()
}
function skipped(reason) {
  writeJson(outputPath, { generatedAt: new Date().toISOString(), status: 'skipped', reason, studies: [] })
  console.log(`[pubmed-ingest] SKIP: ${reason}`)
  process.exit(0)
}
if (!email || !email.includes('@')) skipped('NCBI_EMAIL must be configured with a valid contact email before querying E-utilities')

const commonParams = { tool: toolName, email, ...(apiKey ? { api_key: apiKey } : {}) }
let lastRequestAt = 0
async function requestJson(endpoint, params) {
  const elapsed = Date.now() - lastRequestAt
  if (elapsed < 375) await sleep(375 - elapsed)
  const query = new URLSearchParams({ ...commonParams, ...params })
  const response = await fetch(`${base}/${endpoint}?${query}`, { headers: { Accept: 'application/json' } })
  lastRequestAt = Date.now()
  if (!response.ok) throw new Error(`${endpoint} HTTP ${response.status}: ${(await response.text()).slice(0, 300)}`)
  return response.json()
}

function publicationClass(pubTypes, title) {
  const types = (Array.isArray(pubTypes) ? pubTypes : []).map((value) => String(value).toLowerCase())
  const text = `${types.join(' ')} ${title}`.toLowerCase()
  if (/meta-analysis/.test(text)) return 'meta-analysis'
  if (/systematic review/.test(text)) return 'systematic-review'
  if (/randomized controlled trial|randomised controlled trial/.test(text)) return 'RCT'
  if (/controlled clinical trial|clinical trial/.test(text)) return 'controlled-trial'
  if (/observational study|cohort|case-control|cross-sectional/.test(text)) return 'observational'
  if (/case report/.test(text)) return 'case-report'
  if (/review/.test(text)) return 'narrative-review'
  return 'unclassified'
}
function safetySignal(title) {
  return /safety|adverse|toxicity|toxic|hepat|liver injury|interaction|contraindicat|pregnan|terat|bleed|arrhythm|withdrawal|dependence/i.test(title)
}
function gradeChangeScore(studyClass, safety, priorityWeight, title) {
  const classScore = {
    'meta-analysis': 68,
    'systematic-review': 62,
    RCT: 54,
    'controlled-trial': 42,
    observational: 30,
    'case-report': 22,
    'narrative-review': 18,
    unclassified: 12,
  }[studyClass] || 10
  const safetyBoost = safety ? 18 : 0
  const languageBoost = /primary outcome|significant|no effect|ineffective|harm|adverse|safety|efficacy/i.test(title) ? 5 : 0
  return Math.min(100, classScore + safetyBoost + Math.max(0, Number(priorityWeight || 0)) + languageBoost)
}
function doiFrom(summary) {
  const ids = Array.isArray(summary.articleids) ? summary.articleids : []
  const hit = ids.find((item) => String(item?.idtype || '').toLowerCase() === 'doi')
  return hit?.value || null
}
function authorsFrom(summary) {
  return Array.isArray(summary.authors) ? summary.authors.map((author) => author?.name).filter(Boolean).slice(0, 20) : []
}

const priorities = readJson(prioritiesPath, [])
if (!Array.isArray(priorities) || !priorities.length) skipped('no PubMed priority entities configured')
const decisions = readDecisions(decisionsPath)
const decided = new Map(decisions.map((item) => [`${item.entityId}:${item.pmid}`, item]))
const queue = new Map()
const searches = []

for (const entity of priorities) {
  const terms = (Array.isArray(entity.terms) ? entity.terms : []).map((term) => `"${String(term).replaceAll('"', '')}"[Title/Abstract]`)
  if (!terms.length || !entity.entityId || !entity.slug) continue
  const term = `(${terms.join(' OR ')})`
  const search = await requestJson('esearch.fcgi', {
    db: 'pubmed',
    term,
    retmode: 'json',
    retmax: String(perEntity),
    sort: 'pub_date',
    datetype: 'edat',
    reldate: String(relativeDays),
  })
  const ids = search?.esearchresult?.idlist || []
  searches.push({ entityId: entity.entityId, slug: entity.slug, query: term, returnedPmids: ids.length })
  if (!ids.length) continue

  const summaries = await requestJson('esummary.fcgi', {
    db: 'pubmed',
    id: ids.join(','),
    retmode: 'json',
  })

  for (const pmid of ids) {
    const summary = summaries?.result?.[pmid]
    if (!summary) continue
    const decisionKey = `${entity.entityId}:${pmid}`
    if (decided.has(decisionKey)) continue
    const title = decode(summary.title)
    const studyClass = publicationClass(summary.pubtype, title)
    const safety = safetySignal(title)
    const candidate = {
      queueId: `pubmed:${entity.entityId}:${pmid}`,
      entityId: entity.entityId,
      ingredientSlug: entity.slug,
      ingredientName: entity.displayName || entity.slug,
      pmid: String(pmid),
      doi: doiFrom(summary),
      title,
      authors: authorsFrom(summary),
      journal: decode(summary.fulljournalname || summary.source),
      publicationDate: summary.pubdate || null,
      epubDate: summary.epubdate || null,
      publicationTypes: Array.isArray(summary.pubtype) ? summary.pubtype : [],
      studyClass,
      safetySignal: safety,
      likelyGradeImpactScore: gradeChangeScore(studyClass, safety, entity.priorityWeight, title),
      priorityWeight: Number(entity.priorityWeight || 0),
      pubmedUrl: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      discoveredAt: new Date().toISOString(),
      status: 'needs-review',
      automationDecision: 'none — reviewer must inspect the paper before any evidence grade or public conclusion changes',
    }
    const existing = queue.get(candidate.queueId)
    if (!existing || candidate.likelyGradeImpactScore > existing.likelyGradeImpactScore) queue.set(candidate.queueId, candidate)
  }
}

const studies = [...queue.values()].sort((a, b) => b.likelyGradeImpactScore - a.likelyGradeImpactScore || String(b.publicationDate).localeCompare(String(a.publicationDate)))
const report = {
  generatedAt: new Date().toISOString(),
  status: 'review-required',
  source: 'NCBI PubMed ESearch + ESummary',
  windowDays: relativeDays,
  entityCount: priorities.length,
  searchSummary: searches,
  studyCount: studies.length,
  likelyGradeImpact: studies.filter((study) => study.likelyGradeImpactScore >= 70).length,
  safetyStudies: studies.filter((study) => study.safetySignal).length,
  policy: 'Discovery metadata is not evidence adjudication. No public claims, grades, doses, or safety conclusions may change until a reviewer accepts/rejects the study with provenance.',
  studies,
}
writeJson(outputPath, report)
console.log(`[pubmed-ingest] queued ${studies.length} undecided study/entity matches; likely-grade-impact=${report.likelyGradeImpact}; safety=${report.safetyStudies}`)
if (studies[0]) console.log(`[pubmed-ingest] top review: ${studies[0].ingredientName} · ${studies[0].studyClass} · PMID ${studies[0].pmid} · impact ${studies[0].likelyGradeImpactScore}`)
console.log(`[pubmed-ingest] review queue: ${path.relative(root, outputPath)}`)
