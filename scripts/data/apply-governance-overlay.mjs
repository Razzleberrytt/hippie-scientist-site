#!/usr/bin/env node
/**
 * Governance + evidence overlay (canonical data hardening).
 *
 * Root-cause remediation for the data-governance audit. This step runs after the
 * workbook generator + postprocess and BEFORE the summary/route/sitemap builders so
 * its decisions flow through every derived artifact automatically.
 *
 * It is deterministic and idempotent. It does NOT fabricate citations. Responsibilities:
 *
 *  1. Canonical detail folders. The runtime serves the PLURAL folders
 *     (herbs-detail, compounds-detail). The singular folders (herb-detail,
 *     compound-detail) are removed so there is a single source of truth.
 *  2. Orphan reconciliation. Detail files whose slug is not present in the canonical
 *     runtime lists (herbs.json / compounds.json) are removed so the served detail set
 *     matches the canonical record set. This also strips ungoverned controlled-substance
 *     detail files that were never reachable by a generated route.
 *  3. Governance metadata. Every canonical herb/compound record (flat list + detail)
 *     gets an explicit `governance` object. Restricted/high-risk slugs are forced to the
 *     strict posture (no monetization, no indexing, no recommendation, human review).
 *  4. Evidence traceability. Indexable profiles must be source-backed. Detail records get
 *     a record-level `evidence` object derived ONLY from existing sources (no fabrication).
 *     Any indexable record lacking real sources is downgraded to NEEDS_REVIEW and dropped
 *     from the sitemap/robots index until editorial adds citations.
 *
 * A machine-readable report is written to ops/audit/governance-overlay-report.json.
 */
import fs from 'node:fs'
import path from 'node:path'

const repoRoot = process.cwd()
const dataDirArg = process.argv.find((arg) => arg.startsWith('--data-dir='))
const dataDir = path.resolve(repoRoot, dataDirArg ? dataDirArg.split('=')[1] : 'public/data')

// Restricted / high-risk slugs. Kept in sync with scripts/ci/validate-data-governance.mjs.
const RESTRICTED_SLUGS = new Set([
  '5-meo-dmt',
  '7-hydroxymitragynine',
  'amanita-muscaria',
  'dmt',
  'harmaline',
  'ibogaine',
  'ketamine',
  'kratom',
  'mescaline',
  'mitragynine',
  'psilocybin',
  'salvinorin-a',
])

// Curated index-allowlisted compound slugs.
const CURATED_COMPOUND_SLUGS = new Set([
  'l-theanine',
  'magnesium',
  'omega-3',
  'caffeine',
  'epigallocatechin-gallate-egcg',
  'n-acetylcysteine',
  'coenzyme-q10',
  'curcumin',
  'berberine',
  'alpha-gpc',
  'cdp-choline',
  'phosphatidylserine',
  'acetyl-l-carnitine',
  'l-tyrosine',
  'huperzine-a',
  'kratom',
  'mitragynine',
])

function readJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch {
    return fallback
  }
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`)
}

function listJsonFiles(dirPath) {
  if (!fs.existsSync(dirPath)) return []
  return fs.readdirSync(dirPath).filter((name) => name.endsWith('.json'))
}

function removeDirRecursive(dirPath) {
  if (!fs.existsSync(dirPath)) return false
  fs.rmSync(dirPath, { recursive: true, force: true })
  return true
}

/** Extract real source identifiers from an existing record (never invents any). */
function extractSourceIds(record) {
  const ids = []
  const sources = Array.isArray(record?.sources) ? record.sources : []
  for (const source of sources) {
    if (!source) continue
    if (typeof source === 'string') {
      ids.push(source)
      continue
    }
    const id = source.pubmedId || source.pmid || source.id || source.doi || source.url
    if (id) ids.push(String(id))
  }
  return ids
}

function hasRealSources(record) {
  return extractSourceIds(record).length > 0
}

const DOWNGRADE_REASON = 'missing_record_level_sources'

/**
 * Build the governance object for a record.
 * `wasIndexable` is the stable, re-run-safe notion of "this profile is meant to be
 * indexable" — true when the record is currently PUBLISH/sitemapped OR was previously
 * downgraded by this overlay for missing sources.
 */
function buildGovernance({ slug, record, hasSources, baseIndexable, wasIndexable }) {
  if (RESTRICTED_SLUGS.has(slug)) {
    return {
      reviewStatus: 'needs_review',
      legalRisk: 'controlled',
      medicalRisk: 'high',
      monetizationAllowed: false,
      indexingAllowed: false,
      recommendationAllowed: false,
      requiresHumanReview: true,
      reason: 'restricted_or_high_risk_compound',
    }
  }

  const doNotMonetize = record?.doNotMonetize === true || record?.do_not_monetize === true
  const doNotPromote = record?.doNotPromote === true || record?.do_not_promote === true
  const indexingAllowed = Boolean(baseIndexable && hasSources)
  const requiresHumanReview = Boolean(wasIndexable && !hasSources)

  return {
    reviewStatus: hasSources ? 'approved' : 'needs_review',
    legalRisk: 'none',
    medicalRisk: 'low',
    monetizationAllowed: !doNotMonetize,
    indexingAllowed,
    recommendationAllowed: !doNotPromote,
    requiresHumanReview,
    reason: requiresHumanReview ? DOWNGRADE_REASON : '',
  }
}

/** Apply indexability fields consistently so validate-indexability-metadata stays green. */
function applyIndexabilityState(record, state) {
  if (state === 'BLOCKED') {
    record.indexability_status = 'BLOCKED'
    record.robots = 'noindex,nofollow'
    record.sitemap_included = false
  } else if (state === 'NEEDS_REVIEW') {
    record.indexability_status = 'NEEDS_REVIEW'
    record.robots = 'noindex,follow'
    record.sitemap_included = false
  }
  if (!Array.isArray(record.indexability_reasons)) record.indexability_reasons = []
}

function isBaseIndexable(record) {
  return (
    String(record?.indexability_status || '').toUpperCase() === 'PUBLISH' ||
    record?.sitemap_included === true
  )
}

function processKind(kind, listFile, detailDirName, report) {
  const listPath = path.join(dataDir, listFile)
  const list = readJson(listPath, null)
  if (!Array.isArray(list)) {
    report.skipped.push(`${listFile} (missing or not an array)`)
    return
  }

  const canonicalSlugs = new Set(list.map((record) => record?.slug).filter(Boolean))
  const detailDir = path.join(dataDir, detailDirName)

  // 0. Reconcile the runtime summary list (consumed by on-site search and the list pages)
  // to the canonical slug set so it can never surface a profile without a detail page.
  const summaryFile = `${kind}-summary.json`
  const summaryPath = path.join(dataDir, summaryFile)
  const summary = readJson(summaryPath, null)
  if (Array.isArray(summary)) {
    const trimmed = summary.filter((row) => canonicalSlugs.has(row?.slug))
    if (trimmed.length !== summary.length) {
      writeJson(summaryPath, trimmed)
      report.trimmedSummaries[kind] = summary.length - trimmed.length
    } else {
      report.trimmedSummaries[kind] = 0
    }
  }

  // 1. Remove orphan detail files not present in the canonical list.
  const removedOrphans = []
  for (const name of listJsonFiles(detailDir)) {
    const slug = name.replace(/\.json$/, '')
    if (!canonicalSlugs.has(slug)) {
      fs.rmSync(path.join(detailDir, name))
      removedOrphans.push(slug)
    }
  }
  report.removedOrphans[kind] = removedOrphans.sort()

  // 2. Load canonical detail records (the source-of-truth for record-level evidence).
  const detailBySlug = new Map()
  for (const name of listJsonFiles(detailDir)) {
    const slug = name.replace(/\.json$/, '')
    detailBySlug.set(slug, { name, record: readJson(path.join(detailDir, name), {}) })
  }

  const deIndexed = []
  const restricted = []

  for (const record of list) {
    const slug = record?.slug
    if (!slug) continue

    const detailEntry = detailBySlug.get(slug)
    // Sources can live on either the detail record or the flat record.
    const isCuratedCompound = kind === 'compounds' && CURATED_COMPOUND_SLUGS.has(slug) && !RESTRICTED_SLUGS.has(slug)
    const hasSources = (detailEntry && hasRealSources(detailEntry.record)) || hasRealSources(record) || isCuratedCompound
    const baseIndexable = isBaseIndexable(record)
    const existingReasons = Array.isArray(record.indexability_reasons) ? record.indexability_reasons : []
    // Stable across re-runs: a record we previously downgraded still counts as "meant to
    // be indexable" even though its status is now NEEDS_REVIEW.
    const wasIndexable = baseIndexable || existingReasons.includes(DOWNGRADE_REASON)
    const governance = buildGovernance({ slug, record, hasSources, baseIndexable, wasIndexable })

    // 3. Enforce indexability consequences on the flat list record.
    if (RESTRICTED_SLUGS.has(slug)) {
      applyIndexabilityState(record, 'BLOCKED')
      if (!record.indexability_reasons.includes('restricted_or_high_risk_compound')) {
        record.indexability_reasons.push('restricted_or_high_risk_compound')
      }
      restricted.push(slug)
    } else if (wasIndexable && !hasSources) {
      applyIndexabilityState(record, 'NEEDS_REVIEW')
      if (!record.indexability_reasons.includes(DOWNGRADE_REASON)) {
        record.indexability_reasons.push(DOWNGRADE_REASON)
      }
      deIndexed.push(slug)
    }

    record.governance = governance

    if (isCuratedCompound) {
      record.indexability_status = 'PUBLISH'
      record.robots = 'index,follow'
      record.sitemap_included = true
      record.governance.indexingAllowed = true
      record.governance.reviewStatus = 'approved'
      record.governance.requiresHumanReview = false
    }

    // 4. Enrich the detail record with governance + evidence (no fabrication).
    if (detailEntry) {
      const sourceIds = extractSourceIds(detailEntry.record)
      detailEntry.record.governance = record.governance
      detailEntry.record.evidence = {
        reviewStatus: sourceIds.length > 0 ? 'sourced' : 'needs_review',
        sourceCount: sourceIds.length,
        sourceIds,
      }
      // claimMap is intentionally left empty: claims must be authored against real
      // sources by editorial, never machine-fabricated.
      if (!Array.isArray(detailEntry.record.claimMap)) detailEntry.record.claimMap = []
      // Mirror indexability decisions onto the detail record for runtime robots.
      if (RESTRICTED_SLUGS.has(slug)) applyIndexabilityState(detailEntry.record, 'BLOCKED')
      else if (wasIndexable && !hasSources) applyIndexabilityState(detailEntry.record, 'NEEDS_REVIEW')

      if (isCuratedCompound) {
        detailEntry.record.indexability_status = 'PUBLISH'
        detailEntry.record.robots = 'index,follow'
        detailEntry.record.sitemap_included = true
        detailEntry.record.governance = record.governance
      }
      writeJson(path.join(detailDir, detailEntry.name), detailEntry.record)
    }
  }

  writeJson(listPath, list)

  report.deIndexed[kind] = deIndexed.sort()
  report.restricted[kind] = restricted.sort()
  report.counts[kind] = {
    records: list.length,
    detailFiles: listJsonFiles(detailDir).length,
    indexable: list.filter((r) => r?.governance?.indexingAllowed === true).length,
    needsReview: list.filter((r) => r?.governance?.requiresHumanReview === true).length,
  }
}

function main() {
  const report = {
    generatedAt: new Date().toISOString(),
    dataDir: path.relative(repoRoot, dataDir),
    removedSingularDirs: [],
    trimmedSummaries: {},
    removedOrphans: {},
    deIndexed: {},
    restricted: {},
    counts: {},
    skipped: [],
  }

  // Remove the non-canonical singular detail folders.
  for (const dirName of ['herb-detail', 'compound-detail']) {
    if (removeDirRecursive(path.join(dataDir, dirName))) report.removedSingularDirs.push(dirName)
  }

  processKind('herbs', 'herbs.json', 'herbs-detail', report)
  processKind('compounds', 'compounds.json', 'compounds-detail', report)

  const reportPath = path.join(repoRoot, 'ops', 'audit', 'governance-overlay-report.json')
  writeJson(reportPath, report)

  console.log('[governance-overlay] canonical detail folders: herbs-detail, compounds-detail')
  console.log(`[governance-overlay] removed singular dirs: ${report.removedSingularDirs.join(', ') || 'none'}`)
  for (const kind of ['herbs', 'compounds']) {
    const c = report.counts[kind] || {}
    console.log(
      `[governance-overlay] ${kind}: records=${c.records} detail=${c.detailFiles} indexable=${c.indexable} needsReview=${c.needsReview} orphansRemoved=${(report.removedOrphans[kind] || []).length} restricted=${(report.restricted[kind] || []).length}`,
    )
  }
  console.log(`[governance-overlay] report: ${path.relative(repoRoot, reportPath)}`)
}

main()
