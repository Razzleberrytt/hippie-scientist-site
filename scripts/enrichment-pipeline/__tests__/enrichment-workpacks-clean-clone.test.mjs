import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { afterEach, describe, expect, it } from 'vitest'

let tmpDir

afterEach(() => {
  if (tmpDir) fs.rmSync(tmpDir, { recursive: true, force: true })
  tmpDir = undefined
})

function writeJson(relativePath, value) {
  const fullPath = path.join(tmpDir, relativePath)
  fs.mkdirSync(path.dirname(fullPath), { recursive: true })
  fs.writeFileSync(fullPath, `${JSON.stringify(value, null, 2)}\n`)
}

describe('enrichment workpack clean-clone source attribution', () => {
  it('runs without historical wave-1 targets and only attaches active current-backlog sources', () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'enrichment-workpacks-clean-clone-'))

    writeJson('ops/reports/enrichment-backlog.json', {
      generatedAt: '2026-08-26T00:00:00.000Z',
      items: [
        {
          itemType: 'entity',
          entityType: 'herb',
          entitySlug: 'test-herb',
          currentPublicStatus: 'indexable',
          currentEnrichmentHealthState: 'missing_governed_enrichment',
          priorityLabel: 'do_now',
          recommendedAction: 'Backfill governed safety coverage.',
          missingTopics: ['safety'],
          blockedReasons: [],
          staleStatus: { stale: false, reviewedAt: null },
          publicPriorityScore: 90,
        },
      ],
    })

    writeJson('ops/reports/enrichment-review-cycle.json', {
      generatedAt: '2026-08-26T00:00:00.000Z',
      items: [
        {
          itemType: 'entity',
          entityType: 'herb',
          entitySlug: 'test-herb',
          publicStatus: 'indexable',
          enrichmentHealthState: 'missing_governed_enrichment',
          reviewCycleState: 'fresh',
          recommendedAction: 'No re-review required.',
          affectedTopics: [],
          reasons: [],
          suppressEnrichedSectionRecommended: false,
        },
      ],
    })

    writeJson('public/data/enrichment-governed.json', [
      {
        entityType: 'herb',
        entitySlug: 'test-herb',
        researchEnrichment: { sourceRegistryIds: ['src_existing'] },
      },
    ])

    writeJson('public/data/source-registry.json', [
      {
        sourceId: 'src_existing',
        notes: 'intakeTaskId=intake_gap_wp_herb_test_herb_safety already governed',
        active: true,
      },
      {
        sourceId: 'src_promoted',
        notes: 'intakeTaskId=intake_gap_wp_herb_test_herb_safety promoted source',
        active: true,
      },
      {
        sourceId: 'src_inactive',
        notes: 'intakeTaskId=intake_gap_wp_herb_test_herb_safety inactive source',
        active: false,
      },
      {
        sourceId: 'src_other_entity',
        notes: 'intakeTaskId=intake_gap_wp_herb_other_herb_safety different backlog entity',
        active: true,
      },
      {
        sourceId: 'src_malformed_note',
        notes: 'historical note without governed intake mapping',
        active: true,
      },
    ])

    const repoRoot = process.cwd()
    const generator = path.resolve(repoRoot, 'scripts/report-enrichment-workpacks.ts')
    const tsxCli = path.resolve(repoRoot, 'node_modules/tsx/dist/cli.mjs')
    const result = spawnSync(process.execPath, [tsxCli, generator], {
      cwd: tmpDir,
      encoding: 'utf8',
    })

    expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0)
    expect(fs.existsSync(path.join(tmpDir, 'ops/reports/source-wave-1-targets.json'))).toBe(false)

    const report = JSON.parse(fs.readFileSync(path.join(tmpDir, 'ops/reports/enrichment-workpacks.json'), 'utf8'))
    const workpack = report.workpacks.find(row => row.entitySlug === 'test-herb')

    expect(workpack).toBeTruthy()
    expect(workpack.availableSourceIds).toEqual(['src_existing', 'src_promoted'])
    expect(workpack.availableSourceIds).not.toContain('src_inactive')
    expect(workpack.availableSourceIds).not.toContain('src_other_entity')
    expect(workpack.availableSourceIds).not.toContain('src_malformed_note')
  })
})
