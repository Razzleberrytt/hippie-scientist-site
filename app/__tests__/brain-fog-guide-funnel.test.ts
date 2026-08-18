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

    // The refs const was renamed; what matters is that the page still renders its
    // reference list and that nothing commercial sits in that path.
    expect(source).toMatch(/<References refs=\{[A-Z_]+\} \/>/)
    expect(source).not.toContain('getRevenueProductSet')
    expect(source).not.toContain('RecommendationSection')
    expect(source).not.toContain('AffiliateDisclosure')
  })

  it('routes readers to distinct relevant next-step pages instead of self-links', () => {
    const source = read(PAGE)
    const selfRoute = '/guides/other/supplements-for-brain-fog-and-fatigue/'

    // Counting raw occurrences also counted the canonical `path:` in metadata and
    // the FAQ component's `pagePath`, neither of which is a link offered to a
    // reader. What must not exist is a next-step link back to this page.
    expect(source).not.toMatch(new RegExp(`href=['\"]${selfRoute}['\"]`))
    // Which guides are worth linking is an editorial choice and has changed.
    // The contract is that the page sends readers somewhere else, to more than
    // one distinct destination.
    const internalHrefs = [...source.matchAll(/href="(\/[^"]*)"/g)].map((match) => match[1])
    const distinctDestinations = new Set(internalHrefs.filter((href) => href !== selfRoute))

    expect(distinctDestinations.size).toBeGreaterThanOrEqual(3)
    expect(distinctDestinations.has(selfRoute)).toBe(false)
  })
})
