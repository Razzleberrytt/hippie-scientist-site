#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'

const DATA_DIR = path.join(process.cwd(), 'public', 'data')

const TARGETS = [
  'runtime-maps/related-profiles.json',
  'runtime-maps/comparison-map.json',
  'runtime-maps/stack-map.json',
  'runtime-maps/ecosystem-map.json',
  'runtime-maps/authority-hubs.json',
  'summary-indexes/search-index.json',
  'summary-indexes/alphabetical-shards.json',
  'summary-indexes/entity-shards.json',
  'summary-indexes/alpha-entity-shards.json',
  'runtime-manifests/route-manifest.json',
  'runtime-manifests/route-segment-groups.json',
  'runtime-manifests/sitemap-chunk-manifest.json',
  'runtime-manifests/export-batch-manifest.json',
]

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function stableClone(value) {
  if (Array.isArray(value)) {
    return value.map(stableClone)
  }

  if (isObject(value)) {
    return Object.keys(value)
      .sort((a, b) => a.localeCompare(b))
      .reduce((acc, key) => {
        acc[key] = stableClone(value[key])
        return acc
      }, {})
  }

  return value
}

async function validateFile(relativePath) {
  const absolutePath = path.join(DATA_DIR, relativePath)
  const raw = await fs.readFile(absolutePath, 'utf8')
  const parsed = JSON.parse(raw)

  const stable = `${JSON.stringify(stableClone(parsed))}\n`

  return {
    relativePath,
    deterministic: stable === raw,
  }
}

async function main() {
  const failures = []

  for (const target of TARGETS) {
    try {
      const result = await validateFile(target)

      if (!result.deterministic) {
        failures.push(`${target} is not deterministically ordered`)
      } else {
        console.log(`${target}: deterministic`)
      }
    } catch (error) {
      failures.push(`${target} validation failed: ${error.message}`)
    }
  }

  if (failures.length > 0) {
    console.error('\nDeterministic JSON validation failed:')

    for (const failure of failures) {
      console.error(`- ${failure}`)
    }

    process.exit(1)
  }

  console.log('\nDeterministic JSON validation OK')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
