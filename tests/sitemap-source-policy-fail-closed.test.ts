import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const sitemapSource = fs.readFileSync(path.join(process.cwd(), 'app/sitemap.ts'), 'utf8')

describe('sitemap route source policy', () => {
  it('fails closed when a non-dynamic route source cannot be read', () => {
    const eligibilityStart = sitemapSource.indexOf('function checkRouteFileEligibility')
    const manifestStart = sitemapSource.indexOf('function isAllowedRouteManifestEntry')
    const eligibilitySource = sitemapSource.slice(eligibilityStart, manifestStart)

    expect(eligibilityStart).toBeGreaterThanOrEqual(0)
    expect(manifestStart).toBeGreaterThan(eligibilityStart)
    expect(eligibilitySource).toContain("const content = readFileSync(servedFile, 'utf8')")
    expect(eligibilitySource).toMatch(/catch\s*\{[\s\S]*?return false;[\s\S]*?\}/)
    expect(eligibilitySource).not.toContain("treat as eligible when the file exists but can't be read")
  })

  it('keeps dynamic catch-all source checks delegated to runtime indexability gating', () => {
    const eligibilityStart = sitemapSource.indexOf('function checkRouteFileEligibility')
    const manifestStart = sitemapSource.indexOf('function isAllowedRouteManifestEntry')
    const eligibilitySource = sitemapSource.slice(eligibilityStart, manifestStart)

    expect(eligibilitySource).toContain("if (/\\[[^\\]]+\\]/.test(servedFile))")
    expect(eligibilitySource).toContain('return true;')
    expect(eligibilitySource).toContain('shouldIndexRoute()')
  })
})
