#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'

const DATA_DIR_ARG = process.argv.find((arg) => arg.startsWith('--data-dir='))
const DATA_DIR = DATA_DIR_ARG
  ? DATA_DIR_ARG.split('=')[1]
  : 'public/data'

const OUT_DIR = path.join(DATA_DIR, 'runtime-manifests')
const MAX_ROUTES_PER_GROUP = 5000

function text(value) {
  return String(value ?? '').trim()
}

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
    const raw = await fs.readFile(path.join(DATA_DIR, fileName), 'utf8')
    const parsed = JSON.parse(raw)

    return Array.isArray(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

function normalizeSlug(value) {
  return text(value)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function routeEntry(route, type) {
  return {
    route,
    type,
    segment: route.split('/')[1] || 'root',
  }
}

function dedupeRoutes(entries) {
  const seen = new Map()

  for (const entry of entries) {
    if (!entry?.route) continue

    const existing = seen.get(entry.route)

    if (!existing) {
      seen.set(entry.route, entry)
      continue
    }

    if (text(entry.type).localeCompare(text(existing.type)) < 0) {
      seen.set(entry.route, entry)
    }
  }

  return [...seen.values()].sort((a, b) => {
    const segmentDelta = text(a.segment).localeCompare(text(b.segment))

    if (segmentDelta !== 0) {
      return segmentDelta
    }

    return text(a.route).localeCompare(text(b.route))
  })
}

function buildSegmentGroups(routes) {
  const groups = {}

  for (const route of routes) {
    const segment = route.segment || 'root'

    if (!groups[segment]) {
      groups[segment] = []
    }

    if (groups[segment].length >= MAX_ROUTES_PER_GROUP) {
      continue
    }

    groups[segment].push(route)
  }

  return groups
}

async function writeJson(fileName, value) {
  await fs.mkdir(OUT_DIR, { recursive: true })

  await fs.writeFile(
    path.join(OUT_DIR, fileName),
    `${JSON.stringify(stableClone(value))}\n`,
    'utf8',
  )
}

async function main() {
  const herbs = await readJson('herbs.json')
  const compounds = await readJson('compounds.json')

  const staticRoutes = [
    routeEntry('/', 'static'),
    routeEntry('/herbs', 'static'),
    routeEntry('/compounds', 'static'),
    routeEntry('/compare', 'static'),
    routeEntry('/goals', 'static'),
    routeEntry('/ecosystems', 'static'),
    routeEntry('/topics', 'static'),
    routeEntry('/protocols', 'static'),
    routeEntry('/stacks', 'static'),
  ]

  const herbRoutes = herbs
    .map((record) => normalizeSlug(record?.slug))
    .filter(Boolean)
    .map((slug) => routeEntry(`/herbs/${slug}`, 'herb'))

  const compoundRoutes = compounds
    .map((record) => normalizeSlug(record?.slug))
    .filter(Boolean)
    .map((slug) => routeEntry(`/compounds/${slug}`, 'compound'))

  const allRoutes = dedupeRoutes([
    ...staticRoutes,
    ...herbRoutes,
    ...compoundRoutes,
  ])

  const grouped = buildSegmentGroups(allRoutes)

  await Promise.all([
    writeJson('route-manifest.json', allRoutes),
    writeJson('route-segment-groups.json', grouped),
  ])

  console.log(
    `Built deterministic route manifest with ${allRoutes.length} routes across ${Object.keys(grouped).length} segments`,
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
