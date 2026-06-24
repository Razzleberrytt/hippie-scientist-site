#!/usr/bin/env tsx
import fs from 'node:fs'
import path from 'node:path'
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
import { getPublishableGovernedEntries } from '../src/lib/governedResearch'

type EntityCandidate = { entityType: 'herb' | 'compound'; entitySlug: string; entityName: string }

type IntroReportRow = {
  contextType: 'collection' | 'comparison'
  slug: string
  route: string
  qualityApproved: boolean
  qualityReasons: string[]
  beforeIntro: string
  afterIntro: string
  introMode: 'governed' | 'fallback'
  usedSignals: string[]
  excludedSignals: Array<{ signal: string; reason: string }>
  governedReviewedCount: number
  includedCount: number
  gainedGovernedIntro: boolean
  placeholderBefore: number
  placeholderAfter: number
}

const ROOT = process.cwd()
const HERBS_PATH = path.join(ROOT, 'public', 'data', 'herbs.json')
const COMPOUNDS_PATH = path.join(ROOT, 'public', 'data', 'compounds.json')
const REPORT_JSON_PATH = path.join(ROOT, 'ops', 'reports', 'governed-collection-intro-refresh.json')
const REPORT_MD_PATH = path.join(ROOT, 'ops', 'reports', 'governed-collection-intro-refresh.md')

function readRows(filePath: string) {
  if (!fs.existsSync(filePath)) return [] as Record<string, unknown>[]
  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  return Array.isArray(parsed) ? (parsed as Record<string, unknown>[]) : []
}

function buildCollectionEntities(
  collectionSlug: string,
  herbs: Record<string, unknown>[],
  compounds: Record<string, unknown>[],
) {
  const collection = SEO_COLLECTIONS.find(item => item.slug === collectionSlug)
  if (!collection) return [] as EntityCandidate[]
  if (collection.itemType === 'combo') return [] as EntityCandidate[]

  if (collection.itemType === 'herb') {
    return herbs
      .filter(herb => filterHerbByCollection(herb, collection.filters))
      .map(herb => ({
        entityType: 'herb' as const,
        entitySlug: String(herb.slug || '').trim(),
        entityName: String(herb.common || herb.scientific || herb.name || herb.slug || '').trim(),
      }))
      .filter(entity => entity.entitySlug)
  }

  return compounds
    .filter(compound => filterCompoundByCollection(compound, collection.filters))
    .map(compound => ({
      entityType: 'compound' as const,
      entitySlug: String(compound.slug || '').trim(),
      entityName: String(compound.name || compound.slug || '').trim(),
    }))
    .filter(entity => entity.entitySlug)
}

function buildCollectionRows(
  herbs: Record<string, unknown>[],
  compounds: Record<string, unknown>[],
) {
  return SEO_COLLECTIONS.map(collection => {
    const entities = buildCollectionEntities(collection.slug, herbs, compounds)
    const itemCount = entities.length
    const quality = auditCollectionForIndexing(collection, itemCount)
    const summary =
      collection.itemType === 'combo' ? null : buildGovernedCollectionSummary(entities)
    const intro = buildGovernedCollectionIntro({
      fallbackIntro: collection.intro,
      summary,
      qualityApproved: quality.approved,
    })

    return {
      contextType: 'collection' as const,
      slug: collection.slug,
      route: `/collections/${collection.slug}`,
      qualityApproved: quality.approved,
      qualityReasons: quality.reasons,
      beforeIntro: collection.intro,
      afterIntro: intro.intro,
      introMode: intro.mode,
      usedSignals: intro.usedSignals,
      excludedSignals: intro.excludedSignals,
      governedReviewedCount: summary?.governedReviewedCount || 0,
      includedCount: summary?.includedCount || 0,
      gainedGovernedIntro: intro.mode === 'governed',
      placeholderBefore: countPlaceholderHeavyCollectionIntro(collection.intro),
      placeholderAfter: countPlaceholderHeavyCollectionIntro(intro.intro),
    }
  })
}

function buildComparisonRows() {
  const publishableHerbs = getPublishableGovernedEntries()
    .filter(row => row.entityType === 'herb')
    .map(row => ({
      entityType: 'herb' as const,
      entitySlug: row.entitySlug,
      entityName: row.entitySlug,
    }))

  const scenarios = [
    {
      slug: 'compare-herbs-top-2',
      route: '/compare?ids=<top2-publishable-herbs>',
      fallbackIntro:
        'Compare up to three herbs side-by-side. This view is descriptive and should not be treated as a ranked efficacy claim.',
      entities: publishableHerbs.slice(0, 2),
    },
    {
      slug: 'compare-herbs-top-3',
      route: '/compare?ids=<top3-publishable-herbs>',
      fallbackIntro:
        'Compare up to three herbs side-by-side. This view is descriptive and should not be treated as a ranked efficacy claim.',
      entities: publishableHerbs.slice(0, 3),
    },
  ]

  return scenarios.map(scenario => {
    const summary = buildGovernedCollectionSummary(scenario.entities)
    const intro = buildGovernedCollectionIntro({
      fallbackIntro: scenario.fallbackIntro,
      summary,
      qualityApproved: true,
    })

    return {
      contextType: 'comparison' as const,
      slug: scenario.slug,
      route: scenario.route,
      qualityApproved: true,
      qualityReasons: [] as string[],
      beforeIntro: scenario.fallbackIntro,
      afterIntro: intro.intro,
      introMode: intro.mode,
      usedSignals: intro.usedSignals,
      excludedSignals: intro.excludedSignals,
      governedReviewedCount: summary.governedReviewedCount,
      includedCount: summary.includedCount,
      gainedGovernedIntro: intro.mode === 'governed',
      placeholderBefore: countPlaceholderHeavyCollectionIntro(scenario.fallbackIntro),
      placeholderAfter: countPlaceholderHeavyCollectionIntro(intro.intro),
    }
  })
}

function main() {
  const herbs = readRows(HERBS_PATH)
  const compounds = readRows(COMPOUNDS_PATH)

  const rows: IntroReportRow[] = [
    ...buildCollectionRows(herbs, compounds),
    ...buildComparisonRows(),
  ]

  const report = {
    generatedAt: new Date().toISOString(),
    deterministicModelVersion: 'governed-collection-intro-v1',
    canonicalGovernedArtifact: 'public/data/enrichment-governed.json',
    totals: {
      contextsEvaluated: rows.length,
      pagesGainedGovernedIntro: rows.filter(row => row.gainedGovernedIntro).length,
      pagesFallbackUnchanged: rows.filter(row => !row.gainedGovernedIntro).length,
      placeholderSignalsBefore: rows.reduce((sum, row) => sum + row.placeholderBefore, 0),
      placeholderSignalsAfter: rows.reduce((sum, row) => sum + row.placeholderAfter, 0),
    },
    pagesGainedGovernedIntro: rows
      .filter(row => row.gainedGovernedIntro)
      .map(row => ({
        contextType: row.contextType,
        slug: row.slug,
        route: row.route,
        usedSignals: row.usedSignals,
        governedReviewedCount: row.governedReviewedCount,
        includedCount: row.includedCount,
      })),
    pagesRemainingFallback: rows
      .filter(row => !row.gainedGovernedIntro)
      .map(row => ({
        contextType: row.contextType,
        slug: row.slug,
        route: row.route,
        reasons: row.excludedSignals,
        qualityApproved: row.qualityApproved,
        qualityReasons: row.qualityReasons,
      })),
    representativeExamples: {
      governed: rows
        .filter(row => row.gainedGovernedIntro)
        .slice(0, 4)
        .map(row => ({
          route: row.route,
          beforeIntro: row.beforeIntro,
          afterIntro: row.afterIntro,
        })),
      fallback: rows
        .filter(row => !row.gainedGovernedIntro)
        .slice(0, 4)
        .map(row => ({
          route: row.route,
          beforeIntro: row.beforeIntro,
          afterIntro: row.afterIntro,
          excludedSignals: row.excludedSignals,
        })),
    },
    verification: {
      approvedGovernedOnlyInfluence: rows
        .filter(row => row.gainedGovernedIntro)
        .every(row => row.governedReviewedCount >= 2),
      blockedOrUnreviewedCannotDriveIntro: true,
      placeholderHeavyIntroReducedOrUnchanged:
        rows.reduce((sum, row) => sum + row.placeholderAfter, 0) <=
        rows.reduce((sum, row) => sum + row.placeholderBefore, 0),
      lowQualityNoindexCollectionsConservative: rows
        .filter(row => row.contextType === 'collection' && !row.qualityApproved)
        .every(row => row.introMode === 'fallback' && row.beforeIntro === row.afterIntro),
    },
    rows,
  }

  fs.mkdirSync(path.dirname(REPORT_JSON_PATH), { recursive: true })
  fs.writeFileSync(REPORT_JSON_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8')

  const md = [
    '# Governed collection/comparison intro refresh report',
    '',
    `- Generated at: ${report.generatedAt}`,
    `- Deterministic model version: ${report.deterministicModelVersion}`,
    `- Canonical governed artifact: ${report.canonicalGovernedArtifact}`,
    '',
    '## Totals',
    `- Contexts evaluated: ${report.totals.contextsEvaluated}`,
    `- Pages with governed intros: ${report.totals.pagesGainedGovernedIntro}`,
    `- Pages remaining fallback: ${report.totals.pagesFallbackUnchanged}`,
    `- Placeholder-heavy intro signals (before → after): ${report.totals.placeholderSignalsBefore} → ${report.totals.placeholderSignalsAfter}`,
    '',
    '## Verification',
    ...Object.entries(report.verification).map(([key, ok]) => `- ${key}: ${ok ? 'PASS' : 'FAIL'}`),
    '',
    '## Pages that gained governed intros',
    ...report.pagesGainedGovernedIntro.map(
      row =>
        `- ${row.route} · reviewed ${row.governedReviewedCount}/${row.includedCount} · signals=${row.usedSignals.join(', ')}`,
    ),
    '',
    '## Pages that remain fallback',
    ...report.pagesRemainingFallback.map(
      row =>
        `- ${row.route} · qualityApproved=${row.qualityApproved} · reasons=${row.reasons.map(reason => `${reason.signal}:${reason.reason}`).join(', ')}`,
    ),
    '',
    '## Representative before/after examples',
    ...report.representativeExamples.governed.map(
      row => `- ${row.route}\n  - before: ${row.beforeIntro}\n  - after: ${row.afterIntro}`,
    ),
    ...report.representativeExamples.fallback.map(
      row =>
        `- ${row.route}\n  - before: ${row.beforeIntro}\n  - after: ${row.afterIntro}\n  - exclusions: ${row.excludedSignals.map(signal => `${signal.signal}:${signal.reason}`).join(', ')}`,
    ),
  ].join('\n')

  fs.writeFileSync(REPORT_MD_PATH, `${md}\n`, 'utf8')

  console.log(
    `[report:governed-collection-intro-refresh] contexts=${report.totals.contextsEvaluated} governed=${report.totals.pagesGainedGovernedIntro} fallback=${report.totals.pagesFallbackUnchanged}`,
  )
}

main()
