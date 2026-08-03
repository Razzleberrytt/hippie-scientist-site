import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

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

  it('applies the canonical filter to both the first and paginated library routes', () => {
    const firstPage = read('app/compounds/page.tsx')
    const paginatedPage = read('app/compounds/page/[page]/page.tsx')

    for (const source of [firstPage, paginatedPage]) {
      expect(source).toContain('isRedirectedCompoundDuplicate')
      expect(source).toContain('presentSlugs')
      expect(source).toContain('!isRedirectedCompoundDuplicate')
    }
  })
})
