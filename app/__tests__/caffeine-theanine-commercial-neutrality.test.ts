import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const PAGE = 'app/guides/compare/caffeine-vs-l-theanine/page.tsx'

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('caffeine vs l-theanine commercial neutrality', () => {
  it('does not monetize only one side of a two-way comparison', () => {
    const source = read(PAGE)

    expect(source).not.toContain('RecommendationSection')
    expect(source).not.toContain('getRevenueProductSet')
  })

  it('routes readers to the evidence-first focus guide and preserves references', () => {
    const source = read(PAGE)

    expect(source).toContain('/guides/focus/best-nootropics-for-focus/')
    expect(source).not.toContain('/guides/focus/best-supplements-for-focus/')
    expect(source).toContain('<References refs={CAFFEINE_VS_L_THEANINE_REFS} />')
  })
})
