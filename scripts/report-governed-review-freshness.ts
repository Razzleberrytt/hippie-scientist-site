#!/usr/bin/env tsx
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import publicationManifest from '../public/data/publication-manifest.json'
import submissions from '../ops/enrichment-submissions.json'
import { getGovernedResearchEnrichment, type GovernedEntityType } from '../src/lib/governedResearch'
import { buildGovernedReviewFreshness } from '../src/lib/governedReviewFreshness'

type EntityType = 'herb' | 'compound'
type DetailRow = Record<string, unknown>

type VisibilityRow = {
  entityType: EntityType
  entitySlug: string
  route: string
  beforeVisible: boolean
  afterVisible: boolean
  statusAfter: string
  reviewedLabelAfter: string | null
  usedSignals: string[]
  excludedSignals: Array<{ signal: string; reason: string }>
  intentionallyUnchangedReason?: string
  whatChangedRecently: string[]
}

const ROOT = process.cwd()
const REPORT_JSON_PATH = path.join(ROOT, 'ops', 'reports', 'governed-review-freshness.json')
const REPORT_MD_PATH = path.join(ROOT, 'ops', 'reports', 'governed-review-freshness.md')

const BLOCKED_REVIEW_STATUSES = new Set([
  'blocked',
  'rejected',
  'revision_requested',
  'ready_for_review',
  'draft_submission',
  'under_review',
  'needs_validation_fix',
])

const INPUT_ARTIFACTS = [
  'public/data/enrichment-governed.json',
  'public/data/enrichment-submissions-governed-input.jsonl',
  'ops/enrichment-submissions.json',
  'ops/reports/enrichment-health.json',
  'ops/reports/enrichment-backlog.json',
  'ops/reports/enrichment-review-cycle.json',
  'ops/reports/enrichment-workpacks.json',
  'ops/reports/homepage-enrichment-refresh.json',
  'ops/reports/structured-data-enrichment.json',
  'ops/reports/governed-intro-refresh.json',
  'ops/reports/governed-faq-refresh.json',
  'ops/reports/governed-related-questions.json',
  'ops/reports/governed-quick-compare.json',
  'ops/reports/governed-cta-refresh.json',
]

function asString(value: unknown) {
  return String(value || '').trim()
}

function routeFor(entityType: EntityType, slug: string) {
  return entityType === 'herb' ? `/herbs/${slug}` : `/compounds/${slug}`
}

function readDetail(entityType: EntityType, slug: string): DetailRow | null {
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

function artifactStatus(relativePath: string) {
  const filePath = path.join(ROOT, relativePath)
  if (!fs.existsSync(filePath)) return { path: relativePath, status: 'missing' as const }
  const stat = fs.statSync(filePath)
  return { path: relativePath, status: 'present' as const, modifiedAt: stat.mtime.toISOString() }
}

function unchangedReason(row: ReturnType<typeof buildGovernedReviewFreshness>) {
  if (row.mode === 'hidden') {
    return 'no_publishable_governed_enrichment'
  }
  if (row.state === 'partial') {
    return 'partial_governed_coverage_kept_conservative'
  }
  return undefined
}

function main() {
  const routes = (publicationManifest as Record<string, unknown>).routes as
    | Record<string, string[]>
    | undefined
  const herbRoutes = routes?.herbs || []
  const compoundRoutes = routes?.compounds || []

  const rows: VisibilityRow[] = []

  for (const route of herbRoutes) {
    const slug = asString(route).replace(/^\/herbs\//, '')
    if (!slug) continue
    if (!readDetail('herb', slug)) continue

    const freshness = buildGovernedReviewFreshness(getGovernedResearchEnrichment('herb', slug))
    rows.push({
      entityType: 'herb',
      entitySlug: slug,
      route: routeFor('herb', slug),
      beforeVisible: false,
      afterVisible: freshness.mode === 'governed',
      statusAfter: freshness.statusLabel,
      reviewedLabelAfter: freshness.mode === 'governed' ? freshness.reviewedLabel : null,
      usedSignals: freshness.usedSignals,
      excludedSignals: freshness.excludedSignals,
      intentionallyUnchangedReason: unchangedReason(freshness),
      whatChangedRecently: freshness.whatChangedRecently,
    })
  }

  for (const route of compoundRoutes) {
    const slug = asString(route).replace(/^\/compounds\//, '')
    if (!slug) continue
    if (!readDetail('compound', slug)) continue

    const freshness = buildGovernedReviewFreshness(getGovernedResearchEnrichment('compound', slug))
    rows.push({
      entityType: 'compound',
      entitySlug: slug,
      route: routeFor('compound', slug),
      beforeVisible: false,
      afterVisible: freshness.mode === 'governed',
      statusAfter: freshness.statusLabel,
      reviewedLabelAfter: freshness.mode === 'governed' ? freshness.reviewedLabel : null,
      usedSignals: freshness.usedSignals,
      excludedSignals: freshness.excludedSignals,
      intentionallyUnchangedReason: unchangedReason(freshness),
      whatChangedRecently: freshness.whatChangedRecently,
    })
  }

  const gained = rows.filter(row => row.afterVisible)
  const unchanged = rows.filter(row => !row.afterVisible || row.intentionallyUnchangedReason)

  const candidateSignalsExcluded = [
    {
      signal: 'blocked_or_rejected_submission_status',
      reason: 'status is not publish-approved and must not influence user-facing freshness messaging',
    },
    {
      signal: 'revision_requested_or_under_review',
      reason: 'internal workflow stage is non-publishable and intentionally excluded from runtime copy',
    },
    {
      signal: 'operator_queue_or_workpack_metadata',
      reason: 'ops-only planning detail; not needed for compact page trust signals',
    },
  ]

  const blockedSubmissionKeys = new Set(
    (
      submissions as Array<{
        entityType: GovernedEntityType
        entitySlug: string
        reviewStatus: string
        active?: boolean
      }>
    )
      .filter(row => BLOCKED_REVIEW_STATUSES.has(asString(row.reviewStatus)) || row.active !== true)
      .map(row => `${row.entityType}:${row.entitySlug}`),
  )

  const blockedLeaks = Array.from(blockedSubmissionKeys).filter(key => {
    const [entityType, slug] = key.split(':') as [GovernedEntityType, string]
    const freshness = buildGovernedReviewFreshness(getGovernedResearchEnrichment(entityType, slug))
    return freshness.mode === 'governed'
  })

  assert.equal(blockedLeaks.length, 0, `Blocked/unapproved entries leaked freshness visibility: ${blockedLeaks.join(', ')}`)

  const report = {
    generatedAt: new Date().toISOString(),
    deterministicModelVersion: 'governed-review-freshness-v1',
    canonicalGovernedArtifact: 'public/data/enrichment-governed.json',
    canonicalGovernedInputArtifact: 'public/data/enrichment-submissions-governed-input.jsonl',
    inputArtifacts: INPUT_ARTIFACTS.map(artifactStatus),
    totals: {
      evaluatedPages: rows.length,
      pagesGainedVisibility: gained.length,
      herbsGainedVisibility: gained.filter(row => row.entityType === 'herb').length,
      compoundsGainedVisibility: gained.filter(row => row.entityType === 'compound').length,
      pagesIntentionallyUnchanged: unchanged.length,
    },
    usedSignals: Array.from(new Set(gained.flatMap(row => row.usedSignals))).sort(),
    candidateSignalsExcluded,
    pagesGainedVisibility: gained,
    pagesIntentionallyUnchanged: unchanged,
    representativeExamples: {
      before: {
        reviewedRowVisible: false,
        whatChangedVisible: false,
        text: 'No governed review freshness row shown.',
      },
      after: gained.slice(0, 4).map(row => ({
        route: row.route,
        status: row.statusAfter,
        reviewed: row.reviewedLabelAfter,
        whatChangedRecently: row.whatChangedRecently,
      })),
    },
    verification: {
      blockedOrRejectedLeaks: blockedLeaks,
      blockedKeyCount: blockedSubmissionKeys.size,
      passed: blockedLeaks.length === 0,
    },
  }

  fs.writeFileSync(REPORT_JSON_PATH, `${JSON.stringify(report, null, 2)}\n`)

  const md = [
    '# Governed review freshness report',
    '',
    `Generated: ${report.generatedAt}`,
    '',
    '## Summary',
    `- Evaluated pages: ${report.totals.evaluatedPages}`,
    `- Pages that gained governed freshness visibility: ${report.totals.pagesGainedVisibility}`,
    `- Herbs gained visibility: ${report.totals.herbsGainedVisibility}`,
    `- Compounds gained visibility: ${report.totals.compoundsGainedVisibility}`,
    `- Intentionally unchanged pages: ${report.totals.pagesIntentionallyUnchanged}`,
    '',
    '## Signals used',
    ...report.usedSignals.map(signal => `- ${signal}`),
    '',
    '## Candidate signals excluded (and why)',
    ...report.candidateSignalsExcluded.map(signal => `- ${signal.signal}: ${signal.reason}`),
    '',
    '## Pages that gained freshness visibility',
    '| route | status | reviewed | what changed recently |',
    '| --- | --- | --- | --- |',
    ...report.pagesGainedVisibility.map(
      row =>
        `| ${row.route} | ${row.statusAfter} | ${row.reviewedLabelAfter || 'n/a'} | ${row.whatChangedRecently
          .slice(0, 2)
          .join(' / ')} |`,
    ),
    '',
    '## Pages intentionally unchanged',
    '| route | reason |',
    '| --- | --- |',
    ...report.pagesIntentionallyUnchanged.map(
      row => `| ${row.route} | ${row.intentionallyUnchangedReason || 'no_visibility_change_required'} |`,
    ),
    '',
    '## Verification',
    `- Blocked/unapproved leakage checks passed: ${report.verification.passed ? 'yes' : 'no'}`,
    `- Blocked keys evaluated: ${report.verification.blockedKeyCount}`,
    '',
    '## Representative before/after examples',
    `- Before: ${report.representativeExamples.before.text}`,
    ...report.representativeExamples.after.map(
      row => `- After ${row.route}: ${row.status}; ${row.reviewed}; ${row.whatChangedRecently[0]}`,
    ),
  ]

  fs.writeFileSync(REPORT_MD_PATH, `${md.join('\n')}\n`)

  console.log(
    `[report:governed-review-freshness] evaluated=${report.totals.evaluatedPages} gained=${report.totals.pagesGainedVisibility} unchanged=${report.totals.pagesIntentionallyUnchanged}`,
  )
}

main()
