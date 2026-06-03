#!/usr/bin/env tsx
import assert from 'node:assert/strict'
import enrichmentSubmissions from '../ops/enrichment-submissions.json'
import { SEO_COLLECTIONS } from '../src/data/seoCollections'
import herbSummaries from '../public/data/herbs-summary.json'
import compoundSummaries from '../public/data/compounds-summary.json'
import { filterCompoundByCollection, filterHerbByCollection } from '../src/lib/collectionQuality'
import { applyGovernedDiscoveryControls } from '../src/lib/governedCollectionDiscovery'
import { getPublishableGovernedEntries } from '../src/lib/governedResearch'

function main() {
  const publishableKeys = new Set(
    getPublishableGovernedEntries().map(row => `${row.entityType}:${row.entitySlug}`),
  )

  const blockedKeys = new Set(
    (enrichmentSubmissions as Array<{ entityType?: string; entitySlug?: string; reviewStatus?: string }>)
      .filter(row =>
        ['blocked', 'rejected', 'revision_requested', 'partial'].includes(
          String(row.reviewStatus || ''),
        ),
      )
      .map(row => `${row.entityType}:${row.entitySlug}`),
  )

  assert.ok(
    Array.from(blockedKeys).every(key => !publishableKeys.has(key)),
    'Blocked/rejected/revision_requested/partial entries must never be publishable.',
  )

  const collectionRows = SEO_COLLECTIONS.filter(item => item.itemType !== 'combo').map(collection => {
    const source =
      collection.itemType === 'herb'
        ? (herbSummaries as Array<{ slug: string; researchEnrichmentSummary?: any }>)
        : (compoundSummaries as Array<{ slug: string; researchEnrichmentSummary?: any }>)

    const matches = source.filter(row =>
      collection.itemType === 'herb'
        ? filterHerbByCollection(row as any, collection.filters)
        : filterCompoundByCollection(row as any, collection.filters),
    )

    const governedOnly = applyGovernedDiscoveryControls({
      items: matches,
      getSummary: item => item.researchEnrichmentSummary,
      filter: 'governed_reviewed',
      sort: 'best_covered_first',
    })

    return {
      slug: collection.slug,
      total: matches.length,
      governedOnlyCount: governedOnly.items.length,
      governedEligible: governedOnly.eligibility.governedEligible,
    }
  })

  assert.ok(
    collectionRows.every(row => row.governedOnlyCount <= row.total),
    'Governed-only filter must never increase result counts.',
  )

  assert.ok(
    collectionRows.some(row => row.governedEligible < 2),
    'Sparse governed coverage must be present to validate graceful degradation behavior.',
  )

  console.log(
    `[verify-governed-collection-filters] PASS collections=${collectionRows.length} sparse=${collectionRows.filter(row => row.governedEligible < 2).length} blockedChecked=${blockedKeys.size}`,
  )
}

main()
