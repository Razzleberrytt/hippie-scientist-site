/**
 * validate-evidence-grade-consistency.ts
 *
 * Every profile carries two evidence signals:
 *
 *   evidence_tier   a clean taxonomy — "Strong / Moderate / Limited /
 *                   Mechanistic Human Evidence" — used for badges and filters
 *   evidence_grade  free text filled by several enrichment passes, rendered as
 *                   the letter grade in the evidence-rationale card
 *
 * When they disagree, one page shows a reader two different verdicts about the
 * same ingredient. For an evidence-first site that is a credibility defect, not
 * a cosmetic one.
 *
 * This reports:
 *   - contradictions, ranked by how far apart the two fields sit
 *   - grades that cannot be reduced to a single letter at all
 *   - grades that describe different outcomes differently
 *
 * Run with tsx so it shares the exact normalizer the templates use, rather than
 * a second copy that can drift:
 *   npx tsx scripts/ci/validate-evidence-grade-consistency.ts
 *   npx tsx scripts/ci/validate-evidence-grade-consistency.ts --strict
 *
 * Output: ops/reports/evidence-grade-consistency.json
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import {
  bandFromEvidenceTier,
  gradeTierDistance,
  normalizeEvidenceGrade,
  type EvidenceBand,
} from '../../lib/evidence-grade'

const ROOT = process.cwd()
const DATA_DIR = path.join(ROOT, 'public', 'data')
const REPORTS_DIR = path.join(ROOT, 'ops', 'reports')
const REPORT_PATH = path.join(REPORTS_DIR, 'evidence-grade-consistency.json')

const argv = process.argv.slice(2)
const STRICT = argv.includes('--strict')

type ProfileRecord = {
  slug?: string
  name?: string
  evidence_grade?: unknown
  evidence_tier?: unknown
  indexability_status?: unknown
  evidence_design_match?: unknown
  evidence_risk_of_bias?: unknown
  evidence_consistency?: unknown
}

function readJson(file: string): ProfileRecord[] {
  try {
    const parsed = JSON.parse(readFileSync(path.join(DATA_DIR, file), 'utf8'))
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

type Finding = {
  kind: 'herb' | 'compound'
  slug: string
  url: string
  indexable: boolean
  rawGrade: string
  rawTier: string
  gradeLetter: string | null
  gradeBand: EvidenceBand | null
  tierBand: EvidenceBand | null
  distance: number | null
  issues: string[]
}

function main() {
  const records: [('herb' | 'compound'), ProfileRecord[]][] = [
    ['herb', readJson('herbs.json')],
    ['compound', readJson('compounds.json')],
  ]

  const findings: Finding[] = []

  for (const [kind, rows] of records) {
    for (const record of rows) {
      const slug = String(record.slug ?? '')
      if (!slug) continue

      const normalized = normalizeEvidenceGrade(record.evidence_grade)
      const tierBand = bandFromEvidenceTier(record.evidence_tier)
      const distance = gradeTierDistance(normalized.band, tierBand)
      const indexable = String(record.indexability_status ?? '').toUpperCase() === 'PUBLISH'

      const issues: string[] = []
      if (distance !== null && distance >= 2) issues.push('contradicts-evidence-tier')
      else if (distance === 1) issues.push('minor-disagreement')
      if (normalized.outcomeDependent) issues.push('outcome-dependent-grade')
      if (normalized.raw && !normalized.letter && !normalized.outcomeDependent) issues.push('unmappable-grade')
      if (!normalized.raw) issues.push('missing-grade')
      if (normalized.raw && !normalized.canonical && normalized.letter) issues.push('non-canonical-wording')

      if (!issues.length) continue

      findings.push({
        kind,
        slug,
        url: `/${kind === 'herb' ? 'herbs' : 'compounds'}/${slug}/`,
        indexable,
        rawGrade: normalized.raw,
        rawTier: String(record.evidence_tier ?? ''),
        gradeLetter: normalized.letter,
        gradeBand: normalized.band,
        tierBand,
        distance,
        issues,
      })
    }
  }

  const indexableFindings = findings.filter((f) => f.indexable)
  const counts: Record<string, number> = {}
  for (const finding of indexableFindings) {
    for (const issue of finding.issues) counts[issue] = (counts[issue] ?? 0) + 1
  }

  const contradictions = indexableFindings
    .filter((f) => f.issues.includes('contradicts-evidence-tier'))
    .sort((a, b) => (b.distance ?? 0) - (a.distance ?? 0))

  /**
   * The profile templates only render `EvidenceGradeRationale` when all three
   * rationale fields are present. If nothing populates them, the whole
   * "why is it graded this way" surface is dead on every profile — a far bigger
   * problem than any individual grade value, and invisible without this check.
   */
  const indexableRecords = records.flatMap(([, rows]) =>
    rows.filter((r) => String(r.indexability_status ?? '').toUpperCase() === 'PUBLISH'),
  )
  const gradeCardRenderable = indexableRecords.filter(
    (r) => r.evidence_design_match && r.evidence_risk_of_bias && r.evidence_consistency,
  ).length

  const report = {
    generatedAt: new Date().toISOString(),
    totals: {
      profiles: records.reduce((sum, [, rows]) => sum + rows.length, 0),
      indexable: indexableRecords.length,
      flagged: findings.length,
      flaggedIndexable: indexableFindings.length,
      contradictionsIndexable: contradictions.length,
      gradeCardRenderable,
    },
    issueCounts: counts,
    contradictions,
    findings,
  }

  mkdirSync(REPORTS_DIR, { recursive: true })
  writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`)

  console.log('\nEvidence grade consistency')
  console.log('='.repeat(66))
  console.log(`Profiles scanned            ${report.totals.profiles}`)
  console.log(`Indexable                   ${report.totals.indexable}`)
  console.log(`Flagged (indexable)         ${report.totals.flaggedIndexable}`)
  console.log('')
  console.log(
    `Evidence-rationale card renders on ${gradeCardRenderable}/${report.totals.indexable} indexable profiles` +
      (gradeCardRenderable === 0
        ? '\n  ^ nothing populates evidence_design_match / evidence_risk_of_bias /' +
          '\n    evidence_consistency, so the "why is it graded this way" surface is' +
          '\n    currently dead on every profile page.'
        : ''),
  )
  console.log('')
  for (const [issue, count] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(count).padStart(5)}  ${issue}`)
  }

  if (contradictions.length) {
    console.log(`\nGrade contradicts tier on ${contradictions.length} indexable page(s):`)
    for (const finding of contradictions.slice(0, 15)) {
      console.log(
        `  ${finding.url.padEnd(44)} grade=${JSON.stringify(finding.rawGrade)} (${finding.gradeBand})` +
          ` vs tier=${JSON.stringify(finding.rawTier)} (${finding.tierBand})`,
      )
    }
  }

  console.log(`\nReport: ${path.relative(ROOT, REPORT_PATH)}`)

  if (STRICT && contradictions.length > 0) {
    console.error(
      `\n[evidence-grade] FAILED — ${contradictions.length} indexable page(s) show a grade that contradicts their evidence tier.`,
    )
    process.exit(1)
  }
}

main()
