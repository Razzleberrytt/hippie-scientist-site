import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import {
  CANONICAL_EVIDENCE_GRADES,
  bandFromEvidenceTier,
  gradeTierDistance,
  normalizeEvidenceGrade,
  type CanonicalEvidenceGrade,
  type EvidenceBand,
} from '../../lib/evidence-grade'

const ROOT = process.cwd()
const DATA_DIR = path.join(ROOT, 'public', 'data')
const REPORTS_DIR = path.join(ROOT, 'ops', 'reports')
const REPORT_PATH = path.join(REPORTS_DIR, 'evidence-grade-consistency.json')
const STRICT = process.argv.slice(2).includes('--strict')

type ProfileRecord = {
  slug?: string
  evidence_grade?: unknown
  evidence_tier?: unknown
  indexability_status?: unknown
  evidence_design_match?: unknown
  evidence_risk_of_bias?: unknown
  evidence_consistency?: unknown
}

type Finding = {
  kind: 'herb' | 'compound'
  slug: string
  url: string
  indexable: boolean
  rawGrade: string
  rawTier: string
  canonicalGrade: CanonicalEvidenceGrade | null
  gradeLetter: string | null
  gradeBand: EvidenceBand | null
  tierBand: EvidenceBand | null
  distance: number | null
  issues: string[]
}

function readJson(file: string): ProfileRecord[] {
  try {
    const parsed = JSON.parse(readFileSync(path.join(DATA_DIR, file), 'utf8'))
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
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
      if (normalized.raw && !normalized.grade && !normalized.outcomeDependent) issues.push('unmappable-grade')
      if (!normalized.raw) issues.push('missing-grade')
      if (normalized.raw && normalized.grade && !normalized.canonical) issues.push('non-canonical-wording')
      if (!issues.length) continue

      findings.push({
        kind,
        slug,
        url: `/${kind === 'herb' ? 'herbs' : 'compounds'}/${slug}/`,
        indexable,
        rawGrade: normalized.raw,
        rawTier: String(record.evidence_tier ?? ''),
        canonicalGrade: normalized.grade,
        gradeLetter: normalized.letter,
        gradeBand: normalized.band,
        tierBand,
        distance,
        issues,
      })
    }
  }

  const indexableFindings = findings.filter((finding) => finding.indexable)
  const contradictions = indexableFindings
    .filter((finding) => finding.issues.includes('contradicts-evidence-tier'))
    .sort((a, b) => (b.distance ?? 0) - (a.distance ?? 0))
  const issueCounts: Record<string, number> = {}
  for (const finding of indexableFindings) {
    for (const issue of finding.issues) issueCounts[issue] = (issueCounts[issue] ?? 0) + 1
  }

  const indexableRecords = records.flatMap(([, rows]) =>
    rows.filter((record) => String(record.indexability_status ?? '').toUpperCase() === 'PUBLISH'),
  )
  const gradeCardRenderable = indexableRecords.filter(
    (record) => record.evidence_design_match && record.evidence_risk_of_bias && record.evidence_consistency,
  ).length

  const report = {
    generatedAt: new Date().toISOString(),
    canonicalEnum: CANONICAL_EVIDENCE_GRADES,
    totals: {
      profiles: records.reduce((sum, [, rows]) => sum + rows.length, 0),
      indexable: indexableRecords.length,
      flagged: findings.length,
      flaggedIndexable: indexableFindings.length,
      contradictionsIndexable: contradictions.length,
      gradeCardRenderable,
    },
    issueCounts,
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
  console.log(`Rationale cards renderable  ${gradeCardRenderable}`)
  for (const [issue, count] of Object.entries(issueCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(count).padStart(5)}  ${issue}`)
  }
  console.log(`\nReport: ${path.relative(ROOT, REPORT_PATH)}`)

  if (STRICT && contradictions.length > 0) {
    console.error(`\n[evidence-grade] FAILED — ${contradictions.length} indexable contradiction(s).`)
    process.exit(1)
  }
}

main()
