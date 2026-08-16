/**
 * Pipeline step: collapse authored evidence signals into the canonical contract.
 *
 * The workbook carries two independently hand-filled columns — `evidence_grade`
 * (33 distinct spellings across 856 records) and `evidence_tier` — plus a
 * free-text study design on every claim (~140 spellings of ~12 designs). Every
 * downstream consumer, from the evidence badge to the search index, reads these
 * fields, so they are normalized once here rather than reinterpreted by each
 * template.
 *
 * This runs immediately after the workbook parse so that summary indexes,
 * export batches, and the search index are all built from canonical values.
 * It is idempotent: the authored grade and tier are preserved in
 * `evidence_grade_source` / `evidence_tier_source`, and every rerun reconciles
 * from those authored values rather than from its own normalized output.
 *
 * Usage: tsx scripts/data/normalize-evidence-grades.ts [--data-dir=public/data]
 */

import { mkdirSync, readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs'
import path from 'node:path'

import {
  BAND_LABEL,
  reconcileEvidenceGrade,
  type EvidenceReconciliation,
} from '../../lib/evidence-grade'
import {
  buildEvidenceRationale,
  gradeIsBackedByEvidence,
  type EvidenceRationale,
} from '../../lib/evidence-rationale'
import { buildProfileSummary, isPlaceholderSummary } from '../../lib/profile-summary'
import { normalizeStudyClass, strongestStudyClass, STUDY_CLASS_INFO } from '../../lib/study-class'

const ROOT = process.cwd()
const dataDirArg = process.argv.find((arg) => arg.startsWith('--data-dir='))
const DATA_DIR = path.resolve(ROOT, dataDirArg ? dataDirArg.split('=')[1] : 'public/data')
const REPORTS_DIR = path.join(ROOT, 'ops', 'reports')
const REPORT_PATH = path.join(REPORTS_DIR, 'evidence-grade-migration.json')

const PROFILE_SYNC_FIELDS = [
  'summary',
  'summary_source',
  'evidence_grade',
  'evidence_grade_source',
  'evidence_tier',
  'evidence_tier_source',
  'evidence_grade_band',
  'evidence_grade_reason',
  'evidence_grade_explanation',
  'evidence_grade_adjusted',
  'evidence_design_match',
  'evidence_risk_of_bias',
  'evidence_consistency',
  'evidence_rationale',
  'evidence_human_study_count',
  'evidence_recorded_study_count',
  'evidence_strongest_design',
  'evidence_grade_backed',
  'evidence_grade_backing_gap',
] as const

type Row = Record<string, unknown>

function readJson(file: string): Row[] {
  const full = path.join(DATA_DIR, file)
  if (!existsSync(full)) return []
  const parsed = JSON.parse(readFileSync(full, 'utf8'))
  return Array.isArray(parsed) ? parsed : []
}

function writeJson(file: string, rows: Row[]): void {
  writeFileSync(path.join(DATA_DIR, file), `${JSON.stringify(rows, null, 2)}\n`)
}

function syncDetailRecord(indexFile: string, row: Row): void {
  const slug = String(row.slug ?? '').trim()
  if (!slug) return

  const detailDir = indexFile === 'herbs.json'
    ? 'herbs-detail'
    : indexFile === 'compounds.json'
      ? 'compounds-detail'
      : null
  if (!detailDir) return

  const detailPath = path.join(DATA_DIR, detailDir, `${slug}.json`)
  if (!existsSync(detailPath)) return

  const detail = JSON.parse(readFileSync(detailPath, 'utf8')) as Row
  const nextDetail = { ...detail }
  for (const field of PROFILE_SYNC_FIELDS) {
    if (field in row) nextDetail[field] = row[field]
    else delete nextDetail[field]
  }
  writeFileSync(detailPath, `${JSON.stringify(nextDetail, null, 2)}\n`)
}

/**
 * Study designs for each profile's cited literature, taken from PubMed.
 *
 * `claims.json` reaches only 142 indexable profiles, and 201 of its 512 rows
 * record no design at all. The cited sources reach 318, and since
 * `fetch-pubmed-metadata.mjs` they carry PubMed's own publication types, which
 * are authoritative rather than inferred from a title. Combining both raises
 * the profiles that can show a rationale from 142 to 341.
 */
function loadSourceDesignsBySlug(): Map<string, Row[]> {
  const cachePath = path.join(ROOT, 'ops', 'cache', 'pubmed-metadata.json')
  if (!existsSync(cachePath)) return new Map()

  const cache = JSON.parse(readFileSync(cachePath, 'utf8'))
  const records: Record<string, { publicationTypes?: string[] }> = cache.records ?? {}
  const bySlug = new Map<string, Row[]>()

  for (const dir of ['herbs-detail', 'compounds-detail']) {
    const full = path.join(DATA_DIR, dir)
    if (!existsSync(full)) continue

    for (const file of readdirSync(full)) {
      if (!file.endsWith('.json')) continue
      const detail = JSON.parse(readFileSync(path.join(full, file), 'utf8'))
      const slug = String(detail.slug ?? file.replace(/\.json$/, ''))
      const designs: Row[] = []

      for (const source of Array.isArray(detail.sources) ? detail.sources : []) {
        const pmid = String(source.pmid ?? source.pubmedId ?? '').trim()
        const meta = records[pmid]
        if (!meta?.publicationTypes?.length) continue

        // PubMed tags nearly every record "Journal Article", which says nothing
        // about design; the specific tags alongside it carry the information.
        const classes = meta.publicationTypes
          .filter((type) => !/^journal article$/i.test(type))
          .map((type) => normalizeStudyClass(type))
          .filter((studyClass) => studyClass !== 'unclassified')
        if (!classes.length) continue

        designs.push({
          study_class: strongestStudyClass(classes),
          study_class_source: meta.publicationTypes.join('; '),
        })
      }

      if (designs.length) bySlug.set(slug, designs)
    }
  }

  return bySlug
}

/** Reconcile from authored values so reruns cannot ratchet evidence downward. */
function sourceGrade(row: Row): unknown {
  return row.evidence_grade_source ?? row.evidence_grade
}

function sourceTier(row: Row): unknown {
  return row.evidence_tier_source ?? row.evidence_tier
}

function normalizeProfiles(file: string, claimsBySlug: Map<string, Row[]>, sourcesBySlug: Map<string, Row[]>) {
  const rows = readJson(file)
  if (!rows.length) {
    return {
      file,
      total: 0,
      adjusted: 0,
      rationaleCards: 0,
      summariesWritten: 0,
      reasons: {} as Record<string, number>,
      changes: [] as Row[],
      unbacked: [] as Row[],
    }
  }

  const reasons: Record<string, number> = {}
  const changes: Row[] = []
  const unbacked: Row[] = []
  let adjusted = 0
  let rationaleCards = 0
  let summariesWritten = 0

  const next = rows.map((row) => {
    const authoredGrade = sourceGrade(row)
    const authoredTier = sourceTier(row)
    const result: EvidenceReconciliation = reconcileEvidenceGrade(authoredGrade, authoredTier)
    reasons[result.reason] = (reasons[result.reason] ?? 0) + 1

    if (result.adjusted) {
      adjusted += 1
      changes.push({
        slug: row.slug,
        indexable: String(row.indexability_status ?? '').toUpperCase() === 'PUBLISH',
        authoredGrade: String(authoredGrade ?? ''),
        authoredTier: String(authoredTier ?? ''),
        publishedGrade: result.grade,
        publishedTier: result.band ? BAND_LABEL[result.band] : null,
        reason: result.reason,
      })
    }

    // Claims and cited sources are separate records of the same literature, so
    // both feed the rationale; sources reach more than twice as many profiles.
    const evidenceInputs = [
      ...(claimsBySlug.get(String(row.slug)) ?? []),
      ...(sourcesBySlug.get(String(row.slug)) ?? []),
    ]
    const rationale: EvidenceRationale = buildEvidenceRationale(evidenceInputs)
    if (rationale.designMatch) rationaleCards += 1

    const backing = gradeIsBackedByEvidence(result.grade, rationale)
    if (!backing.backed) {
      unbacked.push({
        slug: row.slug,
        indexable: String(row.indexability_status ?? '').toUpperCase() === 'PUBLISH',
        grade: result.grade,
        reason: backing.reason,
        humanStudyCount: rationale.humanStudyCount,
        claimCount: rationale.totalClaimCount,
      })
    }

    // The resolved band is the only public tier. The workbook's authored tier
    // remains available in evidence_tier_source for audit/reconciliation. This
    // prevents a corrected Grade C/D record from simultaneously publishing a
    // stale "Strong Human Evidence" tier.
    const enriched = {
      ...row,
      evidence_grade: result.grade,
      evidence_grade_source: String(authoredGrade ?? ''),
      evidence_tier: result.band ? BAND_LABEL[result.band] : '',
      evidence_tier_source: String(authoredTier ?? ''),
      evidence_grade_band: result.band,
      evidence_grade_reason: result.reason,
      evidence_grade_explanation: result.explanation,
      evidence_grade_adjusted: result.adjusted,
      // Rationale card fields. Null means "not assessed" and must render as
      // such — an absent signal is not a clean bill of health.
      evidence_design_match: rationale.designMatch,
      evidence_risk_of_bias: rationale.riskOfBias,
      evidence_consistency: rationale.consistency,
      evidence_rationale: rationale.summary,
      evidence_human_study_count: rationale.humanStudyCount,
      evidence_recorded_study_count: rationale.classifiedStudyCount,
      evidence_strongest_design: rationale.strongestClass,
      evidence_grade_backed: backing.backed,
      evidence_grade_backing_gap: backing.reason,
    }

    if (isPlaceholderSummary(enriched.summary)) {
      const composed = buildProfileSummary(enriched)
      if (composed) {
        summariesWritten += 1
        return { ...enriched, summary: composed, summary_source: 'composed-from-record' }
      }
    }

    return enriched
  })

  writeJson(file, next)
  for (const row of next) syncDetailRecord(file, row)
  return { file, total: rows.length, adjusted, rationaleCards, summariesWritten, reasons, changes, unbacked }
}

function normalizeClaims() {
  const rows = readJson('claims.json')
  if (!rows.length) {
    return { total: 0, classes: {} as Record<string, number>, bySlug: new Map<string, Row[]>() }
  }

  const classes: Record<string, number> = {}
  const next = rows.map((row) => {
    const studyClass = normalizeStudyClass(row.study_class_source ?? row.evidence_tier)
    classes[studyClass] = (classes[studyClass] ?? 0) + 1
    const info = STUDY_CLASS_INFO[studyClass]
    return {
      ...row,
      study_class: studyClass,
      study_class_source: String(row.study_class_source ?? row.evidence_tier ?? ''),
      study_class_label: info.label,
      study_class_rank: info.rank,
      study_class_human: info.human,
    }
  })

  writeJson('claims.json', next)

  // Profiles read the classified claims, so group them here rather than
  // re-deriving the classification per profile.
  const bySlug = new Map<string, Row[]>()
  for (const row of next) {
    const slug = String(row.profile_slug ?? '')
    if (!slug) continue
    const bucket = bySlug.get(slug)
    if (bucket) bucket.push(row)
    else bySlug.set(slug, [row])
  }

  return { total: rows.length, classes, bySlug }
}

function main() {
  // Claims first: their canonical study class feeds the profile rationale.
  const claims = normalizeClaims()
  const claimsBySlug = claims.bySlug ?? new Map<string, Row[]>()
  const sourcesBySlug = loadSourceDesignsBySlug()
  const profiles = [
    normalizeProfiles('herbs.json', claimsBySlug, sourcesBySlug),
    normalizeProfiles('compounds.json', claimsBySlug, sourcesBySlug),
  ]

  const totals = {
    profiles: profiles.reduce((sum, p) => sum + p.total, 0),
    adjusted: profiles.reduce((sum, p) => sum + p.adjusted, 0),
    rationaleCards: profiles.reduce((sum, p) => sum + p.rationaleCards, 0),
    summariesWritten: profiles.reduce((sum, p) => sum + p.summariesWritten, 0),
    claims: claims.total,
  }
  const unbacked = profiles.flatMap((p) => p.unbacked)
  const reasons: Record<string, number> = {}
  for (const p of profiles) {
    for (const [reason, count] of Object.entries(p.reasons)) reasons[reason] = (reasons[reason] ?? 0) + count
  }

  const report = {
    generatedAt: new Date().toISOString(),
    totals,
    gradeReasons: reasons,
    studyClasses: claims.classes,
    adjustments: profiles.flatMap((p) => p.changes),
    unbackedStrongGrades: unbacked,
  }

  mkdirSync(REPORTS_DIR, { recursive: true })
  writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`)

  console.log('\nEvidence grade normalization')
  console.log('='.repeat(66))
  console.log(`Profiles normalized   ${totals.profiles}`)
  console.log(`Grades adjusted down  ${totals.adjusted}`)
  for (const [reason, count] of Object.entries(reasons).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(count).padStart(5)}  ${reason}`)
  }
  console.log(`\nRationale cards       ${totals.rationaleCards}`)
  console.log(`Summaries composed    ${totals.summariesWritten}`)
  const unbackedIndexable = unbacked.filter((row) => row.indexable)
  console.log(`A/B grades unbacked   ${unbacked.length} (${unbackedIndexable.length} indexable)`)
  const gapCounts: Record<string, number> = {}
  for (const row of unbackedIndexable) {
    const reason = String(row.reason)
    gapCounts[reason] = (gapCounts[reason] ?? 0) + 1
  }
  for (const [reason, count] of Object.entries(gapCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(count).padStart(5)}  ${reason}`)
  }

  console.log(`\nClaims classified     ${totals.claims}`)
  for (const [studyClass, count] of Object.entries(claims.classes).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(count).padStart(5)}  ${studyClass}`)
  }
  console.log(`\nReport: ${path.relative(ROOT, REPORT_PATH)}`)
}

main()
