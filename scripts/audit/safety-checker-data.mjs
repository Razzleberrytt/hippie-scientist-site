#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const dataDir = path.join(root, 'public', 'data')
const files = ['herbs.json', 'compounds.json']
const allowedTypes = new Set(['string', 'undefined'])
const issues = []
const coverage = { records: 0, safetyText: 0, safetyFlags: 0, mechanisms: 0, sources: 0, completelyUnmapped: 0 }

const readRows = (file) => {
  const filePath = path.join(dataDir, file)
  if (!fs.existsSync(filePath)) return []
  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  return Array.isArray(parsed) ? parsed : []
}

const isStringList = (value) => value === undefined || typeof value === 'string' || (Array.isArray(value) && value.every((item) => typeof item === 'string'))

for (const file of files) {
  for (const row of readRows(file)) {
    coverage.records += 1
    const slug = String(row?.slug || '(missing-slug)')
    const safety = row?.safety ?? row?.safetyNotes ?? row?.safety_notes
    const flags = row?.safety_flags ?? row?.safetyFlags
    const mechanisms = row?.mechanisms ?? row?.primary_mechanisms ?? row?.pathways ?? row?.mechanism
    const sources = row?.safety_sources ?? row?.safetySources ?? row?.interaction_sources ?? row?.interactionSources

    if (safety) coverage.safetyText += 1
    if (flags && (Array.isArray(flags) ? flags.length : String(flags).trim())) coverage.safetyFlags += 1
    if (mechanisms && (Array.isArray(mechanisms) ? mechanisms.length : String(mechanisms).trim())) coverage.mechanisms += 1
    if (sources && (Array.isArray(sources) ? sources.length : String(sources).trim())) coverage.sources += 1
    if (!safety && !flags && !mechanisms) coverage.completelyUnmapped += 1

    if (!allowedTypes.has(typeof safety)) issues.push({ file, slug, field: 'safety', issue: `expected string, got ${typeof safety}` })
    if (!isStringList(flags)) issues.push({ file, slug, field: 'safety_flags', issue: 'expected string or string[]' })
    if (!isStringList(mechanisms)) issues.push({ file, slug, field: 'mechanisms', issue: 'expected string or string[]' })
    if (!isStringList(sources)) issues.push({ file, slug, field: 'safety_sources', issue: 'expected string or string[]' })
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  coverage: {
    ...coverage,
    safetyTextPct: coverage.records ? Math.round((coverage.safetyText / coverage.records) * 1000) / 10 : 0,
    safetyFlagsPct: coverage.records ? Math.round((coverage.safetyFlags / coverage.records) * 1000) / 10 : 0,
    sourceCoveragePct: coverage.records ? Math.round((coverage.sources / coverage.records) * 1000) / 10 : 0,
  },
  structuralIssues: issues,
  interpretationRule: 'Missing safety data is unknown and must never be interpreted as safe.',
}

const reportPath = path.join(root, 'reports', 'safety-checker-data-qa.json')
fs.mkdirSync(path.dirname(reportPath), { recursive: true })
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`)
console.log(JSON.stringify(report.coverage, null, 2))
console.log(`Safety Checker QA report: ${reportPath}`)

if (issues.length) {
  console.error(`Found ${issues.length} malformed safety-data fields.`)
  process.exitCode = 1
}
