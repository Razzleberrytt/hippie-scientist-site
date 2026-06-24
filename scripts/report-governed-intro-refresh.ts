#!/usr/bin/env tsx
import fs from 'node:fs'
import path from 'node:path'
import publicationManifest from '../public/data/publication-manifest.json'
import submissions from '../ops/enrichment-submissions.json'
import {
  buildFallbackCompoundIntro,
  buildFallbackHerbIntro,
  buildGovernedDetailIntro,
  countPlaceholderSignals,
} from '../src/lib/governedIntro'
import {
  getGovernedResearchEnrichment,
  getPublishableGovernedEntries,
  type GovernedEntityType,
} from '../src/lib/governedResearch'
import { calculateCompoundConfidence, calculateHerbConfidence } from '../src/utils/calculateConfidence'

type EntityType = 'herb' | 'compound'

type DetailRow = Record<string, unknown>

type ReportRow = {
  entityType: EntityType
  entitySlug: string
  route: string
  beforeIntro: {
    whatItIs: string
    commonUse: string
    evidenceContext: string
    cautionNote?: string
    placeholderSignalCount: number
  }
  afterIntro: {
    whatItIs: string
    commonUse: string
    evidenceContext: string
    cautionNote?: string
    placeholderSignalCount: number
  }
  introMode: 'governed' | 'fallback'
  usedSignals: string[]
  excludedSignals: Array<{ signal: string; reason: string }>
  gainedGovernedIntro: boolean
  fallbackReason?: string
}

const ROOT = process.cwd()
const REPORT_JSON_PATH = path.join(ROOT, 'ops', 'reports', 'governed-intro-refresh.json')
const REPORT_MD_PATH = path.join(ROOT, 'ops', 'reports', 'governed-intro-refresh.md')

const BLOCKED_REVIEW_STATUSES = new Set([
  'blocked',
  'rejected',
  'revision_requested',
  'ready_for_review',
  'draft_submission',
])

function asStringArray(value: unknown) {
  if (!Array.isArray(value)) return []
  return value.map(item => String(item || '').trim()).filter(Boolean)
}

function asString(value: unknown) {
  return String(value || '').trim()
}

function keyOf(entityType: EntityType, slug: string) {
  return `${entityType}:${slug}`
}

function routeFor(entityType: EntityType, slug: string) {
  return entityType === 'herb' ? `/herbs/${slug}` : `/compounds/${slug}`
}

function readDetailRow(entityType: EntityType, slug: string): DetailRow | null {
  const filePath = path.join(
    ROOT,
    'public',
    'data',
    entityType === 'herb' ? 'herbs-detail' : 'compounds-detail',
    `${slug}.json`,
  )
  if (!fs.existsSync(filePath)) return null
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as DetailRow
}

function buildHerbRow(slug: string, row: DetailRow): ReportRow {
  const description = asString(row.description)
  const mechanism = asString(row.mechanism)
  const effects = asStringArray(row.effects)
  const therapeuticUses = asStringArray(row.therapeuticUses)
  const contraindications = asStringArray(row.contraindications)
  const interactions = asStringArray(row.interactions)
  const sideEffects = asStringArray(row.sideeffects)
  const sources = Array.isArray(row.sources) ? row.sources : []
  const sourceCount = sources.length
  const cautionCount = contraindications.length + interactions.length + sideEffects.length

  const confidence = calculateHerbConfidence({
    mechanism,
    effects,
    compounds: asStringArray(row.activeCompounds),
  })
  const displayName = asString(row.commonName || row.common || row.name || slug)
  const primaryEffects = effects.slice(0, 4)
  const introFacts = [
    sourceCount > 0 ? `${sourceCount} source${sourceCount === 1 ? '' : 's'} listed` : 'sources pending',
    cautionCount > 0
      ? `${cautionCount} caution signal${cautionCount === 1 ? '' : 's'}`
      : 'no caution flags listed',
  ]

  const fallbackIntro = buildFallbackHerbIntro({
    herbDisplayName: displayName,
    description,
    mechanism,
    therapeuticUses,
    primaryEffects,
    confidence,
    sourceCount,
    cautionCount,
    contraindications,
    interactions,
    sideEffects,
    introFacts,
  })

  const governedIntro = buildGovernedDetailIntro({
    entityName: displayName,
    fallback: fallbackIntro,
    enrichment: getGovernedResearchEnrichment('herb', slug),
    sourceCount,
  })

  return {
    entityType: 'herb',
    entitySlug: slug,
    route: routeFor('herb', slug),
    beforeIntro: {
      whatItIs: fallbackIntro.whatItIs,
      commonUse: fallbackIntro.commonUse,
      evidenceContext: fallbackIntro.evidenceContext,
      cautionNote: fallbackIntro.cautionNote,
      placeholderSignalCount: countPlaceholderSignals(fallbackIntro),
    },
    afterIntro: {
      whatItIs: governedIntro.whatItIs,
      commonUse: governedIntro.commonUse,
      evidenceContext: governedIntro.evidenceContext,
      cautionNote: governedIntro.cautionNote,
      placeholderSignalCount: countPlaceholderSignals(governedIntro),
    },
    introMode: governedIntro.decision.mode,
    usedSignals: governedIntro.decision.usedSignals,
    excludedSignals: governedIntro.decision.excludedSignals,
    gainedGovernedIntro: governedIntro.decision.mode === 'governed',
    fallbackReason:
      governedIntro.decision.mode === 'fallback'
        ? governedIntro.decision.excludedSignals[0]?.reason || 'no_publishable_governed_enrichment'
        : undefined,
  }
}

function buildCompoundRow(slug: string, row: DetailRow): ReportRow {
  const description = asString(row.description)
  const mechanism = asString(row.mechanism)
  const effects = asStringArray(row.effects)
  const therapeuticUses = asStringArray(row.therapeuticUses)
  const contraindications = asStringArray(row.contraindications)
  const interactions = asStringArray(row.interactions)
  const sideEffects = asStringArray(row.sideEffects)
  const herbs = asStringArray(row.herbs)
  const sources = Array.isArray(row.sources) ? row.sources : []
  const sourceCount = sources.length
  const cautionCount = contraindications.length + interactions.length + sideEffects.length

  const confidence = calculateCompoundConfidence({
    mechanism,
    effects,
    compounds: herbs,
  })
  const name = asString(row.name || slug)
  const introFacts = [
    sourceCount > 0 ? `${sourceCount} source${sourceCount === 1 ? '' : 's'} listed` : 'sources pending',
    cautionCount > 0
      ? `${cautionCount} caution signal${cautionCount === 1 ? '' : 's'}`
      : 'no caution flags listed',
  ]

  const fallbackIntro = buildFallbackCompoundIntro({
    compoundName: name,
    description,
    mechanism,
    therapeuticUses,
    primaryEffects: effects.slice(0, 4),
    linkedHerbCount: herbs.length,
    confidence,
    sourceCount,
    cautionCount,
    contraindications,
    interactions,
    sideEffects,
    introFacts,
  })

  const governedIntro = buildGovernedDetailIntro({
    entityName: name,
    fallback: fallbackIntro,
    enrichment: getGovernedResearchEnrichment('compound', slug),
    sourceCount,
  })

  return {
    entityType: 'compound',
    entitySlug: slug,
    route: routeFor('compound', slug),
    beforeIntro: {
      whatItIs: fallbackIntro.whatItIs,
      commonUse: fallbackIntro.commonUse,
      evidenceContext: fallbackIntro.evidenceContext,
      cautionNote: fallbackIntro.cautionNote,
      placeholderSignalCount: countPlaceholderSignals(fallbackIntro),
    },
    afterIntro: {
      whatItIs: governedIntro.whatItIs,
      commonUse: governedIntro.commonUse,
      evidenceContext: governedIntro.evidenceContext,
      cautionNote: governedIntro.cautionNote,
      placeholderSignalCount: countPlaceholderSignals(governedIntro),
    },
    introMode: governedIntro.decision.mode,
    usedSignals: governedIntro.decision.usedSignals,
    excludedSignals: governedIntro.decision.excludedSignals,
    gainedGovernedIntro: governedIntro.decision.mode === 'governed',
    fallbackReason:
      governedIntro.decision.mode === 'fallback'
        ? governedIntro.decision.excludedSignals[0]?.reason || 'no_publishable_governed_enrichment'
        : undefined,
  }
}

function main() {
  const herbRoutes = (((publicationManifest as Record<string, unknown>).routes || {}) as Record<
    string,
    string[]
  >).herbs || []
  const compoundRoutes = (((publicationManifest as Record<string, unknown>).routes || {}) as Record<
    string,
    string[]
  >).compounds || []

  const rows: ReportRow[] = []
  for (const route of herbRoutes) {
    const slug = asString(route).replace(/^\/herbs\//, '')
    const row = readDetailRow('herb', slug)
    if (!row) continue
    rows.push(buildHerbRow(slug, row))
  }

  for (const route of compoundRoutes) {
    const slug = asString(route).replace(/^\/compounds\//, '')
    const row = readDetailRow('compound', slug)
    if (!row) continue
    rows.push(buildCompoundRow(slug, row))
  }

  const publishableKeys = new Set(
    getPublishableGovernedEntries().map(row => keyOf(row.entityType as EntityType, row.entitySlug)),
  )

  const blockedOrUnapproved = new Set(
    (submissions as Array<{
      entityType: GovernedEntityType
      entitySlug: string
      reviewStatus: string
      active?: boolean
    }>)
      .filter(row => BLOCKED_REVIEW_STATUSES.has(String(row.reviewStatus)) || row.active !== true)
      .map(row => keyOf(row.entityType, row.entitySlug)),
  )

  const gainedGovernedIntro = rows.filter(row => row.gainedGovernedIntro)
  const fallbackRows = rows.filter(row => row.introMode === 'fallback')
  const blockedLeaks = rows.filter(row => blockedOrUnapproved.has(keyOf(row.entityType, row.entitySlug)) && row.gainedGovernedIntro)

  const placeholderBefore = rows.reduce((sum, row) => sum + row.beforeIntro.placeholderSignalCount, 0)
  const placeholderAfter = rows.reduce((sum, row) => sum + row.afterIntro.placeholderSignalCount, 0)

  const usedSignalCounts: Record<string, number> = {}
  const excludedSignalCounts: Record<string, number> = {}
  for (const row of rows) {
    for (const signal of row.usedSignals) {
      usedSignalCounts[signal] = (usedSignalCounts[signal] || 0) + 1
    }
    for (const excluded of row.excludedSignals) {
      const key = `${excluded.signal}:${excluded.reason}`
      excludedSignalCounts[key] = (excludedSignalCounts[key] || 0) + 1
    }
  }

  const representativeExamples = rows
    .filter(
      row =>
        row.beforeIntro.whatItIs !== row.afterIntro.whatItIs ||
        row.beforeIntro.commonUse !== row.afterIntro.commonUse ||
        row.beforeIntro.evidenceContext !== row.afterIntro.evidenceContext ||
        (row.beforeIntro.cautionNote || '') !== (row.afterIntro.cautionNote || ''),
    )
    .slice(0, 8)
    .map(row => ({
      route: row.route,
      introMode: row.introMode,
      before: row.beforeIntro,
      after: row.afterIntro,
    }))

  const report = {
    generatedAt: new Date().toISOString(),
    deterministicModelVersion: 'governed-intro-refresh-v1',
    canonicalGovernedArtifact: 'public/data/enrichment-governed.json',
    canonicalGovernedInputArtifact: 'public/data/enrichment-submissions-governed-input.jsonl',
    totals: {
      evaluatedPages: rows.length,
      publishableGovernedEntities: publishableKeys.size,
      pagesGainedGovernedIntro: gainedGovernedIntro.length,
      pagesRemainingFallback: fallbackRows.length,
      placeholderSignalsBefore: placeholderBefore,
      placeholderSignalsAfter: placeholderAfter,
      placeholderSignalDelta: placeholderAfter - placeholderBefore,
    },
    signalUsage: {
      usedSignals: usedSignalCounts,
      excludedSignalReasons: excludedSignalCounts,
    },
    gainedGovernedIntroPages: gainedGovernedIntro.map(row => ({
      route: row.route,
      entityType: row.entityType,
      entitySlug: row.entitySlug,
      usedSignals: row.usedSignals,
      excludedSignals: row.excludedSignals,
    })),
    fallbackPages: fallbackRows.map(row => ({
      route: row.route,
      entityType: row.entityType,
      entitySlug: row.entitySlug,
      reason: row.fallbackReason || 'no_publishable_governed_enrichment',
      excludedSignals: row.excludedSignals,
    })),
    representativeExamples,
    verification: {
      onlyApprovedGovernedInfluence: blockedLeaks.length === 0,
      blockedRejectedRevisionRequestedExcluded: blockedLeaks.length === 0,
      placeholderHeavyFallbackReducedOnEligiblePages:
        gainedGovernedIntro.every(
          row => row.afterIntro.placeholderSignalCount <= row.beforeIntro.placeholderSignalCount,
        ) && placeholderAfter <= placeholderBefore,
      sparsePagesDegradeGracefullyConservatively:
        fallbackRows.length > 0 &&
        fallbackRows.every(row => row.fallbackReason === 'no_publishable_governed_enrichment'),
    },
    verificationDetails: {
      blockedEntityLeaks: blockedLeaks.map(row => keyOf(row.entityType, row.entitySlug)),
    },
  }

  fs.mkdirSync(path.dirname(REPORT_JSON_PATH), { recursive: true })
  fs.writeFileSync(REPORT_JSON_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8')

  const md = [
    '# Governed intro refresh report',
    '',
    `- Generated at: ${report.generatedAt}`,
    `- Deterministic model version: ${report.deterministicModelVersion}`,
    '',
    '## Totals',
    `- Evaluated pages: ${report.totals.evaluatedPages}`,
    `- Publishable governed entities: ${report.totals.publishableGovernedEntities}`,
    `- Pages gained governed intro: ${report.totals.pagesGainedGovernedIntro}`,
    `- Pages remaining fallback: ${report.totals.pagesRemainingFallback}`,
    `- Placeholder signal delta (after-before): ${report.totals.placeholderSignalDelta}`,
    '',
    '## Verification',
    ...Object.entries(report.verification).map(([key, ok]) => `- ${key}: ${ok ? 'PASS' : 'FAIL'}`),
    '',
    '## Signal usage',
    ...Object.entries(usedSignalCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([signal, count]) => `- used ${signal}: ${count}`),
    ...Object.entries(excludedSignalCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([signal, count]) => `- excluded ${signal}: ${count}`),
    '',
    '## Pages that gained governed intro',
    ...report.gainedGovernedIntroPages.map(
      row => `- ${row.route} · usedSignals=${row.usedSignals.join(', ') || 'none'}`,
    ),
    '',
    '## Pages still on fallback (first 30)',
    ...report.fallbackPages.slice(0, 30).map(row => `- ${row.route} · ${row.reason}`),
    '',
    '## Representative before/after examples',
    ...representativeExamples.map(
      example =>
        `- ${example.route} (${example.introMode})\n  - before: ${example.before.whatItIs} || ${example.before.commonUse} || ${example.before.evidenceContext}\n  - after: ${example.after.whatItIs} || ${example.after.commonUse} || ${example.after.evidenceContext}`,
    ),
  ].join('\n')

  fs.writeFileSync(REPORT_MD_PATH, `${md}\n`, 'utf8')
  console.log(
    `[report:governed-intro-refresh] pages=${report.totals.evaluatedPages} gained=${report.totals.pagesGainedGovernedIntro} fallback=${report.totals.pagesRemainingFallback} placeholderDelta=${report.totals.placeholderSignalDelta}`,
  )
}

main()
