import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const RETIRED_PAGE = 'app/guides/focus/best-supplements-for-focus/page.tsx'
const HUB = 'app/guides/focus/page.tsx'
const CANONICAL_ROUTES = 'src/lib/canonical-routes.ts'
const GOAL_SEO = 'src/lib/goal-seo.ts'
const OVERRIDE = 'public/redirect-overrides/004-focus-best-supplements-consolidation.txt'

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('focus best-supplements route consolidation', () => {
  it('retires the older quick-reference route and redirects it to the evidence-first guide', () => {
    expect(fs.existsSync(path.join(process.cwd(), RETIRED_PAGE))).toBe(false)

    const redirects = read(OVERRIDE)
    expect(redirects).toContain('/guides/focus/best-supplements-for-focus/')
    expect(redirects).toContain('/guides/focus/best-nootropics-for-focus/ 301')
  })

  it('uses the evidence-first guide for focus discovery and shared canonical registries', () => {
    expect(read(HUB)).not.toContain('best-supplements-for-focus')
    expect(read(HUB)).toContain('/guides/focus/best-nootropics-for-focus/')
    expect(read(CANONICAL_ROUTES)).not.toContain('/guides/focus/best-supplements-for-focus')
    expect(read(CANONICAL_ROUTES)).toContain('/guides/focus/best-nootropics-for-focus/')
    expect(read(GOAL_SEO)).not.toContain('/guides/focus/best-supplements-for-focus')
    expect(read(GOAL_SEO)).toContain('/guides/focus/best-nootropics-for-focus/')
  })
})
