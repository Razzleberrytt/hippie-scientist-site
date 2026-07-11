// JSONL read/write helpers with deterministic output.
//
// Canonical files are line-delimited JSON so they diff cleanly in Git: one
// record per line, keys sorted, records sorted by id. Writing is atomic-ish
// (write temp, rename) to avoid half-written files.

import fs from 'node:fs'
import path from 'node:path'
import { stableStringify } from './ids.mjs'

export function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

export function readJsonl(filePath) {
  if (!fs.existsSync(filePath)) return []
  const raw = fs.readFileSync(filePath, 'utf8')
  const records = []
  const lines = raw.split('\n')
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim()
    if (!line) continue
    try {
      records.push(JSON.parse(line))
    } catch (error) {
      throw new Error(`Invalid JSONL at ${filePath}:${i + 1}: ${error.message}`)
    }
  }
  return records
}

// Serialize records to deterministic JSONL text (no trailing newline handling
// surprises — always exactly one trailing newline when non-empty).
export function serializeJsonl(records, { sortBy = 'id' } = {}) {
  const sorted = [...records].sort((a, b) => {
    const av = String(a?.[sortBy] ?? '')
    const bv = String(b?.[sortBy] ?? '')
    return av < bv ? -1 : av > bv ? 1 : 0
  })
  if (sorted.length === 0) return ''
  return `${sorted.map((record) => stableStringify(record)).join('\n')}\n`
}

export function writeJsonl(filePath, records, options = {}) {
  ensureDir(path.dirname(filePath))
  const text = serializeJsonl(records, options)
  const tmp = `${filePath}.tmp`
  fs.writeFileSync(tmp, text, 'utf8')
  fs.renameSync(tmp, filePath)
  return records.length
}

export function readJson(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) return fallback
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

export function writeJson(filePath, value) {
  ensureDir(path.dirname(filePath))
  const tmp = `${filePath}.tmp`
  fs.writeFileSync(tmp, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
  fs.renameSync(tmp, filePath)
}

// Append a single record as one JSON line (used for immutable audit log).
export function appendJsonl(filePath, record) {
  ensureDir(path.dirname(filePath))
  fs.appendFileSync(filePath, `${stableStringify(record)}\n`, 'utf8')
}
