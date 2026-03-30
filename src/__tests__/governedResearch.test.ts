import { describe, expect, it } from 'vitest'
import {
  getEvidenceLabelMeta,
  getGovernedResearchEnrichment,
  isPublishableGovernedEnrichment,
} from '@/lib/governedResearch'
import type { ResearchEnrichment } from '@/types/researchEnrichment'

describe('governed research enrichment gating', () => {
  it('returns publishable enrichment only', () => {
    expect(getGovernedResearchEnrichment('herb', 'kava')).toBeTruthy()
    expect(getGovernedResearchEnrichment('compound', 'luteolin')).toBeTruthy()

    expect(getGovernedResearchEnrichment('herb', 'ashwagandha')).toBeNull()
    expect(getGovernedResearchEnrichment('herb', 'chamomile')).toBeNull()
    expect(getGovernedResearchEnrichment('compound', 'cbd')).toBeNull()
  })

  it('blocks non-approved or non-publishable rows deterministically', () => {
    const blocked = {
      editorialStatus: 'blocked',
      editorialReadiness: { publishable: true },
    } as ResearchEnrichment
    const unreviewed = {
      editorialStatus: 'approved',
      editorialReadiness: { publishable: false },
    } as ResearchEnrichment

    expect(isPublishableGovernedEnrichment(blocked)).toBe(false)
    expect(isPublishableGovernedEnrichment(unreviewed)).toBe(false)
  })
})

describe('evidence labels', () => {
  it('exposes user-facing labels for all evidence classes used by rendering', () => {
    expect(getEvidenceLabelMeta('stronger_human_support').title).toContain('Stronger human support')
    expect(getEvidenceLabelMeta('limited_human_support').title).toContain('Limited human support')
    expect(getEvidenceLabelMeta('observational_only').title).toContain('Observational only')
    expect(getEvidenceLabelMeta('preclinical_only').title).toContain('Preclinical only')
    expect(getEvidenceLabelMeta('traditional_use_only').title).toContain('Traditional use only')
    expect(getEvidenceLabelMeta('mixed_or_uncertain').title).toContain('Mixed or uncertain')
    expect(getEvidenceLabelMeta('conflicting_evidence').title).toContain('Conflicting evidence')
    expect(getEvidenceLabelMeta('insufficient_evidence').title).toContain('Insufficient evidence')
  })
})
