#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const bestRoot = path.join(root, 'app', 'guides')
const files = []

function walk(dir) {
  if (!fs.existsSync(dir)) return
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full)
    else if (entry.isFile() && /page\.(tsx|jsx)$/.test(entry.name) && full.includes(`${path.sep}best`)) files.push(full)
  }
}

walk(bestRoot)

const evidenceMarkers = [
  /evidence table/i,
  /evidence comparison/i,
  /what .* evidence/i,
  /human evidence/i,
  /evidence strength/i,
  /directness before ranking/i,
  /<table\b/i,
]
const commerceMarkers = [
  /affiliate/i,
  /amazon\.com/i,
  /BuyGuideClient/,
  /AffiliateProduct/,
  /ProductComparison/,
]

const findings = []
for (const file of files) {
  const source = fs.readFileSync(file, 'utf8')
  const returnIndex = source.indexOf('return (')
  if (returnIndex < 0) continue
  const body = source.slice(returnIndex)
  const evidencePositions = evidenceMarkers.map((pattern) => body.search(pattern)).filter((index) => index >= 0)
  const commercePositions = commerceMarkers.map((pattern) => body.search(pattern)).filter((index) => index >= 0)
  if (!commercePositions.length) continue

  const firstCommerce = Math.min(...commercePositions)
  const firstEvidence = evidencePositions.length ? Math.min(...evidencePositions) : -1
  if (firstEvidence < 0 || firstCommerce < firstEvidence) {
    findings.push({
      file: path.relative(root, file),
      issue: firstEvidence < 0 ? 'commercial module/affiliate marker present without a detectable evidence section' : 'commercial marker appears before the first detectable evidence section',
    })
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  scannedBestGuidePages: files.length,
  findings,
  policy: 'Best-guide pages with commerce must present evidence before commercial modules. This audit is conservative and requires manual review for flagged layouts.',
}

const reportPath = path.join(root, 'reports', 'best-guide-commerce-order.json')
fs.mkdirSync(path.dirname(reportPath), { recursive: true })
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`)
console.log(`Scanned ${files.length} best-guide pages; ${findings.length} ordering finding(s).`)
console.log(`Report: ${reportPath}`)

if (findings.length) {
  console.error('Best-guide evidence-before-commerce audit found pages requiring review.')
  process.exitCode = 1
}
