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
 * The homepage now hands discovery to the focused Explore surface instead of
 * pointing directly to the checklist. Keep the conversion contract focused on
 * two things that remain intentional: the homepage must not grow a competing
 * capture surface, and the canonical safety/checklist routes must stay available.
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

  it('keeps the canonical safety destination and checklist capture route available', () => {
    const homepage = read('components/homepage-v2.tsx')
    const explore = read('app/explore/page.tsx')
    const destinations = read('lib/site-destinations.ts')

    expect(homepage).toContain("href='/explore/'")
    expect(homepage).not.toContain('<SiteDestinationGrid />')
    expect(explore).toContain("href: '/safety-checker/'")
    expect(destinations).toContain("id: 'safety'")
    expect(destinations).toContain("href: '/safety-checker'")
    expect(read('app/info/supplement-safety-checklist/page.tsx')).toContain('<NewsletterSignup')
  })
})
