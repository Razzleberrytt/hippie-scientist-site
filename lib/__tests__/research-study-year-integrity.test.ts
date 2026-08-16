import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

import { analyzeResearchQuality } from '@/lib/research-quality-analysis'
import {
  analyzeClaimEvidenceAge,
  analyzeStudyYearConflicts,
  canonicalStudyYearObservations,
} from '@/lib/research-evidence-age'

const roots: string[] = []

function root(): string {
  const value = fs.mkdtempSync(path.join(os.tmpdir(), 'research-year-integrity-'))
  roots.push(value)
  fs.mkdirSync(path.join(value, 'public', 'data', 'herbs-detail'), { recursive: true })
  fs.mkdirSync(path.join(value, 'ops', 'cache'), { recursive: true })
  return value
}

function writeProfile(rootDir: string, slug: string, year: number, pmid?: string) {
  fs.writeFileSync(path.join(rootDir, 'public', 'data', 'herbs-detail', `${slug}.json`), JSON.stringify({
    slug,
    sources: [{ id: 's1', year, ...(pmid ? { pmid } : {}), studyClass: 'rct', title: `${slug} randomized trial` }],
    claimMap: [{
      id: `${slug}-claim`,
      predicate: 'supports_outcome',
      claim: 'Improves sleep outcomes in adults.',
      confidence: 0.8,
      reviewStatus: 'approved',
      sourceRefIds: ['s1'],
    }],
  }))
}

afterEach(() => {
  for (const value of roots.splice(0)) fs.rmSync(value, { recursive: true, force: true })
})

describe('study publication-year ownership', () => {
  it('keeps identifier-less fallback study years scoped to their profile', () => {
    const rootDir = root()
    writeProfile(rootDir, 'old-example', 2000)
    writeProfile(rootDir, 'new-example', 2020)

    const analysis = analyzeResearchQuality(rootDir)
    const ages = analyzeClaimEvidenceAge(analysis, 2026)
    const byUrl = new Map(ages.map((claim) => [claim.url, claim]))

    expect(byUrl.get('/herbs/old-example/')?.newestYear).toBe(2000)
    expect(byUrl.get('/herbs/new-example/')?.newestYear).toBe(2020)
    expect(byUrl.get('/herbs/old-example/')?.allKnownEvidenceOlderThan15Years).toBe(true)
    expect(byUrl.get('/herbs/new-example/')?.allKnownEvidenceOlderThan10Years).toBe(false)

    const observations = canonicalStudyYearObservations(analysis)
    expect(observations.size).toBe(2)
  })

  it('surfaces conflicting source and PubMed years instead of hiding the disagreement', () => {
    const rootDir = root()
    writeProfile(rootDir, 'conflicted-example', 2018, '12345')
    fs.writeFileSync(path.join(rootDir, 'ops', 'cache', 'pubmed-metadata.json'), JSON.stringify({
      records: { '12345': { year: 2020 } },
    }))

    const analysis = analyzeResearchQuality(rootDir)
    const conflicts = analyzeStudyYearConflicts(analysis)

    expect(conflicts).toHaveLength(1)
    expect(conflicts[0]).toMatchObject({
      url: '/herbs/conflicted-example/',
      years: [2018, 2020],
      minYear: 2018,
      maxYear: 2020,
      yearSpread: 2,
    })

    const [age] = analyzeClaimEvidenceAge(analysis, 2026)
    expect(age.medianYear).toBe(2019)
  })
})
