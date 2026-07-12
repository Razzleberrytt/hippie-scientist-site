#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { normalizeFile } from './normalize-patch.mjs'
import { readJson, writeJson, ensureDir } from './canonical/jsonl.mjs'
import {
  loadDataset,
  writeEntities,
  writeClaims,
  writeEdges,
  writeSources,
} from './canonical/store.mjs'
import { patchInboxDir, patchAppliedDir } from './canonical/paths.mjs'
import { applyBatch, batchHash } from './canonical/apply.mjs'
import { validateDataset } from './canonical/validate.mjs'
import { createSnapshot } from './canonical/snapshot.mjs'
import { recordAudit } from './canonical/audit-log.mjs'
import { buildDatabase } from './build-sqlite.mjs'
import {
  buildCanonicalCitationOverlay,
  exportCanonicalCitationsToRuntime,
  mergeCanonicalCitationOverlay,
} from './canonical/citation-export.mjs'
import {
  applyReviewManifest,
  buildEvidenceReview,
  patchBatchHash,
  patchTargetEntity,
  slugify,
  validateReviewManifest,
  verifyFinalizedProfile,
} from './canonical/evidence-finalize.mjs'

const SUPPORTED = new Set(['.json', '.jsonl', '.ndjson', '.yaml', '.yml', '.csv', '.md', '.markdown'])
const ROOT = process.cwd()
const REVIEW_DIR = path.join(ROOT, 'data/reviews/evidence')
const STAGING_ROOT = path.join(ROOT, 'data/staging/evidence-finalize')

function parseArgs(argv) {
  const args = {
    slug: '',
    apply: false,
    approve: false,
    reviewer: '',
    file: '',
    dataDir: 'public/data',
    noRebuild: false,
    refresh: false,
    keepStaging: false,
  }
  for (let index = 2; index < argv.length; index += 1) {
    const value = argv[index]
    if (value === '--apply') args.apply = true
    else if (value === '--approve') args.approve = true
    else if (value === '--no-rebuild') args.noRebuild = true
    else if (value === '--refresh') args.refresh = true
    else if (value === '--keep-staging') args.keepStaging = true
    else if (value === '--slug') { args.slug = argv[index + 1] || ''; index += 1 }
    else if (value.startsWith('--slug=')) args.slug = value.slice('--slug='.length)
    else if (value === '--reviewer') { args.reviewer = argv[index + 1] || ''; index += 1 }
    else if (value.startsWith('--reviewer=')) args.reviewer = value.slice('--reviewer='.length)
    else if (value === '--file') { args.file = argv[index + 1] || ''; index += 1 }
    else if (value.startsWith('--file=')) args.file = value.slice('--file='.length)
    else if (value === '--data-dir') { args.dataDir = argv[index + 1] || args.dataDir; index += 1 }
    else if (value.startsWith('--data-dir=')) args.dataDir = value.slice('--data-dir='.length)
  }
  args.slug = slugify(args.slug)
  return args
}

function fail(message, code = 1) {
  console.error(`✗ ${message}`)
  process.exit(code)
}

function unique(values) {
  return [...new Set(values)].sort()
}

function listInboxFiles(args) {
  if (!fs.existsSync(patchInboxDir)) return []
  if (args.file) {
    const file = path.isAbsolute(args.file) ? args.file : path.join(ROOT, args.file)
    if (!fs.existsSync(file)) fail(`patch file not found: ${args.file}`, 2)
    return [file]
  }

  const all = fs.readdirSync(patchInboxDir)
    .filter((filename) => SUPPORTED.has(path.extname(filename).toLowerCase()))
    .map((filename) => path.join(patchInboxDir, filename))
    .sort()
  const filenameMatches = all.filter((file) => slugify(path.basename(file)).includes(args.slug))
  return filenameMatches.length ? filenameMatches : all
}

function prepareStaging(slug) {
  const stagingDir = path.join(STAGING_ROOT, slug)
  fs.rmSync(stagingDir, { recursive: true, force: true })
  ensureDir(stagingDir)
  return stagingDir
}

function normalizeCandidates({ args, dataset, stagingDir }) {
  const files = listInboxFiles(args)
  if (!files.length) fail('patch inbox is empty')

  const selected = []
  const sourceFiles = new Map()
  const ignored = []

  for (const [index, file] of files.entries()) {
    const fileOutDir = path.join(stagingDir, String(index).padStart(3, '0'))
    const result = normalizeFile(file, { outDir: fileOutDir })
    if (!result.ok) fail(`${path.basename(file)} failed normalization: ${result.error || 'schema validation failed'}`)

    const normalizedPatches = result.report.patches.map((entry) => {
      const patchPath = path.resolve(ROOT, entry.path)
      return { patch: readJson(patchPath), patchPath }
    })
    const matching = []
    const other = []
    for (const item of normalizedPatches) {
      let entity
      try {
        entity = patchTargetEntity(item.patch, dataset)
      } catch (error) {
        fail(`${path.basename(file)}: ${error.message}`)
      }
      if (entity.slug === args.slug) matching.push(item)
      else other.push({ item, entity })
    }

    if (matching.length && other.length) {
      fail(`${path.basename(file)} contains mixed targets; split it before finalizing ${args.slug}`)
    }
    if (!matching.length) {
      ignored.push(path.basename(file))
      continue
    }

    for (const item of matching) {
      item.patch.__normalized_file = item.patchPath
      item.patch.__source_file = file
      selected.push(item.patch)
      if (!sourceFiles.has(file)) sourceFiles.set(file, [])
      sourceFiles.get(file).push(item.patch.patch_id)
    }
  }

  const duplicatePatchIds = selected
    .map((patch) => patch.patch_id)
    .filter((patchId, index, values) => values.indexOf(patchId) !== index)
  if (duplicatePatchIds.length) fail(`duplicate patch IDs in batch: ${unique(duplicatePatchIds).join(', ')}`)
  if (!selected.length) fail(`no inbox patches resolve to ${args.slug}`)

  return { patches: selected, sourceFiles, ignored }
}

function reportMarkdown(report, manifestPath) {
  const lines = [
    `# Evidence review: ${report.slug}`,
    '',
    `- Entity: \`${report.entity_type}:${report.entity_id}\``,
    `- Batch hash: \`${report.batch_hash}\``,
    `- Patches: **${report.summary.patches}**`,
    `- Proposed claims: **${report.summary.proposed_claims}**`,
    `- Unique sources: **${report.summary.unique_sources}**`,
    `- Dry run: **${report.summary.dry_run_applied} applied**, **${report.summary.dry_run_noop} no-op**`,
    `- Existing active claims: **${report.summary.existing_active_claims}**`,
    `- Duplicate sources inside batch: **${report.summary.duplicate_sources}**`,
    '',
    `Review and edit \`${path.relative(ROOT, manifestPath)}\`. Add valid older IDs to the approved arrays and superseded IDs to the deprecated arrays before approval.`,
    '',
    '## Proposed claims',
    '',
  ]

  for (const claim of report.proposed_claims) {
    lines.push(`### ${claim.patch_id}`)
    lines.push('')
    lines.push(`- Predicate: \`${claim.predicate}\``)
    lines.push(`- Evidence: \`${claim.evidence_level}\`; confidence ${claim.confidence}`)
    lines.push(`- Sources: ${claim.source_count}`)
    lines.push('')
    lines.push(claim.claim || '_No claim text_')
    lines.push('')
  }

  lines.push('## Existing active claims')
  lines.push('')
  if (!report.existing_active_claims.length) lines.push('_None._', '')
  for (const claim of report.existing_active_claims) {
    lines.push(`- \`${claim.id}\` [${claim.review_status}]${claim.exact_duplicate_of_proposal ? ' **exact duplicate**' : ''}: ${claim.claim}`)
  }
  lines.push('')
  lines.push('## Sources')
  lines.push('')
  for (const patch of report.patches) {
    for (const source of patch.sources) {
      const locator = source.doi ? `DOI ${source.doi}` : source.pmid ? `PMID ${source.pmid}` : source.url || 'no locator'
      lines.push(`- \`${source.source_id}\` — ${source.title || locator} (${locator})`)
    }
  }
  lines.push('')
  return `${lines.join('\n')}\n`
}

function loadOrCreateManifest({ args, review }) {
  ensureDir(REVIEW_DIR)
  const manifestPath = path.join(REVIEW_DIR, `${args.slug}.manifest.json`)
  const reportPath = path.join(REVIEW_DIR, `${args.slug}.report.json`)
  const markdownPath = path.join(REVIEW_DIR, `${args.slug}.report.md`)
  const existing = readJson(manifestPath)

  if (existing && existing.batch_hash !== review.manifest.batch_hash && existing.decision === 'approved' && !args.refresh) {
    fail('approved review manifest is stale; rerun with --refresh, then review the new batch')
  }

  let manifest = existing && existing.batch_hash === review.manifest.batch_hash
    ? {
        ...review.manifest,
        ...existing,
        approved_patch_ids: review.manifest.approved_patch_ids,
        approved_claim_ids: unique([
          ...review.manifest.approved_claim_ids,
          ...(Array.isArray(existing.approved_claim_ids) ? existing.approved_claim_ids : []),
        ]),
        approved_source_ids: unique([
          ...review.manifest.approved_source_ids,
          ...(Array.isArray(existing.approved_source_ids) ? existing.approved_source_ids : []),
        ]),
      }
    : review.manifest

  if (args.approve) {
    const reviewer = String(args.reviewer || manifest.reviewer || '').trim()
    if (!reviewer) fail('--approve requires --reviewer="Name"', 2)
    manifest = {
      ...manifest,
      decision: 'approved',
      reviewer,
      reviewed_at: new Date().toISOString(),
    }
  }

  writeJson(manifestPath, manifest)
  writeJson(reportPath, review.report)
  fs.writeFileSync(markdownPath, reportMarkdown(review.report, manifestPath), 'utf8')
  return { manifest, manifestPath, reportPath, markdownPath }
}

function assertManifestMatchesPlan(manifest, review, selectedPatches) {
  const validation = validateReviewManifest(manifest, {
    slug: review.report.slug,
    batchHash: review.report.batch_hash,
    availablePatchIds: new Set(selectedPatches.map((patch) => patch.patch_id)),
  })
  if (!validation.ok) fail(`review manifest is not ready:\n  - ${validation.errors.join('\n  - ')}`)

  const approvedPatchIds = [...manifest.approved_patch_ids].sort()
  const allPatchIds = selectedPatches.map((patch) => patch.patch_id).sort()
  if (JSON.stringify(approvedPatchIds) !== JSON.stringify(allPatchIds)) {
    fail('partial batch approval is not supported; split rejected patches into a separate file/batch')
  }

  const approvedClaims = new Set(manifest.approved_claim_ids)
  const approvedSources = new Set(manifest.approved_source_ids)
  const missingClaims = review.manifest.approved_claim_ids.filter((id) => !approvedClaims.has(id))
  const missingSources = review.manifest.approved_source_ids.filter((id) => !approvedSources.has(id))
  if (missingClaims.length) fail(`approved_claim_ids are missing reviewed batch claims: ${missingClaims.join(', ')}`)
  if (missingSources.length) fail(`approved_source_ids are missing reviewed batch sources: ${missingSources.join(', ')}`)
}

function appliedPatchRecord(patch, result, manifest) {
  const { __normalized_file, __source_file, ...clean } = patch
  return {
    ...clean,
    _apply_result: {
      status: result.status,
      changes: result.changes.length,
      reviewer: manifest.reviewer,
      reviewed_at: manifest.reviewed_at,
      at: new Date().toISOString(),
    },
  }
}

function archiveBatch({ patches, sourceFiles, results, manifest }) {
  ensureDir(patchAppliedDir)
  const resultByPatchId = new Map(results.map((result) => [result.patch_id, result]))
  for (const patch of patches) {
    const result = resultByPatchId.get(patch.patch_id)
    writeJson(
      path.join(patchAppliedDir, `${patch.patch_id}.json`),
      appliedPatchRecord(patch, result, manifest),
    )
  }

  const rawDir = path.join(patchAppliedDir, 'raw', manifest.slug)
  ensureDir(rawDir)
  for (const [sourceFile] of sourceFiles) {
    const destination = path.join(rawDir, path.basename(sourceFile))
    fs.copyFileSync(sourceFile, destination)
    fs.rmSync(sourceFile)
  }
}

function readDetailRecord(dataDir, entityType, slug) {
  const detailDir = entityType === 'herb' ? 'herbs-detail' : 'compounds-detail'
  const file = path.resolve(ROOT, dataDir, detailDir, `${slug}.json`)
  return { file, record: readJson(file) }
}

function main() {
  const args = parseArgs(process.argv)
  if (!args.slug) fail('usage: npm run evidence:finalize -- --slug=<profile> [--approve --reviewer="Name"] [--apply]', 2)

  const stagingDir = prepareStaging(args.slug)
  try {
    const dataset = loadDataset()
    const { patches, sourceFiles, ignored } = normalizeCandidates({ args, dataset, stagingDir })
    const review = buildEvidenceReview({ slug: args.slug, patches, dataset })
    const reviewFiles = loadOrCreateManifest({ args, review })

    console.log(`✓ prepared ${args.slug}: ${review.report.summary.patches} patches, ${review.report.summary.proposed_claims} claims, ${review.report.summary.unique_sources} sources`)
    console.log(`  review: ${path.relative(ROOT, reviewFiles.markdownPath)}`)
    console.log(`  manifest: ${path.relative(ROOT, reviewFiles.manifestPath)} (${reviewFiles.manifest.decision})`)
    if (ignored.length) console.log(`  ignored non-target files: ${ignored.join(', ')}`)

    if (!args.apply) {
      if (args.approve) console.log('\n✓ manifest approved. Rerun with --apply to commit the reviewed batch.')
      else console.log(`\nNext: review the report, add approved/deprecated legacy IDs, then run:\n  npm run evidence:finalize -- --slug=${args.slug} --approve --reviewer="Your Name" --apply`)
      return
    }

    assertManifestMatchesPlan(reviewFiles.manifest, review, patches)
    const selectedPatches = patches.filter((patch) => reviewFiles.manifest.approved_patch_ids.includes(patch.patch_id))
    const { dataset: appliedDataset, results } = applyBatch(dataset, selectedPatches)
    const rejected = results.filter((result) => result.status === 'rejected')
    if (rejected.length) fail(`apply rejected: ${rejected.map((result) => `${result.patch_id}: ${result.reason}`).join('; ')}`)

    const finalizedDataset = applyReviewManifest(appliedDataset, reviewFiles.manifest)
    const validation = validateDataset(finalizedDataset)
    if (!validation.ok) {
      fail(`finalized dataset failed validation (${validation.schemaErrorCount} schema, ${validation.refErrors.length} reference errors)`)
    }

    const currentDetail = readDetailRecord(args.dataDir, reviewFiles.manifest.entity_type, args.slug)
    if (!currentDetail.record) fail(`runtime detail record not found: ${path.relative(ROOT, currentDetail.file)}`)
    const overlay = buildCanonicalCitationOverlay(finalizedDataset).get(args.slug)
    if (!overlay) fail(`no canonical citation overlay produced for ${args.slug}`)
    const plannedRecord = mergeCanonicalCitationOverlay(currentDetail.record, overlay)
    const plannedVerification = verifyFinalizedProfile({ record: plannedRecord, manifest: reviewFiles.manifest })
    if (!plannedVerification.ok) {
      fail(`pre-commit runtime verification failed:\n  - ${plannedVerification.errors.join('\n  - ')}`)
    }

    const snapshot = createSnapshot(`pre-evidence-finalize-${args.slug}`)
    writeEntities(finalizedDataset.entities)
    writeClaims(finalizedDataset.claims)
    writeEdges(finalizedDataset.edges)
    writeSources(finalizedDataset.sources)
    if (!args.noRebuild) buildDatabase()

    const exportReport = exportCanonicalCitationsToRuntime({
      dataDir: args.dataDir,
      dataset: finalizedDataset,
      slugs: [args.slug],
    })
    const { file: detailFile, record } = readDetailRecord(args.dataDir, reviewFiles.manifest.entity_type, args.slug)
    const verification = verifyFinalizedProfile({ record, manifest: reviewFiles.manifest })
    if (!verification.ok) fail(`runtime verification failed:\n  - ${verification.errors.join('\n  - ')}`)

    archiveBatch({ patches: selectedPatches, sourceFiles, results, manifest: reviewFiles.manifest })
    recordAudit({
      action: 'evidence_finalize',
      slug: args.slug,
      entity_id: reviewFiles.manifest.entity_id,
      reviewer: reviewFiles.manifest.reviewer,
      reviewed_at: reviewFiles.manifest.reviewed_at,
      batch_hash: patchBatchHash(selectedPatches),
      snapshot: snapshot.name,
      applied: results.filter((result) => result.status === 'applied').map((result) => result.patch_id),
      noop: results.filter((result) => result.status === 'noop').map((result) => result.patch_id),
      approved_claims: reviewFiles.manifest.approved_claim_ids,
      approved_sources: reviewFiles.manifest.approved_source_ids,
      deprecated_claims: reviewFiles.manifest.deprecated_claim_ids,
      deprecated_sources: reviewFiles.manifest.deprecated_source_ids,
      dataset_hash_before: batchHash(dataset),
      dataset_hash_after: batchHash(finalizedDataset),
      runtime_detail: path.relative(ROOT, detailFile),
      runtime_claim_count: record.claimMap.length,
      runtime_source_count: record.sources.length,
    })

    console.log(`\n✓ finalized ${args.slug}`)
    console.log(`  patches: ${results.length}`)
    console.log(`  runtime: ${record.claimMap.length} claims / ${record.sources.length} sources`)
    console.log(`  export updates: ${exportReport.updated.length}`)
    console.log(`  snapshot: ${snapshot.name}`)
  } finally {
    if (!args.keepStaging) fs.rmSync(stagingDir, { recursive: true, force: true })
  }
}

main()
