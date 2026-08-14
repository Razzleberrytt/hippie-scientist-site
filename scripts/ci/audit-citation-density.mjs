#!/usr/bin/env node
/**
 * audit-citation-density.mjs
 *
 * The site's proposition is evidence-first, so the number that matters is not
 * "how many claims do we make" but "how many of them are backed". This audit
 * measures, per indexable profile:
 *
 *   - sources attached (real, de-duplicated, resolvable citations)
 *   - claims asserted (from claims.json)
 *   - citations per claim  — the density that actually supports the brand promise
 *   - unsupported profiles — pages asserting effects with zero sources
 *   - leaked pipeline rows  — "claims" that are really aggregate counters
 *
 * Usage:
 *   node scripts/ci/audit-citation-density.mjs
 *   node scripts/ci/audit-citation-density.mjs --strict     # exit 1 if indexable pages have 0 sources
 *   node scripts/ci/audit-citation-density.mjs --min-sources=2
 *
 * Output: ops/reports/citation-density.json
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { REPORTS_DIR, ROOT, loadProfileCorpus, median, percent, text } from '../lib/profile-corpus.mjs'

const argv = process.argv.slice(2)
const flag = (name, fallback) => {
  const hit = argv.find((a) => a === `--${name}` || a.startsWith(`--${name}=`))
  if (!hit) return fallback
  const [, value] = hit.split('=')
  return value === undefined ? true : value
}

const STRICT = flag('strict', false) === true
const MIN_SOURCES = Number(flag('min-sources', 1))
const REPORT_PATH = path.join(REPORTS_DIR, 'citation-density.json')

/* ------------------------------------------------------------- citations -- */

/** A source only counts if it resolves to something a reader can open. */
function isResolvable(source) {
  if (!source || typeof source !== 'object') return Boolean(text(source))
  const url = text(source.url ?? source.href)
  const pmid = text(source.pubmedId ?? source.pmid)
  const doi = text(source.doi)
  return Boolean(url || pmid || doi)
}

/** Identity for de-duplication: the same trial cited twice is one citation. */
function sourceKey(source) {
  if (!source || typeof source !== 'object') return text(source).toLowerCase()
  const pmid = text(source.pubmedId ?? source.pmid)
  if (pmid) return `pmid:${pmid}`
  const doi = text(source.doi).toLowerCase()
  if (doi) return `doi:${doi.replace(/^https?:\/\/(dx\.)?doi\.org\//, '')}`
  const url = text(source.url ?? source.href).toLowerCase()
  if (url) return `url:${url.replace(/\/+$/, '')}`
  return `title:${text(source.title).toLowerCase()}`
}

/** Primary human evidence is worth more than a narrative review or fact sheet. */
const PRIMARY_EVIDENCE_RE = /(randomi|rct|trial|meta[- ]analysis|systematic review|cochrane)/i

function classifySources(sources) {
  const unique = new Map()
  for (const source of sources) {
    if (!isResolvable(source)) continue
    const key = sourceKey(source)
    if (!unique.has(key)) unique.set(key, source)
  }
  const values = [...unique.values()]
  const primary = values.filter((s) =>
    PRIMARY_EVIDENCE_RE.test(`${text(s.studyType ?? s.study_type ?? s.type)} ${text(s.title)}`),
  ).length
  const withYear = values.filter((s) => Number(s.year) > 1900).length
  const years = values.map((s) => Number(s.year)).filter((y) => y > 1900)

  return {
    unique: values.length,
    primary,
    withYear,
    newestYear: years.length ? Math.max(...years) : null,
    oldestYear: years.length ? Math.min(...years) : null,
  }
}

/* ------------------------------------------------------------------ main -- */

function main() {
  const { entries, claims } = loadProfileCorpus()

  const rows = entries.map((entry) => {
    const stats = classifySources(entry.sources)
    const claimCount = entry.claimCount
    const density = claimCount > 0 ? Number((stats.unique / claimCount).toFixed(2)) : null

    const issues = []
    if (entry.indexable && stats.unique === 0) issues.push('indexable-zero-sources')
    if (entry.indexable && stats.unique < MIN_SOURCES) issues.push('below-min-sources')
    if (claimCount > 0 && stats.unique === 0) issues.push('claims-without-sources')
    // Inferred from studyType/title text; a miss can mean weak evidence OR
    // missing source metadata, so this is a triage signal, not a verdict.
    if (stats.unique > 0 && stats.primary === 0) issues.push('no-primary-evidence-signal')
    if (stats.unique > 0 && stats.withYear === 0) issues.push('sources-undated')

    return {
      kind: entry.kind,
      slug: entry.slug,
      url: entry.url,
      indexable: entry.indexable,
      rawSources: entry.sources.length,
      uniqueSources: stats.unique,
      primarySources: stats.primary,
      newestYear: stats.newestYear,
      oldestYear: stats.oldestYear,
      claimCount,
      citationsPerClaim: density,
      evidenceBand: entry.evidenceGrade.band,
      issues,
    }
  })

  const byKind = {}
  for (const kind of ['herb', 'compound']) {
    const all = rows.filter((r) => r.kind === kind)
    const indexable = all.filter((r) => r.indexable)
    const zero = indexable.filter((r) => r.uniqueSources === 0)

    byKind[kind] = {
      total: all.length,
      indexable: indexable.length,
      totalUniqueSources: all.reduce((sum, r) => sum + r.uniqueSources, 0),
      indexableUniqueSources: indexable.reduce((sum, r) => sum + r.uniqueSources, 0),
      medianSourcesIndexable: median(indexable.map((r) => r.uniqueSources)),
      medianPrimaryIndexable: median(indexable.map((r) => r.primarySources)),
      indexableWithZeroSources: zero.length,
      zeroSourcePct: percent(zero.length, indexable.length),
      indexableWithoutPrimary: indexable.filter((r) => r.uniqueSources > 0 && r.primarySources === 0).length,
      worstOffenders: zero.map((r) => r.url).slice(0, 40),
    }
  }

  const claimIntegrity = {
    totalRows: claims.total,
    usableClaims: [...claims.bySlug.values()].reduce((sum, list) => sum + list.length, 0),
    leakedPipelineRows: claims.leaked.length,
    leakedPct: percent(claims.leaked.length, claims.total),
    profilesWithClaims: claims.bySlug.size,
    sampleLeaked: claims.leaked.slice(0, 5).map((row) => ({ id: row.id, claim: row.claim.slice(0, 90) })),
  }

  const report = {
    generatedAt: new Date().toISOString(),
    minSources: MIN_SOURCES,
    summary: byKind,
    claimIntegrity,
    profiles: rows.sort((a, b) => a.uniqueSources - b.uniqueSources),
  }

  mkdirSync(REPORTS_DIR, { recursive: true })
  writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`)

  printSummary(report)

  if (!STRICT) return

  const failures = []
  const totalZero = Object.values(byKind).reduce((sum, k) => sum + k.indexableWithZeroSources, 0)
  if (totalZero > 0) failures.push(`${totalZero} indexable profile(s) cite nothing`)
  // Roll-up counter rows are filtered at the generator (claimRow in
  // build-runtime-from-workbook.mjs); any reappearance is a regression.
  if (claimIntegrity.leakedPipelineRows > 0) {
    failures.push(`${claimIntegrity.leakedPipelineRows} pipeline counter row(s) leaked into claims.json`)
  }

  if (failures.length) {
    console.error(`\n[citation-density] FAILED — ${failures.join('; ')}.`)
    process.exit(1)
  }
}

function printSummary(report) {
  console.log('\nCitation density audit')
  console.log('='.repeat(64))

  for (const [kind, stats] of Object.entries(report.summary)) {
    console.log(`\n${kind}s`)
    console.log(`  indexable                     ${stats.indexable} / ${stats.total}`)
    console.log(`  unique sources (indexable)    ${stats.indexableUniqueSources}  (corpus-wide: ${stats.totalUniqueSources})`)
    console.log(`  median sources per page       ${stats.medianSourcesIndexable}`)
    console.log(`  median primary human sources  ${stats.medianPrimaryIndexable}`)
    console.log(`  indexable citing NOTHING      ${stats.indexableWithZeroSources}  (${stats.zeroSourcePct}%)`)
    console.log(`  no RCT/meta signal in sources  ${stats.indexableWithoutPrimary}  (weak evidence OR missing studyType metadata)`)
    if (stats.worstOffenders.length) {
      console.log('  zero-source indexable pages (first 10):')
      for (const url of stats.worstOffenders.slice(0, 10)) console.log(`    ${url}`)
    }
  }

  const ci = report.claimIntegrity
  console.log('\nClaim integrity (claims.json)')
  console.log(`  rows                    ${ci.totalRows}`)
  console.log(`  usable claims           ${ci.usableClaims}`)
  console.log(`  leaked pipeline rows    ${ci.leakedPipelineRows}  (${ci.leakedPct}%)`)
  console.log(`  profiles with claims    ${ci.profilesWithClaims}`)
  for (const sample of ci.sampleLeaked) console.log(`    ! ${sample.id}: ${sample.claim}`)

  console.log(`\nReport: ${path.relative(ROOT, REPORT_PATH)}`)
}

main()
