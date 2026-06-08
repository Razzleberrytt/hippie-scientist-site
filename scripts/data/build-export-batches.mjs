#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'

const DATA_DIR_ARG = process.argv.find((arg) => arg.startsWith('--data-dir='))
const DATA_DIR = DATA_DIR_ARG
  ? DATA_DIR_ARG.split('=')[1]
  : 'public/data'

const MANIFEST_DIR = path.join(DATA_DIR, 'runtime-manifests')
const EXPORT_BATCH_SIZE = Number.parseInt(
  process.env.EXPORT_BATCH_SIZE || '250',
  10,
)

function stableClone(value) {
  if (Array.isArray(value)) {
    return value.map(stableClone)
  }

  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort((a, b) => a.localeCompare(b))
      .reduce((acc, key) => {
        acc[key] = stableClone(value[key])
        return acc
      }, {})
  }

  return value
}

async function readJson(fileName, fallback = []) {
  try {
    const raw = await fs.readFile(path.join(MANIFEST_DIR, fileName), 'utf8')
    const parsed = JSON.parse(raw)

    return Array.isArray(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

function chunk(values, size) {
  const output = []

  for (let i = 0; i < values.length; i += size) {
    output.push(values.slice(i, i + size))
  }

  return output
}

function estimateComplexity(route) {
  const pathValue = String(route?.route || '')

  if (pathValue.startsWith('/compounds/')) return 5
  if (pathValue.startsWith('/herbs/')) return 4
  if (pathValue.startsWith('/ecosystems/')) return 3
  if (pathValue.startsWith('/topics/')) return 3
  if (pathValue.startsWith('/compare/')) return 2

  return 1
}

function buildBatches(routes) {
  const sorted = [...routes].sort((a, b) => {
    const complexityDelta = estimateComplexity(b) - estimateComplexity(a)

    if (complexityDelta !== 0) {
      return complexityDelta
    }

    return String(a?.route || '').localeCompare(String(b?.route || ''))
  })

  return chunk(sorted, EXPORT_BATCH_SIZE).map((batch, index) => ({
    id: `batch-${index + 1}`,
    batchIndex: index,
    routeCount: batch.length,
    estimatedComplexity: batch.reduce(
      (sum, route) => sum + estimateComplexity(route),
      0,
    ),
    firstRoute: batch[0]?.route || '',
    lastRoute: batch[batch.length - 1]?.route || '',
    segments: [...new Set(batch.map((route) => route.segment || 'root'))].sort(),
  }))
}

async function writeJson(fileName, value) {
  await fs.mkdir(MANIFEST_DIR, { recursive: true })

  await fs.writeFile(
    path.join(MANIFEST_DIR, fileName),
    `${JSON.stringify(stableClone(value))}\n`,
    'utf8',
  )
}

async function main() {
  const routes = await readJson('route-manifest.json')

  const batches = buildBatches(routes)

  await writeJson('export-batch-manifest.json', batches)

  console.log(
    `Built export batch manifest with ${batches.length} batches from ${routes.length} routes`,
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
