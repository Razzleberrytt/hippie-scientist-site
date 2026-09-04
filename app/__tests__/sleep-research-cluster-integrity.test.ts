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
  'sleep-interventions-evidence-matrix',
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
  'how-much-sleep-do-adults-need',
  '90-minute-sleep-cycle-myth',
  'sleep-onset-vs-sleep-maintenance',
  'subjective-vs-objective-sleep',
  'why-sleep-studies-disagree',
  'sleep-trackers-accuracy',
  'sleep-inertia-grogginess-after-waking',
  'insomnia-vs-sleep-deprivation',
  'night-owl-chronotype-vs-delayed-sleep-phase',
  'delayed-sleep-wake-phase-vs-insomnia',
  'jet-lag-light-melatonin-and-sleep',
  'shift-work-sleep-disorder',
  'teen-sleep-and-school-start-times',
  'morning-light-and-sleep-timing',
  'melatonin-timing-vs-dose',
  'blue-light-screens-and-sleep',
  'sleep-regularity-health',
  'weekend-catch-up-sleep',
  'naps-and-nighttime-sleep',
  'exercise-timing-and-sleep',
  'time-restricted-eating-and-sleep',
  'sleep-environment-evidence-guide',
  'eye-masks-earplugs-and-sleep',
  'bedroom-air-quality-ventilation-and-sleep',
  'sleep-temperature-and-cooling',
  'warm-bath-shower-before-bed',
  'white-noise-and-sleep',
  'music-for-sleep',
  'weighted-blankets-for-sleep',
  'mindfulness-for-insomnia',
  'sleep-position-osa-and-reflux',
  'caffeine-and-sleep-timing',
  'alcohol-and-sleep',
  'cannabis-cannabinoids-and-sleep',
  'nicotine-vaping-and-sleep',
  'otc-antihistamines-for-sleep',
  'teen-adolescent-sleep',
  'menopause-and-sleep',
  'pregnancy-postpartum-and-sleep',
  'chronic-pain-and-sleep',
  'sleep-in-older-adults',
  'cbt-i-vs-sleep-supplements',
  'sleep-apnea-vs-insomnia',
  'snoring-vs-sleep-apnea',
  'nocturia-and-sleep',
  'mouth-taping-for-sleep',
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

  it('keeps the hub separated into evidence-oriented decision layers', () => {
    const hub = hubSource()

    expect(hub).toContain('Core sleep science')
    expect(hub).toContain('Circadian & schedule')
    expect(hub).toContain('Environment & non-drug tools')
    expect(hub).toContain('Substances & OTC')
    expect(hub).toContain('Life stages & comorbidity')
    expect(hub).toContain('Check the bottleneck')
    expect(hub).toContain('Start with the actual sleep problem, not the product')
    expect(hub).toContain('/articles/sleep-interventions-evidence-matrix/')
    expect(hub).toContain('/articles/sleep-environment-evidence-guide/')
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
    const mouthTaping = read('content/articles/mouth-taping-for-sleep.md').replace(/\s+/g, ' ')
    const delayed = read('content/articles/delayed-sleep-wake-phase-vs-insomnia.md').replace(/\s+/g, ' ')
    const chronotype = read('content/articles/night-owl-chronotype-vs-delayed-sleep-phase.md').replace(/\s+/g, ' ')

    expect(cbt).toMatch(/CBT-I is the evidence benchmark/i)
    expect(cbt).toMatch(/sleep hygiene alone is not equivalent to CBT-I/i)
    expect(apnea).toMatch(/sedation is not the same thing as correcting an obstructed airway/i)
    expect(rls).toMatch(/Iron is not just another sleep ingredient/i)
    expect(rls).toMatch(/testing first/i)
    expect(mouthTaping).toMatch(/not.*universal sleep hack|universal sleep hack.*not/i)
    expect(delayed).toMatch(/sleep.*normal.*later schedule|later schedule.*normal/i)
    expect(delayed).toMatch(/clock|circadian/i)
    expect(chronotype).toMatch(/not automatically a sleep disorder|not a diagnosis/i)
  })

  it('keeps adult sleep duration and sleep-cycle myths calibrated', () => {
    const duration = read('content/articles/how-much-sleep-do-adults-need.md').replace(/\s+/g, ' ')
    const cycles = read('content/articles/90-minute-sleep-cycle-myth.md').replace(/\s+/g, ' ')

    expect(duration).toMatch(/7 or more hours/i)
    expect(duration).toMatch(/not.*exactly eight|not exactly eight/i)
    expect(duration).toMatch(/more than nine hours.*appropriate|recovery from sleep debt|recovery.*illness/i)
    expect(cycles).toMatch(/6,?064/i)
    expect(cycles).toMatch(/median.*96 minutes|96 minutes.*median/i)
    expect(cycles).toMatch(/large.*variability|substantial variation/i)
    expect(cycles).toMatch(/first cycle.*shorter|shorter.*first cycle/i)
    expect(cycles).toMatch(/not.*fixed.*90-minute|90-minute.*not.*fixed|not.*universal.*90-minute|sleep cycles are real.*not a 90-minute timer/i)
  })

  it('keeps jet lag tied to direction and circadian timing rather than generic sedation', () => {
    const jetLag = read('content/articles/jet-lag-light-melatonin-and-sleep.md').replace(/\s+/g, ' ')

    expect(jetLag).toMatch(/eastward/i)
    expect(jetLag).toMatch(/westward/i)
    expect(jetLag).toMatch(/1\.5 hours per day westward|1\.5 hours\/day westward/i)
    expect(jetLag).toMatch(/1 hour per day eastward|1 hr\/day eastward/i)
    expect(jetLag).toMatch(/timed light|light-dark scheduling/i)
    expect(jetLag).toMatch(/melatonin.*timing|timing.*melatonin/i)
    expect(jetLag).toMatch(/short trips|home-base/i)
  })

  it('keeps snoring, apnea and nocturia in distinct diagnostic lanes', () => {
    const snoring = read('content/articles/snoring-vs-sleep-apnea.md').replace(/\s+/g, ' ')
    const nocturia = read('content/articles/nocturia-and-sleep.md').replace(/\s+/g, ' ')

    expect(snoring).toMatch(/Snoring is a clue.*Sleep apnea is a diagnosis|Snoring is a symptom.*OSA is a diagnosis/i)
    expect(snoring).toMatch(/objective.*testing|polysomnography|home sleep apnea testing/i)
    expect(snoring).toMatch(/negative.*home.*polysomnography|home.*negative.*polysomnography/i)
    expect(snoring).toMatch(/questionnaires.*not.*diagnos|wearables.*not.*diagnos|apps.*not.*diagnos/i)
    expect(nocturia).toMatch(/bladder may not be what woke you|wakes for another reason|already awake/i)
    expect(nocturia).toMatch(/sleep apnea/i)
    expect(nocturia).toMatch(/CPAP/i)
    expect(nocturia).toMatch(/bladder diary|frequency-volume/i)
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

  it('keeps non-drug interventions tied to their actual endpoints and settings', () => {
    const noise = read('content/articles/white-noise-and-sleep.md').replace(/\s+/g, ' ')
    const blankets = read('content/articles/weighted-blankets-for-sleep.md').replace(/\s+/g, ' ')
    const bath = read('content/articles/warm-bath-shower-before-bed.md').replace(/\s+/g, ' ')
    const music = read('content/articles/music-for-sleep.md').replace(/\s+/g, ' ')
    const mindfulness = read('content/articles/mindfulness-for-insomnia.md').replace(/\s+/g, ' ')
    const sensory = read('content/articles/eye-masks-earplugs-and-sleep.md').replace(/\s+/g, ' ')
    const ventilation = read('content/articles/bedroom-air-quality-ventilation-and-sleep.md').replace(/\s+/g, ' ')
    const position = read('content/articles/sleep-position-osa-and-reflux.md').replace(/\s+/g, ' ')
    const environment = read('content/articles/sleep-environment-evidence-guide.md').replace(/\s+/g, ' ')

    expect(noise).toMatch(/2020.*very low|very low quality/i)
    expect(noise).toMatch(/2025.*meta-analysis/i)
    expect(noise).toMatch(/pink noise.*REM|REM.*pink noise/i)
    expect(blankets).toMatch(/actigraphy.*not statistically significant|not statistically significant.*actigraphy/i)
    expect(bath).toMatch(/1–2 hours|1-2 hours/i)
    expect(music).toMatch(/subjective sleep quality/i)
    expect(music).toMatch(/objective.*did not|did not.*objective/i)
    expect(mindfulness).toMatch(/waitlist/i)
    expect(mindfulness).toMatch(/active control|CBT-I/i)
    expect(sensory).toMatch(/ICU|intensive-care/i)
    expect(sensory).toMatch(/earplugs alone.*less|less consistent|no significant/i)
    expect(ventilation).toMatch(/CO₂.*marker|CO2.*marker|marker of ventilation/i)
    expect(ventilation).toMatch(/universal.*threshold|one universal.*CO₂|one universal.*CO2/i)
    expect(position).toMatch(/no.*universal.*best|no universal.*position/i)
    expect(position).toMatch(/left-side|left lateral/i)
    expect(position).toMatch(/CPAP.*more effective|less effective than CPAP/i)
    expect(environment).toMatch(/problem-removal system|largest reversible disturbance/i)
    expect(environment).toMatch(/purifier.*not.*ventilation|Air purifiers are not ventilation/i)
  })

  it('keeps adolescent sleep separated into biology, opportunity, insomnia and policy questions', () => {
    const teen = read('content/articles/teen-adolescent-sleep.md').replace(/\s+/g, ' ')
    const school = read('content/articles/teen-sleep-and-school-start-times.md').replace(/\s+/g, ' ')

    expect(teen).toMatch(/late chronotype.*not automatically|night owl.*not automatically|not automatically delayed/i)
    expect(teen).toMatch(/CBT-I/i)
    expect(school).toMatch(/69 minutes|69 additional minutes/i)
    expect(school).toMatch(/26-minute|26 minute/i)
    expect(school).toMatch(/sleep opportunity|circadian-social mismatch/i)
  })

  it('keeps shift-work and wake-transition safety visible', () => {
    const shiftWork = read('content/articles/shift-work-sleep-disorder.md').replace(/\s+/g, ' ')
    const inertia = read('content/articles/sleep-inertia-grogginess-after-waking.md').replace(/\s+/g, ' ')

    expect(shiftWork).toMatch(/sleep inertia/i)
    expect(shiftWork).toMatch(/driv|safety-sensitive/i)
    expect(inertia).toMatch(/performance|reaction time|cognitive/i)
    expect(inertia).toMatch(/caffeine|bright light/i)
  })

  it('keeps life-stage and comorbidity pages from collapsing distinct sleep problems into one treatment', () => {
    const teen = read('content/articles/teen-adolescent-sleep.md').replace(/\s+/g, ' ')
    const menopause = read('content/articles/menopause-and-sleep.md').replace(/\s+/g, ' ')
    const pregnancy = read('content/articles/pregnancy-postpartum-and-sleep.md').replace(/\s+/g, ' ')
    const pain = read('content/articles/chronic-pain-and-sleep.md').replace(/\s+/g, ' ')
    const older = read('content/articles/sleep-in-older-adults.md').replace(/\s+/g, ' ')

    expect(teen).toMatch(/school start|circadian/i)
    expect(teen).toMatch(/CBT-I/i)
    expect(menopause).toMatch(/hot flash|vasomotor/i)
    expect(menopause).toMatch(/CBT-I|sleep apnea|restless legs/i)
    expect(pregnancy).toMatch(/sleep deprivation.*not automatically insomnia|not automatically insomnia/i)
    expect(pregnancy).toMatch(/pregnancy.*safety|breastfeeding|lactation/i)
    expect(pain).toMatch(/bidirectional|feedback loop/i)
    expect(pain).toMatch(/insomnia.*improve.*pain|sleep.*improve.*pain/i)
    expect(older).toMatch(/normal aging|aging changes/i)
    expect(older).toMatch(/CBT-I/i)
    expect(older).toMatch(/sleep apnea|OSA/i)
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
    const matrix = read('content/articles/sleep-interventions-evidence-matrix.md').replace(/\s+/g, ' ')

    expect(formulations).toMatch(/not interchangeable/i)
    expect(subjective).toMatch(/answer different questions|not interchangeable/i)
    expect(trackers).toMatch(/do not replace.*clinical|should not be used.*diagnos/i)
    expect(cooling).toMatch(/does not make every.*cooling.*proven|no significant differences.*cooling/i)
    expect(mealTiming).toMatch(/controlled-trial analyses.*no significant|controlled evidence.*not established/i)
    expect(matrix).toMatch(/Best-supported role/i)
    expect(matrix).toMatch(/Biggest limitation/i)
  })
})