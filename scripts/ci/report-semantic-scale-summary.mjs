#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'

const DATA_DIR = path.join(process.cwd(), 'public', 'data')

const FILES = [
  'runtime-maps/related-profiles.json',
  'runtime-maps/comparison-map.json',
  'runtime-maps/stack-map.json',
  'runtime-maps/ecosystem-map.json',
  'summary-indexes/search-index.json',
  'summary-indexes/entity-shards.json',
  'summary-indexes/alpha-entity-shards.json',
  'runtime-manifests/route-manifest.json',
  'runtime-manifests/route-segment-groups.json',
  'runtime-manifests/sitemap-chunk-manifest.json',
  'runtime-manifests/export-batch-manifest.json',
]

function formatBytes(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

async function readJson(relativePath, fallback) {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, relativePath), 'utf8')
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

async function fileSize(relativePath) {
  try {
    const stat = await fs.stat(path.join(DATA_DIR, relativePath))
    return stat.size
  } catch {
    return 0
  }
}

function countRelationships(map) {
  if (!map || typeof map !== 'object' || Array.isArray(map)) {
    return 0
  }

  return Object.values(map).reduce((sum, entries) => {
    return sum + (Array.isArray(entries) ? entries.length : 0)
  }, 0)
}

async function main() {
  const routeManifest = await readJson('runtime-manifests/route-manifest.json', [])
  const sitemapChunks = await readJson('runtime-manifests/sitemap-chunk-manifest.json', [])
  const exportBatches = await readJson('runtime-manifests/export-batch-manifest.json', [])
  const relatedMap = await readJson('runtime-maps/related-profiles.json', {})
  const ecosystemMap = await readJson('runtime-maps/ecosystem-map.json', {})
  const searchIndex = await readJson('summary-indexes/search-index.json', [])

  console.log('\n=== Semantic Scale Summary ===')
  console.log(`Routes: ${Array.isArray(routeManifest) ? routeManifest.length : 0}`)
  console.log(`Sitemap chunks: ${Array.isArray(sitemapChunks) ? sitemapChunks.length : 0}`)
  console.log(`Export batches: ${Array.isArray(exportBatches) ? exportBatches.length : 0}`)
  console.log(`Search records: ${Array.isArray(searchIndex) ? searchIndex.length : 0}`)
  console.log(`Related relationships: ${countRelationships(relatedMap)}`)
  console.log(`Ecosystem relationships: ${countRelationships(ecosystemMap)}`)

  console.log('\nLargest semantic artifacts:')

  const reports = []

  for (const file of FILES) {
    reports.push({
      file,
      size: await fileSize(file),
    })
  }

  reports
    .sort((a, b) => b.size - a.size)
    .slice(0, 8)
    .forEach((report) => {
      console.log(`- ${report.file}: ${formatBytes(report.size)}`)
    })

  console.log('\nSemantic scale summary complete')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
