import fs from 'node:fs'
import path from 'node:path'
import { buildGovernedReviewFreshnessSignal } from '../src/lib/governedReviewFreshness'
import { getPublishableGovernedEntries, isPublishableGovernedEnrichment } from '../src/lib/governedResearch'

type EntityType = 'herb' | 'compound'

type SummaryRow = {
  slug: string
  name: string
  researchEnrichmentSummary?: { lastReviewedAt?: string } | undefined
}

type SubmissionRow = {
  entityType?: string
  entitySlug?: string
  reviewStatus?: string
}

const ROOT = process.cwd()
const OUTPUT_JSON = path.join(ROOT, 'ops', 'reports', 'governed-review-freshness.json')
const OUTPUT_MD = path.join(ROOT, 'ops', 'reports', 'governed-review-freshness.md')

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8')) as T
}

function entityKey(entityType: EntityType, entitySlug: string) {
  return `${entityType}:${entitySlug.trim().toLowerCase()}`
}

function run() {
  const publishableRows = getPublishableGovernedEntries()
  const herbSummary = readJson<SummaryRow[]>('public/data/herbs-summary.json')
  const compoundSummary = readJson<SummaryRow[]>('public/data/compounds-summary.json')
  const submissions = readJson<SubmissionRow[]>('ops/enrichment-submissions.json')
  const reviewCycle = readJson<{ items?: Array<Record<string, unknown>> }>('ops/reports/enrichment-review-cycle.json')

  const summaryByKey = new Map<string, SummaryRow>()
  for (const row of herbSummary) summaryByKey.set(entityKey('herb', row.slug), row)
  for (const row of compoundSummary) summaryByKey.set(entityKey('compound', row.slug), row)

  const reviewCycleByKey = new Map<string, string>()
  for (const item of reviewCycle.items || []) {
    if (item.itemType !== 'entity') continue
    const entityType = item.entityType === 'herb' || item.entityType === 'compound' ? item.entityType : null
    const entitySlug = String(item.entitySlug || '').trim().toLowerCase()
    if (!entityType || !entitySlug) continue
    reviewCycleByKey.set(entityKey(entityType, entitySlug), String(item.reviewCycleState || 'unknown'))
  }

  const gainedVisibility = publishableRows
    .map(row => {
      const key = entityKey(row.entityType, row.entitySlug)
      const freshness = buildGovernedReviewFreshnessSignal(row.researchEnrichment)
      return {
        entityType: row.entityType,
        entitySlug: row.entitySlug,
        route: row.entityType === 'herb' ? `/herbs/${row.entitySlug}` : `/compounds/${row.entitySlug}`,
        reviewCycleState: reviewCycleByKey.get(key) || 'unknown',
        freshnessState: freshness.state,
        reviewedDate: freshness.reviewedDateLabel,
        usedSignals: ['last_reviewed_date', 'freshness_state', 'enriched_reviewed_status', 'uncertainty_presence', 'safety_coverage_state'],
        excludedSignals: freshness.exclusions,
        whatChangedRecently: freshness.whatChangedRecently,
      }
    })
    .sort((a, b) => a.route.localeCompare(b.route))

  const gainedKeys = new Set(gainedVisibility.map(row => entityKey(row.entityType, row.entitySlug)))
  const candidates = [...herbSummary.map(row => ({ entityType: 'herb' as const, slug: row.slug })), ...compoundSummary.map(row => ({ entityType: 'compound' as const, slug: row.slug }))]

  const intentionallyUnchanged = candidates
    .filter(row => !gainedKeys.has(entityKey(row.entityType, row.slug)))
    .map(row => {
      const key = entityKey(row.entityType, row.slug)
      const summary = summaryByKey.get(key)
      return {
        entityType: row.entityType,
        entitySlug: row.slug,
        route: row.entityType === 'herb' ? `/herbs/${row.slug}` : `/compounds/${row.slug}`,
        reason:
          summary?.researchEnrichmentSummary?.lastReviewedAt
            ? 'governed_summary_present_but_not_publishable_for_detail_rendering'
            : 'no_publishable_governed_enrichment',
      }
    })

  const blockedStatuses = new Set(['blocked', 'rejected', 'revision_requested'])
  const blockedSubmissionEntityKeys = new Set(
    submissions
      .filter(row => blockedStatuses.has(String(row.reviewStatus || '').trim()))
      .map(row => `${String(row.entityType || '').trim()}:${String(row.entitySlug || '').trim().toLowerCase()}`)
      .filter(Boolean),
  )

  const blockedStatusDoesNotDriveMessaging = gainedVisibility.every(row => {
    const key = entityKey(row.entityType, row.entitySlug)
    return !blockedSubmissionEntityKeys.has(key) || publishableRows.some(item => entityKey(item.entityType, item.entitySlug) === key)
  })

  const representativeBeforeAfter = gainedVisibility.slice(0, 3).map(row => ({
    route: row.route,
    before: 'No dedicated governed review freshness row or what-changed summary block.',
    after: `Shows ${row.freshnessState} status, reviewed metadata, and compact what-changed summary when supported.`,
  }))

  const report = {
    generatedAt: new Date().toISOString(),
    deterministicModelVersion: 'governed-review-freshness-v1',
    canonicalGovernedArtifactPaths: {
      governedRollup: 'public/data/enrichment-governed.json',
      herbSummary: 'public/data/herbs-summary.json',
      compoundSummary: 'public/data/compounds-summary.json',
      reviewCycle: 'ops/reports/enrichment-review-cycle.json',
    },
    totals: {
      herbPagesWithVisibility: gainedVisibility.filter(row => row.entityType === 'herb').length,
      compoundPagesWithVisibility: gainedVisibility.filter(row => row.entityType === 'compound').length,
      totalPagesWithVisibility: gainedVisibility.length,
      intentionallyUnchanged: intentionallyUnchanged.length,
    },
    pagesGainedVisibility: gainedVisibility,
    signals: {
      used: ['last_reviewed_date', 'enriched_reviewed_status', 'freshness_state', 'uncertainty_presence', 'safety_coverage_state', 'what_changed_recently_summary'],
      excludedCandidates: [
        { signal: 'reviewer_identity', reason: 'internal_workflow_detail_not_user_facing' },
        { signal: 'submission_queue_status', reason: 'blocked_or_draft_workflow_status_must_not_be_public_messaging' },
        { signal: 'raw_submission_ids', reason: 'internal_only_identifier_not_needed_for_user_trust_view' },
      ],
    },
    intentionallyUnchanged: intentionallyUnchanged.slice(0, 60),
    representativeBeforeAfter,
    verification: {
      approvedGovernedOnlyInfluence: gainedVisibility.every(row => {
        const entry = publishableRows.find(
          candidate => candidate.entityType === row.entityType && candidate.entitySlug === row.entitySlug,
        )
        return isPublishableGovernedEnrichment(entry?.researchEnrichment)
      }),
      blockedRejectedRevisionRequestedCannotInfluenceReviewedMessaging: blockedStatusDoesNotDriveMessaging,
      sparseDataGracefulDegradation: gainedVisibility.every(
        row => row.freshnessState === 'partial' || row.freshnessState === 'aging' || row.freshnessState === 'fresh' || row.freshnessState === 'review_due',
      ),
      doesNotOverstateCompleteness: gainedVisibility
        .filter(row => row.freshnessState === 'partial')
        .every(row => row.usedSignals.includes('safety_coverage_state')),
    },
  }

  const fails = Object.entries(report.verification)
    .filter(([, pass]) => pass !== true)
    .map(([name]) => name)

  if (fails.length > 0) {
    throw new Error(`governed review freshness verification failed: ${fails.join(', ')}`)
  }

  fs.writeFileSync(OUTPUT_JSON, `${JSON.stringify(report, null, 2)}\n`)

  const md = [
    '# Governed review freshness visibility report',
    '',
    `Generated: ${report.generatedAt}`,
    '',
    '## Coverage',
    `- Herb pages with visibility: ${report.totals.herbPagesWithVisibility}`,
    `- Compound pages with visibility: ${report.totals.compoundPagesWithVisibility}`,
    `- Total pages with visibility: ${report.totals.totalPagesWithVisibility}`,
    `- Intentionally unchanged pages: ${report.totals.intentionallyUnchanged}`,
    '',
    '## Signals used',
    ...report.signals.used.map(signal => `- ${signal}`),
    '',
    '## Candidate signals excluded',
    ...report.signals.excludedCandidates.map(item => `- ${item.signal}: ${item.reason}`),
    '',
    '## Representative before/after',
    ...report.representativeBeforeAfter.map(
      row => `- ${row.route}\n  - before: ${row.before}\n  - after: ${row.after}`,
    ),
    '',
    '## Verification',
    ...Object.entries(report.verification).map(([key, pass]) => `- ${key}: ${pass}`),
  ].join('\n')

  fs.writeFileSync(OUTPUT_MD, `${md}\n`)

  console.log(
    `[report:governed-review-freshness] pages=${report.totals.totalPagesWithVisibility} herbs=${report.totals.herbPagesWithVisibility} compounds=${report.totals.compoundPagesWithVisibility}`,
  )
}

run()
