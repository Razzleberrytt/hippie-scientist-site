import fs from 'node:fs'
import path from 'node:path'
import { SEO_COLLECTIONS } from '../src/data/seoCollections'
import { filterCompoundByCollection, filterHerbByCollection } from '../src/lib/collectionQuality'
import { buildGovernedCollectionSummary } from '../src/lib/collectionEnrichment'
import { getPublishableGovernedEntries } from '../src/lib/governedResearch'

const ROOT = process.cwd()
const HERBS_PATH = path.join(ROOT, 'public', 'data', 'herbs.json')
const COMPOUNDS_PATH = path.join(ROOT, 'public', 'data', 'compounds.json')
const OUTPUT_PATH = path.join(ROOT, 'ops', 'reports', 'enrichment-collections-summary.json')

function readRows(filePath: string) {
  if (!fs.existsSync(filePath)) return [] as Record<string, unknown>[]
  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  return Array.isArray(parsed) ? (parsed as Record<string, unknown>[]) : []
}

const herbs = readRows(HERBS_PATH)
const compounds = readRows(COMPOUNDS_PATH)

const contexts = SEO_COLLECTIONS.map(collection => {
  if (collection.itemType === 'combo') {
    return {
      contextType: 'collection',
      contextSlug: collection.slug,
      itemType: collection.itemType,
      enrichmentEligible: false,
      ineligibleReasons: ['combo-collections-not-yet-governed'],
      activeSignals: [] as string[],
      includedCount: 0,
      governedReviewedCount: 0,
      nonGovernedCount: 0,
    }
  }

  const entities =
    collection.itemType === 'herb'
      ? herbs
          .filter(herb => filterHerbByCollection(herb, collection.filters))
          .map(herb => ({
            entityType: 'herb' as const,
            entitySlug: String(herb.slug || ''),
            entityName: String(herb.common || herb.scientific || herb.name || herb.slug || ''),
          }))
      : compounds
          .filter(compound => filterCompoundByCollection(compound, collection.filters))
          .map(compound => ({
            entityType: 'compound' as const,
            entitySlug: String(compound.slug || ''),
            entityName: String(compound.name || compound.slug || ''),
          }))

  const summary = buildGovernedCollectionSummary(entities.filter(entity => entity.entitySlug))

  return {
    contextType: 'collection',
    contextSlug: collection.slug,
    itemType: collection.itemType,
    enrichmentEligible: summary.allowComparativeHighlights,
    ineligibleReasons: summary.degradeReasons,
    activeSignals: [
      'evidence_label_distribution',
      'safety_interactions_present',
      'mechanism_constituent_coverage',
      'enriched_reviewed_count',
      'uncertainty_conflict_count',
      ...(summary.lastReviewedAtMostRecent ? ['last_reviewed_metadata'] : []),
    ],
    includedCount: summary.includedCount,
    governedReviewedCount: summary.governedReviewedCount,
    nonGovernedCount: summary.nonGovernedCount,
  }
})

const comparisonCandidates = getPublishableGovernedEntries()
  .filter(entry => entry.entityType === 'herb')
  .slice(0, 3)
  .map(entry => ({
    entityType: entry.entityType,
    entitySlug: entry.entitySlug,
    entityName: entry.entitySlug,
  }))

const comparisonSummary = buildGovernedCollectionSummary(comparisonCandidates)

const output = {
  generatedAt: new Date().toISOString(),
  policy: {
    governedSource: 'public/data/enrichment-governed.json',
    allowedEditorialStatuses: ['approved', 'published'],
    excludeUnreviewedOrBlocked: true,
    sparseCoverageDegradesComparisons: true,
  },
  contexts: [
    ...contexts,
    {
      contextType: 'comparison',
      contextSlug: 'compare-page-herb-selection',
      itemType: 'herb',
      enrichmentEligible: comparisonSummary.allowComparativeHighlights,
      ineligibleReasons: comparisonSummary.degradeReasons,
      activeSignals: [
        'evidence_label_distribution',
        'safety_interactions_present',
        'mechanism_constituent_coverage',
        'enriched_reviewed_count',
        'uncertainty_conflict_count',
      ],
      includedCount: comparisonSummary.includedCount,
      governedReviewedCount: comparisonSummary.governedReviewedCount,
      nonGovernedCount: comparisonSummary.nonGovernedCount,
    },
  ],
}

fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true })
fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`)

const allContexts = output.contexts
const eligible = allContexts.filter(context => context.enrichmentEligible).length
const ineligible = allContexts.length - eligible
console.log(
  `[report-enrichment-collections-summary] wrote ${path.relative(ROOT, OUTPUT_PATH)} contexts=${allContexts.length} eligible=${eligible} ineligible=${ineligible}`,
)
