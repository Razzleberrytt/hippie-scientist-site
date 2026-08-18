import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

/**
 * This asserted twelve implementation strings across four files — footer
 * internals, signup attribution wiring, lead-magnet suppression — to protect one
 * idea: the homepage offers a single owned-audience path, not two competing
 * ones. Every one of those strings has since moved. The footer no longer
 * special-cases the homepage at all.
 *
 * NOTE FOR THE OWNER: the homepage now carries no on-page capture form. It links
 * to /info/supplement-safety-checklist/, where the signup lives. Whether that is
 * the intended funnel or an omission from the homepage redesign is a conversion
 * decision, not something these tests should settle by asserting either shape.
 * What is pinned here is the part that is unambiguous: the homepage must not
 * grow a second, competing capture surface, and the route it funnels to has to
 * exist and carry a signup.
 */
describe('homepage owned-audience funnel', () => {
  it('offers a single owned-audience path from the homepage', () => {
    const page = read('app/page.tsx')
    const homepage = read('components/homepage-v2.tsx')

    const captureComponents = [/HomepageEmailCapture/g, /<EmailCapture\b/g, /<NewsletterSignup\b/g]
    const captureCount = captureComponents.reduce(
      (total, pattern) => total + (page.match(pattern)?.length ?? 0) + (homepage.match(pattern)?.length ?? 0),
      0,
    )

    expect(captureCount).toBeLessThanOrEqual(1)
  })

  it('keeps the checklist destination the homepage points at', () => {
    expect(read('components/homepage-v2.tsx')).toContain('/info/supplement-safety-checklist/')
    expect(read('app/info/supplement-safety-checklist/page.tsx')).toContain('<NewsletterSignup')
  })
})
