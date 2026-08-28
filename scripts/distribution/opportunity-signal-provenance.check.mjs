#!/usr/bin/env node
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const root = process.cwd()
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'distribution-signal-provenance-'))
const output = path.join(tmp, 'out')
const missingSignals = path.join(tmp, 'missing-signals.json')
const run = spawnSync(process.execPath, ['scripts/distribution/build-opportunity-selection.mjs'], {
  cwd: root,
  env: { ...process.env, DISTRIBUTION_OUTPUT: output, DISTRIBUTION_OPPORTUNITY_SIGNALS: missingSignals },
  encoding: 'utf8',
})
assert.equal(run.status, 0, run.stderr || run.stdout)
const artifact = JSON.parse(fs.readFileSync(path.join(output, 'opportunity-selection.json'), 'utf8'))
assert.equal(artifact.signals, null)
assert.equal(artifact.signalEvidence.mode, 'fallback-defaults')
assert.equal(artifact.signalEvidence.signalRecordCount, 0)
assert.equal(artifact.signalEvidence.coveredGovernedCandidateCount, 0)
assert.equal(artifact.signalEvidence.coverageRatio, 0)
assert.match(artifact.signalEvidence.warning, /fallback-driven/)
assert.match(run.stdout, /opportunity signal coverage: 0\//)
console.log('[distribution] opportunity signal provenance regression passed')
