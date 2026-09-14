import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()
const SITEMAP = path.join(ROOT, 'app/sitemap.ts')

describe('retired stack sitemap contract', () => {
  it('does not read or enumerate the retired root stacks payload', () => {
    const source = fs.readFileSync(SITEMAP, 'utf8')

    expect(source).not.toContain("public/data/stacks.json")
    expect(source).not.toContain('const stacksData =')
    expect(source).not.toMatch(/stacksData\.forEach\(/)
  })

  it('keeps graph-level stack output out of route-level sitemap policy', () => {
    const source = fs.readFileSync(SITEMAP, 'utf8')

    expect(source).not.toContain('stack-synergy.json')
    expect(source).not.toContain('graph.stacks')
  })
})
