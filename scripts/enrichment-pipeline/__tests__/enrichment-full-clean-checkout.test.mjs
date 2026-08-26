import crypto from 'node:crypto'
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

function copyIntoFixture(repoRoot, relativePath) {
  const source = path.join(repoRoot, relativePath)
  const destination = path.join(tmpDir, relativePath)
  fs.mkdirSync(path.dirname(destination), { recursive: true })
  fs.cpSync(source, destination, { recursive: true })
}

function sha256(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex')
}

function runScript(repoRoot, relativePath, { copied = false, tsx = false } = {}) {
  const scriptRoot = copied ? tmpDir : repoRoot
  const scriptPath = path.join(scriptRoot, relativePath)
  const args = tsx
    ? [path.join(repoRoot, 'node_modules', 'tsx', 'dist', 'cli.mjs'), scriptPath]
    : [scriptPath]
  const result = spawnSync(process.execPath, args, {
    cwd: tmpDir,
    encoding: 'utf8',
  })

  expect(result.status, `${relativePath}\n${result.stdout}\n${result.stderr}`).toBe(0)
}

function readFixtureJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(tmpDir, relativePath), 'utf8'))
}

describe('full enrichment pipeline clean-checkout regeneration', () => {
  it('rebuilds governed enrichment through source intake without pre-existing report artifacts', () => {
    const repoRoot = process.cwd()
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'enrichment-full-clean-checkout-'))

    const canonicalAndPublicInputs = [
      'public/data/enrichment-normalized.jsonl',
      'public/data/source-registry.json',
      'public/data/herbs-detail',
      'public/data/compounds-detail',
      'public/data/entity-slug-aliases.json',
      'public/data/herbs.json',
      'public/data/compounds.json',
      'public/data/herbs-summary.json',
      'public/data/compounds-summary.json',
      'public/data/indexable-herbs.json',
      'public/data/indexable-compounds.json',
      'public/data/seo-priority-report.json',
      'public/data/publication-manifest.json',
      'public/data/affiliate-recommendation-readiness.json',
      'ops/source-candidates.json',
    ]

    for (const input of canonicalAndPublicInputs) copyIntoFixture(repoRoot, input)

    copyIntoFixture(repoRoot, 'schemas/normalized-enrichment-entry.schema.json')
    copyIntoFixture(repoRoot, 'scripts/enrichment')
    copyIntoFixture(repoRoot, 'scripts/report-enrichment-health.ts')
    copyIntoFixture(repoRoot, 'src')
    copyIntoFixture(repoRoot, 'tsconfig.json')

    fs.symlinkSync(
      path.join(repoRoot, 'node_modules'),
      path.join(tmpDir, 'node_modules'),
      process.platform === 'win32' ? 'junction' : 'dir',
    )

    expect(fs.existsSync(path.join(tmpDir, 'ops', 'reports'))).toBe(false)
    expect(fs.existsSync(path.join(tmpDir, 'public', 'data', 'enrichment-governed.json'))).toBe(false)
    expect(fs.existsSync(path.join(tmpDir, 'data-sources'))).toBe(false)

    const protectedInputs = [
      'public/data/enrichment-normalized.jsonl',
      'public/data/source-registry.json',
      'public/data/publication-manifest.json',
    ]
    const beforeHashes = new Map(
      protectedInputs.map(relativePath => [relativePath, sha256(path.join(tmpDir, relativePath))]),
    )

    runScript(repoRoot, 'scripts/enrichment/generate-governed-enrichment.mjs', { copied: true })
    runScript(repoRoot, 'scripts/report-enrichment-health.ts', { copied: true, tsx: true })
    runScript(repoRoot, 'scripts/report-enrichment-backlog.ts', { tsx: true })
    runScript(repoRoot, 'scripts/report-enrichment-review-cycle.ts', { tsx: true })
    runScript(repoRoot, 'scripts/report-enrichment-workpacks.ts', { tsx: true })
    runScript(repoRoot, 'scripts/report-source-gaps.ts', { tsx: true })
    runScript(repoRoot, 'scripts/report-source-intake-queue.ts', { tsx: true })

    const governed = readFixtureJson('public/data/enrichment-governed.json')
    const health = readFixtureJson('ops/reports/enrichment-health.json')
    const backlog = readFixtureJson('ops/reports/enrichment-backlog.json')
    const reviewCycle = readFixtureJson('ops/reports/enrichment-review-cycle.json')
    const workpacks = readFixtureJson('ops/reports/enrichment-workpacks.json')
    const sourceGaps = readFixtureJson('ops/reports/source-gaps.json')
    const intakeQueue = readFixtureJson('ops/reports/source-intake-queue.json')

    expect(Array.isArray(governed)).toBe(true)
    expect(governed.length).toBeGreaterThan(0)
    expect(Array.isArray(health.entities)).toBe(true)
    expect(Array.isArray(backlog.items)).toBe(true)
    expect(Array.isArray(reviewCycle.items)).toBe(true)
    expect(Array.isArray(workpacks.workpacks)).toBe(true)
    expect(Array.isArray(sourceGaps.gapItems)).toBe(true)
    expect(Array.isArray(intakeQueue.tasks)).toBe(true)

    expect(fs.existsSync(path.join(tmpDir, 'ops', 'reports', 'source-wave-1-targets.json'))).toBe(false)
    expect(fs.existsSync(path.join(tmpDir, 'data-sources'))).toBe(false)

    for (const [relativePath, beforeHash] of beforeHashes) {
      expect(sha256(path.join(tmpDir, relativePath)), relativePath).toBe(beforeHash)
    }
  }, 60_000)
})
