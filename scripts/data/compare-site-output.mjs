#!/usr/bin/env node
// data:compare-site — compare the canonical export (data/generated/site/) against
// the live workbook-generated public/data. Reports counts, slug set differences,
// title/meta differences, per-field coverage, and changed values so a human can
// confirm there are no UNEXPLAINED losses before switching the site over.

import fs from 'node:fs'
import path from 'node:path'
import { readJson, writeJson } from './canonical/jsonl.mjs'
import { exportSiteRecords } from './canonical/site-export.mjs'
import { generatedDir, repoRoot } from './canonical/paths.mjs'

function indexBySlug(rows) {
  const map = new Map()
  for (const r of rows) map.set(r.slug, r)
  return map
}

function isPopulated(value) {
  if (Array.isArray(value)) return value.length > 0
  if (value == null) return false
  if (typeof value === 'string') return value.trim() !== ''
  return true
}

function compareCollection(label, canonicalRows, siteRows) {
  const canon = indexBySlug(canonicalRows)
  const site = indexBySlug(siteRows)
  const canonSlugs = new Set(canon.keys())
  const siteSlugs = new Set(site.keys())

  const onlyInCanonical = [...canonSlugs].filter((s) => !siteSlugs.has(s)).sort()
  const onlyInSite = [...siteSlugs].filter((s) => !canonSlugs.has(s)).sort()
  const shared = [...canonSlugs].filter((s) => siteSlugs.has(s)).sort()

  // Field coverage: for shared records, how often the canonical export populates
  // each key that the site populates.
  const siteKeys = siteRows.length ? Object.keys(siteRows[0]) : []
  const coverage = {}
  for (const key of siteKeys) {
    let sitePop = 0
    let canonPop = 0
    for (const slug of shared) {
      if (isPopulated(site.get(slug)[key])) sitePop += 1
      if (isPopulated(canon.get(slug)?.[key])) canonPop += 1
    }
    coverage[key] = { site_populated: sitePop, canonical_populated: canonPop }
  }

  // Title / name changes on shared slugs.
  const nameChanges = []
  for (const slug of shared) {
    const a = canon.get(slug)
    const b = site.get(slug)
    if (a.name !== b.name) nameChanges.push({ slug, canonical: a.name, site: b.name })
  }

  // Value-level parity for the ported derived fields: count shared records whose
  // canonical value differs from the live value (order-insensitive for arrays).
  const norm = (v) => (Array.isArray(v) ? [...v].map((x) => String(x)).sort().join('|') : String(v ?? ''))
  const PARITY_FIELDS = [
    'name', 'summary', 'evidence_grade', 'evidence_tier', 'dosage',
    'effects', 'primary_effects', 'mechanisms', 'raw_mechanisms', 'canonical_mechanisms',
    'mechanism_categories', 'mechanism_classes', 'mechanism_normalization_status', 'unmapped_mechanisms',
    'indexability_status', 'indexability_score', 'indexability_reasons', 'robots', 'visibility_tier',
    'affiliate_label', 'regulatory_status', 'allow_restricted_reference_export',
  ]
  const valueDiffs = {}
  for (const field of PARITY_FIELDS) {
    let mismatches = 0
    const examples = []
    for (const slug of shared) {
      const cv = norm(canon.get(slug)?.[field])
      const sv = norm(site.get(slug)?.[field])
      if (cv !== sv) {
        mismatches += 1
        if (examples.length < 5) examples.push({ slug, canonical: canon.get(slug)?.[field], site: site.get(slug)?.[field] })
      }
    }
    valueDiffs[field] = { mismatches, of: shared.length, examples: mismatches ? examples : undefined }
  }

  return {
    label,
    counts: { canonical: canonicalRows.length, site: siteRows.length },
    slug_diff: {
      only_in_canonical: { count: onlyInCanonical.length, sample: onlyInCanonical.slice(0, 25) },
      only_in_site: { count: onlyInSite.length, sample: onlyInSite.slice(0, 25) },
      shared: shared.length,
    },
    name_changes: { count: nameChanges.length, sample: nameChanges.slice(0, 25) },
    value_parity: valueDiffs,
    field_coverage: coverage,
  }
}

function main() {
  const publicData = path.join(repoRoot, 'public', 'data')
  const siteHerbs = readJson(path.join(publicData, 'herbs.json'), [])
  const siteCompounds = readJson(path.join(publicData, 'compounds.json'), [])
  const { herbs: canonHerbs, compounds: canonCompounds } = exportSiteRecords()

  const report = {
    compared_at: new Date().toISOString(),
    herbs: compareCollection('herbs', canonHerbs, siteHerbs),
    compounds: compareCollection('compounds', canonCompounds, siteCompounds),
  }

  // Fields the canonical export does not yet populate for ANY shared record.
  for (const key of ['herbs', 'compounds']) {
    const cov = report[key].field_coverage
    report[key].fields_not_yet_ported = Object.entries(cov)
      .filter(([, v]) => v.site_populated > 0 && v.canonical_populated === 0)
      .map(([k]) => k)
  }

  const outDir = path.join(generatedDir, 'reports')
  writeJson(path.join(outDir, 'site-comparison-latest.json'), report)

  // Console summary.
  for (const key of ['herbs', 'compounds']) {
    const r = report[key]
    console.log(`\n${key}: canonical ${r.counts.canonical} vs site ${r.counts.site}`)
    console.log(`  only in canonical: ${r.slug_diff.only_in_canonical.count}${r.slug_diff.only_in_canonical.count ? ` (e.g. ${r.slug_diff.only_in_canonical.sample.slice(0, 5).join(', ')})` : ''}`)
    console.log(`  only in site:      ${r.slug_diff.only_in_site.count}${r.slug_diff.only_in_site.count ? ` (e.g. ${r.slug_diff.only_in_site.sample.slice(0, 5).join(', ')})` : ''}`)
    console.log(`  shared slugs:      ${r.slug_diff.shared}`)
    console.log(`  name changes:      ${r.name_changes.count}`)
    console.log(`  fields not yet ported (${r.fields_not_yet_ported.length}): ${r.fields_not_yet_ported.join(', ') || 'none'}`)
    const parityCount = Object.keys(r.value_parity).length
    const mismatched = Object.entries(r.value_parity).filter(([, v]) => v.mismatches > 0)
    console.log(`  value parity: ${parityCount - mismatched.length}/${parityCount} fields exact`)
    for (const [field, v] of mismatched) console.log(`    ≠ ${field}: ${v.mismatches}/${v.of} differ`)
  }
  console.log('\nreport → data/generated/reports/site-comparison-latest.json')

  // This tool is diagnostic — it never fails the build. The switch decision is
  // manual and gated on this report showing no UNEXPLAINED losses.
}

main()
