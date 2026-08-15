#!/usr/bin/env node

/**
 * Normalize generated evidence_grade fields to the canonical persisted enum.
 *
 * This is a migration boundary, not a scientific grading engine. It only
 * converts legacy representations whose meaning is already explicit. Values
 * that grade different outcomes differently are removed from the universal
 * grade field (and reported) rather than flattened into a misleading verdict.
 * Unknown non-empty values are never guessed; --strict makes them fatal.
 *
 * The runtime builder emits several denormalized copies of herb/compound
 * records in one pass. Every copy that can carry `evidence_grade` is migrated
 * here so a profile cannot be canonical while a featured/search index still
 * exposes the legacy value.
 *
 * Usage:
 *   node scripts/data/normalize-evidence-grades.mjs --data-dir=public/data
 *   node scripts/data/normalize-evidence-grades.mjs --data-dir=public/data --write --strict
 */

import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import {
  CANONICAL_EVIDENCE_GRADES,
  normalizeEvidenceGrade,
} from '../../lib/evidence-grade-core.js'

const DEFAULT_FILES = [
  'herbs.json',
  'compounds.json',
  'featured-herbs.json',
  'featured-compounds.json',
  'herb-index.json',
  'compound-index.json',
  'claims.json',
]

function parseArgs(argv) {
  const args = { dataDir: 'public/data', write: false, strict: false }
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--write') args.write = true
    else if (arg === '--strict') args.strict = true
    else if (arg === '--data-dir') {
      args.dataDir = argv[i + 1] || ''
      i += 1
    } else if (arg.startsWith('--data-dir=')) {
      args.dataDir = arg.slice('--data-dir='.length)
    }
  }
  if (!args.dataDir.trim()) throw new Error('[evidence-grade] missing --data-dir value')
  return args
}

function stableJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`
}

export function migrateEvidenceGradeRecord(record) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    return { record, status: 'not-a-record', changed: false, raw: '', canonical: null }
  }

  const normalized = normalizeEvidenceGrade(record.evidence_grade)

  if (!normalized.raw) {
    return { record, status: 'missing', changed: false, raw: '', canonical: null }
  }

  if (normalized.outcomeDependent) {
    const next = { ...record, evidence_grade_status: 'outcome-dependent' }
    delete next.evidence_grade
    return {
      record: next,
      status: 'outcome-dependent-universal-grade-removed',
      changed: true,
      raw: normalized.raw,
      canonical: null,
    }
  }

  if (!normalized.grade) {
    return {
      record,
      status: 'unmappable',
      changed: false,
      raw: normalized.raw,
      canonical: null,
    }
  }

  if (normalized.canonical) {
    return {
      record,
      status: 'canonical',
      changed: false,
      raw: normalized.raw,
      canonical: normalized.grade,
    }
  }

  return {
    record: { ...record, evidence_grade: normalized.grade },
    status: 'migrated',
    changed: true,
    raw: normalized.raw,
    canonical: normalized.grade,
  }
}

export function migrateEvidenceGradeArray(records) {
  if (!Array.isArray(records)) throw new Error('[evidence-grade] expected a JSON array')

  const findings = []
  const output = records.map((record, index) => {
    const result = migrateEvidenceGradeRecord(record)
    if (result.status !== 'canonical' && result.status !== 'missing' && result.status !== 'not-a-record') {
      findings.push({
        index,
        slug: String(record?.slug ?? record?.target_slug ?? record?.id ?? ''),
        status: result.status,
        raw: result.raw,
        canonical: result.canonical,
      })
    }
    return result.record
  })

  return { output, findings }
}

function summarize(findings) {
  const counts = {}
  for (const finding of findings) counts[finding.status] = (counts[finding.status] ?? 0) + 1
  return counts
}

export function normalizeEvidenceGradeFiles({ dataDir, write = false, strict = false, files = DEFAULT_FILES }) {
  const absoluteDataDir = path.resolve(dataDir)
  const report = {
    canonicalEnum: [...CANONICAL_EVIDENCE_GRADES],
    dataDir: absoluteDataDir,
    write,
    files: [],
    totals: { scanned: 0, changed: 0, unmappable: 0, outcomeDependent: 0 },
    findings: [],
  }

  for (const filename of files) {
    const file = path.join(absoluteDataDir, filename)
    if (!fs.existsSync(file)) {
      report.files.push({ filename, exists: false, records: 0, changed: 0 })
      continue
    }

    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'))
    if (!Array.isArray(parsed)) throw new Error(`[evidence-grade] ${file} must contain a JSON array`)

    const { output, findings } = migrateEvidenceGradeArray(parsed)
    const changed = findings.filter((finding) => finding.status !== 'unmappable').length
    const unmappable = findings.filter((finding) => finding.status === 'unmappable').length
    const outcomeDependent = findings.filter((finding) => finding.status === 'outcome-dependent-universal-grade-removed').length

    report.totals.scanned += parsed.length
    report.totals.changed += changed
    report.totals.unmappable += unmappable
    report.totals.outcomeDependent += outcomeDependent
    report.findings.push(...findings.map((finding) => ({ filename, ...finding })))
    report.files.push({ filename, exists: true, records: parsed.length, changed, unmappable, outcomeDependent })

    if (write && changed > 0) fs.writeFileSync(file, stableJson(output), 'utf8')
  }

  report.issueCounts = summarize(report.findings)

  if (strict && report.totals.unmappable > 0) {
    const preview = report.findings
      .filter((finding) => finding.status === 'unmappable')
      .slice(0, 20)
      .map((finding) => `${finding.filename}[${finding.index}] ${finding.slug || '(no id)'}: ${JSON.stringify(finding.raw)}`)
      .join('\n')
    throw new Error(
      `[evidence-grade] ${report.totals.unmappable} unmappable evidence_grade value(s) remain after migration.\n${preview}`,
    )
  }

  return report
}

export function main(argv = process.argv) {
  const args = parseArgs(argv)
  const report = normalizeEvidenceGradeFiles(args)

  console.log('\nCanonical evidence-grade migration')
  console.log('='.repeat(60))
  console.log(`Enum:              ${report.canonicalEnum.join(' | ')}`)
  console.log(`Records scanned:   ${report.totals.scanned}`)
  console.log(`Values migrated:   ${report.totals.changed}`)
  console.log(`Outcome-dependent: ${report.totals.outcomeDependent}`)
  console.log(`Unmappable:        ${report.totals.unmappable}`)
  console.log(`Mode:              ${args.write ? 'WRITE' : 'DRY RUN'}`)
  for (const file of report.files) {
    console.log(`  ${file.filename.padEnd(24)} records=${String(file.records).padStart(4)} changed=${String(file.changed).padStart(4)} unmappable=${String(file.unmappable ?? 0).padStart(3)}`)
  }

  return report
}

const isDirectRun = process.argv[1]
  ? import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
  : false

if (isDirectRun) {
  try {
    main()
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}
