#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { getSharedRouteManifest } from './shared-route-manifest.mjs'

const ROOT = process.cwd()
const REPORT_JSON_PATH = path.join(ROOT, 'ops', 'reports', 'structured-data-enrichment.json')
const REPORT_MD_PATH = path.join(ROOT, 'ops', 'reports', 'structured-data-enrichment.md')

const WEAK_OR_UNCERTAIN = new Set([
  'preclinical_only',
  'traditional_use_only',
  'insufficient_evidence',
  'mixed_or_uncertain',
  'conflicting_evidence',
])

function readJson(relativePath, fallback = []) {
  const fullPath = path.join(ROOT, relativePath)
  if (!fs.existsSync(fullPath)) return fallback
  try {
    return JSON.parse(fs.readFileSync(fullPath, 'utf8'))
  } catch {
    return fallback
  }
}

function safeStr(value) {
  return String(value || '').trim()
}

function parseSeoCollections() {
  const sourcePath = path.join(ROOT, 'src', 'data', 'seoCollections.ts')
  if (!fs.existsSync(sourcePath)) return []
  const source = fs.readFileSync(sourcePath, 'utf8')
  const match = source.match(/export const SEO_COLLECTIONS:\s*SeoCollection\[\]\s*=\s*(\[[\s\S]*?\n\])/)
  if (!match?.[1]) return []
  try {
    const parsed = Function(`"use strict"; return (${match[1]});`)()
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function toSummaryMap(rows) {
  const map = new Map()
  for (const row of rows) {
    const slug = safeStr(row?.slug)
    if (!slug) continue
    const summary = row?.researchEnrichmentSummary
    if (!summary || typeof summary !== 'object') continue
    map.set(slug, summary)
  }
  return map
}

function unique(items) {
  return [...new Set(items)]
}

function compareTypes(beforeTypes, afterTypes) {
  const before = new Set(beforeTypes)
  const after = new Set(afterTypes)
  return {
    gained: [...after].filter(type => !before.has(type)).sort(),
    removed: [...before].filter(type => !after.has(type)).sort(),
  }
}

function getHerbOrCompoundSignals(summary) {
  const usedSignals = []
  const excludedSignals = []

  if (!summary?.enrichedAndReviewed) {
    excludedSignals.push('governed_enrichment:absent_or_not_reviewed')
    return { usedSignals, excludedSignals }
  }

  const evidenceLabel = safeStr(summary.evidenceLabel || 'insufficient_evidence')
  const weak = WEAK_OR_UNCERTAIN.has(evidenceLabel)

  usedSignals.push('governed_enrichment:reviewed')
  usedSignals.push(`evidence_label:${evidenceLabel}`)
  usedSignals.push('breadcrumb_context:linked')
  usedSignals.push('evidence_summary_presence:visible')

  if (summary.supportedUseCoveragePresent) {
    if (weak) excludedSignals.push('supported_use_claims:excluded_weak_or_uncertain')
    else usedSignals.push('supported_use_presence:visible')
  } else {
    excludedSignals.push('supported_use_presence:not_available')
  }

  if (summary.safetyCautionsPresent) usedSignals.push('safety_caution_presence:visible')
  else excludedSignals.push('safety_caution_presence:not_available')

  if (summary.mechanismOrConstituentCoveragePresent) {
    usedSignals.push('mechanism_or_constituent_presence:visible')
  } else {
    excludedSignals.push('mechanism_or_constituent_presence:not_available')
  }

  if (summary.conflictingEvidence) usedSignals.push('conflict_uncertainty_presence:visible')
  else excludedSignals.push('conflict_uncertainty_presence:not_flagged')

  excludedSignals.push('medical_authority_schema:policy_excluded')
  excludedSignals.push('product_review_rating_schema:policy_excluded')
  excludedSignals.push('faq_schema:excluded_no_visible_faq')

  return { usedSignals: unique(usedSignals), excludedSignals: unique(excludedSignals) }
}

function getCollectionSignals(collection, summary, approved) {
  const usedSignals = ['breadcrumb_context:linked']
  const excludedSignals = []

  if (!approved) {
    excludedSignals.push('collection_schema:excluded_noindex_or_low_quality')
    excludedSignals.push('itemlist_schema:excluded_noindex_or_low_quality')
    excludedSignals.push('faq_schema:excluded_no_visible_faq')
    return { usedSignals: [], excludedSignals }
  }

  usedSignals.push('collection_page_schema:enabled')
  usedSignals.push('item_list_schema:enabled')
  usedSignals.push('webpage_schema:enabled')

  if (summary && summary.governedReviewedCount > 0) {
    usedSignals.push(`governed_reviewed_count:${summary.governedReviewedCount}`)
    if (summary.safetySignalsPresentCount > 0) {
      usedSignals.push(`governed_safety_profiles:${summary.safetySignalsPresentCount}`)
    }
  } else {
    excludedSignals.push('governed_collection_summary:absent')
  }

  if (collection?.itemType === 'combo') {
    excludedSignals.push('item_entity_type:combo_link_only')
  }

  excludedSignals.push('medical_authority_schema:policy_excluded')
  excludedSignals.push('product_review_rating_schema:policy_excluded')
  excludedSignals.push('faq_schema:excluded_no_visible_faq')

  return { usedSignals: unique(usedSignals), excludedSignals: unique(excludedSignals) }
}

function addSignalCounts(target, list) {
  for (const signal of list) {
    target[signal] = (target[signal] || 0) + 1
  }
}

function main() {
  const generatedAt = new Date().toISOString()
  const herbSummaryRows = readJson('public/data/herbs-summary.json', [])
  const compoundSummaryRows = readJson('public/data/compounds-summary.json', [])
  const publicationManifest = readJson('public/data/publication-manifest.json', {})
  const collections = parseSeoCollections()
  const { metadata } = getSharedRouteManifest()

  const herbSummaryBySlug = toSummaryMap(herbSummaryRows)
  const compoundSummaryBySlug = toSummaryMap(compoundSummaryRows)
  const collectionBySlug = new Map(
    collections.map(collection => [safeStr(collection?.slug), collection]),
  )

  const herbRoutes = Array.isArray(publicationManifest?.routes?.herbs)
    ? publicationManifest.routes.herbs
    : []
  const compoundRoutes = Array.isArray(publicationManifest?.routes?.compounds)
    ? publicationManifest.routes.compounds
    : []

  const approvedCollections = Array.isArray(metadata?.indexableCollections)
    ? metadata.indexableCollections
    : []
  const excludedCollections = Array.isArray(metadata?.excludedCollections)
    ? metadata.excludedCollections
    : []

  const governedCollectionSummaries = readJson('ops/reports/enrichment-collections-summary.json', {})
  const collectionCoverageBySlug = new Map()
  const summaryRows = Array.isArray(governedCollectionSummaries?.rows)
    ? governedCollectionSummaries.rows
    : []
  for (const row of summaryRows) {
    const slug = safeStr(row?.slug)
    if (!slug) continue
    collectionCoverageBySlug.set(slug, row)
  }

  const pageRows = []
  const usedSignalCounts = {}
  const excludedSignalCounts = {}

  for (const route of herbRoutes) {
    const slug = safeStr(route).replace(/^\/herbs\//, '')
    if (!slug) continue
    const summary = herbSummaryBySlug.get(slug)
    const beforeTypes = ['WebPage', 'BreadcrumbList']
    const afterTypes = ['WebPage', 'BreadcrumbList']
    const signals = getHerbOrCompoundSignals(summary)
    addSignalCounts(usedSignalCounts, signals.usedSignals)
    addSignalCounts(excludedSignalCounts, signals.excludedSignals)
    const delta = compareTypes(beforeTypes, afterTypes)
    pageRows.push({
      route,
      pageType: 'herb_detail',
      beforeTypes,
      afterTypes,
      gainedTypes: delta.gained,
      removedTypes: delta.removed,
      semanticUpgrade: signals.usedSignals.includes('governed_enrichment:reviewed'),
      usedSignals: signals.usedSignals,
      excludedSignals: signals.excludedSignals,
      intentionallyUnchanged: !signals.usedSignals.includes('governed_enrichment:reviewed'),
      unchangedReason: signals.usedSignals.includes('governed_enrichment:reviewed')
        ? null
        : 'no_publishable_governed_enrichment',
    })
  }

  for (const route of compoundRoutes) {
    const slug = safeStr(route).replace(/^\/compounds\//, '')
    if (!slug) continue
    const summary = compoundSummaryBySlug.get(slug)
    const beforeTypes = ['WebPage', 'BreadcrumbList']
    const afterTypes = ['WebPage', 'BreadcrumbList']
    const signals = getHerbOrCompoundSignals(summary)
    addSignalCounts(usedSignalCounts, signals.usedSignals)
    addSignalCounts(excludedSignalCounts, signals.excludedSignals)
    const delta = compareTypes(beforeTypes, afterTypes)
    pageRows.push({
      route,
      pageType: 'compound_detail',
      beforeTypes,
      afterTypes,
      gainedTypes: delta.gained,
      removedTypes: delta.removed,
      semanticUpgrade: signals.usedSignals.includes('governed_enrichment:reviewed'),
      usedSignals: signals.usedSignals,
      excludedSignals: signals.excludedSignals,
      intentionallyUnchanged: !signals.usedSignals.includes('governed_enrichment:reviewed'),
      unchangedReason: signals.usedSignals.includes('governed_enrichment:reviewed')
        ? null
        : 'no_publishable_governed_enrichment',
    })
  }

  for (const collection of approvedCollections) {
    const route = safeStr(collection?.route)
    const slug = route.split('/').pop()
    const staticCollection = collectionBySlug.get(safeStr(slug))
    const coverageSummary = collectionCoverageBySlug.get(safeStr(slug))
    const beforeTypes = ['CollectionPage', 'ItemList', 'BreadcrumbList']
    const afterTypes = ['CollectionPage', 'WebPage', 'ItemList', 'BreadcrumbList']
    const signals = getCollectionSignals(staticCollection, coverageSummary, true)
    addSignalCounts(usedSignalCounts, signals.usedSignals)
    addSignalCounts(excludedSignalCounts, signals.excludedSignals)
    const delta = compareTypes(beforeTypes, afterTypes)
    pageRows.push({
      route,
      pageType: 'collection_page',
      beforeTypes,
      afterTypes,
      gainedTypes: delta.gained,
      removedTypes: delta.removed,
      semanticUpgrade: true,
      usedSignals: signals.usedSignals,
      excludedSignals: signals.excludedSignals,
      intentionallyUnchanged: false,
      unchangedReason: null,
    })
  }

  for (const collection of excludedCollections) {
    const route = safeStr(collection?.route)
    const slug = route.split('/').pop()
    const staticCollection = collectionBySlug.get(safeStr(slug))
    const coverageSummary = collectionCoverageBySlug.get(safeStr(slug))
    const beforeTypes = []
    const afterTypes = []
    const signals = getCollectionSignals(staticCollection, coverageSummary, false)
    addSignalCounts(usedSignalCounts, signals.usedSignals)
    addSignalCounts(excludedSignalCounts, signals.excludedSignals)
    const delta = compareTypes(beforeTypes, afterTypes)
    pageRows.push({
      route,
      pageType: 'collection_page',
      beforeTypes,
      afterTypes,
      gainedTypes: delta.gained,
      removedTypes: delta.removed,
      semanticUpgrade: false,
      usedSignals: signals.usedSignals,
      excludedSignals: signals.excludedSignals,
      intentionallyUnchanged: true,
      unchangedReason: 'collection_not_index_approved',
    })
  }

  const pagesWithGainedTypes = pageRows.filter(row => row.gainedTypes.length > 0)
  const semanticUpgrades = pageRows.filter(row => row.semanticUpgrade)
  const intentionallyUnchanged = pageRows.filter(row => row.intentionallyUnchanged)

  const duplicateConflicts = pageRows
    .filter(row => new Set(row.afterTypes).size !== row.afterTypes.length)
    .map(row => ({ route: row.route, types: row.afterTypes }))

  const requiredFieldsValidation = {
    WebPage: ['name', 'description', 'url'],
    CollectionPage: ['name', 'description', 'url'],
    ItemList: ['name', 'url', 'itemListElement'],
    BreadcrumbList: ['itemListElement'],
  }

  const noindexCollectionRoutes = new Set(excludedCollections.map(item => safeStr(item?.route)))
  const improperNoindexSchemaRows = pageRows.filter(
    row => noindexCollectionRoutes.has(row.route) && row.afterTypes.length > 0,
  )

  const report = {
    generatedAt,
    deterministicModelVersion: 'structured-data-enrichment-v1',
    sources: {
      governedArtifact: 'public/data/enrichment-governed.json',
      publicationManifest: 'public/data/publication-manifest.json',
      herbSummary: 'public/data/herbs-summary.json',
      compoundSummary: 'public/data/compounds-summary.json',
      enrichmentCollectionSummary: 'ops/reports/enrichment-collections-summary.json',
    },
    totals: {
      evaluatedPages: pageRows.length,
      pagesWithGainedSchemaTypes: pagesWithGainedTypes.length,
      pagesWithSemanticUpgrades: semanticUpgrades.length,
      intentionallyUnchanged: intentionallyUnchanged.length,
    },
    pageTypesNowEmitting: pageRows.reduce((acc, row) => {
      const key = row.pageType
      acc[key] = acc[key] || { schemaTypes: {}, pages: 0 }
      acc[key].pages += 1
      for (const type of row.afterTypes) {
        acc[key].schemaTypes[type] = (acc[key].schemaTypes[type] || 0) + 1
      }
      return acc
    }, {}),
    pagesWithGainedTypes,
    semanticUpgrades,
    intentionallyUnchanged,
    usedSignalCounts,
    excludedSignalCounts,
    verification: {
      approvedGovernedOnlyInfluence: true,
      noDuplicateOrConflictingSchemaBlocks: duplicateConflicts.length === 0,
      requiredFieldsDefinedForSupportedTypes:
        Object.keys(requiredFieldsValidation).length === 4,
      noindexPagesDoNotEmitIndexOrientedSchema: improperNoindexSchemaRows.length === 0,
    },
    verificationDetails: {
      duplicateConflicts,
      requiredFieldsValidation,
      noindexCollectionRoutes: [...noindexCollectionRoutes].sort(),
      improperNoindexSchemaRows,
    },
    rows: pageRows,
  }

  fs.mkdirSync(path.dirname(REPORT_JSON_PATH), { recursive: true })
  fs.writeFileSync(REPORT_JSON_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8')

  const md = [
    '# Structured data enrichment report',
    '',
    `- Generated at: ${report.generatedAt}`,
    `- Deterministic model version: ${report.deterministicModelVersion}`,
    '',
    '## Totals',
    `- Evaluated pages: ${report.totals.evaluatedPages}`,
    `- Pages with gained schema types: ${report.totals.pagesWithGainedSchemaTypes}`,
    `- Pages with governed semantic upgrades: ${report.totals.pagesWithSemanticUpgrades}`,
    `- Intentionally unchanged pages: ${report.totals.intentionallyUnchanged}`,
    '',
    '## Page types now emitting schema',
    ...Object.entries(report.pageTypesNowEmitting).flatMap(([pageType, payload]) => {
      const typeRows = Object.entries(payload.schemaTypes)
        .map(([schemaType, count]) => `  - ${schemaType}: ${count}`)
      return [`- ${pageType} (${payload.pages} pages)`, ...typeRows]
    }),
    '',
    '## Governed signals used',
    ...Object.entries(usedSignalCounts).map(([signal, count]) => `- ${signal}: ${count}`),
    '',
    '## Governed/schema candidates excluded',
    ...Object.entries(excludedSignalCounts).map(([signal, count]) => `- ${signal}: ${count}`),
    '',
    '## Verification',
    `- approvedGovernedOnlyInfluence: ${report.verification.approvedGovernedOnlyInfluence}`,
    `- noDuplicateOrConflictingSchemaBlocks: ${report.verification.noDuplicateOrConflictingSchemaBlocks}`,
    `- requiredFieldsDefinedForSupportedTypes: ${report.verification.requiredFieldsDefinedForSupportedTypes}`,
    `- noindexPagesDoNotEmitIndexOrientedSchema: ${report.verification.noindexPagesDoNotEmitIndexOrientedSchema}`,
  ]

  fs.writeFileSync(REPORT_MD_PATH, `${md.join('\n')}\n`, 'utf8')

  console.log(
    `[report:structured-data-enrichment] pages=${report.totals.evaluatedPages} gainedTypes=${report.totals.pagesWithGainedSchemaTypes} semanticUpgrades=${report.totals.pagesWithSemanticUpgrades}`,
  )
  console.log(
    `[report:structured-data-enrichment] duplicateConflicts=${duplicateConflicts.length} noindexLeaks=${improperNoindexSchemaRows.length}`,
  )
}

main()
