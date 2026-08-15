#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const inputPath = process.argv[2]
const outputPath = process.argv[3] || 'artifacts/search-failure-backlog.json'

if (!inputPath) {
  console.error('Usage: node scripts/ops/build-search-failure-backlog.mjs <failed-search-export.json> [output.json]')
  process.exit(1)
}

const raw = JSON.parse(fs.readFileSync(inputPath, 'utf8'))
const rows = Array.isArray(raw) ? raw : Array.isArray(raw.rows) ? raw.rows : []

const counts = new Map()
for (const row of rows) {
  const term = String(row.search_term ?? row.searchTerm ?? row.term ?? '').trim().toLowerCase()
  if (!term) continue
  const count = Number(row.count ?? row.event_count ?? row.eventCount ?? 1)
  if (!Number.isFinite(count) || count <= 0) continue
  counts.set(term, (counts.get(term) || 0) + count)
}

const backlog = Array.from(counts, ([query, failures]) => ({
  query,
  failures,
  priority: failures >= 25 ? 'high' : failures >= 10 ? 'medium' : 'low',
  recommendedAction: 'Review whether this miss needs an alias/synonym, canonical entity, extract name, condition mapping, or new editorial content.',
}))
  .sort((a, b) => b.failures - a.failures || a.query.localeCompare(b.query))

fs.mkdirSync(path.dirname(outputPath), { recursive: true })
fs.writeFileSync(outputPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), backlog }, null, 2)}\n`)
console.log(`Wrote ${backlog.length} ranked failed-search backlog items to ${outputPath}`)
