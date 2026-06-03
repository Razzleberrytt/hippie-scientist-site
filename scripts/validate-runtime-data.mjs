#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')

const REQUIRED_FIELDS = {
  name: 'string',
  slug: 'string',
  scientificName: 'string',
  summary: 'string',
  description: 'string',
  mechanismTags: 'array',
  activeCompounds: 'array',
  interactions: 'array',
}

const DEFAULT_SUMMARY = 'Profile pending review'

function isStringArray(value) {
  return Array.isArray(value) && value.every(item => typeof item === 'string')
}

function run() {
  const herbsPath = path.join(repoRoot, 'public', 'data-next', 'herbs.json')
  const herbs = JSON.parse(fs.readFileSync(herbsPath, 'utf8'))

  const blocking = []
  const warnings = []

  if (!Array.isArray(herbs)) {
    console.error('[data-next-validate] herbs.json must be an array')
    process.exit(1)
  }

  herbs.forEach((record, index) => {
    for (const [field, expectedType] of Object.entries(REQUIRED_FIELDS)) {
      if (!(field in record)) {
        blocking.push(`row ${index}: missing required field '${field}'`)
        continue
      }

      const value = record[field]
      if (expectedType === 'string' && typeof value !== 'string') {
        blocking.push(`row ${index}: field '${field}' expected string`)
      }
      if (expectedType === 'array' && !isStringArray(value)) {
        blocking.push(`row ${index}: field '${field}' expected string[]`)
      }
    }

    if (typeof record.scientificName === 'string' && !record.scientificName.trim()) {
      warnings.push(`row ${index}: empty scientificName`)
    }
    if (typeof record.summary === 'string' && record.summary.trim() === DEFAULT_SUMMARY) {
      warnings.push(`row ${index}: default summary in use`)
    }
    if (typeof record.description === 'string' && !record.description.trim()) {
      warnings.push(`row ${index}: empty description`)
    }
    if (Array.isArray(record.activeCompounds) && record.activeCompounds.length === 0) {
      warnings.push(`row ${index}: empty activeCompounds`)
    }
  })

  warnings.forEach(line => console.warn(`[data-next-validate] WARN ${line}`))

  if (blocking.length > 0) {
    blocking.forEach(line => console.error(`[data-next-validate] ERROR ${line}`))
    console.error(`[data-next-validate] blocking structural issues: ${blocking.length}`)
    process.exit(1)
  }

  console.log(`[data-next-validate] PASS herbs structural validation (public/data-next) warnings=${warnings.length}`)
}

run()
