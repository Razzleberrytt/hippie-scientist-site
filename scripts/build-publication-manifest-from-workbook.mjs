#!/usr/bin/env node
/**
 * Build publication-manifest.json from the summary indexes.
 *
 * Run this ONLY on a data directory the governance overlay has already
 * processed.
 *
 * The summary indexes in a fresh checkout are parser output: their
 * indexability_status is what the workbook asserted, before
 * apply-governance-overlay.mjs decides what may actually be published. Running
 * this against that state produces a manifest that looks refreshed and
 * overstates eligibility.
 *
 * That is not hypothetical. It was run standalone against committed data in
 * #4916, which took the compound count from 112 to 181 and read as 69 profiles
 * finally being recognised. The overlay puts the number back at 112: those 69
 * are compounds the workbook proposes and governance withholds. The manifest
 * had been 28 days old and correct; the refresh made it current and wrong.
 *
 * Correct order:
 *   node scripts/data/apply-governance-overlay.mjs --data-dir=public/data
 *   node scripts/build-publication-manifest-from-workbook.mjs
 *
 * The overlay rewrites ~190 data files, so regenerating this deliberately means
 * regenerating the corpus too — which is why nothing in the build does it
 * casually, and why the date on this file is a poor reason to touch it.
 */

import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const rootDir = process.cwd()
const dataDir = path.join(rootDir, 'public', 'data')
const CURATED_REFERENCE_COMPOUND_SLUGS = new Set(['kratom', 'mitragynine'])

function readJson(fileName, fallback = []) {
  const filePath = path.join(dataDir, fileName)
  if (!fs.existsSync(filePath)) return fallback
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch {
    return fallback
  }
}

function readManifest(fileName) {
  const parsed = readJson(fileName, {})
  return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
}

function writeJson(fileName, data) {
  const filePath = path.join(dataDir, fileName)
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
}

function text(value) {
  return String(value ?? '').trim()
}

function list(value) {
  if (value === null || value === undefined) return []
  if (Array.isArray(value)) return value.map(item => text(item)).filter(Boolean)
  return text(value).split(/\n|;|\|/).map(item => item.trim()).filter(Boolean)
}

function coerceBool(value) {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true
    if (value.toLowerCase() === 'false') return false
  }
  return null
}

function canIndex(record) {
  const hidden = /^hide$/i.test(text(record?.runtime_export_decision))
  if (hidden) return false

  const status = text(record?.indexability_status)
  if (/^(PUBLISH|NOINDEX|NEEDS_REVIEW|BLOCKED)$/i.test(status)) {
    return status.toUpperCase() === 'PUBLISH'
  }

  const sitemapIncluded = coerceBool(record?.sitemap_included)
  const robotsField = text(record?.robots)
  if (sitemapIncluded !== null && robotsField) {
    return sitemapIncluded && /^index/i.test(robotsField)
  }

  const profileStatus = text(record?.profile_status)
  const summaryQuality = text(record?.summary_quality)
  const evidenceTier = text(record?.evidence_tier || record?.evidenceTier || record?.evidence_grade)
  const hasResearchPending = list(record?.primary_effects).some((effect) => /research-pending/i.test(effect))
  const indexableStatus = /^(complete|near_complete|top50_authority_patched|commercial_ready)$/i.test(profileStatus)
  const indexableQuality = !/^(weak|minimal|thin|stub|research_needed)$/i.test(summaryQuality)
  const evidenceSupported = /\b(strong|moderate|human|clinical|commercial_ready)\b/i.test(evidenceTier) || indexableStatus

  return indexableStatus && indexableQuality && evidenceSupported && !hasResearchPending
}

function isCompoundEligible(compound, herbCounts) {
  const cid = String(compound?.id || compound?.slug || compound?.canonicalCompoundId || '').trim()
  const computedHerbCount = herbCounts[cid] || 0
  const hasHerbCoverage = computedHerbCount > 0

  const reverseLookupReady = String(compound?.reverseLookupReady ?? '').trim() === 'Yes'
  
  const readinessTier = String(compound?.readiness_tier ?? '').trim().toUpperCase()
  const isReadinessAB = readinessTier === 'A' || readinessTier === 'B'
  
  const siteExportStatus = String(compound?.site_export_status_v2 ?? '').trim().toLowerCase()
  const isExportReady = siteExportStatus === 'runtime_export_ready' || siteExportStatus === 'limited_runtime_candidate'

  const hasMechanism = text(compound?.mechanism || compound?.mechanisms).length > 0
  
  return (reverseLookupReady || hasHerbCoverage || isReadinessAB || isExportReady) && hasMechanism
}

// The ordering requirement above is documented but was never enforced, so the
// only thing standing between a checkout and a wrong manifest was whether the
// operator had read the header. #4916 is what that costs. Requiring an explicit
// flag makes the correct order the only way to run this: `data:build` and
// `check:data` pass it from the position after apply-governance-overlay.mjs and
// build-runtime-summary-indexes.mjs, and a bare invocation now refuses instead
// of silently producing an overstated manifest.
function assertPostOverlay() {
  if (process.argv.includes('--post-overlay') || process.env.GOVERNANCE_OVERLAY_APPLIED === '1') return

  console.error('[publication-manifest] REFUSING to run: cannot confirm the governance overlay has been applied.')
  console.error('')
  console.error('  public/data in a fresh checkout is parser output. Its indexability_status is what')
  console.error('  the workbook asserted, before apply-governance-overlay.mjs decides what may actually')
  console.error('  be published, and it overstates the publishable corpus by roughly 31%.')
  console.error('')
  console.error('  Building the manifest from that state produces a file that looks refreshed and is')
  console.error('  wrong. In #4916 it took the compound count from 112 to 181 and read as 69 profiles')
  console.error('  finally being recognised; the overlay puts it back at 112, because those 69 are')
  console.error('  compounds governance withholds.')
  console.error('')
  console.error('  Regenerate through the pipeline, which applies the overlay first:')
  console.error('    npm run data:build')
  console.error('')
  console.error('  If you have genuinely already applied the overlay to public/data in this session:')
  console.error('    node scripts/build-publication-manifest-from-workbook.mjs --post-overlay')
  process.exit(1)
}

function run() {
  assertPostOverlay()
  const previousManifest = readManifest('publication-manifest.json')
  const previousHerbs = Array.isArray(previousManifest?.entities?.herbs) ? previousManifest.entities.herbs : []
  const previousCompounds = Array.isArray(previousManifest?.entities?.compounds) ? previousManifest.entities.compounds : []

  const workbookCompounds = readJson('compounds.json', [])
  const herbSummaryIndex = readJson('summary-indexes/herbs-summary.json', [])

  const eligibleHerbs = (Array.isArray(herbSummaryIndex) ? herbSummaryIndex : [])
    .filter((h) => canIndex(h))
    .map((h) => ({ slug: text(h.slug), name: text(h?.name || h?.displayName || h?.slug) }))
    .filter((h) => h.slug)
    .sort((a, b) => a.slug.localeCompare(b.slug))

  const eligibleCompounds = (Array.isArray(workbookCompounds) ? workbookCompounds : [])
    .filter((compound) => canIndex(compound))
    .map((compound) => String(compound?.slug ?? compound?.id ?? compound?.canonicalCompoundId ?? '').trim())
    .filter(Boolean)
  const uniqueEligibleCompounds = [...new Set(eligibleCompounds)].sort((a, b) => a.localeCompare(b))

  const manifest = {
    generatedAt: new Date().toISOString(),
    source: 'workbook+summary-indexes',
    entities: {
      herbs: eligibleHerbs,
      compounds: uniqueEligibleCompounds,
    },
    counts: {
      herbs_total: Array.isArray(herbSummaryIndex) ? herbSummaryIndex.length : 0,
      herbs_eligible: eligibleHerbs.length,
      compounds_total: Array.isArray(workbookCompounds) ? workbookCompounds.length : 0,
      compounds_eligible: uniqueEligibleCompounds.length,
    },
  }

  writeJson('publication-manifest.json', manifest)

  execFileSync('node', ['scripts/generate-indexable-herbs.mjs'], {
    cwd: rootDir,
    stdio: 'inherit',
  })

  console.log('[publication-manifest] source=workbook+summary-indexes')
  console.log(`[publication-manifest] herbs before=${previousHerbs.length} after=${eligibleHerbs.length} delta=${eligibleHerbs.length - previousHerbs.length}`)
  console.log(`[publication-manifest] compounds before=${previousCompounds.length} after=${uniqueEligibleCompounds.length} delta=${uniqueEligibleCompounds.length - previousCompounds.length}`)
}

run()
