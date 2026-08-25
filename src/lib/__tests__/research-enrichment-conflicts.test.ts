import { describe, expect, it } from 'vitest'

import { normalizeResearchEnrichment } from '../researchEnrichment'

describe('normalizeResearchEnrichment conflict disclosures', () => {
  it('promotes a source-backed claim conflictNote into published conflictNotes', () => {
    const result = normalizeResearchEnrichment({
      evidenceSummary: 'One approved normalized finding.',
      evidenceTier: 'tier-3-limited',
      evidenceClassesPresent: ['human-clinical'],
      supportedUses: [
        {
          claim: 'Ashwagandha produced a limited efficacy signal in one exact trial context.',
          evidenceClass: 'human-clinical',
          sourceRefIds: ['src_pubmed-31517876'],
          conflictNote:
            'Arjuna Natural Ltd funded the study and supplied the tested Shoden extract; this source does not establish independent replication of the exact formulation, dose, population, and duration.',
        },
      ],
      conflictNotes: [],
      reviewedBy: 'normalized-enrichment-pipeline',
      lastReviewedAt: '2026-08-25T01:48:00.000Z',
      editorialStatus: 'approved',
    })

    expect(result).not.toBeNull()
    expect(result?.conflictNotes).toHaveLength(1)
    expect(result?.conflictNotes[0]).toMatchObject({
      claim:
        'Arjuna Natural Ltd funded the study and supplied the tested Shoden extract; this source does not establish independent replication of the exact formulation, dose, population, and duration',
      evidenceClass: 'human-clinical',
      sourceRefIds: ['src_pubmed-31517876'],
    })
  })

  it('deduplicates a promoted conflict when a dedicated conflict claim is also present', () => {
    const disclosure = 'The same source-backed sponsor disclosure'
    const result = normalizeResearchEnrichment({
      evidenceSummary: 'One approved normalized finding.',
      evidenceTier: 'tier-3-limited',
      evidenceClassesPresent: ['human-clinical'],
      supportedUses: [
        {
          claim: 'A limited efficacy signal.',
          evidenceClass: 'human-clinical',
          sourceRefIds: ['src_example'],
          conflictNote: disclosure,
        },
      ],
      conflictNotes: [
        {
          claim: disclosure,
          evidenceClass: 'human-clinical',
          sourceRefIds: ['src_example'],
        },
      ],
      reviewedBy: 'normalized-enrichment-pipeline',
      lastReviewedAt: '2026-08-25T01:48:00.000Z',
      editorialStatus: 'approved',
    })

    expect(result?.conflictNotes).toHaveLength(1)
    expect(result?.conflictNotes[0]?.claim).toBe(disclosure)
  })
})
