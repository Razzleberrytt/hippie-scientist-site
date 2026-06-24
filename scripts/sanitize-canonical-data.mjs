#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const TARGETS = [
  { kind: 'herbs', file: 'public/data/herbs.json' },
  { kind: 'compounds', file: 'public/data/compounds.json' },
]

const JUNK_EXACT = new Set(['nan', 'null', 'undefined', '[object object]'])
const PLACEHOLDER_EXACT = new Set([
  'no direct effects data',
  'contextual inference',
  'no direct mechanism data',
  'no direct mechanism',
  'insufficient data',
  'placeholder',
])
const NUMERIC_ONLY = /^\d+(?:[\s.,/-]\d+)*$/

const asText = value => String(value ?? '').trim()
const cleanWhitespace = value => asText(value).replace(/\s+/g, ' ')

function isJunkString(value) {
  return JUNK_EXACT.has(cleanWhitespace(value).toLowerCase())
}

function isPlaceholderText(value) {
  const text = cleanWhitespace(value).toLowerCase()
  if (!text) return false
  if (PLACEHOLDER_EXACT.has(text)) return true
  if (/^no direct [a-z\s-]+$/i.test(text)) return true
  return false
}

function pickDisplayName(record, kind) {
  const fields =
    kind === 'herbs'
      ? [record?.common, record?.commonName, record?.name, record?.latin, record?.latinName, record?.scientific]
      : [record?.name, record?.commonName, record?.common, record?.latin, record?.latinName]
  return fields.map(cleanWhitespace).find(Boolean) || ''
}

function isJunkRecordName(name) {
  if (!name) return true
  const lowered = name.toLowerCase()
  if (lowered === 'nan' || lowered === 'null' || lowered === 'undefined') return true
  if (NUMERIC_ONLY.test(name)) return true
  return false
}

function sanitizeTextValue(value, counters) {
  const original = cleanWhitespace(value)
  if (!original) return ''
  if (isJunkString(original)) {
    counters.cleanedJunkFieldValues += 1
    return ''
  }

  if (isPlaceholderText(original)) {
    counters.cleanedPlaceholderSegments += 1
    return ''
  }

  const repeatedChunk = original.match(/^(.{16,}?)(?:\s*(?:\||;|,|\/|\.)\s*\1){1,}$/i)
  if (repeatedChunk) {
    counters.cleanedPlaceholderSegments += 1
    return cleanWhitespace(repeatedChunk[1])
  }

  return original
}

function sanitizeValue(value, counters) {
  if (typeof value === 'string') return sanitizeTextValue(value, counters)
  if (Array.isArray(value)) {
    return value.map(item => sanitizeValue(item, counters)).filter(item => {
      if (typeof item === 'string') return cleanWhitespace(item).length > 0
      return item !== null && item !== undefined
    })
  }
  if (value && typeof value === 'object') {
    const out = {}
    for (const [key, nested] of Object.entries(value)) {
      const cleaned = sanitizeValue(nested, counters)
      out[key] = cleaned
    }
    return out
  }
  return value
}

function readJson(relativePath) {
  const full = path.join(ROOT, relativePath)
  return JSON.parse(fs.readFileSync(full, 'utf8'))
}

function writeJson(relativePath, data) {
  const full = path.join(ROOT, relativePath)
  fs.writeFileSync(full, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
}

function sanitizeDataset(kind, records) {
  const counters = {
    removedJunkNameRecords: 0,
    cleanedJunkFieldValues: 0,
    cleanedPlaceholderSegments: 0,
  }

  const sanitized = []
  for (const record of Array.isArray(records) ? records : []) {
    if (!record || typeof record !== 'object') continue
    const name = pickDisplayName(record, kind)
    if (isJunkRecordName(name)) {
      counters.removedJunkNameRecords += 1
      continue
    }
    sanitized.push(sanitizeValue(record, counters))
  }

  return { sanitized, counters }
}

function run() {
  const report = { generatedAt: new Date().toISOString(), datasets: {} }
  for (const target of TARGETS) {
    const input = readJson(target.file)
    const { sanitized, counters } = sanitizeDataset(target.kind, input)
    writeJson(target.file, sanitized)
    report.datasets[target.kind] = {
      file: target.file,
      before: Array.isArray(input) ? input.length : 0,
      after: sanitized.length,
      ...counters,
    }
  }
  console.log(JSON.stringify(report, null, 2))
}

run()
