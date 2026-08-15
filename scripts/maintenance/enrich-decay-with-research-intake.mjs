#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const basePath = path.resolve(process.argv[2] || 'data/maintenance/content-decay-signals.json')
const queuePath = path.resolve(process.argv[3] || 'artifacts/research-intake/pubmed-review-queue.json')
const outputPath = path.resolve(process.env.ENRICHED_DECAY_SIGNALS || 'artifacts/maintenance/content-decay-signals-enriched.json')
const impactThreshold = Number(process.env.RESEARCH_DECAY_IMPACT_THRESHOLD || 50)

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return fallback }
}
function normalizeUrl(value) {
  try {
    const url = new URL(String(value), 'https://thehippiescientist.net')
    const pathname = url.pathname.replace(/\/+/g, '/')
    return pathname === '/' || pathname.endsWith('/') ? pathname : `${pathname}/`
  } catch { return '' }
}
function pageUrlForStudy(study) {
  const prefix = String(study.entityId || '').split(':')[0]
  const collection = prefix === 'herb' ? 'herbs' : prefix === 'compound' ? 'compounds' : ''
  return collection && study.ingredientSlug ? `/${collection}/${study.ingredientSlug}/` : ''
}

const base = readJson(basePath, { schemaVersion: 1, rows: [] })
if (!Array.isArray(base.rows)) throw new Error('base decay signals must contain rows[]')
const queue = readJson(queuePath, { studies: [] })
const studies = Array.isArray(queue.studies) ? queue.studies : []

const rows = base.rows.map((row) => ({ ...row, url: normalizeUrl(row.url), researchSignals: Array.isArray(row.researchSignals) ? row.researchSignals : [] }))
const byUrl = new Map(rows.filter((row) => row.url).map((row) => [row.url, row]))

for (const study of studies) {
  if (Number(study.likelyGradeImpactScore || 0) < impactThreshold) continue
  const url = pageUrlForStudy(study)
  if (!url) continue
  let row = byUrl.get(url)
  if (!row) {
    row = {
      url,
      impressions28: 0,
      clicks28: 0,
      clicksPrevious28: 0,
      positionCurrent: 100,
      positionPrevious: 100,
      ctrCurrent: 0,
      ctrPrevious: 0,
      revenue28: 0,
      daysSinceEvidenceSearch: 0,
      avgCitationAgeDays: 0,
      productChanged: false,
      newResearchCount: 0,
      priorityBoost: 0,
      queryOpportunities: [],
      researchSignals: [],
    }
    rows.push(row)
    byUrl.set(url, row)
  }
  row.newResearchCount = Number(row.newResearchCount || 0) + 1
  row.priorityBoost = Math.max(Number(row.priorityBoost || 0), study.safetySignal ? 8 : study.likelyGradeImpactScore >= 75 ? 6 : 3)
  row.researchSignals.push({
    queueId: study.queueId,
    pmid: study.pmid,
    studyClass: study.studyClass,
    likelyGradeImpactScore: study.likelyGradeImpactScore,
    safetySignal: Boolean(study.safetySignal),
    title: study.title,
  })
}

const output = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  baseGeneratedAt: base.generatedAt || null,
  pubmedQueueGeneratedAt: queue.generatedAt || null,
  researchImpactThreshold: impactThreshold,
  rows,
}
fs.mkdirSync(path.dirname(outputPath), { recursive: true })
fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`)
const affected = rows.filter((row) => row.researchSignals.length).length
console.log(`[decay-research] enriched ${affected} page(s) with high-impact PubMed intake signals`)
console.log(`[decay-research] output: ${path.relative(root, outputPath)}`)
