import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import assert from 'node:assert/strict'

const ROOT = process.cwd()
const proposal = JSON.parse(fs.readFileSync(path.join(ROOT, 'ops/enrichment-submissions/review-proposals/2026-10-10-cbd-cyp2c19-transaminase.json'), 'utf8'))
const records = fs.readFileSync(path.join(ROOT, 'public/data/enrichment-normalized.jsonl'), 'utf8')
  .split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line))
const byId = new Map(records.map(row => [row.enrichmentId, row]))

test('CBD correction proposal is quarantined and explicitly unapproved', () => {
  assert.equal(proposal.reviewStatus, 'draft_submission')
  assert.equal(proposal.publicationAuthorized, false)
  assert.equal(proposal.independentApprovalRequired, true)
  assert.equal(proposal.authoritativeInput, 'public/data/enrichment-normalized.jsonl')
  assert.equal(proposal.generatedOutput, 'public/data/enrichment-governed.json')
  assert.equal(proposal.proposedCorrections.length, 2)
  assert.equal(new Set(proposal.proposedCorrections.map(item => item.enrichmentId)).size, 2)
  for (const correction of proposal.proposedCorrections) {
    assert.equal(correction.reviewStatus, 'draft_submission')
    assert.equal(byId.get(correction.enrichmentId)?.sourceId, correction.sourceId)
    assert.ok(correction.sourceUrl.startsWith('https://'))
    assert.ok(correction.scientificRationale.length > 40)
    assert.ok(!Object.hasOwn(correction, 'reviewedAt'))
    assert.ok(!Object.hasOwn(correction, 'reviewer'))
  }
})

test('the CYP2C19 proposal preserves the active-metabolite exception in short and long summaries', () => {
  const row = proposal.proposedCorrections.find(item => item.enrichmentId === 'enr_cbd-enzyme-cyp2c19')
  assert.equal(row.sourceId, 'src_fda-epidiolex-label-2026')
  assert.equal(row.sourceSection, '7.2 CYP2C19 Substrates')
  assert.match(row.proposedValue.findingTextShort, /clopidogrel/i)
  assert.match(row.proposedValue.findingTextShort, /may decrease/i)
  assert.match(row.proposedValue.findingTextShort, /increase/i)
  assert.match(row.proposedValue.findingTextNormalized, /moderate CYP2C19 inhibitor/i)
  assert.match(row.proposedValue.findingTextNormalized, /active.metabolite exposure/i)
  assert.match(row.proposedValue.findingTextNormalized, /may decrease efficacy/i)
  assert.match(row.proposedValue.findingTextNormalized, /nonprescription CBD formulation/i)
})

test('liver safety proposal distinguishes a trial observation from a known molecular mechanism', () => {
  const row = proposal.proposedCorrections.find(item => item.enrichmentId === 'enr_cbd-adverse-effect-transaminase')
  assert.equal(row.sourceId, 'src_pubmed-40622698')
  assert.equal(row.existingValue.mechanismKnown, true)
  assert.equal(row.proposedValue.mechanismKnown, false)
  assert.match(row.proposedValue.uncertaintyNote, /28-day healthy-adult randomized trial/i)
  assert.match(row.proposedValue.uncertaintyNote, /5 mg\/kg\/day/i)
  assert.match(row.proposedValue.uncertaintyNote, /5\.6% of CBD participants versus 0% of placebo participants/i)
  assert.match(row.proposedValue.uncertaintyNote, /does not establish the molecular mechanism/i)
  assert.equal(byId.get(row.enrichmentId)?.severityLabel, 'high')
})
