#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const herbsPath = path.join(ROOT, 'public', 'data', 'herbs.json')

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

const report = {}
for (const field of fields) {
  report[field.label] = herbs.reduce((missing, herb) => {
    const candidate = [field.key, ...field.fallback]
      .map(key => herb?.[key])
      .find(value => value !== undefined)
    return missing + (hasValue(candidate) ? 0 : 1)
  }, 0)
}

console.log(JSON.stringify({ total: herbs.length, missing: report }, null, 2))
