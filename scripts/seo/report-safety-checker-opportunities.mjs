#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const inputPath = process.argv[2] || path.join(process.cwd(), 'ops', 'analytics', 'safety-checker-events.json')
const outputPath = process.argv[3] || path.join(process.cwd(), 'reports', 'safety-checker-content-opportunities.json')

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return []
  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  return Array.isArray(parsed) ? parsed : Array.isArray(parsed.events) ? parsed.events : []
}

function combinationFromEvent(event) {
  if (event?.name !== 'search_used') return null
  if (event?.payload?.kind !== 'safety-checker') return null
  const combination = String(event?.payload?.query || '').trim()
  if (!combination || !/^(?:herb|compound|med):[a-z0-9-]+(?:\+(?:herb|compound|med):[a-z0-9-]+)+$/.test(combination)) return null
  return combination
}

const events = readJson(inputPath)
const counts = new Map()
for (const event of events) {
  const combination = combinationFromEvent(event)
  if (!combination) continue
  counts.set(combination, (counts.get(combination) || 0) + 1)
}

const opportunities = Array.from(counts.entries())
  .map(([combination, checks]) => ({
    combination,
    checks,
    recommendation: checks >= 10 ? 'editorial-review-priority' : checks >= 3 ? 'watch' : 'low-signal',
    nextStep: 'Verify interaction-specific evidence and source provenance before creating any indexable guide.',
  }))
  .sort((a, b) => b.checks - a.checks || a.combination.localeCompare(b.combination))

fs.mkdirSync(path.dirname(outputPath), { recursive: true })
fs.writeFileSync(outputPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), inputPath, opportunities }, null, 2)}\n`)
console.log(`Wrote ${opportunities.length} Safety Checker content opportunities to ${outputPath}`)
