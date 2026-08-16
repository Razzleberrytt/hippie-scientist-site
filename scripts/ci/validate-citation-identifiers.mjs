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
 *   - the same identified study listed more than once on one profile
 *   - one PMID paired with multiple DOIs, or one DOI paired with multiple PMIDs
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
  citationIdentifiers,
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

function addMapping(map, key, value) {
  if (!key || !value) return
  const values = map.get(key) ?? new Set()
  values.add(value)
  map.set(key, values)
}

function mappingConflicts(map, fromKind, toKind) {
  return [...map.entries()]
    .filter(([, values]) => values.size > 1)
    .map(([identifier, values]) => ({
      kind: `${fromKind}-to-${toKind}`,
      identifier,
      values: [...values].sort(),
    }))
}

function main() {
  const blocking = []
  const advisory = []
  const seenByIdentifier = new Map()
  const duplicateProfileSources = []
  const pmidToDois = new Map()
  const doiToPmids = new Map()
  let sources = 0

  for (const { kind, slug, record } of detailRecords()) {
    const url = `/${kind}/${slug}/`
    const profileIdentifiers = new Set()

    for (const source of Array.isArray(record.sources) ? record.sources : []) {
      sources += 1

      const rawPmid = text(source.pmid ?? source.pubmedId)
      const rawDoi = normalizeDoi(source.doi)
      const canonicalDoi = rawDoi.toLowerCase()
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

      if (isValidPmid(rawPmid) && isValidDoi(rawDoi)) {
        addMapping(pmidToDois, rawPmid, canonicalDoi)
        addMapping(doiToPmids, canonicalDoi, rawPmid)
      }

      const completeness = citationCompleteness(source)
      if (!completeness.complete) {
        advisory.push({ url, missing: completeness.missing, identifier: completeness.identifier })
      }
      if (isPlaceholderCitationTitle(source.title)) {
        advisory.push({ url, missing: ['placeholder-title'], value: text(source.title).slice(0, 90) })
      }

      const aliases = citationIdentifiers(source)
      const duplicateAliases = aliases.filter((identifier) => profileIdentifiers.has(identifier))
      if (duplicateAliases.length) {
        duplicateProfileSources.push({
          url,
          identifiers: duplicateAliases,
          title: text(source.title).slice(0, 80),
        })
      }
      for (const identifier of aliases) profileIdentifiers.add(identifier)

      const normalizedTitle = text(source.title).toLowerCase()
      for (const identifier of aliases) {
        const titles = seenByIdentifier.get(identifier) ?? new Set()
        if (normalizedTitle) titles.add(normalizedTitle)
        seenByIdentifier.set(identifier, titles)
      }
    }
  }

  const conflicts = [...seenByIdentifier.entries()]
    .filter(([, titles]) => titles.size > 1)
    .map(([identifier, titles]) => ({ identifier, titles: [...titles].map((t) => t.slice(0, 80)) }))

  const identifierPairConflicts = [
    ...mappingConflicts(pmidToDois, 'pmid', 'doi'),
    ...mappingConflicts(doiToPmids, 'doi', 'pmid'),
  ]

  const missingCounts = {}
  for (const item of advisory) {
    for (const field of item.missing) missingCounts[field] = (missingCounts[field] ?? 0) + 1
  }

  fs.mkdirSync(REPORTS_DIR, { recursive: true })
  fs.writeFileSync(
    REPORT_PATH,
    `${JSON.stringify({ generatedAt: new Date().toISOString(), sources, blocking, duplicateProfileSources, identifierPairConflicts, missingCounts, conflicts }, null, 2)}\n`,
  )

  console.log('\nCitation identifiers')
  console.log('='.repeat(66))
  console.log(`Sources scanned        ${sources}`)
  console.log(`Blocking problems      ${blocking.length}`)
  console.log(`Duplicate profile refs ${duplicateProfileSources.length}`)
  console.log(`Identifier pair issues ${identifierPairConflicts.length}`)
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

  if (duplicateProfileSources.length) {
    console.error(`\n[citation-identifiers] FAILED — ${duplicateProfileSources.length} duplicate source reference(s) within profiles.`)
    for (const duplicate of duplicateProfileSources.slice(0, 20)) {
      console.error(`  ${duplicate.url} · ${duplicate.identifiers.join(', ')} · ${duplicate.title}`)
    }
    process.exit(1)
  }

  if (identifierPairConflicts.length) {
    console.error(`\n[citation-identifiers] FAILED — ${identifierPairConflicts.length} inconsistent PMID/DOI mapping(s).`)
    for (const conflict of identifierPairConflicts.slice(0, 20)) {
      console.error(`  ${conflict.kind} · ${conflict.identifier} · ${conflict.values.join(' <> ')}`)
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
