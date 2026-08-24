import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), 'utf8')

describe('public research roadmap canonical ownership', () => {
  it('keeps the richer info route as the only app-owned roadmap page', () => {
    expect(fs.existsSync(path.join(root, 'app/roadmap/page.tsx'))).toBe(false)

    const canonicalPage = read('app/info/research-roadmap/page.tsx')
    expect(canonicalPage).toContain("path: '/info/research-roadmap/'")
    expect(canonicalPage).toContain('ResearchSuggestionPanel')
  })

  it('redirects both legacy roadmap URL forms directly to the canonical owner', () => {
    const redirects = read('public/redirect-overrides/005-public-roadmap-consolidation.txt')

    expect(redirects).toContain('/roadmap /info/research-roadmap/ 301')
    expect(redirects).toContain('/roadmap/ /info/research-roadmap/ 301')
  })
})
