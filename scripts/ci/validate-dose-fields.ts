/**
 * validate-dose-fields.ts
 *
 * "X dosage" is one of the highest-intent queries an ingredient page can rank
 * for, so a dose field that cannot answer it is a real defect — but not every
 * missing dose is the same defect, and treating them alike produces a useless
 * backlog.
 *
 * The workbook column behind this is `dosage_or_preferred_form`, which is
 * deliberately dual-purpose. Several enrichment passes have also written
 * *duration* values into it. This classifies every indexable profile into:
 *
 *   dose        a real regimen with an amount and a unit
 *   form        the shape of the product ("capsule or standardized extract")
 *   duration    a duration value ("long", "short-to-medium") — wrong column
 *   abstention  a deliberate, honest refusal to state a dose
 *   empty       nothing at all
 *
 * Only `form`, `duration`, and `empty` are fixable by adding or re-mapping
 * data. Abstentions are editorial decisions and must not be overwritten with
 * invented numbers.
 *
 * Runs with tsx so it shares the exact classifier the profile templates use,
 * rather than a second copy that can drift:
 *   npx tsx scripts/ci/validate-dose-fields.ts
 *   npx tsx scripts/ci/validate-dose-fields.ts --strict
 *   npx tsx scripts/ci/validate-dose-fields.ts --list=form
 *
 * Output: ops/reports/dose-fields.json
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { classifyDoseField, type DoseFieldKind } from '../../lib/dose-presentation'

const ROOT = process.cwd()
const DATA_DIR = path.join(ROOT, 'public', 'data')
const REPORTS_DIR = path.join(ROOT, 'ops', 'reports')
const REPORT_PATH = path.join(REPORTS_DIR, 'dose-fields.json')

const argv = process.argv.slice(2)
const STRICT = argv.includes('--strict')
const LIST = argv.find((a) => a.startsWith('--list='))?.split('=')[1] as DoseFieldKind | undefined

type ProfileRecord = {
  slug?: string
  name?: string
  dosage?: unknown
  typical_dosage?: unknown
  indexability_status?: unknown
}

function readJson(file: string): ProfileRecord[] {
  try {
    const parsed = JSON.parse(readFileSync(path.join(DATA_DIR, file), 'utf8'))
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const percent = (numerator: number, denominator: number) =>
  denominator ? Number(((numerator / denominator) * 100).toFixed(1)) : 0

function main() {
  const sources: [('herb' | 'compound'), ProfileRecord[]][] = [
    ['herb', readJson('herbs.json')],
    ['compound', readJson('compounds.json')],
  ]

  const rows = sources.flatMap(([kind, records]) =>
    records
      .filter((record) => record.slug)
      .map((record) => {
        const value = String(record.dosage ?? record.typical_dosage ?? '').trim()
        return {
          kind,
          slug: String(record.slug),
          url: `/${kind === 'herb' ? 'herbs' : 'compounds'}/${record.slug}/`,
          indexable: String(record.indexability_status ?? '').toUpperCase() === 'PUBLISH',
          status: classifyDoseField(value),
          value,
        }
      }),
  )

  const indexable = rows.filter((r) => r.indexable)
  const byStatus = new Map<DoseFieldKind, typeof rows>()
  for (const row of indexable) {
    if (!byStatus.has(row.status)) byStatus.set(row.status, [])
    byStatus.get(row.status)!.push(row)
  }

  const count = (kind: DoseFieldKind) => byStatus.get(kind)?.length ?? 0

  // The most common offending strings — each is a shared fix that upgrades
  // every page carrying it.
  const offending = new Map<string, number>()
  for (const row of [...(byStatus.get('form') ?? []), ...(byStatus.get('duration') ?? [])]) {
    offending.set(row.value, (offending.get(row.value) ?? 0) + 1)
  }

  const addressable = count('form') + count('duration') + count('empty')

  const report = {
    generatedAt: new Date().toISOString(),
    totals: {
      profiles: rows.length,
      indexable: indexable.length,
      dose: count('dose'),
      form: count('form'),
      duration: count('duration'),
      abstention: count('abstention'),
      empty: count('empty'),
    },
    answerRate: percent(count('dose'), indexable.length),
    addressable,
    offendingStrings: [...offending.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([value, n]) => ({ value, count: n })),
    profiles: rows,
  }

  mkdirSync(REPORTS_DIR, { recursive: true })
  writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`)

  console.log('\nDose field audit')
  console.log('='.repeat(66))
  console.log(`Indexable profiles       ${report.totals.indexable}`)
  console.log('')
  console.log(`  answers a real dose    ${String(report.totals.dose).padStart(4)}  (${report.answerRate}%)`)
  console.log(`  product form           ${String(report.totals.form).padStart(4)}  <- wrong content for the column`)
  console.log(`  duration value         ${String(report.totals.duration).padStart(4)}  <- wrong column entirely`)
  console.log(`  empty                  ${String(report.totals.empty).padStart(4)}`)
  console.log(`  deliberate abstention  ${String(report.totals.abstention).padStart(4)}  <- honest, leave alone`)
  console.log('')
  console.log(`Addressable without inventing numbers: ${addressable}`)

  if (report.offendingStrings.length) {
    console.log('\nMost common non-answers (each is one shared fix):')
    for (const { value, count: n } of report.offendingStrings.slice(0, 12)) {
      console.log(`  ${String(n).padStart(4)}  ${JSON.stringify(value).slice(0, 72)}`)
    }
  }

  if (LIST && byStatus.has(LIST)) {
    const listed = byStatus.get(LIST)!
    console.log(`\nAll "${LIST}" profiles (${listed.length}):`)
    for (const row of listed) console.log(`  ${row.url.padEnd(52)} ${JSON.stringify(row.value).slice(0, 60)}`)
  }

  console.log(`\nReport: ${path.relative(ROOT, REPORT_PATH)}`)

  if (STRICT && count('form') + count('duration') > 0) {
    console.error(
      `\n[dose-fields] FAILED — ${count('form') + count('duration')} indexable profile(s) carry a form or duration in the dose field.`,
    )
    process.exit(1)
  }
}

main()
