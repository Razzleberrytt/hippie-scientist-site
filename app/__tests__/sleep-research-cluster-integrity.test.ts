import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()

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
  'lemon-balm-for-sleep',
  'l-tryptophan-for-sleep',
  '5-htp-for-sleep',
  'oral-gaba-for-sleep',
  'omega-3-and-sleep',
  'vitamin-d-and-sleep',
  'hops-for-sleep',
  'sleep-supplement-formulations',
  'sleep-onset-vs-sleep-maintenance',
  'subjective-vs-objective-sleep',
  'why-sleep-studies-disagree',
  'sleep-trackers-accuracy',
  'sleep-regularity-health',
  'weekend-catch-up-sleep',
  'caffeine-and-sleep-timing',
  'alcohol-and-sleep',
  'cannabis-cannabinoids-and-sleep',
  'nicotine-vaping-and-sleep',
  'otc-antihistamines-for-sleep',
  'morning-light-and-sleep-timing',
  'melatonin-timing-vs-dose',
  'blue-light-screens-and-sleep',
  'sleep-temperature-and-cooling',
  'warm-bath-shower-before-bed',
  'time-restricted-eating-and-sleep',
  'exercise-timing-and-sleep',
  'naps-and-nighttime-sleep',
  'white-noise-and-sleep',
  'music-for-sleep',
  'weighted-blankets-for-sleep',
  'mindfulness-for-insomnia',
  'insomnia-vs-sleep-deprivation',
  'cbt-i-vs-sleep-supplements',
  'sleep-apnea-vs-insomnia',
  'mouth-taping-for-sleep',
  'restless-legs-iron-and-sleep',
]

const REQUIRED_ARTICLES_WITHOUT_HUB_LINK_YET = [
  'sleep-inertia-grogginess-after-waking',
]

describe('sleep research cluster integrity', () => {
  it('keeps every canonical hub research article present and linked from the sleep hub', () => {
    const hub = hubSource()

    for (const slug of REQUIRED_RESEARCH_ARTICLES) {
      const articlePath = path.join(ROOT, 'content/articles', `${slug}.md`)
      expect(fs.existsSync(articlePath), `missing content/articles/${slug}.md`).toBe(true)
      expect(hub, `sleep hub is missing /articles/${slug}/`).toContain(`/articles/${slug}/`)
    }
  })

  it('keeps newly landed sleep research present while integration catches up', () => {
    for (const slug of REQUIRED_ARTICLES_WITHOUT_HUB_LINK_YET) {
      expect(fs.existsSync(path.join(ROOT, 'content/articles', `${slug}.md`)), `missing ${slug}`).toBe(true)
    }
  })

  it('keeps research articles publication-ready rather than placeholder shells', () => {
    for (const slug of [...REQUIRED_RESEARCH_ARTICLES, ...REQUIRED_ARTICLES_WITHOUT_HUB_LINK_YET]) {
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
    const mouthTaping = read('content/articles/mouth-taping-for-sleep.md').replace(/\s+/g, ' ')

    expect(cbt).toMatch(/CBT-I is the evidence benchmark/i)
    expect(cbt).toMatch(/sleep hygiene alone is not equivalent to CBT-I/i)
    expect(apnea).toMatch(/sedation is not the same thing as correcting an obstructed airway/i)
    expect(rls).toMatch(/Iron is not just another sleep ingredient/i)
    expect(rls).toMatch(/testing first/i)
    expect(mouthTaping).toMatch(/not.*universal sleep hack|universal sleep hack.*not/i)
  })

  it('does not restore the corrected tryptophan sleep-latency overclaim', () => {
    const payload = read('public/data/compounds-detail/tryptophan.json')

    expect(payload).not.toMatch(/moderate evidence for modest sleep latency reduction/i)
    expect(payload).toMatch(/wake after sleep onset|WASO/i)
  })

  it('keeps mixed-evidence ingredient verdicts mixed instead of silently upgrading them', () => {
    const gaba = read('content/articles/oral-gaba-for-sleep.md').replace(/\s+/g, ' ')
    const omega3 = read('content/articles/omega-3-and-sleep.md').replace(/\s+/g, ' ')
    const vitaminD = read('content/articles/vitamin-d-and-sleep.md').replace(/\s+/g, ' ')
    const hops = read('content/articles/hops-for-sleep.md').replace(/\s+/g, ' ')
    const lemonBalm = read('content/articles/lemon-balm-for-sleep.md').replace(/\s+/g, ' ')

    expect(gaba).toMatch(/very limited evidence for sleep|sleep evidence remains very limited/i)
    expect(omega3).toMatch(/2020.*no significant adult|earlier.*no significant adult/i)
    expect(omega3).toMatch(/sleep efficiency.*subjective sleep quality/i)
    expect(vitaminD).toMatch(/sleep quantity.*sleep disorders.*uncertain|effects on sleep quantity.*uncertain/i)
    expect(hops).toMatch(/combination.*not.*standalone|cannot.*standalone hops/i)
    expect(lemonBalm).toMatch(/formulation-specific|product-specific/i)
  })

  it('keeps non-drug interventions tied to their actual endpoints and comparators', () => {
    const noise = read('content/articles/white-noise-and-sleep.md').replace(/\s+/g, ' ')
    const blankets = read('content/articles/weighted-blankets-for-sleep.md').replace(/\s+/g, ' ')
    const bath = read('content/articles/warm-bath-shower-before-bed.md').replace(/\s+/g, ' ')
    const music = read('content/articles/music-for-sleep.md').replace(/\s+/g, ' ')
    const mindfulness = read('content/articles/mindfulness-for-insomnia.md').replace(/\s+/g, ' ')

    expect(noise).toMatch(/2020.*very low|very low quality/i)
    expect(noise).toMatch(/2025.*meta-analysis/i)
    expect(blankets).toMatch(/actigraphy.*not statistically significant|not statistically significant.*actigraphy/i)
    expect(bath).toMatch(/1–2 hours|1-2 hours/i)
    expect(music).toMatch(/subjective sleep quality/i)
    expect(music).toMatch(/objective.*did not|did not.*objective/i)
    expect(mindfulness).toMatch(/waitlist/i)
    expect(mindfulness).toMatch(/active control|CBT-I/i)
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
    const cooling = read('content/articles/sleep-temperature-and-cooling.md').replace(/\s+/g, ' ')
    const mealTiming = read('content/articles/time-restricted-eating-and-sleep.md').replace(/\s+/g, ' ')

    expect(formulations).toMatch(/not interchangeable/i)
    expect(subjective).toMatch(/answer different questions|not interchangeable/i)
    expect(trackers).toMatch(/do not replace.*clinical|should not be used.*diagnos/i)
    expect(cooling).toMatch(/does not make every.*cooling.*proven|no significant differences.*cooling/i)
    expect(mealTiming).toMatch(/controlled-trial analyses.*no significant|controlled evidence.*not established/i)
  })
})
