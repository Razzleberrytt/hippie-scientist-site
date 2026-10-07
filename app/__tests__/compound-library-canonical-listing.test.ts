import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { selectCanonicalCompounds, selectPublishedCompounds } from '../compounds/library-selector'
import { isRedirectedCompoundDuplicate } from '../../lib/deprecated-compound-canonicals'

const root = process.cwd()

function read(relativePath: string) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8')
}

describe('compound library canonical listings', () => {
  it('hides same-taxonomy aliases when their canonical compound is present', () => {
    const presentSlugs = new Set([
      'berberine',
      'berberine-hcl',
      'l-theanine',
      'theanine',
      'glycine',
      'glycine-sleep',
    ])

    expect(isRedirectedCompoundDuplicate('berberine-hcl', presentSlugs)).toBe(true)
    expect(isRedirectedCompoundDuplicate('theanine', presentSlugs)).toBe(true)
    expect(isRedirectedCompoundDuplicate('glycine-sleep', presentSlugs)).toBe(true)
    expect(isRedirectedCompoundDuplicate('berberine', presentSlugs)).toBe(false)
  })

  it('keeps an alias discoverable when it is the only same-taxonomy runtime record', () => {
    const presentSlugs = new Set(['berberine-hcl'])

    expect(isRedirectedCompoundDuplicate('berberine-hcl', presentSlugs)).toBe(false)
  })

  it('always hides cross-taxonomy compound aliases from the compound directory', () => {
    const presentSlugs = new Set(['garlic', 'ginger'])

    expect(isRedirectedCompoundDuplicate('garlic-extract', presentSlugs)).toBe(true)
    expect(isRedirectedCompoundDuplicate('gingerol', presentSlugs)).toBe(true)
  })

  it('counts canonical compounds regardless of publication status', () => {
    const compounds = selectCanonicalCompounds([
      { slug: 'z-tracked', displayName: 'Zed', indexability_status: 'NOINDEX' },
      { slug: 'hidden', displayName: 'Hidden', indexability_status: 'PUBLISH', runtime_export_decision: 'hide' },
      { slug: 'berberine', displayName: 'Berberine', indexability_status: 'PUBLISH' },
      { slug: 'berberine-hcl', displayName: 'Berberine HCl', indexability_status: 'PUBLISH' },
      { slug: 'garlic-extract', displayName: 'Garlic Extract', indexability_status: 'PUBLISH' },
      { slug: 'a-tracked', displayName: 'Alpha', indexability_status: 'NEEDS_REVIEW' },
    ])

    expect(compounds.map((compound) => compound.slug)).toEqual([
      'a-tracked',
      'berberine',
      'hidden',
      'z-tracked',
    ])
  })

  it('selects only canonical published compounds and sorts them for the library', () => {
    const compounds = selectPublishedCompounds([
      { slug: 'z-published', displayName: 'Zed', indexability_status: 'PUBLISH' },
      { slug: 'noindex', displayName: 'Noindex', indexability_status: 'NOINDEX' },
      { slug: 'hidden', displayName: 'Hidden', indexability_status: 'PUBLISH', runtime_export_decision: 'hide' },
      { slug: 'berberine', displayName: 'Berberine', indexability_status: 'PUBLISH' },
      { slug: 'berberine-hcl', displayName: 'Berberine HCl', indexability_status: 'PUBLISH' },
      { slug: 'garlic-extract', displayName: 'Garlic Extract', indexability_status: 'PUBLISH' },
      { slug: 'a-published', displayName: 'Alpha', indexability_status: 'PUBLISH' },
    ])

    expect(compounds.map((compound) => compound.slug)).toEqual(['a-published', 'berberine', 'z-published'])
  })

  it('uses the canonical published-compound loader on both library routes', () => {
    const firstPage = read('app/compounds/page.tsx')
    const paginatedPage = read('app/compounds/page/[page]/page.tsx')

    expect(firstPage).toContain('loadPublishedCompounds')
    expect(paginatedPage).toContain('loadPublishedCompounds')
  })

  it('keeps the homepage tracked-compound counter wired to the fresh canonical runtime inventory', () => {
    const compounds = JSON.parse(read('public/data/compounds.json'))
    const buildReport = JSON.parse(read('public/data/build-report.json'))
    const metricsSource = read('lib/public-site-metrics.ts')
    const homepageSource = read('components/homepage-v2.tsx')

    expect(Array.isArray(compounds)).toBe(true)
    expect(compounds).toHaveLength(Number(buildReport?.counts?.compounds))

    const canonicalCompounds = selectCanonicalCompounds(compounds)
    expect(canonicalCompounds.length).toBeGreaterThan(0)
    expect(canonicalCompounds.length).toBeLessThanOrEqual(compounds.length)

    expect(metricsSource).toContain('totalCompounds: canonicalCompounds.length')
    expect(homepageSource).toContain("value: metrics.totalCompounds")
    expect(homepageSource).not.toMatch(/value:\\s*\\d+\\s*,\\s*label:\\s*['"]Compounds tracked['"]/)
  })

  it('does not advertise an inflated fixed profile count in metadata', () => {
    const firstPage = read('app/compounds/page.tsx')

    expect(firstPage).not.toContain('Browse 600+ compound profiles')
    expect(firstPage).toContain('Browse published compound profiles')
    expect(firstPage).toContain('published compounds')
  })
})
