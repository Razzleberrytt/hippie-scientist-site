import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const COMPAT_PAGE = 'app/guides/focus/best-supplements-for-focus/page.tsx'
const HUB = 'app/guides/focus/page.tsx'
const CANONICAL_ROUTES = 'src/lib/canonical-routes.ts'
const GOAL_SEO = 'src/lib/goal-seo.ts'
const OVERRIDE = 'public/redirect-overrides/004-focus-best-supplements-consolidation.txt'

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('focus best-supplements route consolidation', () => {
  it('redirects the older route and keeps its generator wrapper canonicalized to the evidence-first guide', () => {
    const redirects = read(OVERRIDE)
    expect(redirects).toContain('/guides/focus/best-supplements-for-focus/')
    expect(redirects).toContain('/guides/focus/best-nootropics-for-focus/ 301')

    const compatibilitySource = read(COMPAT_PAGE)
    expect(compatibilitySource).toContain("const CANONICAL_PATH = '/guides/focus/best-nootropics-for-focus/'")
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
