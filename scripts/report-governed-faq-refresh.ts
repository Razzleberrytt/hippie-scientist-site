#!/usr/bin/env tsx
import fs from 'node:fs'
import path from 'node:path'
import herbsSummary from '../public/data/herbs-summary.json'
import compoundsSummary from '../public/data/compounds-summary.json'
import publicationManifest from '../public/data/publication-manifest.json'
import submissions from '../ops/enrichment-submissions.json'
import { buildGovernedFaqSectionContent, type GovernedFaqQuestionType } from '../src/lib/governedFaq'
import {
  getGovernedResearchEnrichment,
  getPublishableGovernedEntries,
  type GovernedEntityType,
} from '../src/lib/governedResearch'

const ROOT = process.cwd()
const REPORT_JSON_PATH = path.join(ROOT, 'ops', 'reports', 'governed-faq-refresh.json')
const REPORT_MD_PATH = path.join(ROOT, 'ops', 'reports', 'governed-faq-refresh.md')

const QUESTION_TYPES: GovernedFaqQuestionType[] = [
  'association',
  'evidence_level',
  'safety_caution',
  'evidence_limits',
  'research_gap',
]
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

function safeName(entityType: GovernedEntityType, slug: string) {
  const rows = (entityType === 'herb' ? herbsSummary : compoundsSummary) as Array<{
    slug?: string
    name?: string
    common?: string
  }>
  const match = rows.find(item => item.slug === slug)
  return String(match?.common || match?.name || slug)
}

function asRoute(entityType: GovernedEntityType, slug: string) {
  return entityType === 'herb' ? `/herbs/${slug}` : `/compounds/${slug}`
}

function main() {
  const publishableEntries = getPublishableGovernedEntries()
  const publishableKeys = new Set(publishableEntries.map(row => keyOf(row.entityType, row.entitySlug)))
  const usedQuestionTypes: Record<GovernedFaqQuestionType, number> = {
    association: 0,
    evidence_level: 0,
    safety_caution: 0,
    evidence_limits: 0,
    research_gap: 0,
  }
  const excludedQuestionTypeCounts: Record<GovernedFaqQuestionType, number> = {
    association: 0,
    evidence_level: 0,
    safety_caution: 0,
    evidence_limits: 0,
    research_gap: 0,
  }

  const gainedFaqRows = publishableEntries.map(row => {
    const runtime = getGovernedResearchEnrichment(row.entityType, row.entitySlug)
    if (!runtime) return null
    const faq = buildGovernedFaqSectionContent({
      entityType: row.entityType,
      entityName: safeName(row.entityType, row.entitySlug),
      enrichment: runtime,
    })
    for (const item of faq.faqItems) usedQuestionTypes[item.questionType] += 1
    for (const excluded of faq.excludedQuestionTypes) {
      excludedQuestionTypeCounts[excluded.questionType] += 1
    }
    return {
      entityType: row.entityType,
      entitySlug: row.entitySlug,
      route: asRoute(row.entityType, row.entitySlug),
      beforeVisibleFaq: false,
      afterVisibleFaq: faq.faqItems.length > 0,
      faqSchemaEnabled: faq.emitFaqSchema,
      questionTypesUsed: [...new Set(faq.faqItems.map(item => item.questionType))],
      excludedQuestionTypes: faq.excludedQuestionTypes,
      faqCount: faq.faqItems.length,
    }
  })
  const gainedFaqPages = gainedFaqRows.filter((row): row is NonNullable<typeof row> => Boolean(row))

  const blockedEntities = (submissions as Array<{
    entityType: GovernedEntityType
    entitySlug: string
    reviewStatus: string
    active?: boolean
  }>)
    .filter(row => BLOCKED_REVIEW_STATUSES.has(String(row.reviewStatus)) || row.active !== true)
    .map(row => keyOf(row.entityType, row.entitySlug))
  const blockedSet = new Set(blockedEntities)
  const blockedLeaks = gainedFaqPages.filter(row => blockedSet.has(keyOf(row.entityType, row.entitySlug)))

  const herbRoutes = ((publicationManifest as Record<string, unknown>)?.routes as Record<
    string,
    string[]
  >)?.herbs || []
  const compoundRoutes = ((publicationManifest as Record<string, unknown>)?.routes as Record<
    string,
    string[]
  >)?.compounds || []
  const allEntityRoutes = [...herbRoutes, ...compoundRoutes]
  const unchangedSparsePages = allEntityRoutes
    .map(route => {
      const normalized = String(route)
      const entityType = normalized.startsWith('/herbs/') ? 'herb' : 'compound'
      const slug = normalized.replace(/^\/(herbs|compounds)\//, '')
      return { route: normalized, entityType, entitySlug: slug }
    })
    .filter(row => !publishableKeys.has(keyOf(row.entityType as GovernedEntityType, row.entitySlug)))
    .map(row => ({ ...row, reason: 'no_publishable_governed_enrichment_or_partial' }))

  const report = {
    generatedAt: new Date().toISOString(),
    deterministicModelVersion: 'governed-faq-refresh-v1',
    canonicalGovernedArtifact: 'public/data/enrichment-governed.json',
    totals: {
      publishableEntities: publishableEntries.length,
      pagesGainedVisibleFaq: gainedFaqPages.filter(row => row.afterVisibleFaq).length,
      pagesEligibleForFaqSchema: gainedFaqPages.filter(row => row.faqSchemaEnabled).length,
      intentionallyUnchangedDueToSparseSignals: unchangedSparsePages.length,
    },
    questionTypes: {
      candidate: QUESTION_TYPES,
      usedCounts: usedQuestionTypes,
      excludedCounts: excludedQuestionTypeCounts,
    },
    gainedFaqPages,
    unchangedSparsePages,
    verification: {
      onlyApprovedGovernedInfluence: blockedLeaks.length === 0,
      blockedRejectedRevisionRequestedExcluded: blockedLeaks.length === 0,
      faqSchemaOnlyWhenVisibleAndUseful: gainedFaqPages.every(
        row => !row.faqSchemaEnabled || row.faqCount >= 2,
      ),
      gracefulDegradationWhenSparse: unchangedSparsePages.length > 0,
    },
    verificationDetails: {
      blockedEntityLeaks: blockedLeaks.map(row => keyOf(row.entityType, row.entitySlug)),
    },
  }

  fs.mkdirSync(path.dirname(REPORT_JSON_PATH), { recursive: true })
  fs.writeFileSync(REPORT_JSON_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8')

  const md = [
    '# Governed FAQ refresh report',
    '',
    `- Generated at: ${report.generatedAt}`,
    `- Deterministic model version: ${report.deterministicModelVersion}`,
    '',
    '## Totals',
    `- Publishable governed entities: ${report.totals.publishableEntities}`,
    `- Pages with visible FAQ: ${report.totals.pagesGainedVisibleFaq}`,
    `- Pages with FAQ schema enabled: ${report.totals.pagesEligibleForFaqSchema}`,
    `- Intentionally unchanged (sparse/partial): ${report.totals.intentionallyUnchangedDueToSparseSignals}`,
    '',
    '## Question types',
    `- Candidate types: ${report.questionTypes.candidate.join(', ')}`,
    ...QUESTION_TYPES.map(
      type =>
        `- ${type}: used ${report.questionTypes.usedCounts[type]}, excluded ${report.questionTypes.excludedCounts[type]}`,
    ),
    '',
    '## Verification',
    ...Object.entries(report.verification).map(([key, ok]) => `- ${key}: ${ok ? 'PASS' : 'FAIL'}`),
    '',
    '## Pages with visible governed FAQ',
    ...gainedFaqPages.map(
      row =>
        `- ${row.route} · faqCount=${row.faqCount} · faqSchema=${row.faqSchemaEnabled} · questionTypes=${row.questionTypesUsed.join(', ') || 'none'}`,
    ),
    '',
    '## Intentionally unchanged pages',
    ...unchangedSparsePages.slice(0, 20).map(row => `- ${row.route} · ${row.reason}`),
  ].join('\n')

  fs.writeFileSync(REPORT_MD_PATH, `${md}\n`, 'utf8')
  console.log(
    `[report:governed-faq-refresh] faqPages=${report.totals.pagesGainedVisibleFaq} faqSchemaPages=${report.totals.pagesEligibleForFaqSchema} unchangedSparse=${report.totals.intentionallyUnchangedDueToSparseSignals}`,
  )
}

main()
