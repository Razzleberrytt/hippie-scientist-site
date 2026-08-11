import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

import {
  auditLearnCanonicals,
  expectedRouteFromPath,
  extractCanonical,
  normalizeCanonical,
  walkStaticPages,
} from './check-learn-canonicals.mjs'

let tmpDir

afterEach(() => {
  if (tmpDir) fs.rmSync(tmpDir, { recursive: true, force: true })
  tmpDir = undefined
})

describe('learn canonical audit helpers', () => {
  it('normalizes site URLs and trailing slashes', () => {
    expect(normalizeCanonical('/learn/calming')).toBe('/learn/calming/')
    expect(normalizeCanonical('https://thehippiescientist.net/learn/calming/')).toBe('/learn/calming/')
  })

  it('derives /learn routes and ignores route-group directory names', () => {
    const target = path.join('/tmp', 'repo', 'app', 'learn')
    expect(expectedRouteFromPath(path.join(target, 'page.tsx'), target)).toBe('/learn/')
    expect(expectedRouteFromPath(path.join(target, '(foundations)', 'evidence', 'page.tsx'), target)).toBe('/learn/evidence/')
  })

  it('extracts the metadata styles currently used by static learn pages', () => {
    expect(extractCanonical("alternates: { canonical: '/learn/' }", '/learn/')).toBe('/learn/')
    expect(
      extractCanonical(
        "alternates: { canonical: `${SITE_URL}/learn/serotonin-syndrome-supplements/` }",
        '/learn/serotonin-syndrome-supplements/',
      ),
    ).toBe('/learn/serotonin-syndrome-supplements/')
    expect(
      extractCanonical("buildPageMetadata({ title: 'Calm', path: '/learn/calming' })", '/learn/calming/'),
    ).toBe('/learn/calming/')
    expect(
      extractCanonical("generatePathwayMetadata('inflammation')", '/learn/inflammation/'),
    ).toBe('/learn/inflammation/')
  })

  it('resolves content-collection canonicalUrl variables when the bound slug matches the route', () => {
    const source = `
      const page = allConceptPages.find((item) => item.slug === 'rhabdomyolysis')!
      const canonicalUrl = \`${'${SITE_URL}'}${'${page.url}'}/\`
      export const metadata = { alternates: { canonical: canonicalUrl } }
    `
    expect(extractCanonical(source, '/learn/rhabdomyolysis/')).toBe('/learn/rhabdomyolysis/')
  })
})

describe('learn canonical audit integration', () => {
  it('walks static pages, skips dynamic routes, and reports canonical mismatches', () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'learn-canonical-audit-'))
    const target = path.join(tmpDir, 'app', 'learn')
    const goodDir = path.join(target, 'good')
    const badDir = path.join(target, 'bad')
    const dynamicDir = path.join(target, '[slug]')
    fs.mkdirSync(goodDir, { recursive: true })
    fs.mkdirSync(badDir, { recursive: true })
    fs.mkdirSync(dynamicDir, { recursive: true })

    fs.writeFileSync(path.join(target, 'page.tsx'), "export const metadata = { alternates: { canonical: '/learn/' } }")
    fs.writeFileSync(path.join(goodDir, 'page.tsx'), "export const metadata = buildPageMetadata({ path: '/learn/good/' })")
    fs.writeFileSync(path.join(badDir, 'page.tsx'), "export const metadata = { alternates: { canonical: '/learn/wrong/' } }")
    fs.writeFileSync(path.join(dynamicDir, 'page.tsx'), 'export default function DynamicPage() { return null }')

    expect(walkStaticPages(target)).toHaveLength(3)

    const output = []
    const result = auditLearnCanonicals({ root: tmpDir, targetDir: target, logger: (line) => output.push(line) })
    expect(result.files).toHaveLength(3)
    expect(result.failures).toHaveLength(1)
    expect(result.failures[0].expectedCanonical).toBe('/learn/bad/')
    expect(output.at(-1)).toContain('3 files, 1 problems')
  })

  it('allows an explicit noindex page without a canonical', () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'learn-canonical-noindex-'))
    const target = path.join(tmpDir, 'app', 'learn')
    const utilityDir = path.join(target, 'utility')
    fs.mkdirSync(utilityDir, { recursive: true })
    fs.writeFileSync(
      path.join(utilityDir, 'page.tsx'),
      'export const metadata = { robots: { index: false, follow: false } }',
    )

    const result = auditLearnCanonicals({ root: tmpDir, targetDir: target, logger: () => {} })
    expect(result.failures).toHaveLength(0)
  })
})
