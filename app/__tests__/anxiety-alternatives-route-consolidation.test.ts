import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const COMPAT_PAGE = 'app/guides/anxiety/natural-alternatives-to-anxiety-medication/page.tsx'
const HUB = 'app/guides/anxiety/page.tsx'
const OVERRIDE = 'public/redirect-overrides/002-anxiety-alternatives-consolidation.txt'

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('anxiety alternatives route consolidation', () => {
  it('redirects the overlapping route while keeping its compatibility source canonicalized', () => {
    const redirects = read(OVERRIDE)
    expect(redirects).toContain('/guides/anxiety/natural-alternatives-to-anxiety-medication/')
    expect(redirects).toContain('/guides/anxiety/best-herbs-for-anxiety/ 301')

    const compatibilitySource = read(COMPAT_PAGE)
    expect(compatibilitySource).toContain("alternates: { canonical: '/guides/anxiety/best-herbs-for-anxiety/' }")
  })

  it('does not advertise the redirected route from the anxiety hub', () => {
    const source = read(HUB)

    expect(source).not.toContain('natural-alternatives-to-anxiety-medication')
    expect(source).toContain('/guides/anxiety/best-herbs-for-anxiety/')
  })
})
