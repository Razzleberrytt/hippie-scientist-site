import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('Compare hub canonical links', () => {
  it('links directly to the canonical Rhodiola vs Ashwagandha comparison', () => {
    const page = read('app/guides/compare/page.tsx')

    expect(page).toContain("slug: 'rhodiola-vs-ashwagandha'")
    expect(page).not.toContain("slug: 'ashwagandha-vs-rhodiola'")
    expect(page).toContain("href: '/guides/compare/rhodiola-vs-ashwagandha/'")
  })
})
