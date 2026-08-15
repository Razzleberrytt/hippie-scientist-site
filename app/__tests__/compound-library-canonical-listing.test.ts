import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { selectPublishedCompounds } from '../compounds/library-selector'
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

  it('does not advertise an inflated fixed profile count in metadata', () => {
    const firstPage = read('app/compounds/page.tsx')

    expect(firstPage).not.toContain('Browse 600+ compound profiles')
    expect(firstPage).toContain('Browse published compound profiles')
    expect(firstPage).toContain('published compounds')
  })
})
