import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const read = (path: string) => readFileSync(resolve(root, path), 'utf8')

describe('TikTok app-review Terms of Service prerequisite', () => {
  it('ships a first-party static, canonical and readable Terms route', () => {
    const routePath = 'app/info/terms/page.tsx'
    expect(existsSync(resolve(root, routePath))).toBe(true)
    const page = read(routePath)
    expect(page).toContain("path: '/info/terms/'")
    expect(page).toContain('Terms of Service')
    expect(page).toContain('Effective October 9, 2026')
    expect(page).toContain('educational')
    expect(page).toContain('research')
    expect(page).toContain('Privacy Policy')
    expect(page).toContain('/info/contact/')
    expect(page).toContain('/info/content-licensing/')
    expect(page).toContain('/info/affiliate-disclosure/')
    expect(page).toContain('AuthorityBreadcrumbs')
    expect(page).not.toMatch(/next\/server|next\/headers|force-dynamic|use server|use client/)
  })

  it('keeps Terms discoverable from canonical public routes, the Info index, footer and sitemap', () => {
    expect(read('lib/public-routes.ts')).toContain("terms: '/info/terms/'")
    expect(read('app/info/page.tsx')).toContain("href: '/info/terms/'")
    expect(read('components/Footer.tsx')).toContain("href: PUBLIC_ROUTES.terms, label: 'Terms'")
    const sitemap = read('app/sitemap.ts')
    expect(sitemap).toContain("'/info/terms',")
    expect(sitemap).toContain("route(normalizeSitemapUrl('/info/terms'), 'yearly', 0.4)")
  })

  it('treats a legal policy page as non-editorial, with no unwanted lead capture', () => {
    expect(read('lib/page-experience-policy.ts')).toContain("'/info/terms',")
    const page = read('app/info/terms/page.tsx')
    expect(page).not.toContain('THS_PUBLISHER_ADMIN_TOKEN')
    expect(page).not.toContain('TIKTOK_CLIENT_SECRET')
    expect(page).not.toContain('video.upload')
  })
})
