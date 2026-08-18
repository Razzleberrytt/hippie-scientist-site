import { describe, expect, it } from 'vitest'

import { citationTitleIdentity } from '@/lib/citation-identifiers.mjs'
import { analyzeCitationIntegrity } from '@/lib/citation-integrity.mjs'

/**
 * The same-identifier-two-titles check is there to catch one PMID or DOI naming
 * two different studies — a mis-attributed citation on a page that presents
 * itself as evidence-based. It was instead failing the build on typography: two
 * profiles citing one paper with a hyphen against an em dash, or with and
 * without a trailing period. These cases pin both halves of that: punctuation
 * variants are one study, different studies still conflict.
 */

const profile = (slug: string, sources: Record<string, unknown>[]) => ({
  kind: 'herbs' as const,
  url: `/herbs/${slug}/`,
  record: { slug, sources },
})

describe('citationTitleIdentity', () => {
  it('treats dash styles as the same study', () => {
    expect(citationTitleIdentity('Valerian Root in Treating Sleep Problems-A Systematic Review')).toBe(
      citationTitleIdentity('Valerian Root in Treating Sleep Problems—A Systematic Review'),
    )
  })

  it('treats a trailing period as the same study', () => {
    expect(citationTitleIdentity('Effect of fenugreek extract on testosterone: a meta-analysis.')).toBe(
      citationTitleIdentity('Effect of fenugreek extract on testosterone: a meta-analysis'),
    )
  })

  it('normalises case, curly quotes and repeated whitespace', () => {
    expect(citationTitleIdentity('The  Effect of “Green” Tea’s Catechins')).toBe(
      citationTitleIdentity('the effect of "green" tea\'s catechins'),
    )
  })

  it('keeps genuinely different titles apart', () => {
    expect(citationTitleIdentity('Ashwagandha for sleep quality')).not.toBe(
      citationTitleIdentity('Ashwagandha for stress and anxiety'),
    )
  })
})

describe('citation title conflicts', () => {
  it('does not report a conflict when two profiles cite one paper with different punctuation', () => {
    const report = analyzeCitationIntegrity([
      profile('valerian', [
        { pmid: '33086877', title: 'Valerian Root in Treating Sleep Problems and Associated Disorders-A Systematic Review' },
      ]),
      profile('valeriana-officinalis', [
        { pmid: '33086877', title: 'Valerian Root in Treating Sleep Problems and Associated Disorders—A Systematic Review' },
      ]),
    ])

    expect(report.conflicts).toEqual([])
  })

  it('still reports a conflict when one identifier names two different studies', () => {
    const report = analyzeCitationIntegrity([
      profile('ashwagandha', [{ pmid: '33086877', title: 'Ashwagandha for sleep quality in adults' }]),
      profile('valerian', [{ pmid: '33086877', title: 'Valerian root for insomnia: a systematic review' }]),
    ])

    expect(report.conflicts).toHaveLength(1)
    expect(report.conflicts[0].identifier).toBe('pmid:33086877')
    expect(report.passed).toBe(false)
  })

  it('does not treat a placeholder title as a competing name for the study', () => {
    const report = analyzeCitationIntegrity([
      profile('cinnamon', [
        { pmid: '37818728', title: 'The effect of cinnamon supplementation on glycemic control' },
      ]),
      profile('cinnamomum-verum', [
        { pmid: '37818728', title: 'PubMed PMID 37818728. Minimal citation row added from existing workbook pmid; title unavailable.' },
      ]),
    ])

    expect(report.conflicts).toEqual([])
    // The incomplete row is still surfaced, just not as a naming conflict.
    const missingCounts = report.missingCounts as Record<string, number>
    expect(missingCounts['placeholder-title']).toBe(1)
  })
})
