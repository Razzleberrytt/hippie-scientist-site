#!/usr/bin/env tsx
import assert from 'node:assert/strict'
import submissions from '../ops/enrichment-submissions.json'
import { buildGovernedQuickCompareSection } from '../src/lib/governedQuickCompare'
import {
  getGovernedResearchEnrichment,
  getPublishableGovernedEntries,
  type GovernedEntityType,
} from '../src/lib/governedResearch'

const BLOCKED_REVIEW_STATUSES = new Set([
  'blocked',
  'rejected',
  'revision_requested',
  'ready_for_review',
  'draft_submission',
])

function keyOf(entityType: GovernedEntityType, entitySlug: string) {
  return `${entityType}:${entitySlug}`
}

const publishable = getPublishableGovernedEntries()
assert.ok(publishable.length > 0, 'Expected publishable governed entities for quick-compare verification.')

let visibleBlocks = 0

for (const row of publishable) {
  const enrichment = getGovernedResearchEnrichment(row.entityType, row.entitySlug)
  assert.ok(enrichment, `Expected publishable runtime enrichment for ${row.entityType}:${row.entitySlug}.`)

  const section = buildGovernedQuickCompareSection(row.entityType, row.entitySlug)
  if (!section) continue
  visibleBlocks += 1

  assert.ok(section.cards.length <= 2, `Quick compare must remain compact for ${row.entityType}:${row.entitySlug}.`)
  assert.ok(section.dimensionsUsed.length > 0, `Quick compare dimensions missing for ${row.entityType}:${row.entitySlug}.`)

  for (const card of section.cards) {
    const targetRuntime = getGovernedResearchEnrichment(card.targetType, card.targetSlug)
    assert.ok(
      targetRuntime,
      `Quick compare target must be publishable governed entry: ${row.entityType}:${row.entitySlug} -> ${card.targetType}:${card.targetSlug}`,
    )

    const dimensionText = Object.values(card.dimensions).join(' ')
    assert.ok(
      !/proven|cure|guaranteed|best|better than all/i.test(dimensionText),
      `Non-conservative wording found in quick compare card ${row.entityType}:${row.entitySlug} -> ${card.targetType}:${card.targetSlug}.`,
    )
  }
}

assert.ok(visibleBlocks > 0, 'Expected at least one publishable page with governed quick compare output.')

const blockedOrUnapprovedKeys = new Set(
  (submissions as Array<{
    entityType: GovernedEntityType
    entitySlug: string
    reviewStatus: string
    active?: boolean
  }>)
    .filter(row => BLOCKED_REVIEW_STATUSES.has(String(row.reviewStatus)) || row.active !== true)
    .map(row => keyOf(row.entityType, row.entitySlug)),
)

for (const key of blockedOrUnapprovedKeys) {
  const [entityType, entitySlug] = key.split(':') as [GovernedEntityType, string]
  const runtime = getGovernedResearchEnrichment(entityType, entitySlug)
  assert.equal(runtime, null, `Blocked/unapproved entity leaked into quick-compare runtime: ${key}.`)
  const section = buildGovernedQuickCompareSection(entityType, entitySlug)
  assert.equal(section, null, `Blocked/unapproved entity should not get quick compare section: ${key}.`)
}

console.log(
  `[verify-governed-quick-compare] PASS publishableEntities=${publishable.length} visibleBlocks=${visibleBlocks} blockedChecked=${blockedOrUnapprovedKeys.size}`,
)
