#!/usr/bin/env tsx
import assert from 'node:assert/strict'
import submissions from '../ops/enrichment-submissions.json'
import { buildGovernedFaqSectionContent } from '../src/lib/governedFaq'
import {
  buildGovernedRelatedQuestions,
  type GovernedRelatedQuestionType,
} from '../src/lib/governedRelatedQuestions'
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

const CANDIDATE_QUESTION_TYPES = new Set<GovernedRelatedQuestionType>([
  'association',
  'evidence_strength',
  'safety_caution',
  'uncertainty',
  'compare',
])

function keyOf(entityType: GovernedEntityType, entitySlug: string) {
  return `${entityType}:${entitySlug}`
}

const publishable = getPublishableGovernedEntries()
assert.ok(publishable.length > 0, 'Expected publishable governed entities for related-question verification.')

for (const row of publishable) {
  const enrichment = getGovernedResearchEnrichment(row.entityType, row.entitySlug)
  assert.ok(
    enrichment,
    `Expected publishable runtime enrichment for ${row.entityType}:${row.entitySlug}.`,
  )

  const faq = buildGovernedFaqSectionContent({
    entityType: row.entityType,
    entityName: row.entitySlug,
    enrichment,
  })

  const related = buildGovernedRelatedQuestions({
    entityType: row.entityType,
    entityName: row.entitySlug,
    enrichment,
    governedFaq: faq,
    hasVisibleCompareSection: true,
  })

  assert.ok(related.items.length <= 3, `Related questions must stay compact for ${row.entityType}:${row.entitySlug}.`)

  for (const item of related.items) {
    assert.ok(
      CANDIDATE_QUESTION_TYPES.has(item.questionType),
      `Unexpected related question type ${item.questionType} for ${row.entityType}:${row.entitySlug}.`,
    )
    assert.ok(item.question.length > 0, `Missing related question text for ${row.entityType}:${row.entitySlug}.`)
    assert.ok(item.answer.length > 0, `Missing related answer text for ${row.entityType}:${row.entitySlug}.`)
    assert.ok(
      !/proven|cure|guaranteed/i.test(item.answer),
      `Non-conservative phrasing found in ${row.entityType}:${row.entitySlug}.`,
    )
  }
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
  assert.equal(runtime, null, `Blocked/unapproved entity leaked into related-question runtime: ${key}.`)
}

console.log(
  `[verify-governed-related-questions] PASS publishableEntities=${publishable.length} blockedChecked=${blockedOrUnapprovedKeys.size}`,
)
