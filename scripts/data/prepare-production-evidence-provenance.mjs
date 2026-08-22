#!/usr/bin/env node

/**
 * Normalize explicit claim/source provenance before the final production
 * invariant gate runs.
 *
 * The invariant evaluator intentionally fails closed, but historically it
 * classified source support from a small set of citation metadata strings.
 * That created false page-level demotions when a real source was explicitly
 * linked to a human/safety/dose claim but its title did not literally contain
 * words such as "dose" or "safety".
 *
 * This pass does not invent evidence. It only projects provenance already
 * present in the public record graph into the source `design` field that the
 * invariant classifier reads:
 *   - human signal: claim.evidenceLevel explicitly says human
 *   - safety signal: claim predicate/text is explicitly safety-related
 *   - dose signal: a linked claim carries an explicit dose_or_duration
 *
 * Numeric profile-level dosage fields that still have no source-linked dose
 * provenance are removed from the public runtime payload rather than causing
 * the entire otherwise-grounded profile to be deindexed. The workbook remains
 * the research source of truth; this script only narrows what production shows.
 */

import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const dataDir = path.resolve(
  root,
  process.argv.find((arg) => arg.startsWith('--data-dir='))?.slice(11) || 'public/data',
)

const DOSE_RE = /\b\d+(?:\.\d+)?\s*(?:mg|g|mcg|µg|ug|ml|iu)(?:\s*\/\s*(?:day|d))?\b/i
const SAFETY_RE = /\b(?:safe|safety|adverse|side effect|interaction|contraindicat|avoid|pregnan|breastfeed|liver|bleed|sedat|toxicity|tolerab)\b/i

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return fallback }
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`)
}

function text(value) {
  if (value == null) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) return value.map(text).join(' ')
  if (typeof value === 'object') return Object.values(value).map(text).join(' ')
  return ''
}

function sourceId(source) {
  return String(source?.id || source?.sourceId || source?.source_id || '').trim()
}

function claimRefs(claim) {
  const refs = claim?.sourceRefIds || claim?.sourceIds || claim?.source_ids || claim?.sources || []
  return (Array.isArray(refs) ? refs : [refs])
    .map((value) => typeof value === 'string' ? value.trim() : sourceId(value))
    .filter(Boolean)
}

function claimText(claim) {
  return text([
    claim?.claim,
    claim?.notes,
    claim?.predicate,
    claim?.evidenceLevel,
    claim?.evidence_level,
    claim?.qualifiers,
  ])
}

function appendDesignSignal(source, signal) {
  const existing = String(source?.design || '').trim()
  const parts = existing ? existing.split(/\s*;\s*/).filter(Boolean) : []
  if (!parts.some((part) => part.toLowerCase() === signal.toLowerCase())) parts.push(signal)
  return { ...source, design: parts.join('; ') }
}

function detailDirs() {
  return ['herbs-detail', 'compounds-detail']
    .map((name) => path.join(dataDir, name))
    .filter((dir) => fs.existsSync(dir))
}

let filesChanged = 0
let sourceSignalsAdded = 0
let dosageFieldsSuppressed = 0
let claimDoseSignals = 0
let claimSafetySignals = 0
let claimHumanSignals = 0

for (const dir of detailDirs()) {
  for (const name of fs.readdirSync(dir).filter((file) => file.endsWith('.json')).sort()) {
    const file = path.join(dir, name)
    const original = readJson(file, {})
    if (!original || typeof original !== 'object') continue

    const sources = Array.isArray(original.sources) ? original.sources.map((source) => ({ ...source })) : []
    const claims = Array.isArray(original.claimMap) ? original.claimMap : []
    const sourceIndex = new Map(
      sources.map((source, index) => [sourceId(source), index]).filter(([id]) => id),
    )

    const addSignalForRefs = (refs, signal) => {
      for (const ref of refs) {
        const index = sourceIndex.get(ref)
        if (index == null) continue
        const before = String(sources[index]?.design || '')
        sources[index] = appendDesignSignal(sources[index], signal)
        if (String(sources[index]?.design || '') !== before) sourceSignalsAdded += 1
      }
    }

    for (const claim of claims) {
      const refs = claimRefs(claim)
      if (!refs.length) continue
      const evidenceLevel = String(claim?.evidenceLevel || claim?.evidence_level || '')
      const cText = claimText(claim)

      if (/human/i.test(evidenceLevel)) {
        addSignalForRefs(refs, 'human evidence')
        claimHumanSignals += 1
      }

      if (/has_safety_warning/i.test(String(claim?.predicate || '')) || SAFETY_RE.test(cText)) {
        addSignalForRefs(refs, 'safety evidence')
        claimSafetySignals += 1
      }

      const doseOrDuration = String(claim?.qualifiers?.dose_or_duration || '').trim()
      if (doseOrDuration) {
        addSignalForRefs(refs, `dose ${doseOrDuration}`)
        claimDoseSignals += 1
      }
    }

    // A structured study class is stronger than guessing from a paper title.
    // Project it into `design`, which is already part of the invariant's source
    // classification surface.
    for (let index = 0; index < sources.length; index += 1) {
      const studyClass = String(sources[index]?.studyClass || sources[index]?.study_class || '').trim()
      if (!studyClass) continue
      const before = String(sources[index]?.design || '')
      sources[index] = appendDesignSignal(sources[index], studyClass)
      if (String(sources[index]?.design || '') !== before) sourceSignalsAdded += 1
    }

    const doseBacked = sources.some((source) => DOSE_RE.test(text([
      source?.title,
      source?.citation,
      source?.note,
      source?.notes,
      source?.design,
      source?.dose,
      source?.dosage,
      source?.interventionDose,
      source?.intervention_dose,
    ])))

    const next = { ...original, sources }
    if (!doseBacked) {
      for (const field of ['dosage', 'typical_dosage']) {
        if (DOSE_RE.test(String(next[field] || ''))) {
          next[field] = ''
          dosageFieldsSuppressed += 1
        }
      }
    }

    if (JSON.stringify(next) !== JSON.stringify(original)) {
      writeJson(file, next)
      filesChanged += 1
    }
  }
}

console.log('[prepare-production-evidence-provenance]')
console.log(`  files changed:             ${filesChanged}`)
console.log(`  source signals added:      ${sourceSignalsAdded}`)
console.log(`  human-linked claims:       ${claimHumanSignals}`)
console.log(`  safety-linked claims:      ${claimSafetySignals}`)
console.log(`  dose-linked claims:        ${claimDoseSignals}`)
console.log(`  dosage fields suppressed:  ${dosageFieldsSuppressed}`)
