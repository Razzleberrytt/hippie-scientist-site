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
const META_TITLE_MAX = 60
const META_DESCRIPTION_MIN = 110
const META_DESCRIPTION_MAX = 160

const STATIC_ROUTE_METADATA = {
  '/': {
    title: 'The Hippie Scientist – Evidence-Based Herb & Supplement Research',
    description: 'Evidence-first reference for herbs, supplements, and compounds with mechanisms, safety, interactions, and practical context in plain language.',
  },
  '/herbs': {
    title: 'Herb Profiles & Research Library',
    description: 'Browse herb profiles with mechanisms, safety notes, active compounds, and research context in plain language.',
  },
  '/compounds': {
    title: 'Compound Library',
    description: 'Browse published compound profiles with mechanisms, evidence levels, safety status, and practical context. Evidence-first, no hype.',
  },
  '/compare': {
    title: 'Compare Herbs & Supplements',
    description: 'Compare herbs and supplements by evidence, mechanisms, source-reported dosing context, safety, and practical tradeoffs.',
  },
  '/goals': {
    title: 'Supplement Goals: Compare Options by What You Want to Fix',
    description: 'Start from the outcome, not the ingredient. Compare common options by fit, onset, evidence quality, risk, and why people stop taking them.',
  },
  '/stacks': {
    title: 'Supplement Stacks & Combination Guides',
    description: 'Review supplement combinations with evidence limits, interaction cautions, timing context, and safer decision paths kept visible.',
  },
  '/tools': {
    title: 'Research Tools | The Hippie Scientist',
    description: 'Interactive research tools for comparing botanicals, evidence, activity, compounds, and safety context.',
  },
  '/tools/botanical-activity-atlas': {
    title: 'Botanical Activity Atlas',
    description: 'Explore botanical activity and mechanism relationships across herbs and compounds with conservative evidence and safety context.',
  },
}

function text(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

function stableClone(value) {
  if (Array.isArray(value)) return value.map(stableClone)
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

function profileDisplayName(record) {
  const raw = text(record?.displayName || record?.name || record?.slug)
  return raw.replace(/\s*\([^)]*\)\s*$/, '').trim() || raw
}

function compactTitle(value, fallback) {
  const cleaned = text(value)
  if (cleaned && cleaned.length <= META_TITLE_MAX) return cleaned
  if (fallback.length <= META_TITLE_MAX) return fallback
  const cutoff = fallback.slice(0, META_TITLE_MAX - 1)
  const lastBreak = cutoff.lastIndexOf(' ')
  return `${(lastBreak > 30 ? cutoff.slice(0, lastBreak) : cutoff).trim()}…`
}

function compactDescription(value) {
  const cleaned = text(value)
  if (cleaned.length <= META_DESCRIPTION_MAX) return cleaned
  const cutoff = cleaned.slice(0, META_DESCRIPTION_MAX - 1)
  const lastBreak = Math.max(cutoff.lastIndexOf(' '), cutoff.lastIndexOf(','), cutoff.lastIndexOf(';'))
  return `${(lastBreak > 100 ? cutoff.slice(0, lastBreak) : cutoff).trim()}…`
}

function generatedProfileDescription(displayName, type) {
  const subject = type === 'herb' ? 'herb profile' : 'compound profile'
  return `${displayName} ${subject} with evidence context, key research topics, source notes, safety context, and references presented in an evidence-first format.`
}

function profileDescription(record, displayName, type) {
  const override = text(record?.meta_description || record?.metaDescription)
  const existing = override || text(record?.description || record?.generated_description || record?.summary)
  const selected = existing.length >= META_DESCRIPTION_MIN
    ? existing
    : generatedProfileDescription(displayName, type)
  return compactDescription(selected)
}

function profileTitle(record, displayName, type) {
  const existing = text(record?.meta_title || record?.metaTitle)
  const fallback = type === 'herb'
    ? `${displayName} Benefits, Dosage & Safety`
    : `${displayName}: Effects, Dose & Safety`
  return compactTitle(existing, fallback)
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
  return { route, type, segment: route.split('/')[1] || 'root' }
}

function dedupeRoutes(entries) {
  const seen = new Map()
  for (const entry of entries) {
    if (!entry?.route) continue
    const existing = seen.get(entry.route)
    if (!existing || text(entry.type).localeCompare(text(existing.type)) < 0) {
      seen.set(entry.route, entry)
    }
  }
  return [...seen.values()].sort((a, b) => {
    const segmentDelta = text(a.segment).localeCompare(text(b.segment))
    return segmentDelta !== 0 ? segmentDelta : text(a.route).localeCompare(text(b.route))
  })
}

function buildSegmentGroups(routes) {
  const groups = {}
  for (const route of routes) {
    const segment = route.segment || 'root'
    if (!groups[segment]) groups[segment] = []
    if (groups[segment].length >= MAX_ROUTES_PER_GROUP) continue
    groups[segment].push(route)
  }
  return groups
}

async function writeJson(fileName, value) {
  await fs.mkdir(OUT_DIR, { recursive: true })
  await fs.writeFile(path.join(OUT_DIR, fileName), `${JSON.stringify(stableClone(value))}\n`, 'utf8')
}

async function main() {
  const herbs = await readJson('summary-indexes/herbs-summary.json')
  const compounds = await readJson('summary-indexes/compounds-summary.json')
  const redirectSources = await readRedirectSources()

  const staticRoutes = Object.entries(STATIC_ROUTE_METADATA)
    .map(([route, metadata]) => ({
      ...routeEntry(route, 'static'),
      meta_title: metadata.title,
      meta_description: metadata.description,
      canonical_url: `${SITE_URL}${route === '/' ? '' : route}/`,
    }))
    .filter((entry) => !redirectSources.has(normalizeRoutePath(entry.route)))

  const herbRoutes = herbs
    .filter(isPublishableRecord)
    .map((record) => {
      const slug = normalizeSlug(record.slug)
      const name = profileDisplayName(record)
      return {
        ...routeEntry(`/herbs/${slug}`, 'herb'),
        meta_title: profileTitle(record, name, 'herb'),
        meta_description: profileDescription(record, name, 'herb'),
        canonical_url: `${SITE_URL}/herbs/${slug}/`,
      }
    })
    .filter((entry) => !redirectSources.has(normalizeRoutePath(entry.route)))

  const compoundRoutes = compounds
    .filter(isPublishableRecord)
    .map((record) => {
      const slug = normalizeSlug(record.slug)
      const name = profileDisplayName(record)
      return {
        ...routeEntry(`/compounds/${slug}`, 'compound'),
        meta_title: profileTitle(record, name, 'compound'),
        meta_description: profileDescription(record, name, 'compound'),
        canonical_url: `${SITE_URL}/compounds/${slug}/`,
      }
    })
    .filter((entry) => !redirectSources.has(normalizeRoutePath(entry.route)))

  const allRoutes = dedupeRoutes([...staticRoutes, ...herbRoutes, ...compoundRoutes])
  const grouped = buildSegmentGroups(allRoutes)

  await Promise.all([
    writeJson('route-manifest.json', allRoutes),
    writeJson('route-segment-groups.json', grouped),
  ])

  console.log(`Built deterministic route manifest with ${allRoutes.length} routes across ${Object.keys(grouped).length} segments`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
