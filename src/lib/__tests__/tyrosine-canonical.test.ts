import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  DEPRECATED_HERB_CANONICALS,
  isRedirectedDuplicate,
} from '../../../lib/deprecated-herb-canonicals'

describe('L-tyrosine canonical taxonomy', () => {
  it('removes the legacy herb record from herb browse and static route generation', () => {
    expect(DEPRECATED_HERB_CANONICALS.tyrosine).toBe('l-tyrosine')
    expect(isRedirectedDuplicate('tyrosine', new Set(['tyrosine']))).toBe(true)
  })

  it('redirects both herb URL variants directly to the compound canonical', () => {
    const redirects = readFileSync(path.join(process.cwd(), 'public/_redirects'), 'utf8')

    expect(redirects).toContain('/herbs/tyrosine /compounds/l-tyrosine/ 301')
    expect(redirects).toContain('/herbs/tyrosine/ /compounds/l-tyrosine/ 301')
  })
})
