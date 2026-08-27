import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { expect, test } from 'vitest'

import { validateDistributionPack } from '../distribution-pack-contract.mjs'

const root = process.cwd()
const script = path.join(root, 'scripts', 'distribution', 'build-research-distribution.mjs')

function fixture(overrides = {}) {
  return {
    id: 'sleep-rct-fixture',
    title: 'Sleep evidence fixture',
    finding: 'In the recorded randomized trial, the intervention improved the prespecified sleep outcome versus control.',
    evidenceType: 'RCT',
    evidenceGrade: 'B',
    limitation: 'The fixture represents one study and does not establish a universal effect.',
    sourceUrl: 'https://thehippiescientist.net/guides/compare/sleep-herbs-vs-melatonin/',
    primarySourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/12345678/',
    populationContext: 'Adults enrolled in the recorded randomized trial',
    doseContext: 'Study-specific intervention exposure; not a consumer instruction',
    lastVerified: '2026-08-27',
    tags: ['fixture'],
    ...overrides,
  }
}

function runBuilder(inputPath, outDir) {
  return spawnSync(process.execPath, [script, inputPath], {
    cwd: root,
    env: { ...process.env, DISTRIBUTION_OUTPUT: outDir },
    encoding: 'utf8',
  })
}

test('canonical research object emits a deterministic validated media pack before downstream artifacts', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'distribution-pack-builder-'))
  const inputPath = path.join(temp, 'research-objects.json')
  const outDir = path.join(temp, 'artifacts')
  const object = fixture()
  fs.writeFileSync(inputPath, `${JSON.stringify([object], null, 2)}\n`)

  const firstRun = runBuilder(inputPath, outDir)
  expect(firstRun.status, firstRun.stderr || firstRun.stdout).toBe(0)

  const packPath = path.join(outDir, `${object.id}.media-pack.json`)
  const packagePath = path.join(outDir, `${object.id}.json`)
  const manifestPath = path.join(outDir, 'manifest.json')
  expect(fs.existsSync(packPath)).toBe(true)
  expect(fs.existsSync(packagePath)).toBe(true)
  expect(fs.existsSync(manifestPath)).toBe(true)

  const firstPackBytes = fs.readFileSync(packPath, 'utf8')
  const pack = JSON.parse(firstPackBytes)
  expect(validateDistributionPack(pack, { researchObjects: [object] })).toEqual([])
  expect(pack.researchObjectIds).toEqual([object.id])
  expect(pack.assetIntents.map((intent) => intent.type)).toEqual(['carousel', 'short-video'])
  expect(pack.claims[0].publicSafeStatement).toBe(object.finding)
  expect(pack.uncertainties[0].statement).toBe(object.limitation)

  const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
  expect(packageData.mediaPack.packId).toBe(pack.packId)
  expect(packageData.mediaPack.contentHash).toBe(pack.source.contentHash)
  expect(packageData.mediaPack.status).toBe('validated')

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  expect(manifest.objects[0].mediaPack).toBe(`${object.id}.media-pack.json`)
  expect(manifest.objects[0].mediaPackStatus).toBe('validated')

  const secondRun = runBuilder(inputPath, outDir)
  expect(secondRun.status, secondRun.stderr || secondRun.stdout).toBe(0)
  expect(fs.readFileSync(packPath, 'utf8')).toBe(firstPackBytes)
})

test('unsafe canonical mapping fails before any artifact directory is written', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'distribution-pack-builder-unsafe-'))
  const inputPath = path.join(temp, 'research-objects.json')
  const outDir = path.join(temp, 'artifacts')
  const object = fixture({
    id: 'unsafe-preclinical-fixture',
    evidenceType: 'preclinical',
    evidenceGrade: 'D',
    finding: 'Animal studies suggest people may sleep better after taking the intervention.',
  })
  fs.writeFileSync(inputPath, `${JSON.stringify([object], null, 2)}\n`)

  const result = runBuilder(inputPath, outDir)
  expect(result.status).not.toBe(0)
  expect(`${result.stderr}\n${result.stdout}`).toMatch(/Invalid distribution pack|preclinical/i)
  expect(fs.existsSync(outDir)).toBe(false)
})

test('derived pack id collisions fail before any artifact directory is written', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'distribution-pack-builder-collision-'))
  const inputPath = path.join(temp, 'research-objects.json')
  const outDir = path.join(temp, 'artifacts')
  const first = fixture({ id: 'foo.bar', title: 'First identity' })
  const second = fixture({ id: 'foo-bar', title: 'Second identity' })
  fs.writeFileSync(inputPath, `${JSON.stringify([first, second], null, 2)}\n`)

  const result = runBuilder(inputPath, outDir)
  expect(result.status).not.toBe(0)
  expect(`${result.stderr}\n${result.stdout}`).toMatch(/packId collision.*foo-bar-media-v1/i)
  expect(fs.existsSync(outDir)).toBe(false)
})
