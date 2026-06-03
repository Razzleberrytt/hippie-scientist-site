#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const herbsPath = path.join(ROOT, 'public', 'data', 'herbs.json')
const outputPath = path.join(ROOT, 'public', 'data', 'missing-fields-report.json')
const shouldWrite = process.argv.includes('--write')

function hasValue(value) {
  if (Array.isArray(value)) return value.some(hasValue)
  if (value && typeof value === 'object') return Object.values(value).some(hasValue)
  if (value == null) return false
  return String(value).trim().length > 0
}

const payload = JSON.parse(fs.readFileSync(herbsPath, 'utf8'))
const herbs = Array.isArray(payload) ? payload : []

const fields = [
  { key: 'class', fallback: ['category'], label: 'class' },
  { key: 'activeCompounds', fallback: ['compounds'], label: 'activeCompounds' },
  { key: 'therapeuticUses', fallback: ['therapeutic'], label: 'therapeuticUses' },
  { key: 'contraindications', fallback: [], label: 'contraindications' },
  { key: 'interactions', fallback: [], label: 'interactions' },
]

const missing = {}
const entries = herbs.map(herb => {
  const missingFields = fields
    .filter(field => {
      const candidate = [field.key, ...field.fallback]
        .map(key => herb?.[key])
        .find(value => value !== undefined)
      return !hasValue(candidate)
    })
    .map(field => field.label)

  return {
    slug: String(herb.slug || '').trim(),
    common: String(herb.common || herb.name || '').trim(),
    missingFields,
  }
})

fields.forEach(field => {
  missing[field.label] = entries.reduce(
    (count, herb) => count + (herb.missingFields.includes(field.label) ? 1 : 0),
    0
  )
})

const report = {
  total: herbs.length,
  missing,
  incompleteEntries: entries.filter(entry => entry.missingFields.length > 0),
  generatedAt: new Date().toISOString(),
}

if (shouldWrite) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`)
}

console.log(JSON.stringify(report, null, 2))
