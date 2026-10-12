#!/usr/bin/env node
/**
 * Batch 8 P0 safety hardening after workbook regeneration.
 *
 * Source of truth: data-sources/batch8-safety-overrides.json.
 * This is a fail-closed safety/commerce override, not clinical evidence approval.
 * Keep educational records visible under their existing indexability policy.
 */
import fs from 'node:fs'
import path from 'node:path'
import { writeJsonAtomic } from '../lib/atomic-json.mjs'

const root = process.cwd()
const dataArg = process.argv.find(arg => arg.startsWith('--data-dir='))
const dataDir = path.resolve(root, dataArg ? dataArg.slice('--data-dir='.length) : 'public/data')
const manifestFile = path.join(root, 'data-sources/batch8-safety-overrides.json')
const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'))

if (!Array.isArray(manifest.entries) || manifest.entries.length !== 11) {
  throw new Error('Batch 8 safety manifest is missing or incomplete; release is blocked')
}

const seen = new Set()
const edits = new Map()
function addSafety(record, entry) {
  const existingSafety = typeof record.safetyNotes === 'string'
    ? record.safetyNotes.trim()
    : typeof record.safety === 'string' ? record.safety.trim() : ''
  const newSafety = entry.safetyNotes.trim()
  const combined = existingSafety.includes(newSafety) ? existingSafety
    : existingSafety && !newSafety.includes(existingSafety) ? newSafety + ' ' + existingSafety : newSafety
  const contraindications = Array.from(new Set([
    ...(Array.isArray(record.contraindications) ? record.contraindications : []),
    ...entry.contraindications,
  ].filter(item => typeof item === 'string' && item.trim())))
  const sources = Array.isArray(record.sources) ? [...record.sources] : []
  const sourceIds = new Set(sources.map(s => String(s?.url || s?.id || s)))
  for (const source of entry.sources) {
    const id = String(source?.url || '')
    if (!id || !/^https:\/\//.test(id)) throw new Error('Batch 8 has invalid evidence source: ' + entry.slug)
    if (!sourceIds.has(id)) { sources.push(source); sourceIds.add(id) }
  }
  return {
    ...record,
    safety: combined,
    safetyNotes: combined,
    contraindications,
    sources,
    governance: {
      ...(record.governance && typeof record.governance === 'object' ? record.governance : {}),
      medicalRisk: entry.medicalRisk,
      monetizationAllowed: false,
      recommendationAllowed: false,
      requiresHumanReview: true,
      reason: 'Batch 8 safety quarantine pending independent editorial and exact-product review',
    },
  }
}

function getFile(relative) {
  const filename = path.join(dataDir, relative)
  let entry = edits.get(filename)
  if (!entry) {
    if (!fs.existsSync(filename)) throw new Error('Missing Batch 8 generated target: ' + relative)
    entry = JSON.parse(fs.readFileSync(filename, 'utf8'))
    edits.set(filename, entry)
  }
  return entry
}

for (const entry of manifest.entries) {
  if (!['herb', 'compound'].includes(entry.kind) || !/^[a-z0-9-]+$/.test(entry.slug) ||
      typeof entry.safetyNotes !== 'string' || !entry.safetyNotes.trim() ||
      !Array.isArray(entry.contraindications) || !Array.isArray(entry.sources) || !entry.sources.length ||
      !['high', 'moderate'].includes(entry.medicalRisk)) {
    throw new Error('Invalid Batch 8 override entry: ' + String(entry.slug))
  }
  const key = entry.kind + ':' + entry.slug
  if (seen.has(key)) throw new Error('Duplicate Batch 8 safety override: ' + key)
  seen.add(key)
  const collection = entry.kind === 'herb' ? 'herbs' : 'compounds'
  const list = getFile(collection + '.json')
  if (!Array.isArray(list)) throw new Error('Unexpected generated list: ' + collection)
  const index = list.findIndex(record => record?.slug === entry.slug)
  if (index < 0) throw new Error('Missing Batch 8 published entity: ' + key)
  list[index] = addSafety(list[index], entry)

  const relativeDetail = collection + '-detail/' + entry.slug + '.json'
  const detail = getFile(relativeDetail)
  if (detail?.slug !== entry.slug) throw new Error('Detail identity mismatch: ' + relativeDetail)
  edits.set(path.join(dataDir, relativeDetail), addSafety(detail, entry))
}

// Validate all inputs and all targets before writing, then use the shared
// atomic helper. Never change the approval grade, claim map or indexability.
for (const [filename, record] of edits) writeJsonAtomic(filename, record)
console.log('[batch8-safety] applied 11 versioned holds to canonical and detail data')
