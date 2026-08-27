import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import test from 'node:test'

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
  assert.equal(firstRun.status, 0, firstRun.stderr || firstRun.stdout)

  const packPath = path.join(outDir, `${object.id}.media-pack.json`)
  const packagePath = path.join(outDir, `${object.id}.json`)
  const manifestPath = path.join(outDir, 'manifest.json')
  assert.equal(fs.existsSync(packPath), true)
  assert.equal(fs.existsSync(packagePath), true)
  assert.equal(fs.existsSync(manifestPath), true)

  const firstPackBytes = fs.readFileSync(packPath, 'utf8')
  const pack = JSON.parse(firstPackBytes)
  assert.deepEqual(validateDistributionPack(pack, { researchObjects: [object] }), [])
  assert.deepEqual(pack.researchObjectIds, [object.id])
  assert.deepEqual(pack.assetIntents.map((intent) => intent.type), ['carousel', 'short-video'])
  assert.equal(pack.claims[0].publicSafeStatement, object.finding)
  assert.equal(pack.uncertainties[0].statement, object.limitation)

  const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
  assert.equal(packageData.mediaPack.packId, pack.packId)
  assert.equal(packageData.mediaPack.contentHash, pack.source.contentHash)
  assert.equal(packageData.mediaPack.status, 'validated')

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  assert.equal(manifest.objects[0].mediaPack, `${object.id}.media-pack.json`)
  assert.equal(manifest.objects[0].mediaPackStatus, 'validated')

  const secondRun = runBuilder(inputPath, outDir)
  assert.equal(secondRun.status, 0, secondRun.stderr || secondRun.stdout)
  assert.equal(fs.readFileSync(packPath, 'utf8'), firstPackBytes)
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
  assert.notEqual(result.status, 0)
  assert.match(`${result.stderr}\n${result.stdout}`, /Invalid distribution pack|preclinical/i)
  assert.equal(fs.existsSync(outDir), false)
})

test('derived pack id collisions fail before any artifact directory is written', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'distribution-pack-builder-collision-'))
  const inputPath = path.join(temp, 'research-objects.json')
  const outDir = path.join(temp, 'artifacts')
  const first = fixture({ id: 'foo.bar', title: 'First identity' })
  const second = fixture({ id: 'foo-bar', title: 'Second identity' })
  fs.writeFileSync(inputPath, `${JSON.stringify([first, second], null, 2)}\n`)

  const result = runBuilder(inputPath, outDir)
  assert.notEqual(result.status, 0)
  assert.match(`${result.stderr}\n${result.stdout}`, /packId collision.*foo-bar-media-v1/i)
  assert.equal(fs.existsSync(outDir), false)
})
