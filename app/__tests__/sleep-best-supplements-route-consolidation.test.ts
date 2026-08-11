import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const RETIRED_PAGE = 'app/guides/sleep/sleep-best-supplements/page.tsx'
const HUB = 'app/guides/sleep/page.tsx'
const GOAL_LINKS = 'lib/goal-start-here-links.ts'
const GOAL_CLUSTERS = 'lib/goal-clusters.ts'
const OVERRIDE = 'public/redirect-overrides/003-sleep-best-supplements-consolidation.txt'

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('sleep best supplements route consolidation', () => {
  it('retires the older cornerstone route and redirects it to the current decision guide', () => {
    expect(fs.existsSync(path.join(process.cwd(), RETIRED_PAGE))).toBe(false)

    const redirects = read(OVERRIDE)
    expect(redirects).toContain('/guides/sleep/sleep-best-supplements/')
    expect(redirects).toContain('/guides/sleep/best-supplements-for-sleep/ 301')
  })

  it('removes the retired route from discovery and shared goal navigation', () => {
    expect(read(HUB)).not.toContain('sleep-best-supplements')
    expect(read(GOAL_LINKS)).not.toContain('/guides/sleep/sleep-best-supplements/')
    expect(read(GOAL_LINKS)).toContain('/guides/sleep/best-supplements-for-sleep/')
    expect(read(GOAL_CLUSTERS)).not.toContain("'sleep-best-supplements'")
  })
})
