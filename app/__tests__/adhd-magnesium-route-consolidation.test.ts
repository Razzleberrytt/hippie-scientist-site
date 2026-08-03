import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const canonicalRoute = '/guides/adhd/best-magnesium-supplement-for-adhd/'
const retiredPage = 'app/guides/best/magnesium-supplements-for-adhd/page.tsx'

function read(relativePath: string) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8')
}

describe('ADHD magnesium route consolidation', () => {
  it('removes the duplicate page and sends the best-guides hub to the canonical route', () => {
    expect(fs.existsSync(path.join(root, retiredPage))).toBe(false)

    const hub = read('app/guides/best/page.tsx')
    expect(hub).toContain(`href: '${canonicalRoute}'`)
    expect(hub).not.toContain("href: '/guides/best/magnesium-supplements-for-adhd/'")
  })

  it('keeps slash and non-slash alias families covered by build-time redirects', () => {
    const redirects = read('public/redirect-overrides/adhd-magnesium-canonical.redirects')

    expect(redirects).toContain(
      `/guides/best/magnesium-supplements-for-adhd ${canonicalRoute} 301`,
    )
    expect(redirects).toContain(
      `/best-magnesium-supplements-for-adhd ${canonicalRoute} 301`,
    )
  })

  it('marks the old page specification as retired rather than a future build target', () => {
    const retiredSpec = read('docs/page-specs/best-magnesium-supplements-for-adhd.md')

    expect(retiredSpec).toContain('Retired Page Spec')
    expect(retiredSpec).toContain(`**Canonical route:** \`${canonicalRoute}\``)
    expect(retiredSpec).toContain('Do not recreate a separate page')
    expect(retiredSpec).not.toContain('do NOT merge or redirect')
  })

  it('preserves evidence, label, safety, and governed commercial boundaries on the canonical page', () => {
    const canonical = read('app/guides/adhd/best-magnesium-supplement-for-adhd/page.tsx')

    expect(canonical).toContain('no magnesium form has been proven')
    expect(canonical).toContain('elemental magnesium')
    expect(canonical).toContain('NIH adult upper limit is 350 mg per day')
    expect(canonical).toContain("getRevenueProductSet('magnesium')")
    expect(canonical).toContain('<AffiliateDisclosure variant="compact" />')
  })
})
