import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()

function readSource(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8')
}

describe('retired stack sitemap surface', () => {
  it('does not keep a route-level stacks.json reader or candidate loop', () => {
    const sitemap = readSource('app/sitemap.ts')

    expect(sitemap).not.toContain("readJsonArray<SitemapSourceItem>('public/data/stacks.json')")
    expect(sitemap).not.toContain('const stacksData =')
    expect(sitemap).not.toContain('stacksData.forEach')
  })

  it('keeps graph stack output distinct from the retired route surface', () => {
    const builder = readSource('scripts/data/build-runtime-from-workbook.mjs')

    expect(builder).toContain("writeJson(path.join(outDir, 'stack-synergy.json'), graph.stacks || [])")
    expect(builder).not.toMatch(/writeJson\([^\n]*['"]stacks\.json['"]\)/)
  })
})
