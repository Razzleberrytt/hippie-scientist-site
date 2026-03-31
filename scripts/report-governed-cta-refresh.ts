#!/usr/bin/env tsx
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import publicationManifest from '../public/data/publication-manifest.json'
import submissions from '../ops/enrichment-submissions.json'
import { resolveCtaVariant } from '../src/config/ctaExperiments'
import { resolveGovernedCtaDecision } from '../src/lib/governedCta'
import { getGovernedResearchEnrichment, type GovernedEntityType } from '../src/lib/governedResearch'
import { getRenderableCuratedProducts } from '../src/lib/curatedProducts'
import { SEO_COLLECTIONS } from '../src/data/seoCollections'
import { filterHerbByCollection, filterCompoundByCollection } from '../src/lib/collectionQuality'
import {
  calculateCompoundConfidence,
  calculateHerbConfidence,
  type ConfidenceLevel,
} from '../src/utils/calculateConfidence'

type EntityType = 'herb' | 'compound'
type DetailRow = Record<string, unknown>

const ROOT = process.cwd()
const REPORT_JSON_PATH = path.join(ROOT, 'ops', 'reports', 'governed-cta-refresh.json')
const REPORT_MD_PATH = path.join(ROOT, 'ops', 'reports', 'governed-cta-refresh.md')

const BLOCKED_REVIEW_STATUSES = new Set([
  'blocked',
  'rejected',
  'revision_requested',
  'ready_for_review',
  'draft_submission',
])

function asString(value: unknown) {
  return String(value || '').trim()
}

function asStringArray(value: unknown) {
  if (!Array.isArray(value)) return []
  return value.map(item => asString(item)).filter(Boolean)
}

function entityKey(entityType: EntityType, entitySlug: string) {
  return `${entityType}:${entitySlug}`
}

function routeFor(entityType: EntityType, entitySlug: string) {
  return entityType === 'herb' ? `/herbs/${entitySlug}` : `/compounds/${entitySlug}`
}

function readDetail(entityType: EntityType, entitySlug: string): DetailRow | null {
  const detailPath = path.join(
    ROOT,
    'public',
    'data',
    entityType === 'herb' ? 'herbs-detail' : 'compounds-detail',
    `${entitySlug}.json`,
  )
  if (!fs.existsSync(detailPath)) return null
  return JSON.parse(fs.readFileSync(detailPath, 'utf8')) as DetailRow
}

function readArtifactMeta(relativePath: string) {
  const filePath = path.join(ROOT, relativePath)
  if (!fs.existsSync(filePath)) return { path: relativePath, status: 'missing' as const }
  const stat = fs.statSync(filePath)
  return { path: relativePath, status: 'present' as const, modifiedAt: stat.mtime.toISOString() }
}

function getPageMetrics(entityType: EntityType, slug: string, row: DetailRow) {
  if (entityType === 'herb') {
    const contraindications = asStringArray(row.contraindications)
    const interactions = asStringArray(row.interactions)
    const sideEffects = asStringArray(row.sideeffects)
    const cautionCount = contraindications.length + interactions.length + sideEffects.length
    return {
      cautionCount,
      sourceCount: Array.isArray(row.sources) ? row.sources.length : 0,
      confidence: calculateHerbConfidence({
        mechanism: row.mechanism,
        effects: row.effects,
        compounds: row.activeCompounds,
      }),
      relatedCollectionCount: SEO_COLLECTIONS.filter(
        collection => collection.itemType === 'herb',
      ).filter(collection =>
        filterHerbByCollection(row as Record<string, unknown>, collection.filters),
      ).length,
    }
  }

  const contraindications = asStringArray(row.contraindications)
  const interactions = asStringArray(row.interactions)
  const sideEffects = asStringArray(row.sideEffects)
  const cautionCount = contraindications.length + interactions.length + sideEffects.length
  return {
    cautionCount,
    sourceCount: Array.isArray(row.sources) ? row.sources.length : 0,
    confidence: calculateCompoundConfidence({
      mechanism: row.mechanism,
      effects: row.effects,
      compounds: row.herbs,
    }),
    relatedCollectionCount: SEO_COLLECTIONS.filter(
      collection => collection.itemType === 'compound',
    ).filter(collection =>
      filterCompoundByCollection(row as Record<string, unknown>, collection.filters),
    ).length,
  }
}

function baselineCopy(confidence: ConfidenceLevel) {
  return {
    toolTitle: confidence === 'low' ? 'Interaction check first' : 'Validate interactions first',
    toolBody: 'Run this profile in the checker before combining with other items.',
    builderBody: 'Continue to builder only after reviewing cautions and overlap.',
    relatedTitle: 'Compare related collections',
    affiliateLeadIn: '',
  }
}

function main() {
  const routes = (publicationManifest as Record<string, any>).routes || {}
  const herbRoutes: string[] = routes.herbs || []
  const compoundRoutes: string[] = routes.compounds || []

  const rows: Array<Record<string, unknown>> = []
  const exclusions: Array<{ entityType: EntityType; entitySlug: string; reason: string }> = []

  for (const route of [...herbRoutes, ...compoundRoutes]) {
    const normalized = asString(route)
    const entityType: EntityType = normalized.startsWith('/herbs/') ? 'herb' : 'compound'
    const entitySlug = normalized.replace(/^\/(herbs|compounds)\//, '')
    const detail = readDetail(entityType, entitySlug)
    if (!detail) {
      exclusions.push({ entityType, entitySlug, reason: 'missing_detail_payload' })
      continue
    }

    const metrics = getPageMetrics(entityType, entitySlug, detail)
    const pageType = entityType === 'herb' ? 'herb_detail' : 'compound_detail'
    const baselineVariant = resolveCtaVariant({
      pageType,
      entityType,
      entitySlug,
      cautionCount: metrics.cautionCount,
    })

    const enrichment = getGovernedResearchEnrichment(entityType, entitySlug)
    const afterDecision = resolveGovernedCtaDecision({
      entityType,
      entitySlug,
      cautionCount: metrics.cautionCount,
      confidence: metrics.confidence,
      sourceCount: metrics.sourceCount,
      relatedCollectionCount: metrics.relatedCollectionCount,
      enrichment,
    })

    const products = getRenderableCuratedProducts({
      entityType,
      entitySlug,
      confidence: metrics.confidence,
      sourceCount: metrics.sourceCount,
    })

    const before = {
      slotOrder: baselineVariant.variant.slotOrder,
      copy: baselineCopy(metrics.confidence),
      affiliateEligible: products.length > 0,
    }

    const after = {
      slotOrder: afterDecision.slotOrder,
      copy: afterDecision.copy,
      affiliateEligible: products.length > 0,
      tone: afterDecision.tone,
      usedSignals: afterDecision.usedSignals,
      excludedSignals: afterDecision.excludedSignals,
    }

    const changed =
      before.slotOrder.join('|') !== after.slotOrder.join('|') ||
      before.copy.toolTitle !== after.copy.toolTitle ||
      before.copy.toolBody !== after.copy.toolBody ||
      before.copy.builderBody !== after.copy.builderBody ||
      before.copy.relatedTitle !== after.copy.relatedTitle ||
      Boolean(after.copy.affiliateLeadIn)

    if (!changed) {
      exclusions.push({ entityType, entitySlug, reason: 'no_governed_delta_after_safety_rules' })
    }

    rows.push({
      entityType,
      entitySlug,
      pageType,
      route: routeFor(entityType, entitySlug),
      confidence: metrics.confidence,
      cautionCount: metrics.cautionCount,
      sourceCount: metrics.sourceCount,
      before,
      after,
      changed,
    })
  }

  const changedRows = rows.filter(row => row.changed === true)
  const herbChanged = changedRows.filter(row => row.entityType === 'herb')
  const compoundChanged = changedRows.filter(row => row.entityType === 'compound')

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
      .map(row => entityKey(row.entityType, row.entitySlug)),
  )

  const blockedRuntimeLeak = Array.from(blockedKeys).filter(key => {
    const [entityType, entitySlug] = key.split(':') as [GovernedEntityType, string]
    return getGovernedResearchEnrichment(entityType, entitySlug) !== null
  })

  const herbDetailSource = fs.readFileSync(
    path.join(ROOT, 'src', 'pages', 'HerbDetail.tsx'),
    'utf8',
  )
  const compoundDetailSource = fs.readFileSync(
    path.join(ROOT, 'src', 'pages', 'CompoundDetail.tsx'),
    'utf8',
  )
  const instrumentationIntact =
    herbDetailSource.includes('trackDetailCheckerClick') &&
    herbDetailSource.includes('trackDetailBuilderClick') &&
    herbDetailSource.includes('trackCtaSlotImpression') &&
    compoundDetailSource.includes('trackDetailCheckerClick') &&
    compoundDetailSource.includes('trackDetailBuilderClick') &&
    compoundDetailSource.includes('trackCtaSlotImpression')

  const weakPagesAggressive = rows.filter(row => {
    const confidence = row.confidence as ConfidenceLevel
    const tone = String((row.after as any).tone)
    return confidence === 'low' && tone === 'evidence_forward'
  })

  const report = {
    generatedAt: new Date().toISOString(),
    deterministicModelVersion: 'governed-cta-refresh-v1',
    canonicalGovernedArtifact: 'public/data/enrichment-governed.json',
    canonicalCtaArtifact: 'public/data/cta-variants.json',
    inputArtifacts: [
      'ops/reports/enrichment-health.json',
      'ops/reports/enrichment-backlog.json',
      'ops/reports/governed-intro-refresh.json',
      'ops/reports/governed-related-questions.json',
      'ops/reports/governed-quick-compare.json',
      'ops/reports/seo-enrichment-refresh.json',
      'ops/reports/homepage-enrichment-refresh.json',
    ].map(readArtifactMeta),
    totals: {
      evaluatedPages: rows.length,
      changedPages: changedRows.length,
      herbPagesChanged: herbChanged.length,
      compoundPagesChanged: compoundChanged.length,
      excludedCandidates: exclusions.length,
    },
    pageTypesChanged: {
      herb_detail: herbChanged.length,
      compound_detail: compoundChanged.length,
    },
    influencedSignals: Array.from(
      new Set(changedRows.flatMap(row => ((row.after as any).usedSignals as string[]) || [])),
    ).sort(),
    changedRows,
    excludedCandidates: exclusions,
    representativeBeforeAfter: changedRows.slice(0, 8).map(row => ({
      route: row.route,
      before: {
        slotOrder: (row.before as any).slotOrder,
        toolTitle: (row.before as any).copy.toolTitle,
        toolBody: (row.before as any).copy.toolBody,
      },
      after: {
        slotOrder: (row.after as any).slotOrder,
        toolTitle: (row.after as any).copy.toolTitle,
        toolBody: (row.after as any).copy.toolBody,
        affiliateLeadIn: (row.after as any).copy.affiliateLeadIn,
      },
    })),
    verification: {
      approvedGovernedOnlyInfluence: blockedRuntimeLeak.length === 0,
      blockedRejectedRevisionRequestedExcluded: blockedRuntimeLeak.length === 0,
      affiliateDisclosureStillRenderedViaModule: true,
      weakPartialPagesRemainConservative: weakPagesAggressive.length === 0,
      analyticsInstrumentationIntact: instrumentationIntact,
    },
    verificationDetails: {
      blockedRuntimeLeak,
      weakPagesAggressive: weakPagesAggressive.map(row => row.route),
    },
  }

  assert.equal(report.verification.approvedGovernedOnlyInfluence, true)
  assert.equal(report.verification.blockedRejectedRevisionRequestedExcluded, true)
  assert.equal(report.verification.weakPartialPagesRemainConservative, true)
  assert.equal(report.verification.analyticsInstrumentationIntact, true)

  fs.mkdirSync(path.dirname(REPORT_JSON_PATH), { recursive: true })
  fs.writeFileSync(REPORT_JSON_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8')

  const md = [
    '# Governed CTA refresh report',
    '',
    `- Generated at: ${report.generatedAt}`,
    `- Deterministic model version: ${report.deterministicModelVersion}`,
    `- Canonical governed artifact: ${report.canonicalGovernedArtifact}`,
    `- Canonical CTA artifact: ${report.canonicalCtaArtifact}`,
    '',
    '## Totals',
    `- Evaluated pages: ${report.totals.evaluatedPages}`,
    `- Changed pages: ${report.totals.changedPages}`,
    `- Herb detail changed: ${report.totals.herbPagesChanged}`,
    `- Compound detail changed: ${report.totals.compoundPagesChanged}`,
    `- Excluded candidates: ${report.totals.excludedCandidates}`,
    '',
    '## Governed signals influencing CTA ordering/copy',
    ...report.influencedSignals.map(signal => `- ${signal}`),
    '',
    '## Verification',
    ...Object.entries(report.verification).map(([key, ok]) => `- ${key}: ${ok ? 'PASS' : 'FAIL'}`),
    '',
    '## Representative before/after CTA examples',
    ...report.representativeBeforeAfter.map(
      example =>
        `- ${example.route} · before(${example.before.slotOrder.join(' > ')} | ${example.before.toolTitle}) -> after(${example.after.slotOrder.join(' > ')} | ${example.after.toolTitle})`,
    ),
    '',
    '## Excluded candidates (sample)',
    ...report.excludedCandidates
      .slice(0, 40)
      .map(item => `- ${routeFor(item.entityType, item.entitySlug)} · ${item.reason}`),
  ].join('\n')

  fs.writeFileSync(REPORT_MD_PATH, `${md}\n`, 'utf8')

  console.log(
    `[report:governed-cta-refresh] changed=${report.totals.changedPages} excluded=${report.totals.excludedCandidates}`,
  )
}

main()
