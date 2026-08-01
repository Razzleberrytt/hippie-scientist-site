#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { gzipSync } from 'node:zlib'

const ROOT = process.cwd()

// Performance Budgets configuration (in bytes)
const BUDGETS = {
  // Max size of any single JSON file in public/data/
  maxSingleJson: 2.5 * 1024 * 1024, // 2.5 MB (compounds.json is ~2.3MB)
  
  // Max size of the search index payload
  maxSearchIndex: 1.0 * 1024 * 1024, // 1.0 MB (search-index.json is ~776KB)

  // Max total search/index data payload (search-index + summaries)
  maxTotalIndexPayload: 2.0 * 1024 * 1024, // 2.0 MB (sums up to ~1.5MB currently)
  
  // Max gzip transfer size of the modern App Router runtime shared by every route
  maxAppRouterSharedJsGzip: 120 * 1024, // 120 KB
}

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath)
    return stats.size
  } catch {
    return 0
  }
}

function getGzipSize(filePath) {
  try {
    return gzipSync(fs.readFileSync(filePath)).byteLength
  } catch {
    return 0
  }
}

function getAppRouterSharedJsSize(outDir) {
  const manifestPath = path.join(ROOT, '.next', 'build-manifest.json')

  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
    const sharedFiles = Array.isArray(manifest.rootMainFiles)
      ? manifest.rootMainFiles.filter(file => file.endsWith('.js'))
      : []

    if (sharedFiles.length === 0) return 0

    const sizes = sharedFiles.map(file => getGzipSize(path.join(outDir, '_next', file)))
    if (sizes.some(size => size === 0)) return 0

    return sizes.reduce((total, size) => total + size, 0)
  } catch {
    return 0
  }
}

function formatSize(bytes) {
  return `${(bytes / 1024).toFixed(2)} KB`
}

function main() {
  console.log('[performance-budget] Auditing built asset and data payload sizes...')

  const dataDir = path.join(ROOT, 'public', 'data')
  const outDir = path.join(ROOT, 'out')

  let failed = false
  const errors = []
  const metrics = []

  // 1. Audit public/data payloads
  const compoundsSize = getFileSize(path.join(dataDir, 'compounds.json'))
  const herbsSize = getFileSize(path.join(dataDir, 'herbs.json'))
  const searchIndexSize = getFileSize(path.join(dataDir, 'search-index.json'))
  const herbsSummarySize = getFileSize(path.join(dataDir, 'herbs-summary.json'))
  const compoundsSummarySize = getFileSize(path.join(dataDir, 'compounds-summary.json'))

  const largestJsonSize = Math.max(compoundsSize, herbsSize)
  const totalIndexPayload = searchIndexSize + herbsSummarySize + compoundsSummarySize

  metrics.push({ name: 'Largest JSON (compounds.json)', size: compoundsSize, budget: BUDGETS.maxSingleJson })
  metrics.push({ name: 'Search Index (search-index.json)', size: searchIndexSize, budget: BUDGETS.maxSearchIndex })
  metrics.push({ name: 'Total Search/Index Payload', size: totalIndexPayload, budget: BUDGETS.maxTotalIndexPayload })

  // 2. Audit the compressed App Router runtime loaded by every modern site route.
  // build-manifest.json is authoritative here; filename matching also counts the
  // legacy Pages Router runtime and nomodule polyfill, which visitors do not load
  // as the shared App Router payload.
  if (fs.existsSync(outDir)) {
    metrics.push({
      name: 'App Router shared JS (gzip)',
      size: getAppRouterSharedJsSize(outDir),
      budget: BUDGETS.maxAppRouterSharedJsGzip,
      required: true,
    })
  } else {
    console.log('[performance-budget] out/ directory not found. Skipping JS bundle size audit (run npm run build first).')
  }

  // 3. Evaluate budgets and fail if exceeded by more than 10%
  console.log('\n--- Budget Performance Report ---')
  console.log('| Metric | Actual | Budget | Status |')
  console.log('| :--- | :--- | :--- | :--- |')

  for (const m of metrics) {
    if (m.size === 0) {
      console.log(`| ${m.name} | N/A | ${formatSize(m.budget)} | ⚠️ Missing |`)
      if (m.required) {
        errors.push(`${m.name} could not be measured from the App Router build manifest and exported chunks.`)
        failed = true
      }
      continue
    }

    const ratio = m.size / m.budget
    const status = ratio > 1.1 ? '❌ FAILED' : ratio > 1.0 ? '⚠️ WARNING' : '✅ PASS'
    console.log(`| ${m.name} | ${formatSize(m.size)} | ${formatSize(m.budget)} | ${status} |`)

    if (ratio > 1.10) {
      errors.push(`${m.name} size of ${formatSize(m.size)} exceeds budget of ${formatSize(m.budget)} by more than 10% threshold.`)
      failed = true
    }
  }

  // Write report to docs
  const performanceDocsDir = path.join(ROOT, 'docs', 'performance')
  fs.mkdirSync(performanceDocsDir, { recursive: true })
  
  const mdContent = `# Performance Budgets Log
  
Generated on ${new Date().toISOString()}

| Metric | Actual Size | Budget Size | Status |
| :--- | :--- | :--- | :--- |
${metrics.map(m => `| ${m.name} | ${m.size > 0 ? formatSize(m.size) : 'N/A'} | ${formatSize(m.budget)} | ${m.size === 0 ? 'Missing' : m.size > m.budget ? 'Exceeded' : 'Pass'} |`).join('\n')}
`
  fs.writeFileSync(path.join(performanceDocsDir, 'budgets-log.md'), mdContent, 'utf8')
  console.log('\n[performance-budget] Wrote docs/performance/budgets-log.md')

  if (failed) {
    console.error('\n[performance-budget] FAIL: Performance budget validation failed!')
    errors.forEach(e => console.error(`  - ${e}`))
    process.exit(1)
  }

  console.log('[performance-budget] PASS: All monitored sizes are within performance budgets.')
  process.exit(0)
}

main()
