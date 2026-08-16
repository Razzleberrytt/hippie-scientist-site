import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { analyzeProvenanceConcentration } from '@/lib/research-provenance-concentration'
import { analyzeResearchQuality } from '@/lib/research-quality-analysis'

function writeProfile(root: string, slug: string, record: Record<string, unknown>) {
  const dir = path.join(root, 'public', 'data', 'herbs-detail')
  mkdirSync(dir, { recursive: true })
  writeFileSync(path.join(dir, `${slug}.json`), JSON.stringify({ slug, ...record }))
}

function writeCache(root: string, records: Record<string, unknown>) {
  const dir = path.join(root, 'ops', 'cache')
  mkdirSync(dir, { recursive: true })
  writeFileSync(path.join(dir, 'pubmed-metadata.json'), JSON.stringify({ records }))
}

describe('research provenance concentration', () => {
  it('flags repeated approved-claim dependence on one first-author lineage and journal', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'research-provenance-'))
    try {
      writeCache(root, {
        '11111111': { authorList: ['Smith A', 'Jones B'], journal: 'Journal X' },
        '22222222': { authorList: ['Smith A', 'Lee C'], journal: 'Journal X' },
        '33333333': { authorList: ['Smith A', 'Patel D'], journal: 'Journal X' },
      })
      writeProfile(root, 'example', {
        sources: [
          { id: 's1', pmid: '11111111', studyClass: 'rct' },
          { id: 's2', pmid: '22222222', studyClass: 'rct' },
          { id: 's3', pmid: '33333333', studyClass: 'rct' },
        ],
        claimMap: [
          { id: 'c1', predicate: 'supports_outcome', confidence: 0.8, reviewStatus: 'approved', sourceRefIds: ['s1', 's2'] },
          { id: 'c2', predicate: 'supports_outcome', confidence: 0.8, reviewStatus: 'approved', sourceRefIds: ['s1'] },
          { id: 'c3', predicate: 'supports_outcome', confidence: 0.8, reviewStatus: 'approved', sourceRefIds: ['s2'] },
          { id: 'c4', predicate: 'supports_outcome', confidence: 0.8, reviewStatus: 'approved', sourceRefIds: ['s3'] },
        ],
      })

      const result = analyzeProvenanceConcentration(analyzeResearchQuality(root))
      const profile = result.profiles[0]

      expect(profile).toMatchObject({
        claimStudyEdges: 5,
        authorKnownEdges: 5,
        journalKnownEdges: 5,
        dominantFirstAuthor: 'smith a',
        dominantFirstAuthorEdges: 5,
        dominantFirstAuthorStudyCount: 3,
        dominantJournal: 'journal x',
        dominantJournalEdges: 5,
        dominantJournalStudyCount: 3,
        firstAuthorConcentrated: true,
        journalConcentrated: true,
        provenanceConcentrated: true,
      })
      expect(result.summary.provenanceConcentratedProfiles).toBe(1)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  it('does not interpret missing author or journal metadata as concentration', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'research-provenance-missing-'))
    try {
      writeProfile(root, 'example', {
        sources: [
          { id: 's1', pmid: '11111111', studyClass: 'rct' },
          { id: 's2', pmid: '22222222', studyClass: 'rct' },
          { id: 's3', pmid: '33333333', studyClass: 'rct' },
        ],
        claimMap: [
          { id: 'c1', predicate: 'supports_outcome', reviewStatus: 'approved', sourceRefIds: ['s1', 's2', 's3'] },
          { id: 'c2', predicate: 'supports_outcome', reviewStatus: 'approved', sourceRefIds: ['s1', 's2', 's3'] },
        ],
      })

      const profile = analyzeProvenanceConcentration(analyzeResearchQuality(root)).profiles[0]
      expect(profile.authorMetadataCoverage).toBe(0)
      expect(profile.journalMetadataCoverage).toBe(0)
      expect(profile.firstAuthorConcentrated).toBe(false)
      expect(profile.journalConcentrated).toBe(false)
      expect(profile.provenanceConcentrated).toBe(false)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})
