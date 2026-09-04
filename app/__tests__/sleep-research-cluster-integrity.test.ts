import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()
const HUB = path.join(ROOT, 'app/guides/sleep/page.tsx')

function read(relativePath: string) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8')
}

function hubSource() {
  return read('app/guides/sleep/page.tsx')
}

const REQUIRED_RESEARCH_ARTICLES = [
  'saffron-for-sleep',
  'tart-cherry-for-sleep',
  'chamomile-for-sleep',
  'lavender-for-sleep',
  'passionflower-for-sleep',
  'l-tryptophan-for-sleep',
  '5-htp-for-sleep',
  'sleep-supplement-formulations',
  'sleep-onset-vs-sleep-maintenance',
  'subjective-vs-objective-sleep',
  'why-sleep-studies-disagree',
  'sleep-trackers-accuracy',
  'sleep-regularity-health',
  'weekend-catch-up-sleep',
  'caffeine-and-sleep-timing',
  'alcohol-and-sleep',
  'morning-light-and-sleep-timing',
  'melatonin-timing-vs-dose',
  'blue-light-screens-and-sleep',
  'exercise-timing-and-sleep',
  'naps-and-nighttime-sleep',
  'insomnia-vs-sleep-deprivation',
  'cbt-i-vs-sleep-supplements',
  'sleep-apnea-vs-insomnia',
  'restless-legs-iron-and-sleep',
]

describe('sleep research cluster integrity', () => {
  it('keeps every canonical sleep research article present and linked from the sleep hub', () => {
    const hub = hubSource()

    for (const slug of REQUIRED_RESEARCH_ARTICLES) {
      const articlePath = path.join(ROOT, 'content/articles', `${slug}.md`)
      expect(fs.existsSync(articlePath), `missing content/articles/${slug}.md`).toBe(true)
      expect(hub, `sleep hub is missing /articles/${slug}/`).toContain(`/articles/${slug}/`)
    }
  })

  it('keeps research articles publication-ready rather than placeholder shells', () => {
    for (const slug of REQUIRED_RESEARCH_ARTICLES) {
      const article = read(`content/articles/${slug}.md`)
      const normalized = article.replace(/\s+/g, ' ')

      expect(normalized, slug).not.toMatch(/\bTODO\b/i)
      expect(normalized, slug).not.toMatch(/placeholder reference/i)
      expect(normalized, slug).toMatch(/date:\s*["']?2026-09-04/i)
      expect(normalized, slug).toMatch(/references:/i)
      expect(normalized, slug).toMatch(/pubmed\.ncbi\.nlm\.nih\.gov\//i)
    }
  })

  it('preserves the decision boundary that chronic insomnia is not just a supplement-selection problem', () => {
    const cbt = read('content/articles/cbt-i-vs-sleep-supplements.md').replace(/\s+/g, ' ')
    const apnea = read('content/articles/sleep-apnea-vs-insomnia.md').replace(/\s+/g, ' ')
    const rls = read('content/articles/restless-legs-iron-and-sleep.md').replace(/\s+/g, ' ')

    expect(cbt).toMatch(/CBT-I is the evidence benchmark/i)
    expect(cbt).toMatch(/sleep hygiene alone is not equivalent to CBT-I/i)
    expect(apnea).toMatch(/sedation is not the same thing as correcting an obstructed airway/i)
    expect(rls).toMatch(/Iron is not just another sleep ingredient/i)
    expect(rls).toMatch(/testing first/i)
  })

  it('does not restore the corrected tryptophan sleep-latency overclaim', () => {
    const payload = read('public/data/compounds-detail/tryptophan.json')

    expect(payload).not.toMatch(/moderate evidence for modest sleep latency reduction/i)
    expect(payload).toMatch(/wake after sleep onset|WASO/i)
  })

  it('keeps legacy dream and sedative posts free of the removed DIY dosing and stacking recipes', () => {
    const mugwort = read('content/blog/mugwort-dreaming-tradition.md').replace(/\s+/g, ' ')
    const blueLotus = read('content/blog/blue-lotus-aporphines.md').replace(/\s+/g, ' ')
    const kava = read('content/blog/kava-safety-kavalactones.md').replace(/\s+/g, ' ')

    expect(mugwort).not.toMatch(/1[–-]2 teaspoons dried herb per cup/i)
    expect(mugwort).not.toMatch(/brew a bitter-sweet tea/i)
    expect(blueLotus).not.toMatch(/2[–-]3 grams per cup/i)
    expect(blueLotus).not.toMatch(/soaked in wine for several weeks/i)
    expect(blueLotus).not.toMatch(/combine blue lotus with chamomile, passionflower, or reishi/i)
    expect(kava).not.toMatch(/70[–-]250 milligrams of total kavalactones/i)
    expect(kava).not.toMatch(/every three months thereafter/i)
    expect(kava).not.toMatch(/milk thistle.*mitigate risk/i)
  })

  it('keeps formulation and measurement caveats visible in the authority layer', () => {
    const formulations = read('content/articles/sleep-supplement-formulations.md').replace(/\s+/g, ' ')
    const subjective = read('content/articles/subjective-vs-objective-sleep.md').replace(/\s+/g, ' ')
    const trackers = read('content/articles/sleep-trackers-accuracy.md').replace(/\s+/g, ' ')

    expect(formulations).toMatch(/not interchangeable/i)
    expect(subjective).toMatch(/subjective and objective sleep are different measurement domains/i)
    expect(trackers).toMatch(/not.*diagnos/i)
  })
})
