import { describe, expect, it } from 'vitest'
import {
  buildCanonicalCitationOverlay,
  mergeCanonicalCitationOverlay,
} from '../citation-export.mjs'

function fixtureDataset() {
  return {
    entities: [
      {
        id: 'ent_compound_l_theanine',
        entity_type: 'compound',
        slug: 'l-theanine',
        canonical_name: 'L-theanine',
      },
    ],
    claims: [
      {
        id: 'clm_stress',
        subject_id: 'ent_compound_l_theanine',
        predicate: 'supports_outcome',
        object_literal: 'A small trial reported a lower acute stress response than placebo.',
        source_ids: ['src_stress'],
        evidence_level: 'human_obs',
        confidence: 0.66,
        review_status: 'pending',
        notes: 'Keep the claim narrow.',
      },
      {
        id: 'clm_sleep',
        subject_id: 'ent_compound_l_theanine',
        predicate: 'supports_outcome',
        object_literal: 'Some sleep-quality subscales improved, but the total score did not.',
        source_ids: ['src_stress'],
        evidence_level: 'human_obs',
        confidence: 0.62,
        review_status: 'approved',
      },
      {
        id: 'clm_unsourced',
        subject_id: 'ent_compound_l_theanine',
        predicate: 'supports_outcome',
        object_literal: 'This must not be exported without a traceable source.',
        source_ids: [],
        review_status: 'pending',
      },
    ],
    sources: [
      {
        id: 'src_stress',
        doi: '10.1000/example-doi',
        title: 'Randomized placebo-controlled L-theanine trial',
        year: '2024',
        author_or_label: 'Example et al.',
        review_status: 'approved',
      },
    ],
  }
}

describe('buildCanonicalCitationOverlay', () => {
  it('links sourced canonical claims to deduplicated references by profile slug', () => {
    const overlay = buildCanonicalCitationOverlay(fixtureDataset()).get('l-theanine')

    expect(overlay).toBeTruthy()
    expect(overlay.claimMap).toHaveLength(2)
    expect(overlay.sources).toHaveLength(1)
    expect(overlay.sources[0]).toMatchObject({
      id: 'src_stress',
      doi: '10.1000/example-doi',
      url: 'https://doi.org/10.1000/example-doi',
      studyType: 'Randomized controlled trial',
    })
    expect(overlay.claimMap[0].sourceRefIds).toEqual(['src_stress'])
    expect(overlay.evidence).toMatchObject({
      reviewStatus: 'sourced_pending_review',
      sourceCount: 1,
      claimCount: 2,
    })
  })

  it('does not export claims whose sources cannot be resolved', () => {
    const dataset = fixtureDataset()
    dataset.claims = [{
      ...dataset.claims[0],
      id: 'clm_missing_source',
      source_ids: ['src_missing'],
    }]

    expect(buildCanonicalCitationOverlay(dataset).has('l-theanine')).toBe(false)
  })
})

describe('mergeCanonicalCitationOverlay', () => {
  it('preserves existing detail citations and enriches duplicates from canonical metadata', () => {
    const overlay = buildCanonicalCitationOverlay(fixtureDataset()).get('l-theanine')
    const existing = {
      slug: 'l-theanine',
      sources: [{
        id: 'src_stress',
        title: 'Existing title',
        url: 'https://doi.org/10.1000/example-doi',
      }],
      claimMap: [overlay.claimMap[0]],
      evidence: {
        reviewStatus: 'sourced',
        sourceIds: ['src_stress'],
      },
    }

    const merged = mergeCanonicalCitationOverlay(existing, overlay)

    expect(merged.sources).toHaveLength(1)
    expect(merged.sources[0]).toMatchObject({
      id: 'src_stress',
      title: 'Randomized placebo-controlled L-theanine trial',
      doi: '10.1000/example-doi',
      authors: 'Example et al.',
    })
    expect(merged.claimMap).toHaveLength(2)
    expect(merged.evidence.sourceCount).toBe(1)
    expect(merged.evidence.claimCount).toBe(2)
    expect(merged.evidence.sourceIds).toEqual(['src_stress'])
  })
})
