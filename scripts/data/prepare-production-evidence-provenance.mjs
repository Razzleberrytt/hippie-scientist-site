#!/usr/bin/env node

/**
 * Prepare evidence provenance immediately before production invariants run.
 *
 * Source classification must come from the source/study record itself. This
 * pass deliberately does NOT copy claim labels (human/safety/dose) back onto a
 * linked source: doing so makes the later source-backed invariant circular
 * (claim says human -> source gets "human evidence" -> human-source gate passes).
 *
 * The only mutation retained here is fail-closed dosage suppression. Numeric
 * profile-level dose fields are removed when no source record independently
 * carries dose information. The workbook remains the research source of truth;
 * this narrows only what production may publish.
 */

import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const dataDir = path.resolve(
  root,
  process.argv.find((arg) => arg.startsWith('--data-dir='))?.slice(11) || 'public/data',
)

const DOSE_RE = /\b\d+(?:\.\d+)?\s*(?:mg|g|mcg|µg|ug|ml|iu)(?:\s*\/\s*(?:day|d))?\b/i

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

function detailDirs() {
  return ['herbs-detail', 'compounds-detail']
    .map((name) => path.join(dataDir, name))
    .filter((dir) => fs.existsSync(dir))
}

let filesChanged = 0
let dosageFieldsSuppressed = 0

for (const dir of detailDirs()) {
  for (const name of fs.readdirSync(dir).filter((file) => file.endsWith('.json')).sort()) {
    const file = path.join(dir, name)
    const original = readJson(file, {})
    if (!original || typeof original !== 'object') continue

    const sources = Array.isArray(original.sources) ? original.sources : []
    const doseBacked = sources.some((source) => DOSE_RE.test(text([
      source?.title,
      source?.citation,
      source?.note,
      source?.notes,
      source?.design,
      source?.studyClass,
      source?.study_class,
      source?.usedFor,
      source?.used_for,
      source?.dose,
      source?.dosage,
      source?.interventionDose,
      source?.intervention_dose,
    ])))

    const next = { ...original }
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
console.log('  claim-derived source tags: 0  (forbidden; source metadata is authoritative)')
console.log(`  dosage fields suppressed:  ${dosageFieldsSuppressed}`)
