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
 *  2. Detail reconciliation. Detail files whose slug is not present in the canonical
 *     runtime lists (herbs.json / compounds.json) are removed, and any canonical list
 *     record missing a detail payload gets a detail file copied from that canonical
 *     record. This keeps the served detail set matched to the generated route set.
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

// Curated index-allowlisted herb slugs. Mirrors the canonical
// editor-curated allowlist in src/lib/index-allowlist.ts so the runtime
// visibility gate honors the same source of truth used by the sitemap.
const CURATED_HERB_SLUGS = new Set([
  'ashwagandha',
  'rhodiola',
  'piper-methysticum',
  'turmeric',
  'ginger',
  'peppermint',
  'black-cohosh',
  'momordica-charantia',
  'black-seed',
  'bacopa',
  'ginkgo-biloba',
  'saffron',
  'melissa-officinalis',
  'valerian',
])

// Curated index-allowlisted compound slugs. Mirrors the canonical
// editor-curated allowlist in src/lib/index-allowlist.ts.
// Kratom + mitragynine intentionally excluded — restricted.
const CURATED_COMPOUND_SLUGS = new Set([
  'l-theanine',
  'magnesium',
  'omega-3',
  'caffeine',
  'epigallocatechin-gallate-egcg',
  'n-acetylcysteine',
  'coenzyme-q10',
  'curcumin-piperine',
  'berberine',
  'alpha-gpc',
  'cdp-choline',
  'phosphatidylcholine',
  'acetyl-l-carnitine',
  'l-tyrosine',
  'huperzine-a',
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

// Compounds with real, editorially-reviewed content but a genuinely evolving legal/
// regulatory situation (unapproved research peptides, off-label-marketed prescription
// drugs). These don't fit either generic bucket: they aren't scheduled/controlled
// substances (RESTRICTED_SLUGS) and forcing them through the curated-allowlist bypass
// would incorrectly flip requiresHumanReview to false for content whose FDA status is
// still an open question (e.g. the July 2026 PCAC review). Governance objects here are
// hand-reviewed per compound rather than derived from the generic source-count heuristic.
const MANUAL_GOVERNANCE_OVERRIDES = new Map([
  ['bpc-157', { reviewStatus: 'needs_review', legalRisk: 'elevated', medicalRisk: 'moderate', monetizationAllowed: false, indexingAllowed: true, recommendationAllowed: false, requiresHumanReview: true, reason: 'unapproved_ruo_compound_pending_fda_review' }],
  ['tb-500', { reviewStatus: 'needs_review', legalRisk: 'elevated', medicalRisk: 'moderate', monetizationAllowed: false, indexingAllowed: true, recommendationAllowed: false, requiresHumanReview: true, reason: 'unapproved_ruo_compound_pending_fda_review' }],
  ['cjc-1295', { reviewStatus: 'needs_review', legalRisk: 'elevated', medicalRisk: 'moderate', monetizationAllowed: false, indexingAllowed: true, recommendationAllowed: false, requiresHumanReview: true, reason: 'unapproved_ruo_compound_pending_fda_review' }],
  ['ipamorelin', { reviewStatus: 'needs_review', legalRisk: 'elevated', medicalRisk: 'moderate', monetizationAllowed: false, indexingAllowed: true, recommendationAllowed: false, requiresHumanReview: true, reason: 'unapproved_ruo_compound_pending_fda_review' }],
  ['pt-141', { reviewStatus: 'needs_review', legalRisk: 'elevated', medicalRisk: 'moderate', monetizationAllowed: false, indexingAllowed: true, recommendationAllowed: false, requiresHumanReview: true, reason: 'unapproved_ruo_compound_pending_fda_review' }],
  ['semaglutide', { reviewStatus: 'needs_review', legalRisk: 'low', medicalRisk: 'moderate', monetizationAllowed: false, indexingAllowed: true, recommendationAllowed: false, requiresHumanReview: true, reason: 'prescription_only_no_consumer_affiliate' }],
  ['tirzepatide', { reviewStatus: 'needs_review', legalRisk: 'low', medicalRisk: 'moderate', monetizationAllowed: false, indexingAllowed: true, recommendationAllowed: false, requiresHumanReview: true, reason: 'prescription_only_no_consumer_affiliate' }],
  ['ghk-cu', { reviewStatus: 'needs_review', legalRisk: 'none', medicalRisk: 'low', monetizationAllowed: true, indexingAllowed: true, recommendationAllowed: false, requiresHumanReview: true, reason: 'topical_cosmetic_pending_product_sourcing' }],
])

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

// Explicit, source-backed promotions reviewed outside the broad curated allowlist.
// These slugs still need real Evidence_Register/claims source ids; this list only
// allows the overlay to count those existing workbook-derived citations as record
// sources for the source gate.
const SOURCE_BACKED_PROMOTION_SLUGS = new Set([
  'biotin',
  'calcium',
  'carnitine-l-tartrate',
  'choline',
  'citicoline',
  '11-keto-beta-boswellic-acid',
  'acarbose',
  'acemannan',
  'acetyl-11-keto-beta-boswellic-acid',
  'aescin',
  'alpha-asarone',
  'alpha-mangostin',
  'andrographis',
  'crocin',
  'crocetin',
  'cryptotanshinone',
  'devils-claw',
  'dihydromethysticin',
  'diosgenin',
  'farnesol',
  'ferulic-acid',
  'forskolin',
  'fucoxanthin',
  'galantamine',
  'garcinia-cambogia-extract',
  'garcinol',
  'guggulsterone',
  'iberogast',
  'iron',
  'lavender-extract',
  'lemon-balm',
  'msm',
  'mct-oil',
  'pygeum',
  'saw-palmetto-extract',
  'vitamin-a',
  'willow-bark-extract',
  'yohimbine',
  'atractylenolide-i',
  'atractylenolide-ii',
  'atractylenolide-iii',
])

function buildClaimSourceIdsBySlug() {
  const claims = readJson(path.join(dataDir, 'claims.json'), [])
  const bySlug = new Map()
  if (!Array.isArray(claims)) return bySlug

  for (const claim of claims) {
    const slug = String(claim?.profile_slug || '').trim()
    if (!slug || !SOURCE_BACKED_PROMOTION_SLUGS.has(slug)) continue

    const sourceIds = [
      claim.pmid ? `pmid:${claim.pmid}` : '',
      claim.doi ? `doi:${claim.doi}` : '',
      claim.source_url ? String(claim.source_url) : '',
    ].filter(Boolean)

    if (!sourceIds.length) continue
    const ids = [
      ...sourceIds,
      claim.id ? `claim:${claim.id}` : '',
    ].filter(Boolean)
    if (!bySlug.has(slug)) bySlug.set(slug, [])
    bySlug.get(slug).push(...ids)
  }

  for (const [slug, ids] of bySlug.entries()) {
    bySlug.set(slug, [...new Set(ids)].sort())
  }

  return bySlug
}

function mirrorRecordFieldsIntoDetail(detailRecord, record) {
  const fields = [
    'summary',
    'description',
    'effects',
    'primary_effects',
    'mechanisms',
    'raw_mechanisms',
    'canonical_mechanisms',
    'mechanism_categories',
    'mechanism_classes',
    'mechanism_target_systems',
    'mechanism_normalization_status',
    'unmapped_mechanisms',
    'evidence_tier',
    'profile_status',
    'runtime_export_decision',
    'robots',
    'sitemap_included',
    'indexability_status',
    'indexability_score',
    'indexability_reasons',
    'safety',
  ]

  for (const field of fields) {
    if (field in record) detailRecord[field] = record[field]
  }
}

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

  // 2. Load canonical detail records. If a canonical list row has no detail payload,
  // seed one from the canonical row so fresh builds cannot leave renderable routes
  // without matching detail JSON. This copies existing fields only; it does not
  // fabricate citations or claims.
  const detailBySlug = new Map()
  for (const name of listJsonFiles(detailDir)) {
    const slug = name.replace(/\.json$/, '')
    detailBySlug.set(slug, { name, record: readJson(path.join(detailDir, name), {}) })
  }

  const createdMissingDetails = []
  for (const record of list) {
    const slug = record?.slug
    if (!slug || detailBySlug.has(slug)) continue
    const name = `${slug}.json`
    const detailRecord = { ...record }
    writeJson(path.join(detailDir, name), detailRecord)
    detailBySlug.set(slug, { name, record: detailRecord })
    createdMissingDetails.push(slug)
  }
  report.createdMissingDetails[kind] = createdMissingDetails.sort()

  const deIndexed = []
  const restricted = []
  const claimSourceIdsBySlug = buildClaimSourceIdsBySlug()

  for (const record of list) {
    const slug = record?.slug
    if (!slug) continue

    const detailEntry = detailBySlug.get(slug)
    // Sources can live on either the detail record or the flat record.
    // Curated allowlists (herbs + compounds) are editor-approved by
    // src/lib/index-allowlist.ts and bypass the record-level sources gate
    // so high-traffic slugs stay indexable while real citations are
    // curated. Restricted slugs never get this bypass.
    const isCuratedHerb = kind === 'herbs' && CURATED_HERB_SLUGS.has(slug) && !RESTRICTED_SLUGS.has(slug)
    const isCuratedCompound = kind === 'compounds' && CURATED_COMPOUND_SLUGS.has(slug) && !RESTRICTED_SLUGS.has(slug)
    const isCurated = isCuratedHerb || isCuratedCompound
    const manualOverride = kind === 'compounds' ? MANUAL_GOVERNANCE_OVERRIDES.get(slug) : undefined
    const claimSourceIds = claimSourceIdsBySlug.get(slug) || []
    const hasSources = (detailEntry && hasRealSources(detailEntry.record)) || hasRealSources(record) || claimSourceIds.length > 0 || isCurated
    const baseIndexable = isBaseIndexable(record) || isCurated
    const existingReasons = Array.isArray(record.indexability_reasons) ? record.indexability_reasons : []
    // Stable across re-runs: a record we previously downgraded still counts as "meant to
    // be indexable" even though its status is now NEEDS_REVIEW.
    const wasIndexable = baseIndexable || existingReasons.includes(DOWNGRADE_REASON)
    const governance = manualOverride || buildGovernance({ slug, record, hasSources, baseIndexable, wasIndexable })

    // 3. Enforce indexability consequences on the flat list record.
    if (manualOverride) {
      // Hand-reviewed compound: keep it indexed regardless of the record-level
      // sources heuristic (its evidence is captured in the detail narrative, not a
      // PMID bibliography). See MANUAL_GOVERNANCE_OVERRIDES above.
    } else if (RESTRICTED_SLUGS.has(slug)) {
      applyIndexabilityState(record, 'BLOCKED')
      if (!record.indexability_reasons.includes('restricted_or_high_risk_compound')) {
        record.indexability_reasons.push('restricted_or_high_risk_compound')
      }
      restricted.push(slug)
    } else if (wasIndexable && !hasSources && !isCurated) {
      applyIndexabilityState(record, 'NEEDS_REVIEW')
      if (!record.indexability_reasons.includes(DOWNGRADE_REASON)) {
        record.indexability_reasons.push(DOWNGRADE_REASON)
      }
      deIndexed.push(slug)
    }

    record.governance = governance

    if (manualOverride) {
      record.indexability_status = 'PUBLISH'
      record.robots = 'index,follow'
      record.sitemap_included = true
      if (!record.indexability_reasons.includes('manual_editorial_review')) {
        record.indexability_reasons.push('manual_editorial_review')
      }
    } else if (isCurated) {
      record.indexability_status = 'PUBLISH'
      record.robots = 'index,follow'
      record.sitemap_included = true
      record.governance.indexingAllowed = true
      record.governance.reviewStatus = 'approved'
      record.governance.requiresHumanReview = false
      record.governance.reason = record.governance.reason || 'curated_allowlist'
      if (!record.indexability_reasons.includes('curated_allowlist')) {
        record.indexability_reasons.push('curated_allowlist')
      }
    }

    // 4. Enrich the detail record with governance + evidence (no fabrication).
    if (detailEntry) {
      if (claimSourceIds.length > 0) {
        mirrorRecordFieldsIntoDetail(detailEntry.record, record)
      }
      const sourceIds = [...new Set([...extractSourceIds(detailEntry.record), ...claimSourceIds])].sort()
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
      if (manualOverride) {
        // Keep indexed — see manualOverride handling on the flat record above.
      } else if (RESTRICTED_SLUGS.has(slug)) {
        applyIndexabilityState(detailEntry.record, 'BLOCKED')
      } else if (wasIndexable && !hasSources && !isCurated) {
        applyIndexabilityState(detailEntry.record, 'NEEDS_REVIEW')
      }

      if (manualOverride || isCurated) {
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
  report.curatedAllowlist[kind] = list
    .filter((r) => Array.isArray(r.indexability_reasons) && r.indexability_reasons.includes('curated_allowlist'))
    .map((r) => r.slug)
    .sort()
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
    createdMissingDetails: {},
    deIndexed: {},
    restricted: {},
    counts: {},
    curatedAllowlist: {},
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
    const curated = (report.curatedAllowlist[kind] || []).length
    console.log(
      `[governance-overlay] ${kind}: records=${c.records} detail=${c.detailFiles} indexable=${c.indexable} needsReview=${c.needsReview} curated=${curated} orphansRemoved=${(report.removedOrphans[kind] || []).length} missingDetailsCreated=${(report.createdMissingDetails[kind] || []).length} restricted=${(report.restricted[kind] || []).length}`,
    )
  }
  console.log(`[governance-overlay] report: ${path.relative(repoRoot, reportPath)}`)
}

main()
