import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import sitemap from '../app/sitemap'
import { normalizeVisibilityRoute } from '../lib/sitemap-route-visibility'

const read = (relativePath: string) =>
  fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')

const sleepForms = read('app/guides/sleep/magnesium-types-for-sleep/page.tsx')
const generalTypes = read('app/guides/other/magnesium-types-guide/page.tsx')
const sleepShortlist = read('app/guides/sleep/best-supplements-for-sleep/page.tsx')
const redirects = read('public/_redirects')

describe('magnesium intent separation', () => {
  it('keeps the sleep-form and general-types routes as distinct canonical reader jobs', () => {
    expect(sleepForms).toContain("const SLUG = 'magnesium-types-for-sleep'")
    expect(sleepForms).toContain('path: `/guides/sleep/${SLUG}`')
    expect(generalTypes).toContain("path: '/guides/other/magnesium-types-guide/'")
    expect(sleepShortlist).toContain("alternates: { canonical: '/guides/sleep/best-supplements-for-sleep/' }")

    expect(generalTypes).not.toContain("path: '/guides/sleep/magnesium-types-for-sleep/'")
    expect(sleepForms).not.toContain("path: '/guides/other/magnesium-types-guide/'")
  })

  it('makes the broad-versus-sleep intent boundary explicit in both directions', () => {
    expect(sleepForms).toContain('href="/guides/other/magnesium-types-guide/"')
    expect(sleepForms).toContain('General Magnesium Types &amp; Absorption')

    expect(generalTypes).toContain('href="/guides/sleep/magnesium-types-for-sleep/"')
    expect(generalTypes).toContain('separate sleep-form reader job')
    expect(generalTypes).toContain('sleep outcomes distinct from general bioavailability comparisons')
  })

  it('routes form-comparison intent from the sleep shortlist to the specialized page', () => {
    expect(sleepShortlist).toContain('href="/guides/sleep/magnesium-types-for-sleep/"')
    expect(sleepShortlist).toContain('Compare magnesium forms for sleep')
  })

  it('preserves both high-citation legacy article variants as permanent redirects to the canonical sleep guide', () => {
    expect(redirects).toContain('/articles/magnesium-types-for-sleep /guides/sleep/magnesium-types-for-sleep/ 301')
    expect(redirects).toContain('/articles/magnesium-types-for-sleep/ /guides/sleep/magnesium-types-for-sleep/ 301')
  })

  it('keeps the canonical sleep-form target sitemap-advertised', async () => {
    const entries = await sitemap()
    const routes = new Set(
      entries.map((entry) => normalizeVisibilityRoute(new URL(entry.url).pathname)),
    )

    expect(routes.has('/guides/sleep/magnesium-types-for-sleep')).toBe(true)
    expect(routes.has('/articles/magnesium-types-for-sleep')).toBe(false)
  })
})
