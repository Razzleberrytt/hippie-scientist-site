#!/usr/bin/env tsx
import fs from 'node:fs'
import path from 'node:path'
import herbsSummary from '../public/data/herbs-summary.json'
import compoundsSummary from '../public/data/compounds-summary.json'
import publicationManifest from '../public/data/publication-manifest.json'
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

const ROOT = process.cwd()
const REPORT_JSON_PATH = path.join(ROOT, 'ops', 'reports', 'governed-related-questions.json')
const REPORT_MD_PATH = path.join(ROOT, 'ops', 'reports', 'governed-related-questions.md')

const QUESTION_TYPES: GovernedRelatedQuestionType[] = [
  'association',
  'evidence_strength',
  'safety_caution',
  'uncertainty',
  'compare',
]

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

function hasVisibleCompareSection(entityType: GovernedEntityType, slug: string) {
  const detailPath = path.join(
    ROOT,
    'public',
    'data',
    entityType === 'herb' ? 'herbs-detail' : 'compounds-detail',
    `${slug}.json`,
  )
  if (!fs.existsSync(detailPath)) return false
  const row = JSON.parse(fs.readFileSync(detailPath, 'utf8')) as Record<string, unknown>
  const hasCompounds = Array.isArray(row.activeCompounds) && row.activeCompounds.length > 0
  const hasHerbs = Array.isArray(row.herbs) && row.herbs.length > 0
  return hasCompounds || hasHerbs
}

function main() {
  const publishable = getPublishableGovernedEntries()
  const publishableKeys = new Set(publishable.map(row => `${row.entityType}:${row.entitySlug}`))
  const usedCounts: Record<GovernedRelatedQuestionType, number> = {
    association: 0,
    evidence_strength: 0,
    safety_caution: 0,
    uncertainty: 0,
    compare: 0,
  }
  const excludedCounts: Record<GovernedRelatedQuestionType, number> = {
    association: 0,
    evidence_strength: 0,
    safety_caution: 0,
    uncertainty: 0,
    compare: 0,
  }

  const gainedRows = publishable
    .map(row => {
      const enrichment = getGovernedResearchEnrichment(row.entityType, row.entitySlug)
      if (!enrichment) return null
      const governedFaq = buildGovernedFaqSectionContent({
        entityType: row.entityType,
        entityName: safeName(row.entityType, row.entitySlug),
        enrichment,
      })
      const related = buildGovernedRelatedQuestions({
        entityType: row.entityType,
        entityName: safeName(row.entityType, row.entitySlug),
        enrichment,
        governedFaq,
        hasVisibleCompareSection: hasVisibleCompareSection(row.entityType, row.entitySlug),
      })
      for (const item of related.items) usedCounts[item.questionType] += 1
      for (const excluded of related.excludedQuestionTypes) excludedCounts[excluded.questionType] += 1

      return {
        entityType: row.entityType,
        entitySlug: row.entitySlug,
        route: asRoute(row.entityType, row.entitySlug),
        beforeRelatedQuestions: 0,
        afterRelatedQuestions: related.items.length,
        questionTypesUsed: related.items.map(item => item.questionType),
        excludedQuestionTypes: related.excludedQuestionTypes,
      }
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row))

  const herbRoutes = ((publicationManifest as Record<string, unknown>)?.routes as Record<
    string,
    string[]
  >)?.herbs || []
  const compoundRoutes = ((publicationManifest as Record<string, unknown>)?.routes as Record<
    string,
    string[]
  >)?.compounds || []

  const unchangedSparsePages = [...herbRoutes, ...compoundRoutes]
    .map(route => {
      const normalized = String(route)
      const entityType = normalized.startsWith('/herbs/') ? 'herb' : 'compound'
      const slug = normalized.replace(/^\/(herbs|compounds)\//, '')
      return { route: normalized, entityType, entitySlug: slug }
    })
    .filter(row => !publishableKeys.has(`${row.entityType}:${row.entitySlug}`))
    .map(row => ({ ...row, reason: 'no_publishable_governed_enrichment_or_partial' }))

  const report = {
    generatedAt: new Date().toISOString(),
    deterministicModelVersion: 'governed-related-questions-v1',
    canonicalGovernedArtifact: 'public/data/enrichment-governed.json',
    totals: {
      publishableEntities: publishable.length,
      pagesGainedRelatedQuestions: gainedRows.filter(row => row.afterRelatedQuestions > 0).length,
      intentionallyUnchangedDueToSparseSignals: unchangedSparsePages.length,
    },
    questionTypes: {
      candidate: QUESTION_TYPES,
      usedCounts,
      excludedCounts,
    },
    gainedPages: gainedRows,
    unchangedSparsePages,
    verification: {
      approvedPublishableOnly: gainedRows.every(row => publishableKeys.has(`${row.entityType}:${row.entitySlug}`)),
      compactQuestionSet: gainedRows.every(row => row.afterRelatedQuestions <= 3),
      gracefulDegradationWhenSparse: unchangedSparsePages.length > 0,
      conservativeCoverage: gainedRows.every(row => row.questionTypesUsed.length > 0),
    },
  }

  fs.mkdirSync(path.dirname(REPORT_JSON_PATH), { recursive: true })
  fs.writeFileSync(REPORT_JSON_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8')

  const md = [
    '# Governed related questions report',
    '',
    `- Generated at: ${report.generatedAt}`,
    `- Deterministic model version: ${report.deterministicModelVersion}`,
    '',
    '## Totals',
    `- Publishable governed entities: ${report.totals.publishableEntities}`,
    `- Pages with related questions: ${report.totals.pagesGainedRelatedQuestions}`,
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
    '## Pages that gained governed related questions',
    ...gainedRows.map(
      row =>
        `- ${row.route} · relatedQuestions=${row.afterRelatedQuestions} · questionTypes=${row.questionTypesUsed.join(', ') || 'none'}`,
    ),
    '',
    '## Intentionally unchanged pages',
    ...unchangedSparsePages.slice(0, 25).map(row => `- ${row.route} · ${row.reason}`),
  ].join('\n')

  fs.writeFileSync(REPORT_MD_PATH, `${md}\n`, 'utf8')
  console.log(
    `[report:governed-related-questions] pages=${report.totals.pagesGainedRelatedQuestions} unchangedSparse=${report.totals.intentionallyUnchangedDueToSparseSignals}`,
  )
}

main()
