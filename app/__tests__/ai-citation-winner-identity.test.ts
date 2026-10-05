import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import sitemap from '../sitemap'
import { normalizeVisibilityRoute } from '@/lib/sitemap-route-visibility'

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

const naturalSleep = read('app/guides/sleep/best-natural-sleep-aids-that-work/page.tsx')
const stressCanonical = read('app/guides/best/supplements-for-stress/page.tsx')
const stressImplementation = read('app/guides/anxiety/best-supplements-for-stress/page.tsx')
const anxietyHerbs = read('app/guides/anxiety/best-herbs-for-anxiety/page.tsx')
const valerian = read('content/articles/valerian-root.md')
const mitragynine = read('content/articles/mitragynine.mdx')

describe('AI citation winner identity protection', () => {
  it('keeps every protected citation winner effectively indexable in the emitted sitemap', async () => {
    const entries = await sitemap()
    const paths = new Set(
      entries.map((entry) => normalizeVisibilityRoute(new URL(entry.url).pathname)),
    )

    for (const route of [
      '/guides/sleep/best-natural-sleep-aids-that-work/',
      '/guides/best/supplements-for-stress/',
      '/guides/anxiety/best-herbs-for-anxiety/',
      '/articles/valerian-root/',
      '/articles/mitragynine/',
    ]) {
      expect(paths.has(normalizeVisibilityRoute(route)), `${route} must remain indexable and sitemap-advertised`).toBe(true)
    }
  })

  it('protects the natural sleep-aids winner canonical, H1 intent, and early answer block', () => {
    expect(naturalSleep).toContain("title: 'Best Natural Sleep Aids That Work: 2026 Evidence Guide'")
    expect(naturalSleep).toContain("alternates: { canonical: '/guides/sleep/best-natural-sleep-aids-that-work/' }")
    expect(naturalSleep).toContain('Natural Sleep Aids That Work: What the Evidence Actually Supports')
    expect(naturalSleep.indexOf('id="quick-answer"')).toBeGreaterThan(-1)
    expect(naturalSleep.indexOf('id="quick-answer"')).toBeLessThan(naturalSleep.indexOf('id="ranking"'))
  })

  it('protects the stress winner canonical wrapper and keeps the implementation route noindex', () => {
    expect(stressCanonical).toContain("const CANONICAL_PATH = '/guides/best/supplements-for-stress/'")
    expect(stressCanonical).toContain('robots: { index: true, follow: true }')
    expect(stressCanonical).toContain("title: 'Best Supplements for Stress: Evidence-Ranked Guide (2026)'")
    expect(stressImplementation).toContain("alternates: { canonical: '/guides/best/supplements-for-stress/' }")
    expect(stressImplementation).toContain('robots: { index: false, follow: true }')
    expect(stressImplementation).toContain('Best Supplements for Stress: What the Evidence Actually Supports')
    expect(stressImplementation.indexOf('id="bottom-line"')).toBeGreaterThan(-1)
    expect(stressImplementation.indexOf('id="bottom-line"')).toBeLessThan(stressImplementation.indexOf('id="ranking"'))
  })

  it('protects the anxiety-herbs winner canonical, H1 intent, and early bottom line', () => {
    expect(anxietyHerbs).toContain("title: 'Best Herbs for Anxiety: Evidence-Ranked Guide (2026)'")
    expect(anxietyHerbs).toContain("alternates: { canonical: '/guides/anxiety/best-herbs-for-anxiety/' }")
    expect(anxietyHerbs).toContain('Best Herbs for Anxiety: What Human Evidence Actually Supports')
    expect(anxietyHerbs.indexOf('id="bottom-line"')).toBeGreaterThan(-1)
    expect(anxietyHerbs.indexOf('id="bottom-line"')).toBeLessThan(anxietyHerbs.indexOf('id="ranking"'))
  })

  it('protects the valerian citation-winning article identity and direct answer', () => {
    expect(valerian).toContain('slug: valerian-root')
    expect(valerian).toContain('title: "Valerian Root for Sleep: Does It Work? Evidence Review (2026)"')
    expect(valerian).toContain('profile_status: published')
    expect(valerian).toContain('## Quick answer: does valerian actually work for sleep?')
    expect(valerian).toContain('Valerian root is **not an established treatment for insomnia**')
    expect(valerian.indexOf('## Quick answer: does valerian actually work for sleep?')).toBeLessThan(
      valerian.indexOf('## Why the 2024 umbrella review matters most'),
    )
  })

  it('protects the mitragynine citation-winning article identity and direct-answer placement', () => {
    expect(mitragynine).toContain('slug: "mitragynine"')
    expect(mitragynine).toContain('title: "Mitragynine: Pharmacology, Human Evidence, Safety & 2026 Research Status"')
    expect(mitragynine).toContain('## Quick answers')
    expect(mitragynine).toContain('| **What is mitragynine?** |')
    expect(mitragynine.indexOf('## Quick answers')).toBeLessThan(mitragynine.indexOf('## Bottom line'))
  })
})
