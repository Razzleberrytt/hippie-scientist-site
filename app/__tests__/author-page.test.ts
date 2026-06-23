import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

describe('Author page', () => {
  it('includes the updated author identity copy', () => {
    const source = readFileSync(join(process.cwd(), 'app/author/page.tsx'), 'utf8')

    expect(source).toContain('Willie B. Randolph III')
    expect(source).toContain('Oak Ridge, Tennessee')
    expect(source).toContain('father of two little girls')
  })
})
