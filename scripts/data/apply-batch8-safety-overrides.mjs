#!/usr/bin/env node
/**
 * Durable Batch 8 safety-only overlays. Runs after workbook/governance regeneration,
 * before derived search/publication artifacts. Educational visibility is unchanged.
 *
 * This is an AI-researched precautionary hold, NOT human editorial approval
 * or admission of the outstanding 75 record-level Batch 8 findings.
 */
import fs from 'node:fs'
import path from 'node:path'
import { writeJsonAtomic } from '../lib/atomic-json.mjs'

const root = process.cwd()
const arg = process.argv.find(value => value.startsWith('--data-dir='))
const dataDir = path.resolve(root, arg ? arg.slice('--data-dir='.length) : 'public/data')
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'ops/safety/batch8-reviewed-overrides.json'), 'utf8'))
const reason = 'Batch 8 precautionary safety hold pending independent scientific and product/formulation review'

function read(file) {
  if (!fs.existsSync(file)) throw new Error(`Missing Batch 8 target: ${file}`)
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}
function write(file, value) {
  const next = JSON.stringify(value, null, 2) + '\n'
  if (fs.readFileSync(file, 'utf8') !== next) writeJsonAtomic(file, value)
}
function appendUniqueSafety(previous, alert) {
  const earlier = typeof previous === 'string' ? previous.trim() : ''
  const warning = String(alert || '').trim()
  if (!warning) throw new Error('Batch 8 safety alert cannot be empty')
  if (!earlier || earlier.startsWith(warning)) return earlier || warning
  // Always surface the qualified danger warning in the first two sentences.
  // Move a previously appended copy to the front without duplicating it.
  const legacy = earlier.replace(warning, '').trim()
  return legacy ? `${warning}\n\n${legacy}` : warning
}
function mergeWarnings(existing, next) {
  const out = Array.isArray(existing) ? [...existing] : []
  for (const item of next) if (typeof item === 'string' && !out.includes(item)) out.push(item)
  return out
}
function mergeSources(existing, next) {
  const out = Array.isArray(existing) ? [...existing] : []
  const known = new Set(out.map(s => String(s?.url || s?.pubmedId || s?.pmid || s?.doi || s?.id || s)))
  for (const source of next) {
    if (!source?.url || !/^https:\/\//.test(source.url)) throw new Error('Batch 8 source requires existing HTTPS evidence URL')
    if (!known.has(source.url)) { out.push(source); known.add(source.url) }
  }
  return out
}
function applyHold(record, alert) {
  record.governance = {
    ...(record.governance && typeof record.governance === 'object' ? record.governance : {}),
    medicalRisk: alert.medicalRisk,
    monetizationAllowed: false,
    recommendationAllowed: false,
    requiresHumanReview: true,
    reason,
  }
  // Do not promote publication/indexing status or approvals.
}
let profiles = 0
for (const [kind, profilesBySlug] of [['herbs', manifest.herbs], ['compounds', manifest.compounds]]) {
  const listPath = path.join(dataDir, `${kind}.json`)
  const list = read(listPath)
  if (!Array.isArray(list)) throw new Error(`Expected array: ${listPath}`)
  const folder = kind === 'herbs' ? 'herbs-detail' : 'compounds-detail'
  for (const [slug, alert] of Object.entries(profilesBySlug)) {
    const row = list.find(item => item?.slug === slug)
    if (!row) throw new Error(`Batch 8 missing canonical ${kind} record: ${slug}`)
    const file = path.join(dataDir, folder, `${slug}.json`)
    const detail = read(file)
    if (detail?.slug !== slug) throw new Error(`Batch 8 identity mismatch: ${file}`)
    if (!Array.isArray(alert.sources) || alert.sources.length === 0) throw new Error(`Batch 8 sources missing: ${slug}`)
    detail.safetyNotes = appendUniqueSafety(detail.safetyNotes, alert.safetyNotes)
    detail.contraindications = mergeWarnings(detail.contraindications, alert.contraindications)
    detail.sources = mergeSources(detail.sources, alert.sources)
    // Core-owned render aliases must not lose the warning on regeneration.
    detail.safety = appendUniqueSafety(detail.safety, alert.safetyNotes)
    if (typeof row.safety === 'string') row.safety = appendUniqueSafety(row.safety, alert.safetyNotes)
    applyHold(row, alert)
    applyHold(detail, alert)
    write(file, detail)
    profiles += 1
  }
  write(listPath, list)
}
if (profiles !== 11) throw new Error(`Unexpected Batch 8 hold count: ${profiles}`)
console.log(`[batch8-safety] PASS: ${profiles} safety holds re-applied; no new product approvals`)
