import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { buildResearchQualitySnapshot } from '@/lib/research-quality-snapshot'

describe('canonical research-quality snapshot', () => {
  it('builds analysis, topology, policy queue, structural failures, and source integrity from one root', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'research-quality-snapshot-'))
    try {
      const snapshot = buildResearchQualitySnapshot(root)
      expect(snapshot.analysis.profileAnalyses).toEqual([])
      expect(snapshot.analysis.claimAnalyses).toEqual([])
      expect(snapshot.researchGapQueue).toEqual([])
      expect(snapshot.structuralFailures).toEqual([])
      expect(snapshot.topology.studyClassConflicts.summary.severeClassConflicts).toBe(0)
      expect(snapshot.sourceIntegrity.summary.citedStudies).toBe(0)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})
