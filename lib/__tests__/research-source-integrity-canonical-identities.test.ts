import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { analyzeResearchQuality } from '@/lib/research-quality-analysis'
import { analyzeResearchSourceIntegrity } from '@/lib/research-source-integrity'

describe('research source integrity canonical identities', () => {
  it('counts DOI-only studies, collapses DOI/PMID aliases across profiles, and keeps fallback identities page-local', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'source-integrity-identities-'))
    try {
      const detailDir = path.join(root, 'public', 'data', 'herbs-detail')
      mkdirSync(detailDir, { recursive: true })

      writeFileSync(path.join(detailDir, 'alpha.json'), JSON.stringify({
        slug: 'alpha',
        sources: [
          { id: 'shared', pmid: '11111111', doi: '10.1000/shared', title: 'Shared trial', year: 2020, studyClass: 'rct' },
          { id: 'doi-only', doi: '10.1000/doi-only', title: 'DOI only study', year: 2022, studyClass: 'systematic-review' },
          { id: 'local-fallback', title: 'Alpha local report', year: 2021, studyClass: 'observational' },
        ],
        claimMap: [],
      }))

      writeFileSync(path.join(detailDir, 'beta.json'), JSON.stringify({
        slug: 'beta',
        sources: [
          { id: 'shared-again', pmid: '11111111', title: 'Shared trial', year: 2020, studyClass: 'rct' },
          { id: 'local-fallback', title: 'Beta local report', year: 2023, studyClass: 'observational' },
        ],
        claimMap: [],
      }))

      const analysis = analyzeResearchQuality(root)
      const integrity = analyzeResearchSourceIntegrity(analysis, 2026)

      expect(integrity.summary).toMatchObject({
        citedStudies: 4,
        withStableIdentifier: 2,
        pmidIdentified: 1,
        doiOnly: 1,
        fallbackOnly: 2,
        citedOnMultipleProfiles: 1,
      })

      const shared = integrity.studies.find((study) => study.pmid === '11111111')
      expect(shared).toMatchObject({
        doi: '10.1000/shared',
        pageCount: 2,
        pages: ['/herbs/alpha/', '/herbs/beta/'],
      })

      const doiOnly = integrity.studies.find((study) => study.doi === '10.1000/doi-only')
      expect(doiOnly).toMatchObject({ pmid: '', pageCount: 1, design: 'systematic-review' })

      const fallbacks = integrity.studies.filter((study) => !study.pmid && !study.doi)
      expect(fallbacks).toHaveLength(2)
      expect(fallbacks.map((study) => study.pages)).toEqual([
        ['/herbs/alpha/'],
        ['/herbs/beta/'],
      ])
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})
