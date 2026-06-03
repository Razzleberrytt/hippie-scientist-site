#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const REGISTRY_PATH = path.join(ROOT, 'public', 'data', 'source-registry.json')
const REPORT_PATH = path.join(ROOT, 'ops', 'reports', 'source-registry-summary.json')

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function writeJson(filePath, payload) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2) + '\n', 'utf8')
}

const registry = readJson(REGISTRY_PATH)
const bySourceClass = {}
const bySourceType = {}
const byEvidenceClass = {}
const byReliabilityTier = {}
let activeCount = 0

for (const source of registry) {
  bySourceClass[source.sourceClass] = (bySourceClass[source.sourceClass] ?? 0) + 1
  bySourceType[source.sourceType] = (bySourceType[source.sourceType] ?? 0) + 1
  byEvidenceClass[source.evidenceClass] = (byEvidenceClass[source.evidenceClass] ?? 0) + 1
  byReliabilityTier[source.reliabilityTier] = (byReliabilityTier[source.reliabilityTier] ?? 0) + 1
  if (source.active === true) activeCount += 1
}

const report = {
  generatedAt: new Date().toISOString(),
  registryPath: 'public/data/source-registry.json',
  totalSources: registry.length,
  activeSources: activeCount,
  inactiveSources: registry.length - activeCount,
  counts: {
    bySourceClass,
    bySourceType,
    byEvidenceClass,
    byReliabilityTier,
  },
}

writeJson(REPORT_PATH, report)
console.log(`[report-source-registry] wrote ${path.relative(ROOT, REPORT_PATH)} sources=${registry.length}`)
