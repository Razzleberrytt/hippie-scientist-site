#!/usr/bin/env node
/**
 * Make the detail payloads' indexability fields agree with the authority.
 *
 * Indexability was recorded four times per profile, and they disagreed:
 *
 *   summary-indexes/*-summary.json  `indexability_status`  352 PUBLISH
 *   *-detail/*.json                 `governance.indexingAllowed`  352 true
 *   *-detail/*.json                 `indexability_status`  479 PUBLISH
 *   herbs.json / compounds.json     `indexability_status`  differs on 99
 *
 * The first two agree on all 856 profiles, and the first is what
 * `app/sitemap.ts` and the profile pages actually read, so it is the
 * authority. The third is the liar: 127 detail records advertised
 * `robots: index,follow` and `sitemap_included: true` while the governance
 * flag on the same record said no. That is the shape of the reported
 * "taurine is in the sitemap while emitting noindex" conflict — it depended
 * entirely on which copy you read, and the copy the site serves said index.
 *
 * This step removes the disagreement rather than arbitrating it: the detail
 * triple is copied from the summary index instead of being maintained
 * separately. It changes no governance decision, so no page changes its
 * rendered `robots` tag and no profile enters or leaves the sitemap — it only
 * stops the unread copies from contradicting the read one.
 *
 * `enforce-production-content-invariants.mjs` runs later in the build and
 * demotes profiles that fail an invariant; `demoteFromIndex` writes the triple
 * and the governance flag together, so a demotion stays internally consistent
 * after this step and does not need to run before it.
 *
 * Usage: node scripts/data/sync-detail-indexability.mjs [--data-dir=public/data] [--dry-run]
 */

import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const args = process.argv.slice(2)
const dirArg = args.find((arg) => arg.startsWith('--data-dir='))
const DATA_DIR = path.resolve(ROOT, dirArg ? dirArg.split('=')[1] : 'public/data')
const DRY_RUN = args.includes('--dry-run')

/** Below this the summary indexes are not the corpus and syncing from them would be destructive. */
const MIN_EXPECTED_PROFILES = 400

const TRIPLE = ['indexability_status', 'robots', 'sitemap_included']

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch (error) {
    console.error(`[sync-detail-indexability] FAILED — cannot parse ${path.relative(ROOT, file)}: ${error.message}`)
    process.exit(1)
  }
}

function readSummary(file) {
  const full = path.join(DATA_DIR, 'summary-indexes', file)
  if (!fs.existsSync(full)) return []
  const parsed = readJson(full)
  if (Array.isArray(parsed)) return parsed
  return Object.values(parsed).find(Array.isArray) ?? []
}

function main() {
  const authority = new Map()
  for (const file of ['herbs-summary.json', 'compounds-summary.json']) {
    for (const record of readSummary(file)) {
      const slug = String(record?.slug ?? '').trim()
      if (slug) authority.set(slug, record)
    }
  }

  if (authority.size < MIN_EXPECTED_PROFILES) {
    console.error(
      `[sync-detail-indexability] FAILED — the summary indexes hold ${authority.size} profiles, below the ` +
        `${MIN_EXPECTED_PROFILES} minimum. Build them before syncing; copying from a partial index would ` +
        'silently unpublish the rest of the corpus.',
    )
    process.exit(1)
  }

  let inspected = 0
  let changed = 0
  let missingFromAuthority = 0
  let governanceConflicts = 0
  const fieldCounts = {}

  for (const [kind, dir] of [['herb', 'herbs-detail'], ['compound', 'compounds-detail']]) {
    const full = path.join(DATA_DIR, dir)
    if (!fs.existsSync(full)) continue

    for (const file of fs.readdirSync(full)) {
      if (!file.endsWith('.json')) continue
      const filePath = path.join(full, file)
      const raw = fs.readFileSync(filePath, 'utf8')
      const record = readJson(filePath)
      const slug = String(record.slug ?? file.replace(/\.json$/, ''))
      inspected += 1

      const source = authority.get(slug)
      if (!source) {
        missingFromAuthority += 1
        continue
      }

      // The governance flag and the summary index are the two representations
      // that already agree corpus-wide. If they ever stop agreeing, syncing
      // would launder a real disagreement into apparent consistency, so say so
      // rather than paper over it.
      const governanceAllows =
        record.governance && typeof record.governance.indexingAllowed === 'boolean'
          ? record.governance.indexingAllowed
          : null
      const authorityPublishes = String(source.indexability_status ?? '').toUpperCase() === 'PUBLISH'
      if (governanceAllows !== null && governanceAllows !== authorityPublishes) {
        governanceConflicts += 1
        console.warn(
          `[sync-detail-indexability] ${kind}:${slug} — governance.indexingAllowed=${governanceAllows} but ` +
            `summary index says ${source.indexability_status}. Left unchanged.`,
        )
        continue
      }

      const next = { ...record }
      let touched = false
      for (const field of TRIPLE) {
        if (!(field in source)) continue
        if (next[field] === source[field]) continue
        next[field] = source[field]
        fieldCounts[field] = (fieldCounts[field] ?? 0) + 1
        touched = true
      }

      // Reasons explain the status, so they travel with it.
      const sourceReasons = Array.isArray(source.indexability_reasons) ? source.indexability_reasons : null
      if (sourceReasons && JSON.stringify(next.indexability_reasons ?? null) !== JSON.stringify(sourceReasons)) {
        next.indexability_reasons = [...sourceReasons]
        fieldCounts.indexability_reasons = (fieldCounts.indexability_reasons ?? 0) + 1
        touched = true
      }

      if (!touched) continue
      changed += 1
      if (!DRY_RUN) {
        const pretty = /\n\s+"/.test(raw.slice(0, 4096))
        const serialized = pretty ? JSON.stringify(next, null, 2) : JSON.stringify(next)
        fs.writeFileSync(filePath, raw.endsWith('\n') ? `${serialized}\n` : serialized, 'utf8')
      }
    }
  }

  console.log(`\nDetail indexability synced from the summary index${DRY_RUN ? ' (dry run)' : ''}`)
  console.log('='.repeat(66))
  console.log(`Profiles inspected     ${inspected}`)
  console.log(`Profiles changed       ${changed}`)
  console.log(`Missing from authority ${missingFromAuthority}`)
  console.log(`Governance conflicts   ${governanceConflicts}`)
  for (const [field, count] of Object.entries(fieldCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(count).padStart(5)}  ${field}`)
  }

  if (inspected < MIN_EXPECTED_PROFILES) {
    console.error(`\n[sync-detail-indexability] FAILED — only ${inspected} detail payloads were readable.`)
    process.exit(1)
  }
}

main()
