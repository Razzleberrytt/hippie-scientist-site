import assert from 'node:assert/strict'
import { buildGovernedCollectionSummary } from '../src/lib/collectionEnrichment'
import { getGovernedResearchEnrichment } from '../src/lib/governedResearch'

const blocked = getGovernedResearchEnrichment('herb', 'ashwagandha')
assert.equal(blocked, null, 'Blocked/unpublishable enrichment must remain excluded at runtime.')

const sparseSummary = buildGovernedCollectionSummary([
  { entityType: 'herb', entitySlug: 'kava', entityName: 'Kava' },
  { entityType: 'herb', entitySlug: 'ashwagandha', entityName: 'Ashwagandha' },
  { entityType: 'herb', entitySlug: 'chamomile', entityName: 'Chamomile' },
])

assert.equal(sparseSummary.includedCount, 3)
assert.equal(
  sparseSummary.governedReviewedCount,
  1,
  'Only publishable governed enrichment should count in collection summaries.',
)
assert.equal(
  sparseSummary.allowComparativeHighlights,
  false,
  'Sparse governed coverage must disable comparative highlights.',
)
assert.ok(
  sparseSummary.degradeReasons.includes('insufficient-governed-coverage'),
  'Sparse governed coverage should include explicit degradation reasons.',
)

const emptySummary = buildGovernedCollectionSummary([
  { entityType: 'herb', entitySlug: 'ashwagandha', entityName: 'Ashwagandha' },
])
assert.equal(emptySummary.governedReviewedCount, 0)
assert.equal(emptySummary.allowComparativeHighlights, false)
assert.ok(emptySummary.degradeReasons.includes('no-governed-enrichment'))

console.log(
  `[verify-enrichment-collections] PASS sparse=${sparseSummary.governedReviewedCount}/${sparseSummary.includedCount} empty=${emptySummary.governedReviewedCount}`,
)
