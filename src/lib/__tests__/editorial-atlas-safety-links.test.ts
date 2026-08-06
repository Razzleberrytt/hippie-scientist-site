import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const serotonergicAtlasHref = '/tools/botanical-activity-atlas/serotonergic-interaction-risk/?safety=Serotonergic&sort=evidence'

describe('editorial atlas safety links', () => {
  it('keeps the serotonin syndrome guide linked to the prefiltered atlas', () => {
    const source = readFileSync('app/learn/serotonin-syndrome-supplements/page.tsx', 'utf8')
    expect(source).toContain(serotonergicAtlasHref)
    expect(source).toContain('Compare serotonergic-risk botanicals')
  })

  it('keeps the stacking safety guide linked to the prefiltered atlas', () => {
    const source = readFileSync('app/guides/other/supplement-stacking-safety/page.tsx', 'utf8')
    expect(source).toContain(serotonergicAtlasHref)
    expect(source).toContain('Compare serotonergic-risk botanicals')
  })
})
