import assert from 'node:assert/strict'
import governedArtifact from '../public/data/enrichment-governed.json'
import {
  getEvidenceLabelMeta,
  getGovernedResearchEnrichment,
  isPublishableGovernedEnrichment,
} from '../src/lib/governedResearch'
import type { ResearchEnrichment } from '../src/types/researchEnrichment'

const rows = governedArtifact as Array<{
  entityType: 'herb' | 'compound'
  entitySlug: string
  researchEnrichment: ResearchEnrichment
}>

assert.ok(rows.length > 0, 'Canonical governed artifact is empty.')

for (const row of rows) {
  const expected = isPublishableGovernedEnrichment(row.researchEnrichment)
  const actual = getGovernedResearchEnrichment(row.entityType, row.entitySlug)
  if (expected) {
    assert.ok(actual, `Expected publishable governed enrichment for ${row.entityType}:${row.entitySlug}.`)
  } else {
    assert.equal(actual, null, `Expected blocked governed enrichment for ${row.entityType}:${row.entitySlug}.`)
  }
}

assert.ok(getGovernedResearchEnrichment('herb', 'kava'), 'kava should render publishable enrichment')
assert.ok(
  getGovernedResearchEnrichment('compound', 'luteolin'),
  'luteolin should render publishable enrichment',
)
assert.equal(getGovernedResearchEnrichment('herb', 'ashwagandha'), null)
assert.equal(getGovernedResearchEnrichment('herb', 'chamomile'), null)
assert.equal(getGovernedResearchEnrichment('compound', 'cbd'), null)

const evidenceLabels = [
  'stronger_human_support',
  'limited_human_support',
  'observational_only',
  'preclinical_only',
  'traditional_use_only',
  'mixed_or_uncertain',
  'conflicting_evidence',
  'insufficient_evidence',
] as const

for (const label of evidenceLabels) {
  const meta = getEvidenceLabelMeta(label)
  assert.ok(meta.title.length > 0, `Missing title for evidence label ${label}`)
  assert.ok(meta.tone.length > 0, `Missing tone for evidence label ${label}`)
}

console.log(`[verify-governed-enrichment-rendering] PASS rows=${rows.length}`)
