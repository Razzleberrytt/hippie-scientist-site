#!/usr/bin/env node
/**
 * Validate every citation identifier before it can ship.
 *
 * A citation is the mechanism by which a reader checks a claim, so a malformed
 * identifier is worse than an absent one: the page still presents itself as
 * sourced. Two compounds shipped a packed cell — `pmid: "15070181; 22167571"` —
 * which the exporter turned into one href containing two URLs, resolving
 * nowhere.
 *
 * Blocking (exit 1):
 *   - a PMID or DOI that cannot be a real identifier
 *   - a citation URL that is not a single well-formed link
 *   - one identifier recorded under conflicting study titles
 *
 * Reported only: missing year/authors/journal and placeholder titles. Those are
 * enrichment gaps across most of the corpus; failing on them would block every
 * build without telling anyone something new.
 *
 * Usage: node scripts/ci/validate-citation-identifiers.mjs
 */

import fs from 'node:fs'
import path from 'node:path'

import {
  citationCompleteness,
  isPlaceholderCitationTitle,
  isValidDoi,
  isValidPmid,
  normalizeDoi,
} from '../../lib/citation-identifiers.mjs'

const ROOT = process.cwd()
const DATA_DIR = path.join(ROOT, 'public', 'data')
const REPORTS_DIR = path.join(ROOT, 'ops', 'reports')
const REPORT_PATH = path.join(REPORTS_DIR, 'citation-identifiers.json')

const text = (value) => String(value ?? '').trim()

function* detailRecords() {
  for (const [dir, kind] of [
    ['herbs-detail', 'herbs'],
    ['compounds-detail', 'compounds'],
  ]) {
    const full = path.join(DATA_DIR, dir)
    if (!fs.existsSync(full)) continue
    for (const file of fs.readdirSync(full)) {
      if (!file.endsWith('.json')) continue
      try {
        const record = JSON.parse(fs.readFileSync(path.join(full, file), 'utf8'))
        yield { kind, slug: record.slug ?? file.replace(/\.json$/, ''), record }
      } catch {
        // A file that will not parse is another validator's finding.
      }
    }
  }
}

function main() {
  const blocking = []
  const advisory = []
  const seenByIdentifier = new Map()
  let sources = 0

  for (const { kind, slug, record } of detailRecords()) {
    const url = `/${kind}/${slug}/`
    for (const source of Array.isArray(record.sources) ? record.sources : []) {
      sources += 1

      const rawPmid = text(source.pmid ?? source.pubmedId)
      const rawDoi = normalizeDoi(source.doi)
      const rawUrl = text(source.url)

      if (rawPmid && !isValidPmid(rawPmid)) {
        blocking.push({ url, kind: 'invalid-pmid', value: rawPmid, title: text(source.title).slice(0, 80) })
      }
      if (rawDoi && !isValidDoi(rawDoi)) {
        blocking.push({ url, kind: 'invalid-doi', value: rawDoi, title: text(source.title).slice(0, 80) })
      }
      if (rawUrl && !/^https?:\/\/\S+$/.test(rawUrl)) {
        blocking.push({ url, kind: 'malformed-citation-url', value: rawUrl.slice(0, 120), title: text(source.title).slice(0, 80) })
      }

      const completeness = citationCompleteness(source)
      if (!completeness.complete) {
        advisory.push({ url, missing: completeness.missing, identifier: completeness.identifier })
      }
      if (isPlaceholderCitationTitle(source.title)) {
        advisory.push({ url, missing: ['placeholder-title'], value: text(source.title).slice(0, 90) })
      }

      // Same identifier, different titles — one study recorded twice.
      if (completeness.identifier) {
        const titles = seenByIdentifier.get(completeness.identifier) ?? new Set()
        const normalized = text(source.title).toLowerCase()
        if (normalized) titles.add(normalized)
        seenByIdentifier.set(completeness.identifier, titles)
      }
    }
  }

  const conflicts = [...seenByIdentifier.entries()]
    .filter(([, titles]) => titles.size > 1)
    .map(([identifier, titles]) => ({ identifier, titles: [...titles].map((t) => t.slice(0, 80)) }))

  const missingCounts = {}
  for (const item of advisory) {
    for (const field of item.missing) missingCounts[field] = (missingCounts[field] ?? 0) + 1
  }

  fs.mkdirSync(REPORTS_DIR, { recursive: true })
  fs.writeFileSync(
    REPORT_PATH,
    `${JSON.stringify({ generatedAt: new Date().toISOString(), sources, blocking, missingCounts, conflicts }, null, 2)}\n`,
  )

  console.log('\nCitation identifiers')
  console.log('='.repeat(66))
  console.log(`Sources scanned        ${sources}`)
  console.log(`Blocking problems      ${blocking.length}`)
  console.log(`Same id, two titles    ${conflicts.length}`)
  for (const [field, count] of Object.entries(missingCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(count).padStart(5)}  missing ${field}`)
  }
  console.log(`\nReport: ${path.relative(ROOT, REPORT_PATH)}`)

  if (blocking.length) {
    console.error(`\n[citation-identifiers] FAILED — ${blocking.length} unusable identifier(s).\n`)
    for (const problem of blocking.slice(0, 20)) {
      console.error(`  ${problem.url} · ${problem.kind} · ${problem.value}`)
    }
    process.exit(1)
  }

  if (conflicts.length) {
    console.error(`\n[citation-identifiers] FAILED — ${conflicts.length} identifier(s) recorded under conflicting titles.`)
    for (const conflict of conflicts.slice(0, 20)) {
      console.error(`  ${conflict.identifier} · ${conflict.titles.join(' <> ')}`)
    }
    process.exit(1)
  }
}

main()
