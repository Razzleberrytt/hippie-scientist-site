import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()
const pagePath = path.join(ROOT, 'app', 'info', 'page.tsx')
const source = fs.readFileSync(pagePath, 'utf8')

const requiredTrustRoutes = [
  '/info/about/',
  '/info/author/',
  '/info/methodology/',
  '/info/editorial-policy/',
  '/info/corrections/',
  '/info/research-roadmap/',
  '/info/disclaimer/',
  '/info/supplement-safety-checklist/',
  '/info/dosing/',
  '/info/faq/',
  '/info/privacy/',
  '/info/affiliate-disclosure/',
  '/info/content-licensing/',
  '/info/free-guide/',
  '/info/infographics/',
  '/info/newsletter/',
  '/info/research-resources-for-writers/',
  '/info/contact/',
]

describe('info authority parent hub', () => {
  it('provides a real /info route for child-page parent breadcrumbs', () => {
    expect(fs.existsSync(pagePath)).toBe(true)
    expect(source).toContain("path: '/info/'")
  })

  it('uses canonical hub surfaces and keyboard-visible cards', () => {
    expect(source).toContain('hero-shell')
    expect(source).toContain('heading-premium')
    expect(source).toContain('text-reading')
    expect(source).toContain('card-premium')
    expect(source).toContain('focus-visible:ring-2')
  })

  it('links the major existing trust, policy, safety, and resource routes', () => {
    for (const route of requiredTrustRoutes) expect(source).toContain(route)
  })

  it('states the site-boundary purpose of the directory', () => {
    expect(source).toContain('where its boundaries are')
    expect(source).toContain("parent directory for the site's trust and policy pages".replace("site's", 'site&apos;s'))
  })
})
