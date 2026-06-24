#!/usr/bin/env tsx
import assert from 'node:assert/strict'
import { SEO_COLLECTIONS } from '../src/data/seoCollections'
import {
  auditCollectionForIndexing,
  filterCompoundByCollection,
  filterHerbByCollection,
} from '../src/lib/collectionQuality'
import { buildGovernedCollectionSummary } from '../src/lib/collectionEnrichment'
import {
  buildGovernedCollectionIntro,
  countPlaceholderHeavyCollectionIntro,
} from '../src/lib/governedCollectionIntro'
import {
  getGovernedResearchEnrichment,
  getPublishableGovernedEntries,
} from '../src/lib/governedResearch'
import herbs from '../public/data/herbs.json'
import compounds from '../public/data/compounds.json'

function buildEntities(collection: (typeof SEO_COLLECTIONS)[number]) {
  if (collection.itemType === 'combo')
    return [] as Array<{ entityType: 'herb' | 'compound'; entitySlug: string; entityName: string }>
  if (collection.itemType === 'herb') {
    return (herbs as Record<string, unknown>[])
      .filter(herb => filterHerbByCollection(herb, collection.filters))
      .map(herb => ({
        entityType: 'herb' as const,
        entitySlug: String(herb.slug || ''),
        entityName: String(herb.common || herb.scientific || herb.name || herb.slug || ''),
      }))
      .filter(row => row.entitySlug)
  }
  return (compounds as Record<string, unknown>[])
    .filter(compound => filterCompoundByCollection(compound, collection.filters))
    .map(compound => ({
      entityType: 'compound' as const,
      entitySlug: String(compound.slug || ''),
      entityName: String(compound.name || compound.slug || ''),
    }))
    .filter(row => row.entitySlug)
}

let placeholderBefore = 0
let placeholderAfter = 0
let governedCollectionCount = 0
let fallbackCount = 0

for (const collection of SEO_COLLECTIONS) {
  const entities = buildEntities(collection)
  const quality = auditCollectionForIndexing(collection, entities.length)
  const summary = collection.itemType === 'combo' ? null : buildGovernedCollectionSummary(entities)
  const result = buildGovernedCollectionIntro({
    fallbackIntro: collection.intro,
    summary,
    qualityApproved: quality.approved,
  })

  placeholderBefore += countPlaceholderHeavyCollectionIntro(collection.intro)
  placeholderAfter += countPlaceholderHeavyCollectionIntro(result.intro)

  if (result.mode === 'governed') {
    governedCollectionCount += 1
    assert.ok(
      summary && summary.governedReviewedCount >= 2,
      `Governed intro requires approved reviewed coverage: ${collection.slug}`,
    )
  } else {
    fallbackCount += 1
  }

  if (!quality.approved) {
    assert.equal(
      result.mode,
      'fallback',
      `Low-quality/noindex collection should stay fallback: ${collection.slug}`,
    )
    assert.equal(
      result.intro,
      collection.intro,
      `Low-quality/noindex collection intro must remain unchanged: ${collection.slug}`,
    )
  }
}

const blocked = getGovernedResearchEnrichment('herb', 'ashwagandha')
assert.equal(blocked, null, 'Blocked/unreviewed governed enrichment should not resolve at runtime.')

const sparseSummary = buildGovernedCollectionSummary([
  { entityType: 'herb', entitySlug: 'ashwagandha', entityName: 'Ashwagandha' },
  { entityType: 'herb', entitySlug: 'kava', entityName: 'Kava' },
])
const sparseIntro = buildGovernedCollectionIntro({
  fallbackIntro: 'Fallback intro for sparse coverage.',
  summary: sparseSummary,
  qualityApproved: true,
})
assert.equal(
  sparseIntro.mode,
  'fallback',
  'Blocked/unreviewed + sparse governed signals should not produce governed intro.',
)

const publishable = getPublishableGovernedEntries()
assert.ok(
  publishable.length > 0,
  'Expected publishable governed entries to validate collection intro gating.',
)
const publishableHerbScenario = buildGovernedCollectionSummary(
  publishable
    .filter(row => row.entityType === 'herb')
    .slice(0, 3)
    .map(row => ({
      entityType: 'herb' as const,
      entitySlug: row.entitySlug,
      entityName: row.entitySlug,
    })),
)
const comparisonIntro = buildGovernedCollectionIntro({
  fallbackIntro:
    'Compare up to three herbs side-by-side. This view is descriptive and should not be treated as a ranked efficacy claim.',
  summary: publishableHerbScenario,
  qualityApproved: true,
})
assert.ok(
  comparisonIntro.mode === 'governed' || governedCollectionCount > 0,
  'Expected at least one collection or governed comparison scenario intro to use governed mode.',
)
assert.ok(
  placeholderAfter <= placeholderBefore,
  'Expected placeholder-heavy intro count to reduce or remain unchanged.',
)

console.log(
  `[verify-governed-collection-intro-refresh] PASS governedCollections=${governedCollectionCount} comparisonMode=${comparisonIntro.mode} fallback=${fallbackCount} placeholderBefore=${placeholderBefore} placeholderAfter=${placeholderAfter}`,
)
