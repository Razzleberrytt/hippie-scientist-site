import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { P0_RESEARCH_REVIEWS } from '@/lib/mental-health-research-directory'
import { primaryNavigation } from '@/lib/primary-navigation'

describe('mental health evidence navigation', () => {
  it('exposes all 40 batch 1–4 release reviews from the searchable directory', () => {
    expect(P0_RESEARCH_REVIEWS.length).toBe(40)
    const paths = P0_RESEARCH_REVIEWS.map((article) => article.href)
    expect(new Set(paths).size).toBe(paths.length)
    for (const review of P0_RESEARCH_REVIEWS) {
      expect(['relationships', 'personality', 'emotions']).toContain(review.topic)
      expect(review.title.length).toBeGreaterThan(8)
      expect(review.description.length).toBeGreaterThan(40)
      const slug = review.href.match(/^\/articles\/([a-z0-9-]+)\/$/)?.[1]
      expect(slug).toBeTruthy()
      expect(existsSync(join(process.cwd(), 'content/articles', slug + '.md'))).toBe(true)
    }
  })

  it('places a direct, functioning directory entry in primary navigation', () => {
    const guides = primaryNavigation.find((entry) => entry.label === 'Guides')
    expect(guides?.children?.some((entry) => entry.href === '/guides/mental-health')).toBe(true)
    expect(guides?.children?.some((entry) => entry.href === '/guides/mental-health/#research-directory')).toBe(true)
    const hub = readFileSync(join(process.cwd(), 'app/guides/mental-health/page.tsx'), 'utf8')
    expect(hub).toContain('<MentalHealthResearchDirectory reviews={P0_RESEARCH_REVIEWS} />')
    expect(hub).toContain('id="personality-guides"')
    const mobile = readFileSync(join(process.cwd(), 'components/Navigation.tsx'), 'utf8')
    expect(mobile).toContain("label: 'Mental Health'")
    expect(mobile).toContain("href: '/guides/mental-health'")
  })

  it('includes every completed Batch 3 manuscript exactly once', () => {
    const slugs = ["alexithymia-emotional-awareness-evidence-review","anger-dysregulation-regulation-evidence-review","chronic-emptiness-bpd-depression-evidence-review","dissociation-depersonalization-derealization-evidence-review","emotional-numbness-anhedonia-blunting-evidence-review","shame-versus-guilt-evidence-review","splitting-dichotomous-thinking-evidence-review","bipolar-ii-versus-bpd-evidence-review","adhd-versus-trauma-ptsd-evidence-review","persistent-depressive-disorder-dysthymia-evidence-review"]
    for (const slug of slugs) expect(P0_RESEARCH_REVIEWS.filter((review) => review.href === '/articles/' + slug + '/')).toHaveLength(1)
  })
})
