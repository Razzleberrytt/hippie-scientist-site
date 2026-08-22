#!/usr/bin/env node
/**
 * Report where the two copies of indexability metadata disagree.
 *
 * Indexability is recorded twice for every profile:
 *
 *   summary-indexes/{herbs,compounds}-summary.json — the authority. Both
 *   `app/sitemap.ts` and the profile pages resolve `robots` and sitemap
 *   membership from here, and this layer is internally coherent: no noindexed
 *   URL is advertised, no indexable profile is omitted.
 *
 *   {herbs,compounds}-detail/*.json — a second copy of the same three fields
 *   that disagrees with the first. Taurine is `PUBLISH / index,follow /
 *   sitemap_included: true` in the summary index and `NEEDS_REVIEW /
 *   noindex,follow / sitemap_included: false` in the detail file.
 *
 * That is how "taurine appears in the sitemap while being emitted as noindex"
 * can be reported and still be untrue of the live site: the answer depends on
 * which copy is read, and the copy the site uses says index.
 *
 * This reports rather than reconciles, deliberately. The detail copy is not
 * inert — `getRuntimeVisibility` reads it to decide `canRender`, so rewriting
 * it changes which pages exist at all. Choosing which layer wins is a
 * governance decision with real SEO consequences, and it belongs to a human.
 *
 * Exit code is 0 when the divergence is at or below the recorded baseline and
 * 1 when it grows, so the problem cannot quietly get worse while it waits for
 * that decision.
 *
 * Usage: node scripts/ci/report-indexability-divergence.mjs [--data-dir=public/data] [--update-baseline]
 */

import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const args = process.argv.slice(2)
const dirArg = args.find((arg) => arg.startsWith('--data-dir='))
const DATA_DIR = path.resolve(ROOT, dirArg ? dirArg.split('=')[1] : 'public/data')
const UPDATE_BASELINE = args.includes('--update-baseline')
// `ops/reports/` is gitignored, so the baseline lives in `config/` where it is
// tracked — a gate whose threshold does not reach CI is not a gate.
const BASELINE_PATH = path.join(ROOT, 'config', 'indexability-divergence-baseline.json')
const REPORT_PATH = path.join(ROOT, 'ops', 'reports', 'indexability-divergence.json')

const MIN_EXPECTED_PROFILES = 400

function readSummary(file) {
  const full = path.join(DATA_DIR, 'summary-indexes', file)
  if (!fs.existsSync(full)) return []
  const parsed = JSON.parse(fs.readFileSync(full, 'utf8'))
  if (Array.isArray(parsed)) return parsed
  return Object.values(parsed).find(Array.isArray) ?? []
}

const isIndexable = (record) =>
  String(record?.indexability_status ?? '').toUpperCase() === 'PUBLISH' &&
  !/noindex/i.test(String(record?.robots ?? ''))

function main() {
  const authority = new Map()
  for (const [file, kind] of [['herbs-summary.json', 'herb'], ['compounds-summary.json', 'compound']]) {
    for (const record of readSummary(file)) {
      if (record?.slug) authority.set(String(record.slug), { kind, record })
    }
  }

  if (authority.size < MIN_EXPECTED_PROFILES) {
    console.error(
      `[indexability-divergence] FAILED — the summary indexes hold ${authority.size} profiles, below the ` +
        `${MIN_EXPECTED_PROFILES} minimum. Run \`npm run data:build\` first.`,
    )
    process.exit(1)
  }

  const divergent = []
  let compared = 0

  for (const [kind, dir] of [['herb', 'herbs-detail'], ['compound', 'compounds-detail']]) {
    const full = path.join(DATA_DIR, dir)
    if (!fs.existsSync(full)) continue
    for (const file of fs.readdirSync(full)) {
      if (!file.endsWith('.json')) continue
      const detail = JSON.parse(fs.readFileSync(path.join(full, file), 'utf8'))
      const slug = String(detail.slug ?? file.replace(/\.json$/, ''))
      const entry = authority.get(slug)
      if (!entry) continue
      compared += 1

      const authoritative = isIndexable(entry.record)
      const duplicate = isIndexable(detail)
      const sitemapAuthoritative = entry.record.sitemap_included === true
      const sitemapDuplicate = detail.sitemap_included === true
      if (authoritative === duplicate && sitemapAuthoritative === sitemapDuplicate) continue

      divergent.push({
        slug,
        kind,
        summary: {
          indexability_status: entry.record.indexability_status ?? null,
          robots: entry.record.robots ?? null,
          sitemap_included: sitemapAuthoritative,
        },
        detail: {
          indexability_status: detail.indexability_status ?? null,
          robots: detail.robots ?? null,
          sitemap_included: sitemapDuplicate,
        },
      })
    }
  }

  const summaryIndexable = [...authority.values()].filter((entry) => isIndexable(entry.record)).length

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true })
  fs.writeFileSync(
    REPORT_PATH,
    `${JSON.stringify(
      {
        compared,
        divergent: divergent.length,
        authoritativeIndexable: summaryIndexable,
        note: 'summary-indexes is the layer app/sitemap.ts and the profile pages read. The detail copy is reported, not reconciled.',
        profiles: divergent,
      },
      null,
      2,
    )}\n`,
    'utf8',
  )

  console.log('\nIndexability divergence (summary index vs detail payload)')
  console.log('='.repeat(66))
  console.log(`Profiles compared        ${compared}`)
  console.log(`Divergent                ${divergent.length}`)
  console.log(`Indexable (authoritative) ${summaryIndexable}`)
  console.log(`\nReport: ${path.relative(ROOT, REPORT_PATH)}`)

  if (UPDATE_BASELINE) {
    fs.writeFileSync(BASELINE_PATH, `${JSON.stringify({ divergent: divergent.length }, null, 2)}\n`, 'utf8')
    console.log(`Baseline updated: ${path.relative(ROOT, BASELINE_PATH)} (${divergent.length})`)
    return
  }

  if (!fs.existsSync(BASELINE_PATH)) {
    console.log('\nNo baseline recorded yet. Run with --update-baseline to record the current figure.')
    return
  }

  const baseline = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8')).divergent ?? 0
  if (divergent.length > baseline) {
    console.error(
      `\n[indexability-divergence] FAILED — divergence grew from ${baseline} to ${divergent.length}. ` +
        'Two copies of indexability metadata are drifting further apart.',
    )
    process.exit(1)
  }
  console.log(`\nAt or below the recorded baseline (${baseline}).`)
}

main()
