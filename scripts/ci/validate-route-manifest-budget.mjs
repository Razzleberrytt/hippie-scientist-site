#!/usr/bin/env node

import { getSharedRouteManifest } from '../shared-route-manifest.mjs'

const MAX_TOTAL_ROUTES = Number.parseInt(
  process.env.ROUTE_MANIFEST_MAX_TOTAL || '6000',
  10,
)
const MAX_INDEXABLE_ROUTES = Number.parseInt(
  process.env.ROUTE_MANIFEST_MAX_INDEXABLE || '4500',
  10,
)
const MAX_NO_INDEX_ROUTES = Number.parseInt(
  process.env.ROUTE_MANIFEST_MAX_NOINDEX || '2500',
  10,
)

function asArray(value) {
  return Array.isArray(value) ? value : []
}

function routeOf(value) {
  if (typeof value === 'string') return value
  return String(value?.route || value?.url || value?.path || '').trim()
}

function normalizeRoute(value) {
  const route = routeOf(value)
  if (!route || route === '/') return '/'
  return `/${route.replace(/^\/+|\/+$/g, '')}`
}

function collectRoutes(manifest) {
  if (Array.isArray(manifest)) return manifest.map(normalizeRoute).filter(Boolean)

  const candidates = [
    manifest?.routes,
    manifest?.allRoutes,
    manifest?.sitemapRoutes,
    manifest?.routeEntries,
    manifest?.entries,
  ]

  const firstArray = candidates.find(Array.isArray)
  return asArray(firstArray).map(normalizeRoute).filter(Boolean)
}

function collectNoindexRoutes(manifest) {
  const directives = manifest?.routeDirectives
  if (!directives) return []

  if (directives instanceof Map) {
    return [...directives.entries()]
      .filter(([, value]) => value?.noindex === true)
      .map(([route]) => normalizeRoute(route))
  }

  if (typeof directives === 'object') {
    return Object.entries(directives)
      .filter(([, value]) => value?.noindex === true)
      .map(([route]) => normalizeRoute(route))
  }

  return []
}

function countDuplicates(routes) {
  const seen = new Set()
  const duplicates = new Set()

  for (const route of routes) {
    if (seen.has(route)) duplicates.add(route)
    seen.add(route)
  }

  return duplicates.size
}

function main() {
  const manifest = getSharedRouteManifest()
  const routes = collectRoutes(manifest)
  const noindexRoutes = collectNoindexRoutes(manifest)
  const uniqueRoutes = new Set(routes)
  const duplicateCount = countDuplicates(routes)
  const indexableCount = routes.length - noindexRoutes.length

  const failures = []

  if (routes.length > MAX_TOTAL_ROUTES) {
    failures.push(`total routes ${routes.length} exceeds budget ${MAX_TOTAL_ROUTES}`)
  }

  if (indexableCount > MAX_INDEXABLE_ROUTES) {
    failures.push(`indexable routes ${indexableCount} exceeds budget ${MAX_INDEXABLE_ROUTES}`)
  }

  if (noindexRoutes.length > MAX_NO_INDEX_ROUTES) {
    failures.push(`noindex routes ${noindexRoutes.length} exceeds budget ${MAX_NO_INDEX_ROUTES}`)
  }

  if (duplicateCount > 0 || uniqueRoutes.size !== routes.length) {
    failures.push(`manifest contains ${duplicateCount} duplicate routes`)
  }

  if (failures.length > 0) {
    console.error('Route manifest budget validation failed:')
    for (const failure of failures) console.error(`- ${failure}`)
    process.exit(1)
  }

  console.log(
    `Route manifest budget OK: ${routes.length} total, ${indexableCount} indexable, ${noindexRoutes.length} noindex`,
  )
}

main()
