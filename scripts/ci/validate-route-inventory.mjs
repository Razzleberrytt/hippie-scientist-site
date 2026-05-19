#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const repoRoot = process.cwd()
const appRoot = path.join(repoRoot, 'app')
const readmePath = path.join(repoRoot, 'README.md')
const fallbackInventoryPath = path.join(repoRoot, 'docs', 'ROUTE_INVENTORY.md')

function toPosixPath(value) {
  return value.split(path.sep).join('/')
}

function isRouteGroup(segment) {
  return segment.startsWith('(') && segment.endsWith(')')
}

function isPrivateSegment(segment) {
  return segment.startsWith('_')
}

function isParallelRouteSegment(segment) {
  return segment.startsWith('@')
}

function walkPageFiles(dir, results = []) {
  if (!fs.existsSync(dir)) return results

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      walkPageFiles(fullPath, results)
      continue
    }

    if (entry.isFile() && entry.name === 'page.tsx') {
      results.push(fullPath)
    }
  }

  return results
}

function normalizeSegment(segment) {
  if (segment.startsWith('[[...') && segment.endsWith(']]')) {
    return `:${segment.slice(5, -2)}`
  }

  if (segment.startsWith('[...') && segment.endsWith(']')) {
    return `:${segment.slice(4, -1)}`
  }

  if (segment.startsWith('[') && segment.endsWith(']')) {
    return `:${segment.slice(1, -1)}`
  }

  return segment
}

function pageFileToRoute(filePath) {
  const relativeFile = toPosixPath(path.relative(appRoot, filePath))
  const segments = relativeFile.split('/').slice(0, -1)

  const publicSegments = segments
    .filter((segment) => !isRouteGroup(segment))
    .filter((segment) => !isPrivateSegment(segment))
    .filter((segment) => !isParallelRouteSegment(segment))
    .map(normalizeSegment)

  if (publicSegments.length === 0) return '/'

  return `/${publicSegments.join('/')}`
}

function getScannedRoutes() {
  return [...new Set(walkPageFiles(appRoot).map(pageFileToRoute))].sort()
}

function extractInventoryFromMarkdown(markdown, sourceLabel) {
  const lines = markdown.split(/\r?\n/)
  const startIndex = lines.findIndex((line) => /^##\s+Active App Router routes\s*$/.test(line.trim()))

  if (startIndex === -1) return null

  const routes = []

  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const line = lines[index]

    if (/^##\s+/.test(line.trim())) break

    const match = line.match(/^\s*-\s+`([^`]+)`/)

    if (!match) continue

    routes.push(match[1].trim())
  }

  if (routes.length === 0) {
    throw new Error(`[route-inventory] Found ${sourceLabel} inventory heading, but no route bullets.`)
  }

  return [...new Set(routes)].sort()
}

function getCanonicalInventory() {
  if (fs.existsSync(readmePath)) {
    const readmeInventory = extractInventoryFromMarkdown(fs.readFileSync(readmePath, 'utf8'), 'README.md')

    if (readmeInventory) {
      return {
        source: 'README.md',
        routes: readmeInventory,
      }
    }
  }

  if (fs.existsSync(fallbackInventoryPath)) {
    const docsInventory = extractInventoryFromMarkdown(
      fs.readFileSync(fallbackInventoryPath, 'utf8'),
      'docs/ROUTE_INVENTORY.md',
    )

    if (docsInventory) {
      return {
        source: 'docs/ROUTE_INVENTORY.md',
        routes: docsInventory,
      }
    }
  }

  return null
}

function diffRoutes(actual, expected) {
  const actualSet = new Set(actual)
  const expectedSet = new Set(expected)

  return {
    missingFromDocs: actual.filter((route) => !expectedSet.has(route)),
    missingFromApp: expected.filter((route) => !actualSet.has(route)),
  }
}

function printInventory(routes) {
  console.log('[route-inventory] Active App Router routes:')

  for (const route of routes) {
    console.log(`- ${route}`)
  }
}

const scannedRoutes = getScannedRoutes()

printInventory(scannedRoutes)

const canonical = getCanonicalInventory()

if (!canonical) {
  console.log('[route-inventory] No canonical inventory found in README.md or docs/ROUTE_INVENTORY.md; scan-only mode.')
  process.exit(0)
}

const { missingFromDocs, missingFromApp } = diffRoutes(scannedRoutes, canonical.routes)

if (missingFromDocs.length > 0 || missingFromApp.length > 0) {
  console.error(`[route-inventory] Route inventory drift detected against ${canonical.source}.`)

  if (missingFromDocs.length > 0) {
    console.error('\nRoutes present in app/**/page.tsx but missing from canonical inventory:')

    for (const route of missingFromDocs) {
      console.error(`- ${route}`)
    }
  }

  if (missingFromApp.length > 0) {
    console.error('\nRoutes present in canonical inventory but missing from app/**/page.tsx:')

    for (const route of missingFromApp) {
      console.error(`- ${route}`)
    }
  }

  process.exit(1)
}

console.log(`[route-inventory] Verified ${scannedRoutes.length} routes against ${canonical.source}.`)
