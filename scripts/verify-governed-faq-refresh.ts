#!/usr/bin/env tsx
import assert from 'node:assert/strict'
import submissions from '../ops/enrichment-submissions.json'
import {
  buildGovernedFaqSectionContent,
  type GovernedFaqQuestionType,
} from '../src/lib/governedFaq'
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
const CANDIDATE_QUESTION_TYPES = new Set<GovernedFaqQuestionType>([
  'association',
  'evidence_level',
  'safety_caution',
  'evidence_limits',
  'research_gap',
])

function keyOf(entityType: GovernedEntityType, entitySlug: string) {
  return `${entityType}:${entitySlug}`
}

const publishable = getPublishableGovernedEntries()
assert.ok(publishable.length > 0, 'Expected publishable governed entities for FAQ verification.')

for (const row of publishable) {
  const enrichment = getGovernedResearchEnrichment(row.entityType, row.entitySlug)
  assert.ok(enrichment, `Expected runtime governed enrichment for ${row.entityType}:${row.entitySlug}.`)
  const faq = buildGovernedFaqSectionContent({
    entityType: row.entityType,
    entityName: row.entitySlug,
    enrichment,
  })
  assert.ok(faq.evidenceSnapshot.length > 0, `Missing evidence snapshot for ${row.entityType}:${row.entitySlug}.`)
  for (const item of faq.faqItems) {
    assert.ok(
      CANDIDATE_QUESTION_TYPES.has(item.questionType),
      `Unexpected FAQ question type ${item.questionType} for ${row.entityType}:${row.entitySlug}.`,
    )
    assert.ok(item.question.length > 0, `Missing FAQ question text for ${row.entityType}:${row.entitySlug}.`)
    assert.ok(item.answer.length > 0, `Missing FAQ answer text for ${row.entityType}:${row.entitySlug}.`)
  }
  assert.equal(
    faq.emitFaqSchema,
    faq.faqItems.length >= 2,
    `FAQ schema alignment failed for ${row.entityType}:${row.entitySlug}.`,
  )
}

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
  assert.equal(runtime, null, `Blocked/unapproved entity leaked into governed FAQ runtime: ${key}.`)
}

console.log(
  `[verify-governed-faq-refresh] PASS publishableEntities=${publishable.length} blockedChecked=${blockedOrUnapprovedKeys.size}`,
)
