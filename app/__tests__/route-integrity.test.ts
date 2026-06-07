import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { goals } from '../../data/goals'

describe('Route Integrity Test', () => {
  it('verifies all popular search and popular goal links in app/search/page.tsx are valid active routes or redirect targets', () => {
    // 1. Read app/search/page.tsx
    const searchPagePath = path.resolve(__dirname, '../search/page.tsx')
    const searchPageContent = fs.readFileSync(searchPagePath, 'utf8')

    // Extract hrefs using regex matching href: '/...'
    const hrefRegex = /href:\s*['"]([^'"]+)['"]/g
    const hrefs: string[] = []
    let match
    while ((match = hrefRegex.exec(searchPageContent)) !== null) {
      hrefs.push(match[1])
    }

    expect(hrefs.length).toBeGreaterThan(0)

    // 2. Load route-manifest.json to get canonical routes
    const routeManifestPath = path.resolve(__dirname, '../../public/data/runtime-manifests/route-manifest.json')
    expect(fs.existsSync(routeManifestPath)).toBe(true)
    const routeManifest = JSON.parse(fs.readFileSync(routeManifestPath, 'utf8'))
    
    // Canonical routes set
    const canonicalRoutes = new Set<string>()
    for (const entry of routeManifest) {
      if (entry.route) {
        canonicalRoutes.add(entry.route)
        canonicalRoutes.add(entry.route + '/')
      }
    }

    // Add static app routes
    const staticAppRoutes = [
      '/',
      '/search',
      '/search/',
      '/guides',
      '/guides/',
      '/herbs',
      '/herbs/',
      '/compounds',
      '/compounds/',
      '/articles',
      '/articles/',
      '/compare',
      '/compare/',
      '/stacks',
      '/stacks/',
      '/goals',
      '/goals/',
    ]
    for (const route of staticAppRoutes) {
      canonicalRoutes.add(route)
    }

    // Add generated goal routes from goals data
    for (const goal of goals) {
      canonicalRoutes.add(`/goals/${goal.slug}`)
      canonicalRoutes.add(`/goals/${goal.slug}/`)
    }

    // 3. Load public/_redirects to get redirect sources
    const redirectsPath = path.resolve(__dirname, '../../public/_redirects')
    expect(fs.existsSync(redirectsPath)).toBe(true)
    const redirectsContent = fs.readFileSync(redirectsPath, 'utf8')
    const redirectLines = redirectsContent.split('\n')
    const redirectSources = new Set<string>()
    
    for (const line of redirectLines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const parts = trimmed.split(/\s+/)
      if (parts.length >= 2) {
        redirectSources.add(parts[0])
        redirectSources.add(parts[0] + '/')
      }
    }

    // 4. Assert that each href exists in canonicalRoutes OR redirectSources
    const invalidHrefs: string[] = []
    for (const href of hrefs) {
      const normalizedHref = href.split('?')[0]
      const isValid = canonicalRoutes.has(normalizedHref) || redirectSources.has(normalizedHref)
      if (!isValid) {
        invalidHrefs.push(href)
      }
    }

    if (invalidHrefs.length > 0) {
      console.error('Found invalid or unmapped search popular links:', invalidHrefs)
    }

    expect(invalidHrefs).toEqual([])
  })
})
