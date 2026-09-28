import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { coreGoals } from '@/lib/core-goals'

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

/**
 * The homepage used to carry its goal hrefs as inline literals, so this asserted
 * them by matching the source text. They now come from lib/core-goals, and the
 * hubs moved from /guides/<goal>/ to /goals/<goal>/, which a source grep can
 * only ever report as a failure. The contract worth keeping is the one it was
 * really protecting: stress and anxiety are separate decisions and must not be
 * funnelled into one shared hub.
 */
describe('homepage goal routes', () => {
  it('sends stress and anxiety visitors to their own decision hubs', () => {
    const hrefBySlug = new Map(coreGoals.map((goal) => [goal.slug, goal.href]))

    expect(hrefBySlug.get('stress')).toBe('/goals/stress/')
    expect(hrefBySlug.get('anxiety')).toBe('/goals/anxiety/')
  })

  it('gives every core goal a distinct destination', () => {
    const hrefs = coreGoals.map((goal) => goal.href)
    expect(new Set(hrefs).size).toBe(hrefs.length)
  })

  it('routes homepage goal discovery through the canonical site destinations instead of duplicating goal cards', () => {
    const homepage = read('components/homepage-v2.tsx')

    expect(homepage).toContain('<SiteDestinationGrid />')
    expect(homepage).not.toContain("from '@/lib/core-goals'")
  })
})
