#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'

const DATA_DIR = path.join(process.cwd(), 'public', 'data')

const PAYLOAD_LIMITS = {
  'runtime-maps/related-profiles.json': 4_000_000,
  'runtime-maps/comparison-map.json': 3_000_000,
  'runtime-maps/stack-map.json': 3_000_000,
  'runtime-maps/ecosystem-map.json': 3_500_000,
  'runtime-maps/authority-hubs.json': 2_000_000,
  'summary-indexes/search-index.json': 5_000_000,
  'summary-indexes/alphabetical-shards.json': 4_000_000,
  'summary-indexes/entity-shards.json': 4_000_000,
  'summary-indexes/alpha-entity-shards.json': 4_000_000,
  'runtime-manifests/route-manifest.json': 2_000_000,
  'runtime-manifests/route-segment-groups.json': 2_000_000,
  'runtime-manifests/sitemap-chunk-manifest.json': 1_000_000,
  'runtime-manifests/export-batch-manifest.json': 1_000_000,
}

async function fileSize(filePath) {
  try {
    const stat = await fs.stat(filePath)
    return stat.size
  } catch {
    return 0
  }
}

function formatBytes(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

async function main() {
  const failures = []
  const reports = []

  for (const [relativePath, limit] of Object.entries(PAYLOAD_LIMITS)) {
    const absolutePath = path.join(DATA_DIR, relativePath)
    const size = await fileSize(absolutePath)

    reports.push({
      relativePath,
      size,
      limit,
    })

    if (size > limit) {
      failures.push(
        `${relativePath} size ${formatBytes(size)} exceeds budget ${formatBytes(limit)}`,
      )
    }
  }

  reports
    .sort((a, b) => b.size - a.size)
    .forEach((report) => {
      console.log(
        `${report.relativePath}: ${formatBytes(report.size)} / ${formatBytes(report.limit)}`,
      )
    })

  if (failures.length > 0) {
    console.error('\nRuntime payload budget validation failed:')

    for (const failure of failures) {
      console.error(`- ${failure}`)
    }

    process.exit(1)
  }

  console.log('\nRuntime payload budgets OK')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
