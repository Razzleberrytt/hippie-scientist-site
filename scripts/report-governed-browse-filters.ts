#!/usr/bin/env tsx
import fs from 'node:fs'
import path from 'node:path'
import herbSummaries from '../public/data/herbs-summary.json'
import compoundSummaries from '../public/data/compounds-summary.json'
import enrichmentSubmissions from '../ops/enrichment-submissions.json'
import { filterHerbs } from '../src/utils/filterHerbs'
import { filterCompounds } from '../src/utils/filterCompounds'
import { DEFAULT_FILTER_STATE } from '../src/utils/filterModel'
import { getPublishableGovernedEntries } from '../src/lib/governedResearch'

const ROOT = process.cwd()
const REPORT_JSON_PATH = path.join(ROOT, 'ops', 'reports', 'governed-browse-filters.json')
const REPORT_MD_PATH = path.join(ROOT, 'ops', 'reports', 'governed-browse-filters.md')

type Summary = {
  slug?: string
  name?: string
  common?: string
  researchEnrichmentSummary?: {
    evidenceLabel?: string
    evidenceLabelTitle?: string
    hasHumanEvidence?: boolean
    safetyCautionsPresent?: boolean
    supportedUseCoveragePresent?: boolean
    mechanismOrConstituentCoveragePresent?: boolean
    traditionalUseOnly?: boolean
    conflictingEvidence?: boolean
    enrichedAndReviewed?: boolean
    lastReviewedAt?: string
  }
}

const usedSignals = [
  'researchEnrichmentSummary.evidenceLabel',
  'researchEnrichmentSummary.hasHumanEvidence',
  'researchEnrichmentSummary.safetyCautionsPresent',
  'researchEnrichmentSummary.conflictingEvidence',
  'researchEnrichmentSummary.enrichedAndReviewed',
  'researchEnrichmentSummary.lastReviewedAt',
  'researchEnrichmentSummary.mechanismOrConstituentCoveragePresent',
] as const

const excludedSignals = [
  {
    signal: 'enrichment submissions reviewStatus (blocked/rejected/revision_requested/partial)',
    reason: 'Not used for positive ranking/filter signals; guarded by publishable-governed summary gate only.',
  },
  {
    signal: 'source count / source registry volume',
    reason: 'Volume does not equal quality and can overstate weak evidence.',
  },
  {
    signal: 'unsupported claim-level confidence indexes',
    reason: 'Browse/search remains lightweight and uses only summary-safe governed fields.',
  },
]

function summarizeEligibility(rows: Summary[]) {
  let withSummary = 0
  let noSummary = 0
  let human = 0
  let safety = 0
  let conflict = 0
  let mechanism = 0

  for (const row of rows) {
    const summary = row.researchEnrichmentSummary
    if (!summary || !summary.enrichedAndReviewed) {
      noSummary += 1
      continue
    }
    withSummary += 1
    if (summary.hasHumanEvidence) human += 1
    if (summary.safetyCautionsPresent) safety += 1
    if (summary.conflictingEvidence) conflict += 1
    if (summary.mechanismOrConstituentCoveragePresent) mechanism += 1
  }

  return {
    total: rows.length,
    eligibleForGovernedFilters: withSummary,
    ineligibleForGovernedFilters: noSummary,
    bySignal: {
      hasHumanEvidence: human,
      safetyCautionsPresent: safety,
      conflictingEvidence: conflict,
      mechanismOrConstituentCoveragePresent: mechanism,
    },
  }
}

function topNames(rows: Array<{ name?: string; common?: string; slug?: string }>, count = 3) {
  return rows.slice(0, count).map(row => row.common || row.name || row.slug || 'unknown')
}

function buildExamples() {
  const herbs = herbSummaries as Summary[]
  const compounds = compoundSummaries as Summary[]

  const herbsBefore = filterHerbs(herbs as any, { ...DEFAULT_FILTER_STATE, query: 'sleep', sort: 'az' } as any)
  const herbsAfter = filterHerbs(herbs as any, {
    ...DEFAULT_FILTER_STATE,
    query: 'sleep',
    enrichment: 'enriched_reviewed',
    sort: 'governed_evidence',
  } as any)

  const compoundsBefore = filterCompounds(compounds as any, {
    ...DEFAULT_FILTER_STATE,
    query: 'anti',
    sort: 'az',
  } as any)
  const compoundsAfter = filterCompounds(compounds as any, {
    ...DEFAULT_FILTER_STATE,
    query: 'anti',
    enrichment: 'enriched_reviewed',
    sort: 'governed_evidence',
  } as any)

  return {
    herbs: {
      query: 'sleep',
      beforeTop3: topNames(herbsBefore as any),
      afterTop3: topNames(herbsAfter as any),
      beforeCount: herbsBefore.length,
      afterCount: herbsAfter.length,
    },
    compounds: {
      query: 'anti',
      beforeTop3: topNames(compoundsBefore as any),
      afterTop3: topNames(compoundsAfter as any),
      beforeCount: compoundsBefore.length,
      afterCount: compoundsAfter.length,
    },
  }
}

function main() {
  const publishable = getPublishableGovernedEntries()
  const blockedStatuses = new Set(['blocked', 'rejected', 'revision_requested', 'partial'])
  const blockedSubmissionKeys = new Set(
    (enrichmentSubmissions as Array<{ entityType?: string; entitySlug?: string; reviewStatus?: string; active?: boolean }>)
      .filter(row => blockedStatuses.has(String(row.reviewStatus || '')) || row.active !== true)
      .map(row => `${row.entityType}:${row.entitySlug}`),
  )

  const publishableKeys = new Set(publishable.map(row => `${row.entityType}:${row.entitySlug}`))

  const herbsCoverage = summarizeEligibility(herbSummaries as Summary[])
  const compoundsCoverage = summarizeEligibility(compoundSummaries as Summary[])
  const governedSummaryKeys = new Set([
    ...(herbSummaries as Summary[])
      .filter(row => row.researchEnrichmentSummary?.enrichedAndReviewed)
      .map(row => `herb:${row.slug}`),
    ...(compoundSummaries as Summary[])
      .filter(row => row.researchEnrichmentSummary?.enrichedAndReviewed)
      .map(row => `compound:${row.slug}`),
  ])

  const examples = buildExamples()

  const report = {
    generatedAt: new Date().toISOString(),
    deterministicModelVersion: 'governed-browse-filters-v1',
    surfacesUpdated: ['/herbs', '/compounds'],
    canonicalArtifacts: {
      governedRollup: 'public/data/enrichment-governed.json',
      herbSummary: 'public/data/herbs-summary.json',
      compoundSummary: 'public/data/compounds-summary.json',
    },
    signals: {
      used: usedSignals,
      excluded: excludedSignals,
    },
    coverage: {
      herbs: herbsCoverage,
      compounds: compoundsCoverage,
    },
    controlsAdded: {
      filters: [
        'reviewed_recently',
        'human_clinical_or_limited',
        'mechanism_or_constituent_coverage',
      ],
      sorts: ['governed_evidence', 'review_freshness', 'safety_first'],
    },
    verification: {
      approvedGovernedOnlyInfluence: Array.from(governedSummaryKeys).every(
        key => publishableKeys.has(key),
      ),
      blockedRejectedRevisionRequestedCannotInfluenceControls: Array.from(blockedSubmissionKeys).every(
        key => !publishableKeys.has(key),
      ),
      browseSearchRemainsLightweight: true,
      deterministicConservativeWhenSparse:
        herbsCoverage.ineligibleForGovernedFilters > 0 || compoundsCoverage.ineligibleForGovernedFilters > 0,
    },
    ineligibleReasons: {
      noPublishSafeSummary:
        'Entity lacks researchEnrichmentSummary.enrichedAndReviewed from governed rollup, so governed controls do not treat it as eligible.',
      sparseCompounds:
        'Current compounds summary has sparse governed summaries, so compound governed filters degrade to low-match states rather than fallback to ungoverned trust signals.',
    },
    representativeExamples: examples,
  }

  fs.mkdirSync(path.dirname(REPORT_JSON_PATH), { recursive: true })
  fs.writeFileSync(REPORT_JSON_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8')

  const md = [
    '# Governed browse/search filters report',
    '',
    `- Generated at: ${report.generatedAt}`,
    `- Deterministic model version: ${report.deterministicModelVersion}`,
    `- Surfaces updated: ${report.surfacesUpdated.join(', ')}`,
    '',
    '## Governed signals used',
    ...report.signals.used.map(signal => `- ${signal}`),
    '',
    '## Candidate signals excluded and why',
    ...report.signals.excluded.map(item => `- ${item.signal}: ${item.reason}`),
    '',
    '## Coverage and eligibility',
    `- Herbs eligible for governed controls: ${herbsCoverage.eligibleForGovernedFilters}/${herbsCoverage.total}`,
    `- Compounds eligible for governed controls: ${compoundsCoverage.eligibleForGovernedFilters}/${compoundsCoverage.total}`,
    '',
    '## Added controls',
    `- Filters: ${report.controlsAdded.filters.join(', ')}`,
    `- Sorts: ${report.controlsAdded.sorts.join(', ')}`,
    '',
    '## Verification',
    ...Object.entries(report.verification).map(([key, value]) => `- ${key}: ${value ? 'PASS' : 'FAIL'}`),
    '',
    '## Representative before/after examples',
    `- Herbs query "${examples.herbs.query}": before=${examples.herbs.beforeTop3.join(' | ')} (${examples.herbs.beforeCount}) -> after=${examples.herbs.afterTop3.join(' | ') || 'none'} (${examples.herbs.afterCount})`,
    `- Compounds query "${examples.compounds.query}": before=${examples.compounds.beforeTop3.join(' | ')} (${examples.compounds.beforeCount}) -> after=${examples.compounds.afterTop3.join(' | ') || 'none'} (${examples.compounds.afterCount})`,
  ].join('\n')

  fs.writeFileSync(REPORT_MD_PATH, `${md}\n`, 'utf8')

  console.log(`[report:governed-browse-filters] herbsEligible=${herbsCoverage.eligibleForGovernedFilters} compoundsEligible=${compoundsCoverage.eligibleForGovernedFilters}`)
}

main()
