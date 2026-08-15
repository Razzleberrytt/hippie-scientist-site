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
 * It is idempotent: the authored value is preserved in `evidence_grade_source`
 * and every rerun reconciles from that, never from its own output.
 *
 * Usage: tsx scripts/data/normalize-evidence-grades.ts [--data-dir=public/data]
 */

import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import path from 'node:path'

import { reconcileEvidenceGrade, type EvidenceReconciliation } from '../../lib/evidence-grade'
import { normalizeStudyClass, STUDY_CLASS_INFO } from '../../lib/study-class'

const ROOT = process.cwd()
const dataDirArg = process.argv.find((arg) => arg.startsWith('--data-dir='))
const DATA_DIR = path.resolve(ROOT, dataDirArg ? dataDirArg.split('=')[1] : 'public/data')
const REPORTS_DIR = path.join(ROOT, 'ops', 'reports')
const REPORT_PATH = path.join(REPORTS_DIR, 'evidence-grade-migration.json')

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

/** Reconcile from the authored value so reruns cannot ratchet grades downward. */
function sourceGrade(row: Row): unknown {
  return row.evidence_grade_source ?? row.evidence_grade
}

function normalizeProfiles(file: string) {
  const rows = readJson(file)
  if (!rows.length) return { file, total: 0, adjusted: 0, reasons: {} as Record<string, number>, changes: [] as Row[] }

  const reasons: Record<string, number> = {}
  const changes: Row[] = []
  let adjusted = 0

  const next = rows.map((row) => {
    const authored = sourceGrade(row)
    const result: EvidenceReconciliation = reconcileEvidenceGrade(authored, row.evidence_tier)
    reasons[result.reason] = (reasons[result.reason] ?? 0) + 1

    if (result.adjusted) {
      adjusted += 1
      changes.push({
        slug: row.slug,
        indexable: String(row.indexability_status ?? '').toUpperCase() === 'PUBLISH',
        authoredGrade: String(authored ?? ''),
        authoredTier: String(row.evidence_tier ?? ''),
        publishedGrade: result.grade,
        reason: result.reason,
      })
    }

    return {
      ...row,
      evidence_grade: result.grade,
      evidence_grade_source: String(authored ?? ''),
      evidence_grade_band: result.band,
      evidence_grade_reason: result.reason,
      evidence_grade_explanation: result.explanation,
      evidence_grade_adjusted: result.adjusted,
    }
  })

  writeJson(file, next)
  return { file, total: rows.length, adjusted, reasons, changes }
}

function normalizeClaims() {
  const rows = readJson('claims.json')
  if (!rows.length) return { total: 0, classes: {} as Record<string, number> }

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
  return { total: rows.length, classes }
}

function main() {
  const profiles = [normalizeProfiles('herbs.json'), normalizeProfiles('compounds.json')]
  const claims = normalizeClaims()

  const totals = {
    profiles: profiles.reduce((sum, p) => sum + p.total, 0),
    adjusted: profiles.reduce((sum, p) => sum + p.adjusted, 0),
    claims: claims.total,
  }
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
  console.log(`\nClaims classified     ${totals.claims}`)
  for (const [studyClass, count] of Object.entries(claims.classes).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(count).padStart(5)}  ${studyClass}`)
  }
  console.log(`\nReport: ${path.relative(ROOT, REPORT_PATH)}`)
}

main()
