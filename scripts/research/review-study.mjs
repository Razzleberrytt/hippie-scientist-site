#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const root = process.cwd()
const [action, identifier] = process.argv.slice(2).filter((arg) => !arg.startsWith('--'))
const queuePath = path.resolve(process.argv.find((arg) => arg.startsWith('--queue='))?.slice(8) || 'artifacts/research-intake/pubmed-review-queue.json')
const decisionsPath = path.resolve(process.argv.find((arg) => arg.startsWith('--decisions='))?.slice(12) || 'data/research/review-decisions.jsonl')
const entityArg = process.argv.find((arg) => arg.startsWith('--entity='))?.slice(9)
const reason = process.argv.find((arg) => arg.startsWith('--reason='))?.slice(9) || ''
const reviewer = process.env.GITHUB_ACTOR || process.env.USER || process.env.USERNAME || 'local-reviewer'

if (!['accept', 'reject'].includes(action) || !identifier) {
  console.error('Usage: node scripts/research/review-study.mjs <accept|reject> <queueId|PMID> [--entity=entityId] [--reason="..."] [--queue=path]')
  process.exit(1)
}
if (!fs.existsSync(queuePath)) {
  console.error(`[review-study] queue not found: ${queuePath}`)
  process.exit(1)
}

const queue = JSON.parse(fs.readFileSync(queuePath, 'utf8'))
const studies = Array.isArray(queue.studies) ? queue.studies : []
const matches = studies.filter((study) => {
  if (identifier === study.queueId) return true
  if (String(identifier) === String(study.pmid) && (!entityArg || entityArg === study.entityId)) return true
  return false
})
if (!matches.length) {
  console.error(`[review-study] no matching study for ${identifier}${entityArg ? ` / ${entityArg}` : ''}`)
  process.exit(1)
}
if (matches.length > 1) {
  console.error(`[review-study] PMID ${identifier} matches multiple entities; pass --entity=<entityId> or the full queueId`)
  process.exit(1)
}
const study = matches[0]

let prior = []
if (fs.existsSync(decisionsPath)) {
  prior = fs.readFileSync(decisionsPath, 'utf8').split(/\r?\n/).filter(Boolean).flatMap((line) => {
    try { return [JSON.parse(line)] } catch { return [] }
  })
}
const existing = prior.find((item) => item.queueId === study.queueId && item.supersededBy == null)
if (existing) {
  console.error(`[review-study] active decision already exists for ${study.queueId}: ${existing.decision} at ${existing.decidedAt}`)
  process.exit(1)
}

const decidedAt = new Date().toISOString()
const record = {
  provenanceId: `decision:${crypto.createHash('sha256').update(`${study.queueId}:${action}:${decidedAt}:${reviewer}`).digest('hex').slice(0, 16)}`,
  queueId: study.queueId,
  entityId: study.entityId,
  ingredientSlug: study.ingredientSlug,
  pmid: study.pmid,
  doi: study.doi || null,
  title: study.title,
  studyClass: study.studyClass,
  safetySignal: Boolean(study.safetySignal),
  likelyGradeImpactScore: study.likelyGradeImpactScore,
  decision: action === 'accept' ? 'accepted-for-editorial-review' : 'rejected-from-review-queue',
  decisionMeaning: action === 'accept'
    ? 'This study may now be used by an editor/researcher in evidence adjudication; acceptance does not automatically change a grade or conclusion.'
    : 'This study/entity match was rejected from the intake queue; rejection does not delete the discovery provenance.',
  reason: reason || null,
  reviewer,
  decidedAt,
  sourceQueueGeneratedAt: queue.generatedAt || null,
  sourceSystem: queue.source || 'PubMed review queue',
  supersededBy: null,
}

fs.mkdirSync(path.dirname(decisionsPath), { recursive: true })
fs.appendFileSync(decisionsPath, `${JSON.stringify(record)}\n`)
console.log(`[review-study] ${record.decision}: ${study.queueId}`)
console.log(`[review-study] provenance: ${record.provenanceId}`)
console.log('[review-study] no evidence grade or public conclusion was changed automatically')
