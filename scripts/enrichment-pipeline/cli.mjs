#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { loadContract, validateContractAgainstWorkbook } from './lib/contract.mjs'
import { loadCanonical, canonicalFingerprint, loadPublicDataSignals } from './lib/canonical.mjs'
import { scanGaps, filterJobs } from './lib/scanner.mjs'
import {
  claimJobs,
  listJobs,
  readStore,
  recoverStaleClaims,
  setStatus,
  statusCounts,
  syncQueue,
} from './lib/job-store.mjs'
import { latestCandidateForJob, latestCandidates, readCandidate } from './lib/candidates.mjs'
import { normalizeCandidate } from './lib/normalize.mjs'
import { validateCandidate } from './lib/validators.mjs'
import { buildPatch, writePatch, writeReviewExport } from './lib/exporter.mjs'
import { dryRun, formatDryRun, importPatch } from './lib/importer.mjs'
import { buildResearchIndex, readResearchIndex, writeResearchIndex } from './lib/research-index.mjs'
import { buildWorkerBrief, filterByShard, partition } from './lib/worker.mjs'
import { computeMetrics, formatMetrics } from './lib/metrics.mjs'
import { auditDuplicateOrganisms, formatDuplicateAudit } from './lib/duplicate-organisms.mjs'
import { exportWorkbook } from './lib/xlsx-export.mjs'
import {
  readReadiness,
  readinessStatus,
  readinessTemplate,
  writeReadiness,
} from './lib/readiness.mjs'
import { queuePath, exportsDir, reportsDir, relative, assertPipelineWritePath, opsRoot } from './lib/paths.mjs'

/**
 * Enrichment pipeline CLI.
 *
 * Read-only and candidate-only commands run freely. The one command that can
 * change canonical data — `import` — is gated by the readiness record and fails
 * closed, so an operator cannot reach a production write by running commands out
 * of order or forgetting a flag.
 */

const COMMANDS = {
  scan: 'Scan canonical data for gaps and refresh the job queue (read-only).',
  queue: 'Print the current queue, filtered.',
  status: 'Job counts by status, band, and field.',
  brief: 'Print the field-limited worker brief for one job.',
  claim: 'Claim jobs for a worker. Honours the readiness scope by default (--ignore-scope to opt out).',
  index: 'Build the local research index from Source_Register + Evidence_Register.',
  validate: 'Normalize and validate candidates; report verdicts.',
  export: 'Turn validated candidates into a reviewable workbook patch + review export.',
  'export-xlsx': 'Write the Queue / Accepted / Needs Review / Failed / Metrics workbook.',
  import: 'Apply an approved patch to canonical data. Requires an approved readiness record.',
  migrate: 'Compare a historical spreadsheet against canonical data (dry-run).',
  metrics: 'Print deterministic pipeline metrics.',
  readiness: 'Show or initialise the production-enrichment readiness record.',
  doctor: 'Check the contract against the live workbook and report drift.',
  duplicates: 'Report entities that share a latin_name — the same organism under two profiles.',
}

function parseArgs(argv) {
  const args = { _: [], flags: {} }
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (!arg.startsWith('--')) {
      args._.push(arg)
      continue
    }
    const [key, inline] = arg.slice(2).split('=')
    if (inline !== undefined) {
      args.flags[key] = inline
    } else if (argv[i + 1] && !argv[i + 1].startsWith('--')) {
      args.flags[key] = argv[i + 1]
      i += 1
    } else {
      args.flags[key] = true
    }
  }
  return args
}

function usage() {
  const lines = ['Enrichment pipeline', '', 'Usage: node scripts/enrichment-pipeline/cli.mjs <command> [options]', '']
  for (const [name, description] of Object.entries(COMMANDS)) {
    lines.push(`  ${name.padEnd(14)} ${description}`)
  }
  lines.push('')
  lines.push('Common filters: --priority P0,P1  --field latin_name  --entity-type herb  --mode automatic')
  lines.push('                --slug ashwagandha  --status pending  --limit 20')
  lines.push('Sharding:       --shard 0 --shards 4')
  lines.push('')
  lines.push('Docs: docs/enrichment-pipeline.md')
  return lines.join('\n')
}

function filtersFrom(flags) {
  return {
    priority: flags.priority,
    field: flags.field,
    entityType: flags['entity-type'],
    mode: flags.mode,
    slug: flags.slug,
    status: flags.status,
  }
}

function writeQueueSnapshot(scan) {
  assertPipelineWritePath(queuePath)
  fs.mkdirSync(path.dirname(queuePath), { recursive: true })
  fs.writeFileSync(
    queuePath,
    `${JSON.stringify(
      {
        queue_version: 1,
        entities_scanned: scan.entities_scanned,
        fields_considered: scan.fields_considered,
        skipped: scan.skipped,
        duplicate_slugs: scan.duplicate_slugs,
        jobs: scan.jobs,
      },
      null,
      2,
    )}\n`,
    'utf8',
  )
  return queuePath
}

async function cmdScan(flags) {
  const contract = loadContract()
  const canonical = await loadCanonical()
  const before = canonicalFingerprint(canonical)

  const scan = scanGaps(canonical, {
    contract,
    publicSignals: loadPublicDataSignals(),
    includeManualReview: flags['automatic-only'] !== true,
  })

  if (canonicalFingerprint(canonical) !== before) {
    throw new Error('Scan mutated canonical data in memory. This is a bug — refusing to continue.')
  }

  const snapshot = writeQueueSnapshot(scan)
  const summary = flags['no-sync'] ? null : syncQueue(scan.jobs)

  console.log(`scanned ${scan.entities_scanned} entities in ${canonical.entitySheet}`)
  console.log(`  gaps queued            ${scan.jobs.length}`)
  console.log(`  populated cells left   ${scan.skipped.populated}`)
  console.log(`  queue snapshot         ${relative(snapshot)}`)
  if (summary) {
    console.log(`  ledger: +${summary.added} added, ${summary.refreshed} refreshed, ${summary.retired} retired`)
  }
  const bands = {}
  for (const job of scan.jobs) bands[job.priority] = (bands[job.priority] || 0) + 1
  console.log(`  bands                  ${JSON.stringify(bands)}`)
  return scan
}

function cmdQueue(flags) {
  const limit = Number.parseInt(flags.limit ?? '25', 10)
  let jobs = filterJobs(listJobs(), filtersFrom(flags))
  if (flags.shards) {
    jobs = filterByShard(jobs, {
      shard: Number.parseInt(flags.shard, 10),
      shardCount: Number.parseInt(flags.shards, 10),
    })
  }
  console.log(`${jobs.length} job(s) match; showing ${Math.min(limit, jobs.length)}`)
  for (const job of jobs.slice(0, limit)) {
    console.log(
      `${job.priority} ${String(job.score).padStart(5)} ${job.status.padEnd(15)} ${job.slug.padEnd(30)} ` +
        `${job.requested_fields.join('+')}`,
    )
  }
}

function cmdStatus() {
  const store = readStore()
  const jobs = Object.values(store.jobs)
  console.log(`job store: ${jobs.length} job(s), updated ${store.updated_at ?? 'never'}`)
  for (const [status, count] of Object.entries(statusCounts())) {
    if (count) console.log(`  ${status.padEnd(18)} ${count}`)
  }
  const readiness = readinessStatus()
  console.log(`readiness: ${readiness.approved ? `APPROVED (${readiness.gate})` : 'not approved'}`)
  if (!readiness.approved) console.log(`  blocked by: ${readiness.missing.join('; ')}`)
}

async function cmdBrief(flags) {
  const jobId = flags.job || flags._?.[0]
  if (!jobId) throw new Error('brief requires --job <job_id>')
  const job = listJobs((j) => j.job_id === jobId)[0]
  if (!job) throw new Error(`Unknown job ${jobId}`)
  const contract = loadContract()
  const canonical = await loadCanonical()
  let researchIndex = null
  try {
    researchIndex = readResearchIndex()
  } catch {
    // The brief still works without the index; it just carries no leads.
  }
  console.log(JSON.stringify(buildWorkerBrief({ job, canonical, contract, researchIndex }), null, 2))
}

/**
 * Claim scope.
 *
 * When an approved readiness record exists, `claim` honours it by default:
 * jobs outside `allowed_fields`, or outside a pinned `pilot_scope.job_ids`, are
 * not handed out. Pilot 1 showed why — `claim` took the first ten jobs in id
 * order rather than the approved set, and only the import gate caught it. That
 * is late: by then a worker has already spent effort on work that cannot land.
 *
 * `--ignore-scope` opts out for research that is not headed for import.
 */
function readinessClaimFilter(flags) {
  if (flags['ignore-scope'] === true) return { filter: () => true, note: 'scope ignored (--ignore-scope)' }

  const status = readinessStatus()
  if (!status.approved) {
    return { filter: () => true, note: 'no approved readiness record — claiming unrestricted' }
  }

  const record = status.record
  const allowedFields = new Set(record.allowed_fields || [])
  const pinned = new Set(record.pilot_scope?.job_ids || [])

  return {
    filter: (job) => {
      if (pinned.size && !pinned.has(job.job_id)) return false
      if (allowedFields.size && !job.requested_fields.every((f) => allowedFields.has(f))) return false
      return true
    },
    note:
      `scoped to readiness ${record.gate}: fields [${[...allowedFields].join(', ') || 'any'}]` +
      (pinned.size ? `, ${pinned.size} pinned job(s)` : ''),
  }
}

function cmdClaim(flags) {
  const worker = flags.worker
  if (!worker) throw new Error('claim requires --worker <id>')
  const limit = Number.parseInt(flags.limit ?? '1', 10)
  const filters = filtersFrom(flags)
  const shardCount = flags.shards ? Number.parseInt(flags.shards, 10) : null
  const shard = flags.shard !== undefined ? Number.parseInt(flags.shard, 10) : null
  const scope = readinessClaimFilter(flags)

  const claimed = claimJobs({
    worker,
    limit,
    filter: (job) => {
      if (!scope.filter(job)) return false
      if (!filterJobs([job], filters).length) return false
      if (shardCount === null) return true
      return filterByShard([job], { shard, shardCount }).length > 0
    },
  })
  console.log(`claimed ${claimed.length} job(s) for ${worker} — ${scope.note}`)
  for (const job of claimed) console.log(`  ${job.job_id} ${job.slug} ${job.requested_fields.join('+')}`)
}

async function cmdIndex() {
  const canonical = await loadCanonical()
  const index = buildResearchIndex(canonical)
  const target = writeResearchIndex(index)
  console.log(`indexed ${Object.keys(index.records).length} distinct source(s)`)
  console.log(`  from ${index.source_rows} Source_Register + ${index.evidence_rows} Evidence_Register rows`)
  console.log(`  entities with sources: ${Object.keys(index.by_entity).length}`)
  console.log(`  written to ${relative(target)}`)
}

async function cmdValidate(flags) {
  const contract = loadContract()
  const canonical = await loadCanonical()
  const paths = flags.job ? [latestCandidateForJob(flags.job)].filter(Boolean) : latestCandidates()

  if (!paths.length) {
    console.log('no candidates to validate')
    return []
  }

  const results = []
  for (const filePath of paths) {
    const raw = readCandidate(filePath)
    const candidate = normalizeCandidate(raw, contract)
    const result = validateCandidate(candidate, { contract, canonical })
    results.push(result)

    const v = result.verdict
    console.log(`${v.status.padEnd(13)} ${candidate.job_id} ${candidate.entity.slug}`)
    for (const error of v.errors) console.log(`    ERROR  ${error.rule}: ${error.message}`)
    for (const finding of v.review_findings) console.log(`    REVIEW ${finding.rule}: ${finding.message}`)
    for (const decision of v.review_decisions) console.log(`    REVIEW ${decision.field}: ${decision.reason}`)
    for (const decision of v.apply_decisions) console.log(`    APPLY  ${decision.field}: ${decision.reason}`)
    for (const decision of v.no_op_decisions) console.log(`    NO-OP  ${decision.field}: ${decision.reason}`)

    if (!flags['no-status']) {
      const next = { rejected: 'rejected', needs_review: 'needs_review', validated: 'validated', no_op: 'rejected' }[v.status]
      try {
        setStatus(candidate.job_id, next, { note: `validation verdict ${v.status}`, patch: { candidate_path: relative(filePath) } })
      } catch {
        // A job that is not in the ledger (fixture runs) is not an error here.
      }
    }
  }
  return results
}

async function cmdExport(flags) {
  const contract = loadContract()
  const label = flags.batch || `batch-${new Date().toISOString().slice(0, 10)}`
  const results = await cmdValidate({ ...flags, 'no-status': true })
  if (!results.length) return

  const { patch, excluded } = buildPatch({ results, batchLabel: label, contract })
  const reviewPath = writeReviewExport({ batchLabel: label, excluded, results })

  if (!patch.changes.length) {
    console.log(`no importable changes; ${excluded.length} candidate(s) need review -> ${relative(reviewPath)}`)
    return
  }

  const patchPath = writePatch(patch)
  console.log(`wrote ${patch.changes.length} proposed change(s) -> ${relative(patchPath)}`)
  console.log(`  review export -> ${relative(reviewPath)}`)
  console.log('  next: review the patch in Git, set status to "approved", then run import --dry-run')
}

async function cmdExportXlsx(flags) {
  const label = flags.batch || `batch-${new Date().toISOString().slice(0, 10)}`
  const jobs = filterJobs(listJobs(), filtersFrom(flags))
  let researchIndex = null
  try {
    researchIndex = readResearchIndex()
  } catch {
    // optional
  }
  const results = await cmdValidate({ ...flags, 'no-status': true })
  const metrics = computeMetrics({ researchIndex })
  const target = await exportWorkbook({ jobs, results, metrics, label })
  console.log(`wrote ${relative(target)}`)
}

async function cmdImport(flags) {
  const patchArg = flags.patch
  if (!patchArg) throw new Error('import requires --patch <path>')
  const patchPath = path.resolve(patchArg)

  if (flags.apply !== true) {
    const report = await dryRun(patchPath)
    console.log(formatDryRun(report))
    console.log(`  report -> ${report.report_path}`)
    if (!report.runner_ok) {
      console.error('\nrunner validation failed:')
      console.error(report.runner_output)
      process.exitCode = 1
    }
    return
  }

  const report = await importPatch(patchPath, { approveHumanReview: flags['approve-human-review'] === true })
  console.log(`imported ${report.patch_id}`)
  console.log(`  counts       ${JSON.stringify(report.counts)}`)
  console.log(`  idempotent   ${report.idempotency.verified}`)
  console.log(`  report       ${report.report_path}`)
  console.log('  next: npm run data:build:core && npm run guard:source-of-truth')
}

async function cmdMigrate(flags) {
  const file = flags.file
  if (!file) throw new Error('migrate requires --file <path-to.xlsx>')
  const contract = loadContract()
  const canonical = await loadCanonical()
  const { migrateWorkbook, writeMigrationReport } = await import('./lib/migrate-xlsx.mjs')
  const migration = await migrateWorkbook(path.resolve(file), { canonical, contract })
  const target = writeMigrationReport(migration, migration.file_digest)

  console.log(`migration dry-run for ${migration.file}`)
  console.log(`  sheets with entity data ${migration.schema.length}`)
  console.log(`  rows read               ${migration.rows_read}`)
  console.log(`  new proposals           ${migration.proposals.length}`)
  console.log(`  conflicts               ${migration.conflicts.length}`)
  console.log(`  skipped                 ${JSON.stringify(migration.skipped)}`)
  console.log(`  report                  ${relative(target)}`)
  console.log('  nothing was written to canonical data')
}

async function cmdMetrics() {
  let researchIndex = null
  try {
    researchIndex = readResearchIndex()
  } catch {
    // optional
  }
  console.log(formatMetrics(computeMetrics({ researchIndex })))
}

function cmdReadiness(flags) {
  if (flags.init === true) {
    if (readReadiness()) throw new Error('A readiness record already exists; edit it rather than reinitialising.')
    fs.mkdirSync(opsRoot, { recursive: true })
    const target = writeReadiness(readinessTemplate())
    console.log(`wrote unapproved readiness template -> ${relative(target)}`)
    console.log('A human must complete it and set approved: true. Until then, import is blocked.')
    return
  }
  const status = readinessStatus()
  console.log(`readiness: ${status.approved ? 'APPROVED' : 'NOT APPROVED'} (gate ${status.gate ?? 'none'})`)
  for (const item of status.missing) console.log(`  missing: ${item}`)
}

async function cmdDoctor() {
  const contract = loadContract()
  const canonical = await loadCanonical()
  const drift = validateContractAgainstWorkbook(contract, canonical.columns)

  console.log(`contract v${contract.version}: ${contract.fields.size} field(s)`)
  console.log(`workbook  ${canonical.entitySheet}: ${canonical.columns.length} column(s), ${canonical.bySlug.size} entities`)
  console.log(`duplicate slugs: ${canonical.duplicateSlugs.length}`)
  if (drift.missingFromWorkbook.length) {
    console.log(`  contract fields absent from the workbook: ${drift.missingFromWorkbook.join(', ')}`)
  }
  if (drift.missingFromContract.length) {
    console.log(`  workbook columns absent from the contract: ${drift.missingFromContract.join(', ')}`)
  }
  console.log(drift.ok ? 'contract and workbook agree' : 'DRIFT — update the contract before scanning')
  if (!drift.ok) process.exitCode = 1
}

async function main() {
  const argv = process.argv.slice(2)
  const command = argv[0]
  const { flags, _ } = parseArgs(argv.slice(1))
  flags._ = _

  if (!command || command === '--help' || command === '-h' || !COMMANDS[command]) {
    console.log(usage())
    if (command && !COMMANDS[command]) process.exitCode = 1
    return
  }

  switch (command) {
    case 'scan':
      await cmdScan(flags)
      break
    case 'queue':
      cmdQueue(flags)
      break
    case 'status':
      cmdStatus()
      break
    case 'brief':
      await cmdBrief(flags)
      break
    case 'claim':
      cmdClaim(flags)
      break
    case 'index':
      await cmdIndex()
      break
    case 'validate':
      await cmdValidate(flags)
      break
    case 'export':
      await cmdExport(flags)
      break
    case 'export-xlsx':
      await cmdExportXlsx(flags)
      break
    case 'import':
      await cmdImport(flags)
      break
    case 'migrate':
      await cmdMigrate(flags)
      break
    case 'metrics':
      await cmdMetrics()
      break
    case 'readiness':
      cmdReadiness(flags)
      break
    case 'duplicates': {
      const canonical = await loadCanonical()
      const report = auditDuplicateOrganisms(canonical)
      console.log(formatDuplicateAudit(report))
      if (flags.json === true) {
        const target = path.join(reportsDir, 'duplicate-organisms.json')
        assertPipelineWritePath(target)
        fs.mkdirSync(path.dirname(target), { recursive: true })
        fs.writeFileSync(target, `${JSON.stringify(report, null, 2)}
`, 'utf8')
        console.log(`
report -> ${relative(target)}`)
      }
      break
    }
    case 'doctor':
      await cmdDoctor()
      break
    default:
      console.log(usage())
  }
}

main().catch((error) => {
  console.error(`[enrichment] ${error.message}`)
  process.exitCode = 1
})

export { recoverStaleClaims, partition, exportsDir }
