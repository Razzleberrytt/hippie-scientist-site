import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const script = path.join(repo, 'scripts/data/apply-batch8-safety-overrides.mjs')
const manifest = JSON.parse(fs.readFileSync(path.join(repo, 'ops/safety/batch8-reviewed-overrides.json'), 'utf8'))

test('Batch 8 safety holds survive regeneration and are idempotent', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'ths-batch8-safety-'))
  try {
    const data = path.join(temp, 'public/data')
    fs.mkdirSync(path.join(temp, 'ops/safety'), { recursive: true })
    fs.mkdirSync(path.join(data, 'herbs-detail'), { recursive: true })
    fs.mkdirSync(path.join(data, 'compounds-detail'), { recursive: true })
    fs.copyFileSync(path.join(repo, 'ops/safety/batch8-reviewed-overrides.json'), path.join(temp, 'ops/safety/batch8-reviewed-overrides.json'))
    for (const [kind, entries] of [['herbs', manifest.herbs], ['compounds', manifest.compounds]]) {
      const rows = Object.keys(entries).map(slug => ({
        slug, safety: 'Original core caution', governance: {
          reviewStatus: 'needs_review', indexingAllowed: true,
          monetizationAllowed: true, recommendationAllowed: true, requiresHumanReview: false,
        },
      }))
      fs.writeFileSync(path.join(data, kind + '.json'), JSON.stringify(rows))
      const folder = kind === 'herbs' ? 'herbs-detail' : 'compounds-detail'
      for (const slug of Object.keys(entries)) fs.writeFileSync(path.join(data, folder, slug + '.json'), JSON.stringify({
        slug, safetyNotes: 'Original detail caution', safety: 'Original core caution',
        contraindications: ['Original contraindication'], sources: [],
        governance: { reviewStatus: 'needs_review', indexingAllowed: true, monetizationAllowed: true, recommendationAllowed: true },
      }))
    }
    const run = () => execFileSync(process.execPath, [script, '--data-dir=public/data'], { cwd: temp, encoding: 'utf8' })
    assert.match(run(), /PASS: 11 safety holds/)
    const before = []
    for (const [kind, entries] of [['herbs', manifest.herbs], ['compounds', manifest.compounds]]) {
      const rows = JSON.parse(fs.readFileSync(path.join(data, kind + '.json'), 'utf8'))
      const folder = kind === 'herbs' ? 'herbs-detail' : 'compounds-detail'
      for (const [slug, alert] of Object.entries(entries)) {
        const row = rows.find(record => record.slug === slug)
        const file = path.join(data, folder, slug + '.json')
        const detail = JSON.parse(fs.readFileSync(file, 'utf8'))
        assert.ok(detail.safetyNotes.startsWith(alert.safetyNotes), slug)
        assert.ok(detail.safetyNotes.includes('Original detail caution'), slug)
        assert.ok(detail.safety.startsWith(alert.safetyNotes), slug)
        assert.ok(detail.contraindications.includes('Original contraindication'), slug)
        assert.ok(alert.sources.every(source => detail.sources.some(saved => saved.url === source.url)), slug)
        for (const record of [row, detail]) {
          assert.equal(record.governance.monetizationAllowed, false)
          assert.equal(record.governance.recommendationAllowed, false)
          assert.equal(record.governance.requiresHumanReview, true)
          assert.equal(record.governance.indexingAllowed, true)
          assert.equal(record.governance.reviewStatus, 'needs_review')
        }
        before.push([file, fs.readFileSync(file, 'utf8')])
      }
    }
    assert.match(run(), /PASS: 11 safety holds/)
    for (const [file, bytes] of before) assert.equal(fs.readFileSync(file, 'utf8'), bytes)
  } finally {
    fs.rmSync(temp, { recursive: true, force: true })
  }
})
