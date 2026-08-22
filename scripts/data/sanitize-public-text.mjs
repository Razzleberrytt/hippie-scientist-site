#!/usr/bin/env node
/**
 * Strip internal editorial and governance text from every published payload.
 *
 * The workbook parser already sanitizes the records it writes, so `herbs.json`
 * and `compounds.json` are clean. The leak that shipped was everywhere else:
 * payloads that are built from the *detail* files rather than from the parser
 * output, and payloads written by scripts that no pipeline step runs.
 *
 * Concretely, before this step existed:
 *   - `sources[].title` carried 23 governance rulings, rendered to readers as
 *     the name of a study by `ShowMeTheStudies` / `ReferencedStudies`.
 *   - `claimMap[].claim` and `claimMap[].notes` carried 98 each.
 *   - the root `herbs-summary.json` / `compounds-summary.json` — which
 *     `ResearchSearchExperience` and `OnDemandComparisonClient` fetch at
 *     runtime — carried 36 editorial instructions and were stale, because the
 *     only scripts that write them are not in any pipeline.
 *
 * Rather than hide this at the display layer, this pass repairs the payloads
 * themselves, and it runs inside `data:build` so a rebuild cannot reintroduce
 * what a previous rebuild removed.
 *
 * Two rules, in order:
 *   1. A leaked `summary`/`description` is replaced with the canonical text the
 *      parser already sanitized for that slug. Nothing is invented — the
 *      replacement is the same profile's own published prose.
 *   2. Anything else is sentence-stripped: only the offending sentences go, so
 *      real prose sitting beside an instruction survives. A citation title that
 *      is entirely a governance ruling becomes empty, which is honest — the
 *      renderers already fall back to the URL, and `apply-pubmed-metadata.ts`
 *      fills the real title for any row with a PMID.
 *
 * The pass is idempotent: running it twice changes nothing the second time.
 *
 * Usage: node scripts/data/sanitize-public-text.mjs [--data-dir=public/data] [--dry-run]
 */

import fs from 'node:fs'
import path from 'node:path'

import {
  PUBLIC_TEXT_FIELDS,
  findInternalGovernanceLeaks,
  isLeakedUserFacingText,
  stripLeakedSentences,
} from '../../lib/editorial-leak.mjs'

const ROOT = process.cwd()
const args = process.argv.slice(2)
const dataDirArg = args.find((arg) => arg.startsWith('--data-dir='))
const DATA_DIR = path.resolve(ROOT, dataDirArg ? dataDirArg.split('=')[1] : 'public/data')
const DRY_RUN = args.includes('--dry-run')

/** Pipeline reports, not published content. Left alone. */
const SKIP_DIRS = new Set(['reports', '_meta'])

/** Fields where an empty result is correct rather than a hole in the page. */
const EMPTIABLE_FIELDS = new Set(['title', 'notes', 'citation', 'searchText'])

function walkFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue
      walkFiles(path.join(dir, entry.name), out)
    } else if (entry.name.endsWith('.json')) {
      out.push(path.join(dir, entry.name))
    }
  }
  return out
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch (error) {
    console.error(`[sanitize-public-text] cannot parse ${path.relative(ROOT, file)}: ${error.message}`)
    process.exit(1)
  }
}

/** slug → canonical sanitized prose, from the two files the parser sanitizes. */
function loadCanonicalText() {
  const bySlug = new Map()
  for (const file of ['herbs.json', 'compounds.json']) {
    const full = path.join(DATA_DIR, file)
    if (!fs.existsSync(full)) continue
    const records = readJson(full)
    if (!Array.isArray(records)) continue
    for (const record of records) {
      const slug = String(record?.slug ?? '').trim()
      if (!slug) continue
      bySlug.set(slug, {
        summary: String(record.summary ?? '').trim(),
        description: String(record.description ?? '').trim(),
      })
    }
  }
  return bySlug
}

const stats = { filesChanged: 0, fieldsRepaired: {}, replacedFromCanonical: 0, emptied: 0, stripped: 0, quarantinedClaims: 0 }

/** Claims removed from public payloads, written to an internal report. */
const quarantined = []

function bump(field) {
  stats.fieldsRepaired[field] = (stats.fieldsRepaired[field] ?? 0) + 1
}

/**
 * Fields that describe a profile in prose and so can be recovered from the
 * canonical record for that slug. `generated_description` and
 * `meta_description` are derived restatements of the same thing, so they map
 * onto the canonical summary rather than being left behind — 210 of them were,
 * because the replacement rule only recognised the two literal field names.
 *
 * @type {Record<string, string[]>}
 */
const CANONICAL_SOURCE_FIELDS = {
  summary: ['summary', 'description'],
  description: ['description', 'summary'],
  generated_description: ['summary', 'description'],
  meta_description: ['summary', 'description'],
  overview: ['summary', 'description'],
}

/**
 * Recover a profile slug from a record that identifies itself by route rather
 * than by slug. The route manifest keys 50 entries as `/herbs/agarikon` with no
 * `slug` field, so their `meta_description` had no canonical prose to fall back
 * to and kept the instruction.
 *
 * @param {Record<string, unknown>} node
 * @returns {string}
 */
function slugFromRoute(node) {
  for (const key of ['route', 'canonical_url', 'url', 'path']) {
    const value = String(node?.[key] ?? '').trim()
    if (!value) continue
    const segments = value.replace(/[?#].*$/, '').split('/').filter(Boolean)
    const last = segments[segments.length - 1]
    if (last && !last.includes('.')) return last
  }
  return ''
}

function canonicalReplacement(key, slug, canonical) {
  const candidates = CANONICAL_SOURCE_FIELDS[key]
  if (!candidates || !slug) return null
  const record = canonical.get(slug)
  if (!record) return null
  for (const field of candidates) {
    const value = record[field]
    if (value && !isLeakedUserFacingText(value)) return value
  }
  return null
}

/**
 * Repair one node in place. `slugHint` is the nearest enclosing record slug, so
 * a nested payload can still recover its own canonical prose.
 */
function repair(node, canonical, slugHint = '', depth = 0) {
  if (depth > 12 || !node || typeof node !== 'object') return false
  let changed = false

  if (Array.isArray(node)) {
    // A claim whose entire text is a governance ruling — "v9.4: Promising
    // preclinical profile but not enough direct human outcome evidence for
    // monetized recommendation." — is not a scientific claim at all. Blanking
    // it would leave an empty bullet on the page and emptying the record would
    // keep a claim with no claim in it, so the entry is removed outright and
    // written to an internal quarantine report for human review. 98 entries
    // are affected; none of them asserted anything about an herb or compound.
    for (let index = node.length - 1; index >= 0; index -= 1) {
      const item = node[index]
      if (!item || typeof item !== 'object' || Array.isArray(item)) continue
      if (typeof item.claim !== 'string' || !item.claim.trim()) continue
      if (findInternalGovernanceLeaks(item.claim).length === 0) continue
      quarantined.push({
        slug: slugHint,
        id: item.id ?? null,
        claim: item.claim,
        reason: 'claim text is an internal governance ruling, not a scientific claim',
      })
      node.splice(index, 1)
      stats.quarantinedClaims += 1
      changed = true
    }
    for (const item of node) if (repair(item, canonical, slugHint, depth + 1)) changed = true
    return changed
  }

  const slug = String(node.slug ?? '').trim() || slugFromRoute(node) || slugHint

  for (const [key, value] of Object.entries(node)) {
    if (typeof value === 'string') {
      if (!PUBLIC_TEXT_FIELDS.includes(key)) continue
      if (!isLeakedUserFacingText(value)) continue

      const replacement = canonicalReplacement(key, slug, canonical)

      if (replacement) {
        node[key] = replacement
        stats.replacedFromCanonical += 1
      } else {
        // `stripLeakedSentences` recovers real content clause by clause and
        // returns '' for a value that is wholly an internal ruling, so a
        // version-stamped decision can never be partially published.
        const survived = stripLeakedSentences(value)
        if (survived) {
          node[key] = survived
          stats.stripped += 1
        } else if (EMPTIABLE_FIELDS.has(key)) {
          node[key] = ''
          stats.emptied += 1
        } else {
          // Nothing survived and the field is reader-visible. Leave it rather
          // than blank a page element; the validator will report it so a human
          // fixes the workbook cell.
          continue
        }
      }
      bump(key)
      changed = true
      continue
    }

    if (value && typeof value === 'object') {
      if (repair(value, canonical, slug, depth + 1)) changed = true
    }
  }

  return changed
}

function main() {
  if (!fs.existsSync(DATA_DIR)) {
    console.error(`[sanitize-public-text] FAILED — no data directory at ${path.relative(ROOT, DATA_DIR)}`)
    process.exit(1)
  }

  const canonical = loadCanonicalText()
  if (canonical.size === 0) {
    console.error('[sanitize-public-text] FAILED — no canonical records in herbs.json/compounds.json.')
    console.error('Run the workbook parse before sanitizing, or this pass has nothing to repair from.')
    process.exit(1)
  }

  const files = walkFiles(DATA_DIR)
  if (files.length === 0) {
    console.error(`[sanitize-public-text] FAILED — no JSON payloads under ${path.relative(ROOT, DATA_DIR)}`)
    process.exit(1)
  }

  for (const file of files) {
    const raw = fs.readFileSync(file, 'utf8')
    const payload = readJson(file)
    // Per-profile payloads (detail files, ai-entity graphs) are named after
    // their slug, and their inner nodes — a JSON-LD `@graph` entry, for
    // instance — carry no slug of their own. Seeding the hint from the filename
    // lets those nodes recover the right profile's canonical prose.
    const fileSlug = path.basename(file, '.json')
    if (!repair(payload, canonical, canonical.has(fileSlug) ? fileSlug : '')) continue
    stats.filesChanged += 1
    // Match the file's existing formatting. The summary indexes are written
    // minified and the detail files pretty-printed; reformatting either would
    // bury a two-line repair in a whole-corpus diff.
    const pretty = /\n\s+"/.test(raw.slice(0, 4096))
    const serialized = pretty ? JSON.stringify(payload, null, 2) : JSON.stringify(payload)
    if (!DRY_RUN) fs.writeFileSync(file, raw.endsWith('\n') ? `${serialized}\n` : serialized, 'utf8')
  }

  console.log(`\nPublic text sanitized${DRY_RUN ? ' (dry run)' : ''}`)
  console.log('='.repeat(66))
  console.log(`Files scanned            ${files.length}`)
  console.log(`Files changed            ${stats.filesChanged}`)
  console.log(`  replaced w/ canonical  ${stats.replacedFromCanonical}`)
  console.log(`  sentence-stripped      ${stats.stripped}`)
  console.log(`  emptied                ${stats.emptied}`)
  console.log(`  claims quarantined     ${stats.quarantinedClaims}`)
  for (const [field, count] of Object.entries(stats.fieldsRepaired).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${String(count).padStart(5)}  ${field}`)
  }

  if (quarantined.length && !DRY_RUN) {
    // ops/, not public/ — this is an internal review artifact and must not be
    // served from the site.
    const reportPath = path.join(ROOT, 'ops', 'reports', 'quarantined-claims.json')
    fs.mkdirSync(path.dirname(reportPath), { recursive: true })
    fs.writeFileSync(
      reportPath,
      `${JSON.stringify({ count: quarantined.length, claims: quarantined }, null, 2)}
`,
      'utf8',
    )
    console.log(`
Quarantined claims report: ${path.relative(ROOT, reportPath)}`)
  }
}

main()
