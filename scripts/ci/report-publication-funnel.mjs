#!/usr/bin/env node
/**
 * Where profiles are lost between "we have this" and "Google can index it".
 *
 * Why this exists
 * ---------------
 * Three artifacts answer "what is published?" and they disagree by up to 30%:
 *
 *   indexability_status: PUBLISH in herbs.json / compounds.json
 *   publication-manifest.json (post-governance eligibility)
 *   the profile URLs actually present in out/sitemap.xml
 *
 * The most reachable of those — the status field on the main data files — is
 * also the least accurate, because the committed data is parser output taken
 * before the governance overlay runs. Anyone planning content from it, human or
 * agent, is working from a number that overstates the indexable corpus.
 *
 * That is not hypothetical. Reading that field is what produced three
 * successive wrong conclusions about this codebase in one sitting: that thin
 * variant pages were competing for the same query (they are canonicalised),
 * that published profiles were missing evidence grades (grades are withheld
 * deliberately when the evidence cannot back them), and that Grade A herbs were
 * being suppressed by a bug (governance excludes them on purpose).
 *
 * Each stage of the funnel is legitimate. What was missing is anything that
 * states the stages side by side, so a drop can be recognised as intended
 * rather than rediscovered as a bug.
 *
 * This reports; it does not gate. The drops are policy decisions, and a
 * threshold here would encode today's numbers as correct forever.
 *
 * Usage: node scripts/ci/report-publication-funnel.mjs [--json]
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const asJson = process.argv.includes('--json')

function readJson(relativePath) {
  const file = path.join(ROOT, relativePath)
  if (!fs.existsSync(file)) return null
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return null
  }
}

const herbs = readJson('public/data/herbs.json') || []
const compounds = readJson('public/data/compounds.json') || []
const manifest = readJson('public/data/publication-manifest.json')

const profiles = [
  ...herbs.map((record) => ({ kind: 'herb', record })),
  ...compounds.map((record) => ({ kind: 'compound', record })),
]

const authored = profiles.length
const dataEligible = profiles.filter(
  ({ record }) => String(record.indexability_status || '').toUpperCase() === 'PUBLISH',
).length

/**
 * Profile routes in the manifest the deploy actually builds the sitemap from.
 *
 * This replaced publication-manifest.json as the governed stage once it became
 * clear nothing ships that file. scripts/build-deploy.mjs regenerates the whole
 * data pipeline from the workbook and never runs
 * build-publication-manifest-from-workbook.mjs, and no consumer exists under
 * app/, lib/, components/ or scripts/data/. Reporting it as a funnel stage
 * invited exactly one conclusion — that 96 publishable profiles were being
 * dropped — from an artifact that has no bearing on what gets indexed.
 */
function routeManifestProfileCount() {
  const routes = readJson('public/data/runtime-manifests/route-manifest.json')
  if (!Array.isArray(routes)) return null
  const profiles = routes
    .map((entry) => String(entry?.route ?? ''))
    .filter((route) => /^\/(herbs|compounds)\/[^/]+\/?$/u.test(route))
  return new Set(profiles).size
}
const governed = routeManifestProfileCount()

/**
 * publication-manifest.json, kept in view as an artifact rather than a stage.
 * It is stale and unconsumed; saying so is more useful than either quoting it
 * or quietly dropping it, because its number is plausible enough to be trusted.
 */
const orphanedManifestCount = manifest
  ? (manifest.entities?.herbs?.length ?? 0) + (manifest.entities?.compounds?.length ?? 0)
  : null

/** Distinct /herbs/<slug>/ and /compounds/<slug>/ URLs in the emitted sitemap. */
function sitemapProfileCount() {
  const file = path.join(ROOT, 'out', 'sitemap.xml')
  if (!fs.existsSync(file)) return null
  const xml = fs.readFileSync(file, 'utf8')
  const matches = xml.match(/\/(herbs|compounds)\/[a-z0-9-]+\//g) || []
  return new Set(matches).size
}
const inSitemap = sitemapProfileCount()

/**
 * Account for the last drop, because an unexplained one gets investigated.
 *
 * A profile route absent from the sitemap is almost always governance doing its
 * job: the page is built with `noindex, follow`, so listing it would be a
 * contradiction. Presented as a bare "-31" that is indistinguishable from
 * leakage, and it reads as 31 lost pages — including names like caffeine,
 * magnesium and melatonin, which is alarming enough to act on.
 *
 * Only one of these buckets can indicate a defect. A page built *without*
 * noindex and still missing from the sitemap is a genuine leak; everything else
 * is either policy or build ordering, since the route manifest is regenerated
 * later in the build than the sitemap is written.
 */
function sitemapGapBreakdown() {
  const routes = readJson('public/data/runtime-manifests/route-manifest.json')
  const sitemapFile = path.join(ROOT, 'out', 'sitemap.xml')
  if (!Array.isArray(routes) || !fs.existsSync(sitemapFile)) return null

  const xml = fs.readFileSync(sitemapFile, 'utf8')
  const listed = new Set(xml.match(/\/(herbs|compounds)\/[a-z0-9-]+\//g) || [])
  const profileRoutes = [...new Set(
    routes.map((entry) => String(entry?.route ?? '')).filter((route) => /^\/(herbs|compounds)\/[^/]+\/?$/u.test(route)),
  )]

  const breakdown = { withheldNoindex: 0, leaked: 0, notBuilt: 0, leakedRoutes: [] }
  for (const route of profileRoutes) {
    if (listed.has(`${route}/`)) continue
    const page = path.join(ROOT, 'out', route.replace(/^\//u, ''), 'index.html')
    if (!fs.existsSync(page)) {
      breakdown.notBuilt += 1
      continue
    }
    if (/<meta name="robots" content="noindex/u.test(fs.readFileSync(page, 'utf8'))) {
      breakdown.withheldNoindex += 1
    } else {
      breakdown.leaked += 1
      if (breakdown.leakedRoutes.length < 10) breakdown.leakedRoutes.push(route)
    }
  }
  return breakdown
}
const sitemapGap = sitemapGapBreakdown()

/**
 * How stale the governed manifest is, measured against the data it describes.
 *
 * The first version of this compared manifest.generatedAt to the generatedAt in
 * _meta/build-info.json. Both files are written by the same pipeline step, so
 * they always move together: with the manifest 28 days behind herbs.json, the
 * check saw a 28 *second* gap and never fired. A staleness guard that reads a
 * clock moving in lockstep with the thing it is timing cannot detect drift at
 * all, which is worse than having no guard — the number looks checked.
 *
 * Comparing against the data files is the comparison that was meant. On a fresh
 * clone every mtime is checkout time, which makes a genuinely old manifest look
 * old rather than hiding it.
 */
function manifestDriftDays() {
  if (!manifest?.generatedAt) return null
  const generated = Date.parse(manifest.generatedAt)
  if (Number.isNaN(generated)) return null

  let newest = 0
  for (const relativePath of ['public/data/herbs.json', 'public/data/compounds.json']) {
    const file = path.join(ROOT, relativePath)
    if (!fs.existsSync(file)) continue
    newest = Math.max(newest, fs.statSync(file).mtimeMs)
  }
  if (!newest) return null
  return Math.round((newest - generated) / 86400000)
}
const staleDays = manifestDriftDays()

/**
 * Whether the manifest still describes this corpus, independent of any clock.
 * A profile it names that no longer exists, or a profile marked PUBLISH that it
 * has never heard of, means the two are describing different corpora — the
 * signal survives a fresh clone, where every mtime is identical.
 */
function manifestCoverage() {
  if (!manifest) return null
  const named = new Set([
    ...(manifest.entities?.herbs ?? []),
    ...(manifest.entities?.compounds ?? []),
  ].map((entry) => String(entry?.slug ?? entry)))

  const current = new Set(profiles.map(({ record }) => String(record.slug)))
  const publishable = profiles
    .filter(({ record }) => String(record.indexability_status || '').toUpperCase() === 'PUBLISH')
    .map(({ record }) => String(record.slug))

  return {
    namedButGone: [...named].filter((slug) => !current.has(slug)).length,
    publishableButUnknown: publishable.filter((slug) => !named.has(slug)).length,
  }
}
const coverage = manifestCoverage()

const stages = [
  { label: 'authored profiles', count: authored, note: 'herbs.json + compounds.json' },
  { label: 'data says PUBLISH', count: dataEligible, note: 'indexability_status — pre-governance' },
  { label: 'in route manifest', count: governed, note: 'runtime-manifests/route-manifest.json' },
  { label: 'in emitted sitemap', count: inSitemap, note: 'out/sitemap.xml' },
]

if (asJson) {
  console.log(JSON.stringify({ stages, manifestStaleDays: staleDays, manifestCoverage: coverage, sitemapGap }, null, 2))
  process.exit(0)
}

console.log('\nPublication funnel')
console.log('='.repeat(66))

let previous = null
for (const stage of stages) {
  if (stage.count == null) {
    console.log(`  ${stage.label.padEnd(22)} ${'—'.padStart(6)}   ${stage.note} (not built)`)
    continue
  }
  const drop = previous == null ? '' : `-${previous - stage.count}`
  console.log(`  ${stage.label.padEnd(22)} ${String(stage.count).padStart(6)} ${drop.padStart(7)}   ${stage.note}`)
  previous = stage.count
}

if (dataEligible && inSitemap) {
  const overstated = dataEligible - inSitemap
  const pct = ((overstated / dataEligible) * 100).toFixed(1)
  console.log(
    `\n  indexability_status overstates the indexed corpus by ${overstated} profiles (${pct}%).` +
      '\n  Plan from the sitemap or the route manifest, not from that field.',
  )
}

if (orphanedManifestCount != null) {
  const detail = []
  if (staleDays != null && staleDays > 7) detail.push(`${staleDays} days behind the data`)
  if (coverage?.publishableButUnknown) detail.push(`missing ${coverage.publishableButUnknown} profiles marked PUBLISH`)
  console.log(
    `\n  publication-manifest.json reports ${orphanedManifestCount} profiles` +
      (detail.length ? ` and is ${detail.join(', ')}.` : '.') +
      '\n  Nothing consumes it: build-deploy.mjs never regenerates it and no code reads it,' +
      '\n  so that number describes nothing that ships. Do not plan from it.',
  )
}

if (sitemapGap) {
  console.log(
    '\n  The route-manifest to sitemap drop, accounted for:' +
      `\n    ${sitemapGap.withheldNoindex} built with noindex — governance withheld them, correctly absent` +
      `\n    ${sitemapGap.notBuilt} have no page in out/ — the route manifest is regenerated after the sitemap` +
      `\n    ${sitemapGap.leaked} built indexable but missing from the sitemap`,
  )
  if (sitemapGap.leaked) {
    console.log(
      '\n  That last number is the only one here that means a defect:' +
        `\n    ${sitemapGap.leakedRoutes.join('\n    ')}`,
    )
  } else {
    console.log('\n  Nothing indexable is missing from the sitemap.')
  }
}

if (inSitemap == null) {
  console.log('\n  out/ is not built, so the emitted-sitemap stage was skipped.')
}

console.log('')
