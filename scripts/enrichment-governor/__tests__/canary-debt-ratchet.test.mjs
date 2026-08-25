import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import assert from 'node:assert/strict'

import { verifyCanaries } from '../canary.mjs'
import { contract } from '../governor.mjs'

const ROOT = process.cwd()

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'))
}

function readJsonl(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => JSON.parse(line))
}

test('Ashwagandha and Luteolin repaired canary debts are permanently ratcheted', () => {
  const entries = readJsonl('public/data/enrichment-normalized.jsonl')
  const registry = readJson('public/data/source-registry.json')
  const result = verifyCanaries(entries, registry)

  assert.deepEqual(contract.canaries.baselineDebt.allowedMissingNullVisibilityAnchors, [])
  assert.deepEqual(contract.canaries.baselineDebt.allowedMissingSafetyVisibilityAnchors, [])
  assert.ok(contract.canaries.anchorRequirements.ashwagandha.includes('null_visibility'))
  assert.ok(contract.canaries.anchorRequirements.luteolin.includes('safety_visibility'))

  const ashwagandha = result.fixed.find(row => row.slug === 'ashwagandha')
  const luteolin = result.fixed.find(row => row.slug === 'luteolin')
  assert.equal(ashwagandha?.nullVisibility, true)
  assert.equal(ashwagandha?.safetyVisibility, true)
  assert.equal(luteolin?.nullVisibility, true)
  assert.equal(luteolin?.safetyVisibility, true)
  assert.deepEqual(result.blockers, [])
  assert.deepEqual(result.warnings, [])
  assert.equal(result.idealPass, true)
  assert.equal(result.status, 'PASS')
})

test('Ashwagandha keeps the DASS-21 null endpoint separate from the supported HAM-A endpoint', () => {
  const entries = readJsonl('public/data/enrichment-normalized.jsonl')
  const positive = entries.find(row => row.enrichmentId === 'enr_ashwagandha-supported-use-stress-rct')
  const nullMixed = entries.find(row => row.enrichmentId === 'enr_ashwagandha-null-mixed-dass21-rct')
  const dosage = entries.find(row => row.enrichmentId === 'enr_ashwagandha-dosage-context-shoden-rct')

  assert.equal(positive?.claimType, 'efficacy_signal')
  assert.match(positive?.findingTextNormalized || '', /HAM-A/i)
  assert.match(positive?.findingTextNormalized || '', /P = \.040/)

  assert.equal(nullMixed?.claimType, 'efficacy_null_or_mixed')
  assert.equal(nullMixed?.sourceId, 'src_pubmed-31517876')
  assert.match(nullMixed?.findingTextNormalized || '', /DASS-21/i)
  assert.match(nullMixed?.findingTextNormalized || '', /P = \.096/)
  assert.match(nullMixed?.findingTextNormalized || '', /did not reach statistical significance/i)
  assert.match(nullMixed?.uncertaintyNote || '', /alongside the statistically significant HAM-A result/i)
  assert.match(nullMixed?.conflictNote || '', /Arjuna Natural Ltd funded the study/i)

  assert.equal(dosage?.claimType, 'dosing_note')
  assert.match(dosage?.findingTextNormalized || '', /studied exposure only/i)
  assert.match(dosage?.findingTextNormalized || '', /not a general dosing recommendation/i)
})

test('Luteolin human evidence remains trial-specific and does not become efficacy', () => {
  const entries = readJsonl('public/data/enrichment-normalized.jsonl')
  const registry = readJson('public/data/source-registry.json')
  const source = registry.find(row => row.sourceId === 'src_pubmed-40046611')
  const safety = entries.find(row => row.enrichmentId === 'enr_luteolin-short-term-tolerability-phase1')
  const mixed = entries.find(row => row.enrichmentId === 'enr_luteolin-unsupported-oncologic-efficacy-phase1')
  const dosage = entries.find(row => row.enrichmentId === 'enr_luteolin-dosage-context-phase1')

  assert.equal(source?.pmid, '40046611')
  assert.equal(source?.doi, '10.1155/proc/8165686')
  assert.equal(source?.sourceClass, 'non-randomized-human-study')
  assert.equal(source?.studyDesign, 'non-randomized-trial')
  assert.equal(source?.reliabilityTier, 'tier-c')
  assert.match(source?.notes || '', /Single-arm phase I study in five men/i)
  assert.match(source?.notes || '', /DHC Corporation supplied/i)
  assert.match(source?.notes || '', /mixed \(2 favorable, 1 stable, 2 progressed\)/i)

  assert.equal(safety?.claimType, 'safety_risk')
  assert.equal(safety?.severityLabel, 'none_known')
  assert.match(safety?.findingTextNormalized || '', /five men/i)
  assert.match(safety?.usageContext || '', /50 mg oral luteolin once daily for 180 days/i)
  assert.match(safety?.uncertaintyNote || '', /does not establish general or long-term safety/i)
  assert.match(safety?.conflictNote || '', /DHC Corporation supplied/i)

  assert.equal(mixed?.claimType, 'efficacy_null_or_mixed')
  assert.match(mixed?.findingTextNormalized || '', /two favorable responses, one stable disease, and two disease progressions/i)
  assert.match(mixed?.findingTextNormalized || '', /do not establish luteolin efficacy/i)
  assert.doesNotMatch(mixed?.findingTextNormalized || '', /luteolin (?:is|was) effective/i)

  assert.equal(dosage?.claimType, 'dosing_note')
  assert.match(dosage?.findingTextNormalized || '', /studied exposure only/i)
  assert.match(dosage?.findingTextNormalized || '', /not a general dosing recommendation/i)
})
