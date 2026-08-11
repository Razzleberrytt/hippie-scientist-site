import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { goals } from '@/data/goals'
import { goalContentBySlug, type GoalContentExtension } from '@/data/goal-content'
import { getPublicGoal, getPublicGoalContentExtension } from '../goal-public-copy'

const fixture: GoalContentExtension = {
  faqItems: [
    {
      question: 'How do melatonin, valerian, and magnesium compare for sleep?',
      answer: 'Valerian helps reduce sleep latency over weeks.',
    },
  ],
  dosingNotes: [
    {
      compound: 'Valerian Root',
      note: 'Typically 300–600 mg before bed.',
    },
  ],
  evidenceRows: [
    {
      compound: 'Valerian Root',
      evidence: 'Limited to moderate',
      humanData: 'Subjective scales',
      limitation: 'Requires 2–4 weeks for cumulative effect',
    },
  ],
  safetyBullets: ['Review safety.'],
}

function publicGoalContent(slug: keyof typeof goalContentBySlug) {
  return getPublicGoalContentExtension(slug, goalContentBySlug[slug])
}

function publicPrimaryGoal(slug: string) {
  const goal = goals.find((entry) => entry.slug === slug)
  if (!goal) throw new Error(`Missing goal fixture: ${slug}`)
  return getPublicGoal(goal)
}

describe('public goal evidence calibration', () => {
  it('removes unsupported valerian efficacy and cumulative-effect claims from sleep public copy', () => {
    const result = getPublicGoalContentExtension('sleep', fixture)

    expect(result.faqItems[0].answer).toMatch(/evidence for valerian in insomnia is inconsistent/i)
    expect(result.faqItems[0].answer).not.toMatch(/helps reduce sleep latency/i)
    expect(result.evidenceRows[0].evidence).toBe('Inconsistent / insufficient')
    expect(result.evidenceRows[0].limitation).not.toMatch(/requires 2–4 weeks/i)
    expect(result.dosingNotes[0].note).toMatch(/evidence for insomnia remains inconsistent/i)
  })

  it('calibrates sleep evidence grades and removes universal theanine timing/dose claims', () => {
    const result = publicGoalContent('sleep')
    const magnesium = result.evidenceRows.find((row) => row.compound === 'Magnesium')
    const theanine = result.evidenceRows.find((row) => row.compound === 'L-Theanine')
    const theanineDose = result.dosingNotes.find((row) => row.compound === 'L-Theanine')

    expect(magnesium?.evidence).toBe('Limited / heterogeneous')
    expect(theanine?.evidence).toBe('Limited / mixed for sleep')
    expect(theanine?.limitation).toMatch(/optimal dose and duration remain uncertain/i)
    expect(theanineDose?.note).toMatch(/do not establish one optimal dose/i)
    expect(theanineDose?.note).not.toMatch(/100[–-]200 mg before bed/i)
  })

  it('removes rapid-onset stress claims and calibrates rhodiola and theanine', () => {
    const result = publicGoalContent('stress')
    const faq = result.faqItems.find((item) => item.question.startsWith('Ashwagandha vs L-Theanine'))
    const rhodiola = result.evidenceRows.find((row) => row.compound === 'Rhodiola')
    const theanine = result.evidenceRows.find((row) => row.compound === 'L-Theanine')

    expect(faq?.answer).not.toMatch(/30[–-]90 minutes|rapid, acute stress buffering/i)
    expect(rhodiola?.evidence).toBe('Variable / outcome-specific')
    expect(theanine?.evidence).toBe('Limited / mixed for stress')
    expect(theanine?.limitation).toMatch(/bias-sensitive/i)
  })

  it('does not present kava or L-Theanine as established anxiety treatments', () => {
    const result = publicGoalContent('anxiety')
    const kavaFaq = result.faqItems.find((item) => item.question === 'Is kava effective for social anxiety?')
    const theanineFaq = result.faqItems.find((item) => item.question.startsWith('Can L-Theanine'))
    const kava = result.evidenceRows.find((row) => row.compound === 'Kava')
    const theanine = result.evidenceRows.find((row) => row.compound === 'L-Theanine')
    const kavaDose = result.dosingNotes.find((row) => row.compound === 'Kava')

    expect(kavaFaq?.answer).toMatch(/does not establish it as a reliable treatment for social anxiety/i)
    expect(kavaFaq?.answer).toMatch(/liver injury/i)
    expect(theanineFaq?.answer).toMatch(/anxiety findings were inconsistent/i)
    expect(kava?.evidence).toBe('Mixed / safety-limited')
    expect(theanine?.evidence).toBe('Inconsistent for anxiety')
    expect(kavaDose?.note).not.toMatch(/only reputable CO2 or aqueous extracts/i)
  })

  it('keeps caffeine evidence strong without promising theanine will smooth stimulation', () => {
    const result = publicGoalContent('focus')
    const comparison = result.faqItems.find((item) => item.question.startsWith('Caffeine vs L-Theanine'))
    const caffeine = result.evidenceRows.find((row) => row.compound === 'Caffeine')
    const theanine = result.evidenceRows.find((row) => row.compound === 'L-Theanine')
    const bacopa = result.evidenceRows.find((row) => row.compound === 'Bacopa Monnieri')
    const theanineDose = result.dosingNotes.find((row) => row.compound === 'L-Theanine')

    expect(comparison?.answer).not.toMatch(/smooths out caffeine jitters/i)
    expect(comparison?.answer).toMatch(/should not be assumed to reliably eliminate caffeine jitters/i)
    expect(caffeine?.evidence).toBe('Strong acute attention evidence')
    expect(theanine?.evidence).toBe('Task-specific / mixed')
    expect(bacopa?.evidence).toBe('Repeated-dose memory evidence')
    expect(theanineDose?.note).not.toMatch(/2:1 theanine:caffeine ratio/i)
  })

  it('calibrates anxiety quick picks and the first comparison table before deeper evidence sections', () => {
    const result = publicPrimaryGoal('anxiety')
    const kava = result.options.find((option) => option.slug === 'kava')
    const theanine = result.options.find((option) => option.slug === 'l-theanine')
    const kavaPick = result.quickPicks.find((pick) => pick.slug === 'kava')

    expect(kava?.bestFor).not.toMatch(/rapid relief|social relaxation/i)
    expect(kava?.speed).toMatch(/no reliable treatment onset/i)
    expect(kava?.evidence).toBe('Mixed / safety-limited')
    expect(kava?.risk).toBe('Moderate to high')
    expect(kava?.avoidIf).toMatch(/liver disease|alcohol|sedatives/i)
    expect(kavaPick?.need).toMatch(/higher-risk herbal evidence/i)
    expect(theanine?.speed).not.toMatch(/30 to 90 minutes/i)
    expect(theanine?.evidence).toBe('Inconsistent for anxiety')
  })

  it('calibrates primary sleep, stress, and focus comparison rows too', () => {
    const sleep = publicPrimaryGoal('sleep')
    const stress = publicPrimaryGoal('stress')
    const focus = publicPrimaryGoal('focus')

    const sleepTheanine = sleep.options.find((option) => option.slug === 'l-theanine')
    const sleepMagnesium = sleep.options.find((option) => option.slug === 'magnesium')
    const stressTheanine = stress.options.find((option) => option.slug === 'l-theanine')
    const focusTheanine = focus.options.find((option) => option.slug === 'l-theanine')
    const focusCaffeine = focus.options.find((option) => option.slug === 'caffeine')

    expect(sleepTheanine?.speed).not.toMatch(/30 to 90 minutes/i)
    expect(sleepTheanine?.evidence).toBe('Limited / mixed for sleep')
    expect(sleepMagnesium?.evidence).toBe('Limited / heterogeneous for sleep')
    expect(stressTheanine?.speed).not.toMatch(/30 to 90 minutes/i)
    expect(stressTheanine?.evidence).toBe('Limited / mixed for stress')
    expect(focusTheanine?.evidence).toBe('Task-specific / mixed')
    expect(focusTheanine?.bestFor).not.toMatch(/calmer attention/i)
    expect(focusCaffeine?.evidence).toBe('Strong acute attention evidence')
  })

  it('wires the calibrated primary goal into the rendered goal route', () => {
    const goalPage = fs.readFileSync(
      path.join(process.cwd(), 'app/goals/[slug]/page.tsx'),
      'utf8',
    )

    expect(goalPage).toContain('getPublicGoal, getPublicGoalContentExtension')
    expect(goalPage).toContain('const rawGoal = getGoal(slug)')
    expect(goalPage).toContain('const goal = getPublicGoal(rawGoal)')
    expect(goalPage).toContain('goal.quickPicks.map')
    expect(goalPage).toContain('goal.options.map')
  })

  it('does not mutate the source extension or primary goal records', () => {
    const originalFaq = fixture.faqItems[0].answer
    const sourceAnxiety = goals.find((entry) => entry.slug === 'anxiety')
    const originalKavaEvidence = sourceAnxiety?.options.find((option) => option.slug === 'kava')?.evidence

    getPublicGoalContentExtension('sleep', fixture)
    if (sourceAnxiety) getPublicGoal(sourceAnxiety)

    expect(fixture.faqItems[0].answer).toBe(originalFaq)
    expect(sourceAnxiety?.options.find((option) => option.slug === 'kava')?.evidence).toBe(originalKavaEvidence)
  })

  it('leaves unrelated goal content and primary goal records unchanged', () => {
    const contentResult = getPublicGoalContentExtension('other', fixture)
    const pain = goals.find((entry) => entry.slug === 'pain')
    if (!pain) throw new Error('Missing pain goal fixture')
    const primaryResult = getPublicGoal(pain)

    expect(contentResult.faqItems[0].answer).toBe(fixture.faqItems[0].answer)
    expect(contentResult.evidenceRows[0]).toEqual(fixture.evidenceRows[0])
    expect(primaryResult).toEqual(pain)
    expect(primaryResult).not.toBe(pain)
  })
})
