import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const PAGE = 'app/guides/other/supplements-for-brain-fog-and-fatigue/page.tsx'

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('brain fog and fatigue guide funnel', () => {
  it('keeps references independent from commercial product availability', () => {
    const source = read(PAGE)

    expect(source).toContain('<References refs={SUPPLEMENTS_FOR_BRAIN_FOG_AND_FATIGUE_REFS} />')
    expect(source).not.toContain('getRevenueProductSet')
    expect(source).not.toContain('RecommendationSection')
    expect(source).not.toContain('AffiliateDisclosure')
  })

  it('routes readers to distinct relevant next-step pages instead of self-links', () => {
    const source = read(PAGE)
    const selfRoute = '/guides/other/supplements-for-brain-fog-and-fatigue/'

    expect(source.split(selfRoute)).toHaveLength(2)
    expect(source).toContain('/guides/focus/best-nootropics-for-focus/')
    expect(source).toContain('/guides/other/creatine-brain-health/')
    expect(source).toContain('/guides/focus/focus-without-caffeine-crash/')
  })
})
