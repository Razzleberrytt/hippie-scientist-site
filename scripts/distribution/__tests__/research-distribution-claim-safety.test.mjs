import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

const tempDirs = []

afterEach(() => {
  for (const dir of tempDirs.splice(0)) fs.rmSync(dir, { recursive: true, force: true })
})

describe('research distribution claim-safety boundary', () => {
  it('blocks lossy creative/X compression while preserving governed factual text', () => {
    const root = process.cwd()
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ths-distribution-claim-safety-'))
    tempDirs.push(tempDir)
    const inputPath = path.join(tempDir, 'research-objects.json')
    const outDir = path.join(tempDir, 'out')
    const finding = 'Systematic reviews of randomized trials suggest that some ashwagandha extracts may reduce perceived stress and anxiety symptoms in adults, but the evidence should be interpreted cautiously because formulations, doses, study populations, and outcome measures vary across trials.'
    const limitation = 'The clinical evidence base remains limited by small trials, heterogeneous extracts and dosing regimens, variable outcome measures, and risk-of-bias concerns, so results from one preparation should not be generalized to all ashwagandha products.'

    fs.writeFileSync(inputPath, `${JSON.stringify([{
      id: 'claim-safety-fixture',
      title: 'Ashwagandha and stress/anxiety outcomes in randomized human trials',
      finding,
      evidenceType: 'meta-analysis',
      evidenceGrade: 'B',
      limitation,
      sourceUrl: 'https://thehippiescientist.net/herbs/ashwagandha/',
      primarySourceUrl: 'https://doi.org/10.1002/ptr.7598',
      doseContext: 'Study-context only; not consumer dosing advice.',
      populationContext: 'Adults represented in the cited randomized trials.',
      lastVerified: '2026-08-27',
    }], null, 2)}\n`)

    execFileSync(process.execPath, ['scripts/distribution/build-research-distribution.mjs', inputPath], {
      cwd: root,
      env: { ...process.env, DISTRIBUTION_OUTPUT: outDir },
      stdio: 'pipe',
    })

    const artifact = JSON.parse(fs.readFileSync(path.join(outDir, 'claim-safety-fixture.json'), 'utf8'))
    const manifest = JSON.parse(fs.readFileSync(path.join(outDir, 'manifest.json'), 'utf8'))

    expect(artifact.sharedFacts.finding).toBe(finding)
    expect(artifact.sharedFacts.limitation).toBe(limitation)
    expect(artifact.shortVideo).toContain(finding)
    expect(artifact.shortVideo).toContain(limitation)
    expect(artifact.creativeSpec.claimSafetyStatus).toBe('blocked-unsafe-truncation')
    expect(artifact.creativeSpec.blockedFields).toEqual(expect.arrayContaining(['finding', 'limitation']))
    expect(artifact.x).toBeNull()
    expect(artifact.xStatus.status).toBe('blocked-over-limit')
    expect(manifest.objects[0]).toMatchObject({
      creativeSpecStatus: 'blocked-unsafe-truncation',
      xStatus: 'blocked-over-limit',
      mediaPackStatus: 'validated',
    })
  })
})
