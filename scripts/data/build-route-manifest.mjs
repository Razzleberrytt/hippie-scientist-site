#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'

const DATA_DIR_ARG = process.argv.find((arg) => arg.startsWith('--data-dir='))
const DATA_DIR = DATA_DIR_ARG
  ? DATA_DIR_ARG.split('=')[1]
  : 'public/data'

const OUT_DIR = path.join(DATA_DIR, 'runtime-manifests')
const MAX_ROUTES_PER_GROUP = 5000
const SITE_URL = 'https://thehippiescientist.net'

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

function normalizeRoutePath(value) {
  if (!value) return '/'
  let pathName = value
  try {
    pathName = value.startsWith('http') ? new URL(value).pathname : value
  } catch {
    pathName = value
  }

  const pathOnly = pathName.split(/[?#]/)[0] || '/'
  const withSlash = pathOnly.startsWith('/') ? pathOnly : `/${pathOnly}`
  return withSlash.length > 1 ? withSlash.replace(/\/+$/, '') : '/'
}

async function readRedirectSources(relativePath = 'public/_redirects') {
  const sources = new Set()

  try {
    const raw = await fs.readFile(path.join(process.cwd(), relativePath), 'utf8')
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const [source, target, status] = trimmed.split(/\s+/)
      if (!source || source.includes('*')) continue
      if (!/^30[1278]$/.test(status || '')) continue
      if (target && normalizeRoutePath(source) === normalizeRoutePath(target)) continue
      sources.add(normalizeRoutePath(source))
    }
  } catch {
    return sources
  }

  return sources
}

function isPublishableRecord(record) {
  if (!record?.slug) return false
  if (record.sitemap_included !== true) return false
  if (String(record.robots || '').toLowerCase() !== 'index,follow') return false
  return String(record.indexability_status || '').toUpperCase() === 'PUBLISH'
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
  const herbs = await readJson('summary-indexes/herbs-summary.json')
  const compounds = await readJson('summary-indexes/compounds-summary.json')
  const redirectSources = await readRedirectSources()

  const staticRoutes = [
    routeEntry('/', 'static'),
    routeEntry('/herbs', 'static'),
    routeEntry('/compounds', 'static'),
    routeEntry('/compare', 'static'),
    routeEntry('/goals', 'static'),
    routeEntry('/stacks', 'static'),
  ].map(entry => ({
    ...entry,
    meta_title: entry.route === '/' ? 'The Hippie Scientist' : '',
    meta_description: '',
    canonical_url: `${SITE_URL}${entry.route === '/' ? '' : entry.route}/`,
  }))
    .filter((entry) => !redirectSources.has(normalizeRoutePath(entry.route)))

  const herbRoutes = herbs
    .filter(isPublishableRecord)
    .map((record) => {
      const slug = normalizeSlug(record.slug)
      const name = record.name || slug
      const title = record.meta_title || `${name} Herb Profile: Benefits, Effects & Safety`
      const desc = record.meta_description || record.generated_description || record.summary || ''
      return {
        ...routeEntry(`/herbs/${slug}`, 'herb'),
        meta_title: title,
        meta_description: desc,
        canonical_url: `${SITE_URL}/herbs/${slug}/`,
      }
    })
    .filter((entry) => !redirectSources.has(normalizeRoutePath(entry.route)))

  const compoundRoutes = compounds
    .filter(isPublishableRecord)
    .map((record) => {
      const slug = normalizeSlug(record.slug)
      const name = record.name || slug
      const title = record.meta_title || `${name} Benefits, Effects & Safety Guide`
      const desc = record.meta_description || record.summary || ''
      return {
        ...routeEntry(`/compounds/${slug}`, 'compound'),
        meta_title: title,
        meta_description: desc,
        canonical_url: `${SITE_URL}/compounds/${slug}/`,
      }
    })
    .filter((entry) => !redirectSources.has(normalizeRoutePath(entry.route)))

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
