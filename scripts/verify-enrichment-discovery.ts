import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'

type GovernedRow = {
  entityType: 'herb' | 'compound'
  entitySlug: string
  researchEnrichment: Record<string, any>
}

const ROOT = process.cwd()
const DATA_DIR = path.join(ROOT, 'public', 'data')
const REPORT_PATH = path.join(ROOT, 'ops', 'reports', 'enrichment-discovery-summary.json')

const PUBLISHABLE_EDITORIAL_STATUSES = new Set(['approved', 'published'])

const SUMMARY_KEYS = [
  'evidenceLabel',
  'evidenceLabelTitle',
  'hasHumanEvidence',
  'safetyCautionsPresent',
  'supportedUseCoveragePresent',
  'mechanismOrConstituentCoveragePresent',
  'traditionalUseOnly',
  'conflictingEvidence',
  'enrichedAndReviewed',
  'lastReviewedAt',
]

const EVIDENCE_LABEL_TITLES: Record<string, string> = {
  stronger_human_support: 'Stronger human support',
  limited_human_support: 'Limited human support',
  observational_only: 'Observational only',
  preclinical_only: 'Preclinical only',
  traditional_use_only: 'Traditional use only',
  mixed_or_uncertain: 'Mixed or uncertain',
  conflicting_evidence: 'Conflicting evidence',
  insufficient_evidence: 'Insufficient evidence',
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8')) as T
}

function slugify(value: string) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function isPublishableEnrichment(enrichment: Record<string, any>) {
  if (!enrichment || typeof enrichment !== 'object') return false
  if (!PUBLISHABLE_EDITORIAL_STATUSES.has(String(enrichment.editorialStatus || ''))) return false
  return enrichment.editorialReadiness?.publishable === true
}

function buildExpectedSummary(enrichment: Record<string, any>) {
  const evidenceLabel = String(enrichment?.pageEvidenceJudgment?.evidenceLabel || 'insufficient_evidence')
  const evidenceClasses = Array.isArray(enrichment.evidenceClassesPresent)
    ? enrichment.evidenceClassesPresent
    : []

  return {
    evidenceLabel,
    evidenceLabelTitle:
      EVIDENCE_LABEL_TITLES[evidenceLabel] || EVIDENCE_LABEL_TITLES.insufficient_evidence,
    hasHumanEvidence: evidenceClasses.some(
      (evidenceClass: string) =>
        evidenceClass === 'human-clinical' || evidenceClass === 'human-observational',
    ),
    safetyCautionsPresent:
      (enrichment?.safetyProfile?.summary?.total ?? 0) > 0 ||
      (Array.isArray(enrichment.interactions) && enrichment.interactions.length > 0) ||
      (Array.isArray(enrichment.contraindications) && enrichment.contraindications.length > 0) ||
      (Array.isArray(enrichment.adverseEffects) && enrichment.adverseEffects.length > 0),
    supportedUseCoveragePresent:
      (Array.isArray(enrichment.supportedUses) && enrichment.supportedUses.length > 0) ||
      (Array.isArray(enrichment.unsupportedOrUnclearUses) &&
        enrichment.unsupportedOrUnclearUses.length > 0),
    mechanismOrConstituentCoveragePresent:
      (Array.isArray(enrichment.mechanisms) && enrichment.mechanisms.length > 0) ||
      (Array.isArray(enrichment.constituents) && enrichment.constituents.length > 0),
    traditionalUseOnly: evidenceLabel === 'traditional_use_only',
    conflictingEvidence:
      evidenceLabel === 'conflicting_evidence' ||
      enrichment?.pageEvidenceJudgment?.grading?.conflictState === 'conflicting_evidence',
    enrichedAndReviewed: true,
    lastReviewedAt: String(enrichment.lastReviewedAt || ''),
  }
}

function verifySummaryPayloadWithGovernedSource(
  entityType: 'herb' | 'compound',
  rows: Array<Record<string, any>>,
  publishableByEntity: Map<string, Record<string, any>>,
) {
  for (const row of rows) {
    const slug = slugify(String(row.slug || row.id || ''))
    const key = `${entityType}:${slug}`
    const expectedEnrichment = publishableByEntity.get(key)
    const summary = row.researchEnrichmentSummary

    if (!expectedEnrichment) {
      assert.equal(summary, undefined, `Blocked/unreviewed enrichment leaked into ${key}`)
      continue
    }

    assert.ok(summary && typeof summary === 'object', `Missing governed summary for ${key}`)

    const extraKeys = Object.keys(summary).filter(keyName => !SUMMARY_KEYS.includes(keyName))
    assert.equal(extraKeys.length, 0, `Unexpected summary keys for ${key}: ${extraKeys.join(', ')}`)

    assert.deepEqual(summary, buildExpectedSummary(expectedEnrichment), `Summary mismatch for ${key}`)
  }
}

function verifySummaryShapeOnly(
  entityType: 'herb' | 'compound',
  rows: Array<Record<string, any>>,
) {
  for (const row of rows) {
    const slug = slugify(String(row.slug || row.id || ''))
    const key = `${entityType}:${slug}`
    const summary = row.researchEnrichmentSummary
    if (summary === undefined) continue

    assert.ok(summary && typeof summary === 'object', `Invalid governed summary payload for ${key}`)
    const extraKeys = Object.keys(summary).filter(keyName => !SUMMARY_KEYS.includes(keyName))
    assert.equal(extraKeys.length, 0, `Unexpected summary keys for ${key}: ${extraKeys.join(', ')}`)
  }
}

function run() {
  const herbSummary = readJson<Array<Record<string, any>>>('public/data/herbs-summary.json')
  const compoundSummary = readJson<Array<Record<string, any>>>('public/data/compounds-summary.json')
  const allRows = [...herbSummary, ...compoundSummary]
  const hasRuntimeGovernedSummaries = allRows.some(
    row => row.researchEnrichmentSummary && typeof row.researchEnrichmentSummary === 'object',
  )

  const publishableByEntity = new Map<string, Record<string, any>>()
  const ineligibleEntities: string[] = []

  if (hasRuntimeGovernedSummaries) {
    const governedRows = readJson<GovernedRow[]>('public/data/enrichment-governed.json')

    for (const row of governedRows) {
      const key = `${row.entityType}:${slugify(row.entitySlug)}`
      if (isPublishableEnrichment(row.researchEnrichment)) {
        publishableByEntity.set(key, row.researchEnrichment)
      } else {
        ineligibleEntities.push(key)
      }
    }

    verifySummaryPayloadWithGovernedSource('herb', herbSummary, publishableByEntity)
    verifySummaryPayloadWithGovernedSource('compound', compoundSummary, publishableByEntity)
  } else {
    verifySummaryShapeOnly('herb', herbSummary)
    verifySummaryShapeOnly('compound', compoundSummary)
  }

  const report = {
    generatedAt: new Date().toISOString(),
    contexts: [
      {
        context: 'herb_browse_search_list',
        dataSource: 'public/data/herbs-summary.json',
        fields: SUMMARY_KEYS,
        filters: [
          'enriched_reviewed',
          'has_human_evidence',
          'safety_cautions',
          'traditional_only',
          'conflicting_evidence',
        ],
      },
      {
        context: 'compound_browse_search_list',
        dataSource: 'public/data/compounds-summary.json',
        fields: SUMMARY_KEYS,
        filters: [
          'enriched_reviewed',
          'has_human_evidence',
          'safety_cautions',
          'traditional_only',
          'conflicting_evidence',
        ],
      },
    ],
    publishableEntityCount: publishableByEntity.size,
    runtimeSummaryEntityCount: allRows.filter(
      row => row.researchEnrichmentSummary && typeof row.researchEnrichmentSummary === 'object',
    ).length,
    verificationSource: hasRuntimeGovernedSummaries
      ? 'governed_rollup_parity'
      : 'runtime_summary_shape_only',
    ineligibleEntities,
  }

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true })
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8')

  console.log(
    `[verify-enrichment-discovery] PASS publishable=${publishableByEntity.size} ineligible=${ineligibleEntities.length}`,
  )
  console.log(`[verify-enrichment-discovery] report=${path.relative(ROOT, REPORT_PATH)}`)
}

run()
