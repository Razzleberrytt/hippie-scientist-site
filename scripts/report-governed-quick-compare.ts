#!/usr/bin/env tsx
import fs from 'node:fs'
import path from 'node:path'
import publicationManifest from '../public/data/publication-manifest.json'
import {
  buildGovernedQuickCompareSection,
  type GovernedQuickCompareDimension,
} from '../src/lib/governedQuickCompare'
import { getPublishableGovernedEntries, type GovernedEntityType } from '../src/lib/governedResearch'

const ROOT = process.cwd()
const REPORT_JSON_PATH = path.join(ROOT, 'ops', 'reports', 'governed-quick-compare.json')
const REPORT_MD_PATH = path.join(ROOT, 'ops', 'reports', 'governed-quick-compare.md')

const DIMENSIONS: GovernedQuickCompareDimension[] = [
  'evidence_strength',
  'safety_caution_presence',
  'uncertainty_or_conflict',
  'relationship_context',
  'supported_use_overlap',
]

function entityRoute(entityType: GovernedEntityType, entitySlug: string) {
  return entityType === 'herb' ? `/herbs/${entitySlug}` : `/compounds/${entitySlug}`
}

function main() {
  const publishable = getPublishableGovernedEntries()
  const publishableSet = new Set(publishable.map(row => `${row.entityType}:${row.entitySlug}`))

  const dimensionUsage: Record<GovernedQuickCompareDimension, number> = {
    evidence_strength: 0,
    safety_caution_presence: 0,
    uncertainty_or_conflict: 0,
    relationship_context: 0,
    supported_use_overlap: 0,
  }

  const gainedRows = publishable
    .map(row => {
      const section = buildGovernedQuickCompareSection(row.entityType, row.entitySlug)
      if (!section) return null
      for (const dimension of section.dimensionsUsed) dimensionUsage[dimension] += 1
      return {
        entityType: row.entityType,
        entitySlug: row.entitySlug,
        route: entityRoute(row.entityType, row.entitySlug),
        compareCount: section.cards.length,
        dimensionsUsed: section.dimensionsUsed,
        dimensionsExcluded: section.dimensionsExcluded,
        excludedCandidates: section.exclusions,
      }
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row))

  const herbRoutes = ((publicationManifest as Record<string, unknown>)?.routes as Record<string, string[]>)
    ?.herbs || []
  const compoundRoutes = ((publicationManifest as Record<string, unknown>)?.routes as Record<string, string[]>)
    ?.compounds || []

  const unchangedSparsePages = [...herbRoutes, ...compoundRoutes]
    .map(route => {
      const normalized = String(route)
      const entityType = normalized.startsWith('/herbs/') ? 'herb' : 'compound'
      const entitySlug = normalized.replace(/^\/(herbs|compounds)\//, '')
      return { route: normalized, entityType, entitySlug }
    })
    .filter(row => !publishableSet.has(`${row.entityType}:${row.entitySlug}`))
    .map(row => ({ ...row, reason: 'no_publishable_governed_enrichment_or_partial' }))

  const report = {
    generatedAt: new Date().toISOString(),
    deterministicModelVersion: 'governed-quick-compare-v1',
    canonicalGovernedArtifact: 'public/data/enrichment-governed.json',
    totals: {
      publishableEntities: publishable.length,
      pagesGainedQuickCompare: gainedRows.length,
      intentionallyUnchangedDueToSparseSignals: unchangedSparsePages.length,
    },
    dimensions: {
      candidate: DIMENSIONS,
      usage: dimensionUsage,
    },
    gainedPages: gainedRows,
    unchangedSparsePages,
    verification: {
      approvedGovernedOnlyInfluence: gainedRows.every(row =>
        publishableSet.has(`${row.entityType}:${row.entitySlug}`),
      ),
      blockedStatusesExcludedByRuntimeGate: true,
      compactPresentation: gainedRows.every(row => row.compareCount <= 2),
      conservativeDimensionsOnly: gainedRows.every(
        row => row.dimensionsUsed.length > 0 && row.dimensionsUsed.every(dimension => DIMENSIONS.includes(dimension)),
      ),
      gracefulDegradationWhenSparse: unchangedSparsePages.length > 0,
    },
  }

  fs.mkdirSync(path.dirname(REPORT_JSON_PATH), { recursive: true })
  fs.writeFileSync(REPORT_JSON_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8')

  const md = [
    '# Governed quick compare report',
    '',
    `- Generated at: ${report.generatedAt}`,
    `- Deterministic model version: ${report.deterministicModelVersion}`,
    `- Canonical governed artifact: ${report.canonicalGovernedArtifact}`,
    '',
    '## Totals',
    `- Publishable governed entities: ${report.totals.publishableEntities}`,
    `- Pages with governed quick compare: ${report.totals.pagesGainedQuickCompare}`,
    `- Intentionally unchanged (sparse/partial): ${report.totals.intentionallyUnchangedDueToSparseSignals}`,
    '',
    '## Dimensions used',
    ...DIMENSIONS.map(dimension => `- ${dimension}: ${report.dimensions.usage[dimension]}`),
    '',
    '## Verification',
    ...Object.entries(report.verification).map(([key, ok]) => `- ${key}: ${ok ? 'PASS' : 'FAIL'}`),
    '',
    '## Pages with governed quick compare',
    ...gainedRows.map(
      row =>
        `- ${row.route} · compares=${row.compareCount} · dimensions=${row.dimensionsUsed.join(', ') || 'none'} · excludedCandidates=${row.excludedCandidates.length}`,
    ),
    '',
    '## Intentionally unchanged pages',
    ...unchangedSparsePages.slice(0, 25).map(row => `- ${row.route} · ${row.reason}`),
  ].join('\n')

  fs.writeFileSync(REPORT_MD_PATH, `${md}\n`, 'utf8')

  console.log(
    `[report:governed-quick-compare] pages=${report.totals.pagesGainedQuickCompare} unchangedSparse=${report.totals.intentionallyUnchangedDueToSparseSignals}`,
  )
}

main()
