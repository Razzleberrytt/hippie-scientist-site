import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { goals } from '../../data/goals'

describe('Route Integrity Test', () => {
  it('verifies all popular search and popular goal links in app/search/page.tsx are valid active routes or redirect targets', () => {
    // 1. Read app/search/page.tsx and extract all hrefs
    const searchPagePath = path.resolve(__dirname, '../search/page.tsx')
    const searchPageContent = fs.readFileSync(searchPagePath, 'utf8')

    const hrefRegex = /href:\s*['"]([^'"]+)['"]/g
    const hrefs: string[] = []
    let match
    while ((match = hrefRegex.exec(searchPageContent)) !== null) {
      hrefs.push(match[1])
    }
    expect(hrefs.length).toBeGreaterThan(0)

    // 2. Build a set of known-valid canonical routes
    const canonicalRoutes = new Set<string>()

    // 2a. Route manifest (workbook-generated subset)
    const routeManifestPath = path.resolve(
      __dirname,
      '../../public/data/runtime-manifests/route-manifest.json',
    )
    expect(fs.existsSync(routeManifestPath)).toBe(true)
    const routeManifest = JSON.parse(fs.readFileSync(routeManifestPath, 'utf8'))
    for (const entry of routeManifest) {
      if (entry.route) {
        canonicalRoutes.add(entry.route)
        canonicalRoutes.add(entry.route + '/')
      }
    }

    // 2b. Well-known static app routes
    const staticAppRoutes = [
      '/',
      '/search', '/search/',
      '/guides', '/guides/',
      '/herbs', '/herbs/',
      '/compounds', '/compounds/',
      '/articles', '/articles/',
      '/compare', '/compare/',
      '/stacks', '/stacks/',
      '/goals', '/goals/',
    ]
    for (const route of staticAppRoutes) {
      canonicalRoutes.add(route)
    }

    // 2c. Goal routes from goals data
    for (const goal of goals) {
      canonicalRoutes.add(`/goals/${goal.slug}`)
      canonicalRoutes.add(`/goals/${goal.slug}/`)
    }

    // 2d. Herb routes: enumerate public/data/herb-detail/*.json slugs.
    //     These are the actual source of truth served by app/herbs/[slug]/page.tsx.
    //     The route-manifest is a workbook-derived subset and does not list every herb.
    const herbDetailDir = path.resolve(__dirname, '../../public/data/herb-detail')
    if (fs.existsSync(herbDetailDir)) {
      for (const fileName of fs.readdirSync(herbDetailDir)) {
        if (fileName.endsWith('.json')) {
          const slug = fileName.replace(/\.json$/, '')
          canonicalRoutes.add(`/herbs/${slug}`)
          canonicalRoutes.add(`/herbs/${slug}/`)
        }
      }
    }

    // 2e. Compound routes: enumerate public/data/compound-detail/*.json slugs.
    const compoundDetailDir = path.resolve(__dirname, '../../public/data/compound-detail')
    if (fs.existsSync(compoundDetailDir)) {
      for (const fileName of fs.readdirSync(compoundDetailDir)) {
        if (fileName.endsWith('.json')) {
          const slug = fileName.replace(/\.json$/, '')
          canonicalRoutes.add(`/compounds/${slug}`)
          canonicalRoutes.add(`/compounds/${slug}/`)
        }
      }
    }

    // 3. Load redirect sources from public/_redirects
    const redirectsPath = path.resolve(__dirname, '../../public/_redirects')
    expect(fs.existsSync(redirectsPath)).toBe(true)
    const redirectsContent = fs.readFileSync(redirectsPath, 'utf8')
    const redirectSources = new Set<string>()
    for (const line of redirectsContent.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const parts = trimmed.split(/\s+/)
      if (parts.length >= 2) {
        redirectSources.add(parts[0])
        redirectSources.add(parts[0] + '/')
      }
    }

    // 3b. Static App Router pages are the source of truth for non-data-driven
    //     routes (e.g. /tools, /dosing, /stacks/builder, /education/*). The
    //     route-manifest is a workbook-derived subset and the hardcoded list
    //     above is not exhaustive, so resolve any remaining href against an
    //     actual app/<path>/page.tsx file before flagging it as invalid.
    const appDir = path.resolve(__dirname, '..')
    const hasStaticPage = (normalizedHref: string): boolean => {
      const clean = normalizedHref.replace(/^\/+|\/+$/g, '')
      if (!clean) return true // root
      if (clean.includes('[') || clean.includes(']')) return false
      return (
        fs.existsSync(path.join(appDir, clean, 'page.tsx')) ||
        fs.existsSync(path.join(appDir, clean, 'page.ts'))
      )
    }

    // 4. Assert every href is valid (canonical route OR redirect source OR static page)
    const invalidHrefs: string[] = []
    for (const href of hrefs) {
      const normalizedHref = href.split('?')[0]
      if (
        !canonicalRoutes.has(normalizedHref) &&
        !redirectSources.has(normalizedHref) &&
        !hasStaticPage(normalizedHref)
      ) {
        invalidHrefs.push(href)
      }
    }

    if (invalidHrefs.length > 0) {
      console.error('Found invalid or unmapped search popular links:', invalidHrefs)
    }
    expect(invalidHrefs).toEqual([])
  })
})
