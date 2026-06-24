#!/usr/bin/env tsx
import assert from 'node:assert/strict'
import publicationManifest from '../public/data/publication-manifest.json'
import submissions from '../ops/enrichment-submissions.json'
import {
  getGovernedResearchEnrichment,
  getPublishableGovernedEntries,
  type GovernedEntityType,
} from '../src/lib/governedResearch'
import { buildGovernedReviewFreshness } from '../src/lib/governedReviewFreshness'
import type { ResearchEnrichment } from '../src/types/researchEnrichment'

type EntityType = 'herb' | 'compound'

const BLOCKED_REVIEW_STATUSES = new Set([
  'blocked',
  'rejected',
  'revision_requested',
  'ready_for_review',
  'draft_submission',
  'under_review',
  'needs_validation_fix',
])

function asString(value: unknown) {
  return String(value || '').trim()
}

function cloneAsPartial(enrichment: ResearchEnrichment): ResearchEnrichment {
  return {
    ...enrichment,
    supportedUses: [],
    unsupportedOrUnclearUses: [],
    interactions: [],
    contraindications: [],
    adverseEffects: [],
    mechanisms: [],
    constituents: [],
    safetyProfile: {
      safetyEntries: [],
      summary: {
        total: 0,
        byTopicType: {},
        bySeverity: {},
      },
    },
  }
}

function run() {
  const publishable = getPublishableGovernedEntries()
  assert.ok(publishable.length > 0, 'Expected publishable governed entries for freshness verification.')

  const routes = (publicationManifest as Record<string, unknown>).routes as
    | Record<string, string[]>
    | undefined
  const herbRoutes = (routes?.herbs || []).map(route => asString(route).replace(/^\/herbs\//, ''))
  const compoundRoutes = (routes?.compounds || []).map(route =>
    asString(route).replace(/^\/compounds\//, ''),
  )

  let evaluated = 0
  let visible = 0
  let partialStates = 0

  for (const slug of herbRoutes) {
    if (!slug) continue
    evaluated += 1
    const decision = buildGovernedReviewFreshness(getGovernedResearchEnrichment('herb', slug))
    if (decision.mode === 'governed') visible += 1
    if (decision.state === 'partial') partialStates += 1
  }

  for (const slug of compoundRoutes) {
    if (!slug) continue
    evaluated += 1
    const decision = buildGovernedReviewFreshness(getGovernedResearchEnrichment('compound', slug))
    if (decision.mode === 'governed') visible += 1
    if (decision.state === 'partial') partialStates += 1
  }

  const blockedKeys = new Set(
    (
      submissions as Array<{
        entityType: GovernedEntityType
        entitySlug: string
        reviewStatus: string
        active?: boolean
      }>
    )
      .filter(row => BLOCKED_REVIEW_STATUSES.has(asString(row.reviewStatus)) || row.active !== true)
      .map(row => `${row.entityType}:${row.entitySlug}`),
  )

  for (const key of blockedKeys) {
    const [entityType, slug] = key.split(':') as [GovernedEntityType, string]
    const decision = buildGovernedReviewFreshness(getGovernedResearchEnrichment(entityType, slug))
    assert.equal(decision.mode, 'hidden', `Blocked/unapproved entry leaked visibility: ${key}`)
  }

  const sample = publishable[0]
  const forcedPartial = buildGovernedReviewFreshness(cloneAsPartial(sample.researchEnrichment))
  assert.equal(forcedPartial.mode, 'governed', 'Partial rendering should still return governed mode.')
  assert.equal(forcedPartial.state, 'partial', 'Sparse governed coverage should degrade to partial state.')
  assert.notEqual(
    forcedPartial.statusLabel,
    'Fresh review',
    'Partial coverage must never be labeled as fully fresh/current.',
  )

  const allowedSignals = new Set([
    'publishable_governed_enrichment',
    'last_reviewed_at',
    'topic_coverage_supported_use',
    'topic_coverage_safety',
    'topic_coverage_mechanism_or_constituent',
    'uncertainty_or_conflict_visibility',
  ])

  for (const row of publishable) {
    const decision = buildGovernedReviewFreshness(row.researchEnrichment)
    decision.usedSignals.forEach(signal => {
      assert.ok(allowedSignals.has(signal), `Unexpected non-governed signal in freshness output: ${signal}`)
    })
  }

  assert.ok(evaluated > 0, 'Expected at least one detail page route for freshness verification.')
  assert.ok(visible > 0, 'Expected at least one page to receive governed freshness visibility.')

  console.log(
    `[verify-governed-review-freshness] PASS evaluated=${evaluated} visible=${visible} partial=${partialStates} blockedChecked=${blockedKeys.size}`,
  )
}

run()
