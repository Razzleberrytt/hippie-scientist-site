#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'

const DATA_DIR_ARG = process.argv.find((arg) => arg.startsWith('--data-dir='))
const DATA_DIR = DATA_DIR_ARG
  ? DATA_DIR_ARG.split('=')[1]
  : 'public/data'

const MANIFEST_DIR = path.join(DATA_DIR, 'runtime-manifests')
const SITEMAP_CHUNK_SIZE = Number.parseInt(
  process.env.SITEMAP_CHUNK_SIZE || '500',
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

function buildChunkManifest(routes) {
  const grouped = {}

  for (const route of routes) {
    const segment = route?.segment || 'root'

    if (!grouped[segment]) {
      grouped[segment] = []
    }

    grouped[segment].push(route)
  }

  const manifest = []

  for (const segment of Object.keys(grouped).sort()) {
    const chunks = chunk(grouped[segment], SITEMAP_CHUNK_SIZE)

    chunks.forEach((routes, index) => {
      manifest.push({
        id: `${segment}-${index + 1}`,
        segment,
        chunkIndex: index,
        routeCount: routes.length,
        firstRoute: routes[0]?.route || '',
        lastRoute: routes[routes.length - 1]?.route || '',
      })
    })
  }

  return manifest.sort((a, b) => a.id.localeCompare(b.id))
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

  const manifest = buildChunkManifest(routes)

  await writeJson('sitemap-chunk-manifest.json', manifest)

  console.log(
    `Built sitemap chunk manifest with ${manifest.length} chunks from ${routes.length} routes`,
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
