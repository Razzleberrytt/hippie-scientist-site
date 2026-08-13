import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { getSleepArticleContent } from '../../lib/sleep-cluster-content'
import {
  calibrateSleepArticlePublicCopy,
  getSleepArticlePublicMetadata,
  isCalibratedSleepArticleSlug,
} from '../../lib/sleep-cluster-public-copy'

function publicContent(slug: string) {
  return calibrateSleepArticlePublicCopy(getSleepArticleContent(slug))
}

function flattened(slug: string) {
  return JSON.stringify(publicContent(slug)).replace(/\s+/g, ' ')
}

describe('sleep cluster public evidence calibration', () => {
  it('calibrates the four live legacy decision routes at the renderer boundary', () => {
    for (const slug of [
      'magnesium-for-sleep',
      'best-magnesium-for-sleep',
      'sleep-stack-magnesium-melatonin',
      'l-theanine-for-calm',
    ]) {
      expect(isCalibratedSleepArticleSlug(slug)).toBe(true)
    }

    expect(isCalibratedSleepArticleSlug('melatonin-vs-valerian')).toBe(false)
  })

  it('reframes magnesium for sleep around limited direct evidence instead of a bedtime protocol', () => {
    const content = publicContent('magnesium-for-sleep')
    const text = flattened('magnesium-for-sleep')

    expect(content.evidence.tier).toBe('limited')
    expect(content.evidence.label).toMatch(/Limited Human Sleep Evidence/i)
    expect(text).toContain('40918053')
    expect(text).toContain('33865376')
    expect(text).toMatch(/155 adults/i)
    expect(text).toMatch(/Cohen d=0\.2/i)
    expect(text).not.toMatch(/100[–-]300 mg elemental magnesium in the evening/i)
    expect(text).not.toMatch(/Choose magnesium before melatonin/i)
    expect(text).not.toMatch(/glycinate or bisglycinate is usually the cleaner sleep-focused choice/i)
    expect(text).toMatch(/study regimen is not a personalized dosing recommendation/i)
    expect(content.productSlug).toBe('magnesium')
  })

  it('keeps the magnesium product guide commercial but removes the form-winner claim', () => {
    const content = publicContent('best-magnesium-for-sleep')
    const text = flattened('best-magnesium-for-sleep')

    expect(content.evidence.tier).toBe('limited')
    expect(content.productSlug).toBe('magnesium')
    expect(content.comparisonRows?.[0]?.dose).toMatch(/Study context:/i)
    expect(text).toContain('40567408')
    expect(text).toContain('41601871')
    expect(text).not.toMatch(/Best sleep-oriented default/i)
    expect(text).not.toMatch(/glycinate wins/i)
    expect(text).not.toMatch(/100[–-]300 mg/i)
    expect(text).toMatch(/no head-to-head randomized sleep trial/i)
    expect(text).toMatch(/transparent elemental-magnesium labeling/i)
  })

  it('turns the magnesium-melatonin stack page into a limited combination-evidence guide', () => {
    const content = publicContent('sleep-stack-magnesium-melatonin')
    const text = flattened('sleep-stack-magnesium-melatonin')

    expect(content.evidence.tier).toBe('limited')
    expect(content.evidence.label).toBe('Limited Combination Evidence')
    expect(content.productSlug).toBeUndefined()
    expect(text).toContain('38745424')
    expect(text).toContain('21226679')
    expect(text).toContain('31850132')
    expect(text).toMatch(/35 otherwise healthy adults/i)
    expect(text).not.toMatch(/magnesium first: 100[–-]300 mg/i)
    expect(text).not.toMatch(/0\.3[–-]1 mg is often a rational first test/i)
    expect(text).not.toMatch(/A Conservative Magnesium \+ Melatonin Stack/i)
    expect(text).toMatch(/does not publish a magnesium-first sequence/i)
    expect(text).toMatch(/CBT-I is the first-line evidence-based treatment for chronic insomnia/i)
  })

  it('removes the fixed L-theanine calm dose and rapid-anxiety inference', () => {
    const content = publicContent('l-theanine-for-calm')
    const text = flattened('l-theanine-for-calm')

    expect(content.evidence.tier).toBe('limited')
    expect(text).toContain('40056718')
    expect(text).toContain('42410082')
    expect(text).toMatch(/19 articles \/ 897 participants/i)
    expect(text).not.toMatch(/100[–-]200 mg/i)
    expect(text).not.toMatch(/30[–-]90 minutes before bed/i)
    expect(text).not.toMatch(/smooth caffeine-related arousal/i)
    expect(text).toMatch(/does not publish a fixed bedtime dose/i)
    expect(content.productSlug).toBe('l-theanine')
  })

  it('overrides public SEO/hero wording for calibrated routes', () => {
    const fallback = { title: 'Old title', description: 'Old description' }

    expect(getSleepArticlePublicMetadata('magnesium-for-sleep', fallback).title).toMatch(/Human Evidence/i)
    expect(getSleepArticlePublicMetadata('sleep-stack-magnesium-melatonin', fallback).title).toMatch(/Combination Evidence/i)
    expect(getSleepArticlePublicMetadata('l-theanine-for-calm', fallback).description).toMatch(/acute-anxiety claims/i)
    expect(getSleepArticlePublicMetadata('melatonin-vs-valerian', fallback)).toEqual(fallback)
  })

  it('renders calibrated content and labels research regimens as context rather than dosing', () => {
    const renderer = fs
      .readFileSync(path.join(process.cwd(), 'components/articles/GoalClusterArticlePage.tsx'), 'utf8')
      .replace(/\s+/g, ' ')

    expect(renderer).toContain('calibrateSleepArticlePublicCopy(getSleepArticleContent(slug))')
    expect(renderer).toContain('getSleepArticlePublicMetadata')
    expect(renderer).toContain('Evidence reviewed ${SLEEP_CLUSTER_EVIDENCE_REVIEW_DATE}')
    expect(renderer).toContain('Study / use context')
    expect(renderer).not.toContain('>Typical dose<')
  })
})
