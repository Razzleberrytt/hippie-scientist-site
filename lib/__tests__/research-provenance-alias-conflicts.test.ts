import { describe, expect, it } from 'vitest'

import {
  analyzeStudyProvenanceConflicts,
  buildStudyProvenanceIndex,
} from '@/lib/research-provenance-concentration'
import type { ResearchProfile } from '@/lib/research-coverage'
import type { ResearchQualityAnalysis } from '@/lib/research-quality-analysis'

function record(sources: ResearchProfile['sources']): ResearchProfile {
  return { slug: 'example', sources, claimMap: [] }
}

function analysis(profile: ResearchProfile, cache: ResearchQualityAnalysis['cache'] = {}): ResearchQualityAnalysis {
  return {
    cache,
    profiles: [{ kind: 'herbs', url: '/herbs/example/', file: 'example.json', record: profile }],
    profileAnalyses: [],
    claimAnalyses: [],
    structuredClaimAnalyses: [],
  }
}

describe('canonical provenance alias resolution', () => {
  it('marks conflicting alias provenance instead of choosing the first source row', () => {
    const sources = [
      { id: 's1', doi: '10.1000/example', firstAuthor: 'Alpha A', journal: 'Journal One' },
      { id: 's2', doi: '10.1000/example', firstAuthor: 'Beta B', journal: 'Journal Two' },
    ]

    const first = [...buildStudyProvenanceIndex(record(sources), {}).values()][0]
    const reversed = [...buildStudyProvenanceIndex(record([...sources].reverse()), {}).values()][0]

    expect(first).toEqual(reversed)
    expect(first).toMatchObject({
      firstAuthor: null,
      journal: null,
      firstAuthorCandidates: ['alpha a', 'beta b'],
      journalCandidates: ['journal one', 'journal two'],
      firstAuthorConflict: true,
      journalConflict: true,
    })

    const conflicts = analyzeStudyProvenanceConflicts(analysis(record(sources)))
    expect(conflicts).toHaveLength(1)
    expect(conflicts[0]).toMatchObject({
      url: '/herbs/example/',
      firstAuthorConflict: true,
      journalConflict: true,
    })
  })

  it('uses canonical PubMed provenance before conflicting source-row labels', () => {
    const profile = record([
      { id: 's1', pmid: '123', firstAuthor: 'Wrong Source', journal: 'Abbrev Journal' },
      { id: 's2', pmid: '123', firstAuthor: 'Another Wrong Source', journal: 'Another Label' },
    ])
    const cache = {
      '123': {
        authorList: ['Canonical Author', 'Second Author'],
        journal: 'Canonical Journal',
      },
    }

    const provenance = [...buildStudyProvenanceIndex(profile, cache).values()][0]
    expect(provenance).toMatchObject({
      firstAuthor: 'canonical author',
      journal: 'canonical journal',
      firstAuthorCandidates: ['canonical author'],
      journalCandidates: ['canonical journal'],
      firstAuthorConflict: false,
      journalConflict: false,
    })
    expect(analyzeStudyProvenanceConflicts(analysis(profile, cache))).toHaveLength(0)
  })
})
