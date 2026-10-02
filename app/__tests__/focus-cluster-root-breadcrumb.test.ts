import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const PAGE = path.join(process.cwd(), 'app/[slug]/page.tsx')

function pageSource() {
  return fs.readFileSync(PAGE, 'utf8')
}

describe('focus-cluster root breadcrumb', () => {
  it('labels the Guides parent honestly and exposes a named breadcrumb landmark', () => {
    const source = pageSource()

    expect(source).toContain('aria-label="Breadcrumb"')
    expect(source).toContain('<Link href="/guides/" className="transition hover:text-ink">Guides</Link>')
    expect(source).not.toContain('<Link href="/guides/" className="transition hover:text-ink">Articles</Link>')
    expect(source).toContain('<span aria-hidden="true">/</span>')
    expect(source).toContain('aria-current="page"')
  })
})
