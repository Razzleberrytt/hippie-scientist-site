#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const outDir = path.join(root, 'reports', 'botanical-atlas')
const herbPath = path.join(root, 'public', 'data', 'herbs.json')
const compoundPath = path.join(root, 'public', 'data', 'compounds.json')
const allowlistPath = path.join(root, 'src', 'lib', 'index-allowlist.ts')

const readJsonArray = (filePath) => {
  if (!existsSync(filePath)) return []
  const parsed = JSON.parse(readFileSync(filePath, 'utf8'))
  return Array.isArray(parsed) ? parsed : []
}

const list = (value) => {
  if (Array.isArray(value)) return value.flatMap(list)
  if (typeof value !== 'string') return []
  return value.split(/[;,|]/).map((item) => item.trim()).filter(Boolean)
}

const text = (...values) => {
  const match = values.find((value) => typeof value === 'string' && value.trim())
  return typeof match === 'string' ? match.trim() : ''
}

const extractAllowlist = (source, exportName) => {
  const match = source.match(new RegExp(`export const ${exportName} = \\[([\\s\\S]*?)\\] as const`))
  if (!match) return new Set()
  return new Set(Array.from(match[1].matchAll(/['"]([^'"]+)['"]/g), (entry) => entry[1]))
}

const allowlistSource = existsSync(allowlistPath) ? readFileSync(allowlistPath, 'utf8') : ''
const herbAllowlist = extractAllowlist(allowlistSource, 'CURATED_INDEXABLE_HERB_SLUGS')
const compoundAllowlist = extractAllowlist(allowlistSource, 'CURATED_INDEXABLE_COMPOUND_SLUGS')

const fieldGroups = {
  effects: ['primary_effects', 'effects', 'primaryActions'],
  chemistry: ['compoundClasses', 'pharmCategories', 'compoundClass', 'activeCompounds', 'active_compounds', 'compounds', 'activeconstituents'],
  evidence: ['evidence_tier', 'evidenceTier', 'evidence_grade', 'evidenceLevel'],
  noticeability: ['intensityLabel', 'intensityClean', 'intensityLevel', 'intensity'],
  safety: ['safety_flags', 'interactionTags', 'contraindications', 'interactions', 'safetyNotes', 'safety_notes'],
  timing: ['time_to_effect', 'onset', 'duration'],
}

const hasGroup = (record, keys) => keys.some((key) => list(record[key]).length > 0 || text(record[key]))

const coverageRow = (record, type, indexable) => {
  const coverage = Object.fromEntries(
    Object.entries(fieldGroups).map(([group, keys]) => [group, hasGroup(record, keys)]),
  )
  const missing = Object.entries(coverage).filter(([, present]) => !present).map(([group]) => group)
  const criticalMissing = missing.filter((group) => ['effects', 'chemistry', 'noticeability', 'safety'].includes(group))
  const score = Math.round((Object.values(coverage).filter(Boolean).length / Object.keys(coverage).length) * 100)
  const priority = (indexable ? 100 : 0) + criticalMissing.length * 20 + missing.length * 5

  return {
    type,
    slug: String(record.slug || ''),
    name: text(record.displayName, record.name, record.commonName, record.title, record.slug),
    indexable,
    score,
    priority,
    missing,
    ...coverage,
  }
}

const herbs = readJsonArray(herbPath)
const compounds = readJsonArray(compoundPath)
const rows = [
  ...herbs.map((record) => coverageRow(record, 'herb', herbAllowlist.has(String(record.slug || '')))),
  ...compounds.map((record) => coverageRow(record, 'compound', compoundAllowlist.has(String(record.slug || '')))),
].filter((row) => row.slug)

rows.sort((a, b) => b.priority - a.priority || a.score - b.score || a.slug.localeCompare(b.slug))

const indexableRows = rows.filter((row) => row.indexable)
const summary = {
  generatedAt: new Date().toISOString(),
  totals: {
    profiles: rows.length,
    herbs: rows.filter((row) => row.type === 'herb').length,
    compounds: rows.filter((row) => row.type === 'compound').length,
    curatedIndexable: indexableRows.length,
  },
  indexableCoverage: Object.fromEntries(
    Object.keys(fieldGroups).map((group) => [
      group,
      indexableRows.length
        ? Math.round((indexableRows.filter((row) => row[group]).length / indexableRows.length) * 100)
        : 0,
    ]),
  ),
  topPriorityGaps: rows.filter((row) => row.missing.length).slice(0, 50),
}

mkdirSync(outDir, { recursive: true })
writeFileSync(path.join(outDir, 'coverage.json'), `${JSON.stringify({ summary, rows }, null, 2)}\n`)

const csvEscape = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`
const csvHeaders = ['type', 'slug', 'name', 'indexable', 'score', 'priority', ...Object.keys(fieldGroups), 'missing']
const csv = [
  csvHeaders.join(','),
  ...rows.map((row) => csvHeaders.map((key) => csvEscape(key === 'missing' ? row.missing.join('|') : row[key])).join(',')),
].join('\n')
writeFileSync(path.join(outDir, 'coverage.csv'), `${csv}\n`)

const percentLines = Object.entries(summary.indexableCoverage)
  .map(([field, percent]) => `| ${field} | ${percent}% |`)
  .join('\n')
const priorityLines = summary.topPriorityGaps.slice(0, 25)
  .map((row, index) => `${index + 1}. **${row.name || row.slug}** (${row.type}${row.indexable ? ', indexable' : ''}) — missing ${row.missing.join(', ')}`)
  .join('\n') || 'No coverage gaps found.'

const markdown = `# Botanical Activity Atlas Coverage Report\n\nGenerated: ${summary.generatedAt}\n\n## Dataset\n\n- Profiles: ${summary.totals.profiles}\n- Herbs: ${summary.totals.herbs}\n- Compounds: ${summary.totals.compounds}\n- Curated indexable profiles: ${summary.totals.curatedIndexable}\n\n## Curated indexable coverage\n\n| Field group | Coverage |\n|---|---:|\n${percentLines}\n\n## Highest-priority gaps\n\n${priorityLines}\n\n## Outputs\n\n- \`reports/botanical-atlas/coverage.json\`\n- \`reports/botanical-atlas/coverage.csv\`\n- \`reports/botanical-atlas/coverage.md\`\n`
writeFileSync(path.join(outDir, 'coverage.md'), markdown)

console.log(markdown)

if (process.argv.includes('--strict')) {
  const incompleteIndexable = indexableRows.filter((row) => !row.effects || !row.chemistry || !row.safety)
  if (incompleteIndexable.length > 0) {
    console.error(`Atlas coverage audit failed: ${incompleteIndexable.length} curated indexable profiles lack effects, chemistry, or safety data.`)
    process.exitCode = 1
  }
}
