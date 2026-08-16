import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

import {
  buildScopedResearchQualityTopology,
  scopeResearchQualityAnalysis,
} from '@/lib/research-quality-snapshot'
import type { ResearchQualityAnalysis } from '@/lib/research-quality-analysis'

const roots: string[] = []

afterEach(() => {
  while (roots.length) rmSync(roots.pop() as string, { recursive: true, force: true })
})

function analysisFixture(): ResearchQualityAnalysis {
  return {
    cache: {},
    profiles: [
      { kind: 'herbs', url: '/herbs/public/', file: 'public.json', record: { slug: 'public' } },
      { kind: 'herbs', url: '/herbs/hidden/', file: 'hidden.json', record: { slug: 'hidden' } },
    ],
    profileAnalyses: [
      { url: '/herbs/public/' },
      { url: '/herbs/hidden/' },
    ],
    claimAnalyses: [
      { url: '/herbs/public/', claimId: 'public-claim' },
      { url: '/herbs/hidden/', claimId: 'hidden-claim' },
    ],
    structuredClaimAnalyses: [
      { url: '/herbs/public/', claimId: 'public-claim' },
      { url: '/herbs/hidden/', claimId: 'hidden-claim' },
    ],
  } as unknown as ResearchQualityAnalysis
}

describe('scoped research-quality topology', () => {
  it('scopes every derived analysis row by the same profile URL set', () => {
    const scoped = scopeResearchQualityAnalysis(analysisFixture(), ['/herbs/public/'])

    expect(scoped.profiles.map((profile) => profile.url)).toEqual(['/herbs/public/'])
    expect(scoped.profileAnalyses.map((profile) => profile.url)).toEqual(['/herbs/public/'])
    expect(scoped.claimAnalyses.map((claim) => claim.url)).toEqual(['/herbs/public/'])
    expect(scoped.structuredClaimAnalyses.map((claim) => claim.url)).toEqual(['/herbs/public/'])
  })

  it('excludes an unselected canonical profile from downstream global topology counts', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'ths-scoped-topology-'))
    roots.push(root)
    const detailDir = path.join(root, 'public', 'data', 'herbs-detail')
    mkdirSync(detailDir, { recursive: true })

    writeFileSync(path.join(detailDir, 'public.json'), JSON.stringify({
      slug: 'public',
      sources: [{ id: 'public-rct', pmid: '11111111', studyClass: 'rct', title: 'Public trial' }],
      claimMap: [],
    }))
    writeFileSync(path.join(detailDir, 'hidden.json'), JSON.stringify({
      slug: 'hidden',
      sources: [{ id: 'hidden-rct', pmid: '22222222', studyClass: 'rct', title: 'Hidden trial' }],
      claimMap: [],
    }))

    const scoped = buildScopedResearchQualityTopology(root, ['/herbs/public/'])

    expect(scoped.analysis.profiles.map((profile) => profile.url)).toEqual(['/herbs/public/'])
    expect(scoped.topology.underlyingStudyIndependence.summary).toMatchObject({
      profilesAnalyzed: 1,
      globalInventoryPublicationCount: 1,
      globalPrimaryHumanPublicationCount: 1,
    })
  })
})
