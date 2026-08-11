import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const PAGE = 'app/guides/other/adaptogens-compared/page.tsx'

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('adaptogens compared commercial neutrality', () => {
  it('keeps the broad comparison independent from a one-ingredient product module', () => {
    const source = read(PAGE)

    expect(source).not.toContain('RecommendationSection')
    expect(source).not.toContain('getRevenueProductSet')
    expect(source).not.toContain('Ashwagandha product picks')
  })

  it('preserves evidence references and owned-audience capture', () => {
    const source = read(PAGE)

    expect(source).toContain('<References refs={ADAPTOGENS_REFS} />')
    expect(source).toContain('location="guide-adaptogens"')
  })
})
