import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), 'utf8')

const newsletter = read('components/NewsletterSignup.tsx')
const emailCapture = read('components/EmailCapture.tsx')
const deferred = read('components/articles/DeferredEmailCapture.tsx')
const articleEmailCapture = read('components/articles/EmailCapture.tsx')
const contextual = read('components/ContextualLeadMagnet.tsx')
const layout = read('app/layout.tsx')
const herbs = read('app/herbs/[slug]/page.tsx')
const compounds = read('app/compounds/[slug]/page.tsx')
const blog = read('components/blog/BlogPostPage.tsx')
const articleExperiment = read('components/monetization/ArticleEmailCaptureExperiment.tsx')
const glycinePolicy = read('lib/lead-magnets.ts')

describe('systemic email-capture ownership contract', () => {
  it('marks ordinary newsletter signup surfaces as page-owned by default', () => {
    expect(newsletter).toContain("captureOwner?: 'page' | 'contextual-global'")
    expect(newsletter).toContain("captureOwner = 'page'")
    expect(newsletter).toContain('data-email-capture-owner={captureOwner}')

    expect(emailCapture).toContain("captureOwner?: 'page' | 'contextual-global'")
    expect(emailCapture).toContain("captureOwner = 'page'")
    expect(emailCapture).toContain('captureOwner={captureOwner}')

    expect(articleEmailCapture).toContain("captureOwner?: 'page' | 'contextual-global'")
    expect(articleEmailCapture).toContain("captureOwner = 'page'")
    expect(articleEmailCapture).toContain('data-email-capture-owner={captureOwner}')
  })

  it('marks the deferred root-layout capture as contextual-global', () => {
    expect(deferred).toContain("captureOwner='contextual-global'")
    expect(articleEmailCapture).toContain("captureOwner?: 'page' | 'contextual-global'")
    expect(contextual).toContain("<DeferredEmailCapture")
    expect(contextual).toContain("data-contextual-lead-magnet='true'")
    expect(layout).toContain('<ContextualLeadMagnet />')
  })

  it('fails closed until the current route has been checked for page-owned capture', () => {
    expect(contextual).toContain("document.getElementById('main-content')")
    expect(contextual).toContain("querySelector('[data-email-capture-owner=\"page\"]')")
    expect(contextual).toContain('ownershipCheck.pathname !== pathname')
    expect(contextual).toContain('ownershipCheck.hasPageOwnedCapture')
    expect(contextual).toContain('new MutationObserver(scanOwnership)')
    expect(contextual).toContain("attributeFilter: ['data-email-capture-owner']")
    expect(contextual).toContain('if (!ownershipCheck || ownershipCheck.pathname !== pathname || ownershipCheck.hasPageOwnedCapture) return null')
  })

  it('protects shared templates and delayed experiments that own signup', () => {
    expect(herbs).toContain('<EmailCapture')
    expect(compounds).toContain('<EmailCapture')
    expect(blog).toContain('<EmailCapture')
    expect(articleExperiment).toContain("data-email-capture-owner='page'")
    expect(articleExperiment).toContain("data-email-capture-reservation='article-experiment'")
    expect(articleExperiment).toContain('if (!variant || !isRenderable) return ownershipReservation')
  })

  it('keeps explicit route policy compatible with the systemic rule', () => {
    expect(glycinePolicy).toContain("path === '/guides/sleep/glycine-for-sleep'")
    expect(glycinePolicy).toContain("path === '/guides/sleep/glycine-for-sleep/'")
  })

  it('does not change signup provider, consent, or analytics plumbing', () => {
    expect(newsletter).toContain('mailchimpSignupConfig.action')
    expect(newsletter).toContain('trackEmailSignup')
    expect(newsletter).toContain('trackExperimentConversion')
    expect(newsletter).toContain('trackRevenueEvent')
  })
})
