import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const RETIRED_PAGE = 'app/guides/sleep/sleep-best-supplements/page.tsx'
const HUB = 'app/guides/sleep/page.tsx'
const APIGENIN_GUIDE = 'app/guides/sleep/apigenin-for-sleep/page.tsx'
const GOAL_LINKS = 'lib/goal-start-here-links.ts'
const GOAL_CLUSTERS = 'lib/goal-clusters.ts'
const OVERRIDE = 'public/redirect-overrides/003-sleep-best-supplements-consolidation.txt'
const RETIRED_ROUTE = '/guides/sleep/sleep-best-supplements/'
const CANONICAL_ROUTE = '/guides/sleep/best-supplements-for-sleep/'

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('sleep best supplements route consolidation', () => {
  it('retires the older cornerstone route and redirects it to the current decision guide', () => {
    expect(fs.existsSync(path.join(process.cwd(), RETIRED_PAGE))).toBe(false)

    const redirects = read(OVERRIDE)
    expect(redirects).toContain(RETIRED_ROUTE)
    expect(redirects).toContain(`${CANONICAL_ROUTE} 301`)
  })

  it('removes the retired route from discovery and shared goal navigation', () => {
    expect(read(HUB)).not.toContain('sleep-best-supplements')
    expect(read(GOAL_LINKS)).not.toContain(RETIRED_ROUTE)
    expect(read(GOAL_LINKS)).toContain(CANONICAL_ROUTE)
    expect(read(GOAL_CLUSTERS)).not.toContain("'sleep-best-supplements'")
  })

  it('links sleep guides directly to the canonical decision route instead of through the redirect', () => {
    const apigenin = read(APIGENIN_GUIDE)
    expect(apigenin).not.toContain(RETIRED_ROUTE)
    expect(apigenin).toContain(CANONICAL_ROUTE)
  })
})
