import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { assertPipelineWritePath, reportsDir, repoRoot, relative, workbookPath } from './paths.mjs'
import { assertProductionImportAllowed } from './readiness.mjs'
import { loadCanonical } from './canonical.mjs'
import { normalizeText } from './normalize.mjs'

/**
 * Importer.
 *
 * The pipeline does not write the workbook. It drives
 * scripts/data/apply-workbook-patch.mjs, which already performs the atomic
 * write (temp file + rename), rejects stale patches, refuses governance
 * columns, and demands explicit acknowledgement for safety and dosage fields.
 *
 * What this module adds on top:
 *   - a dry-run report that names every addition, no-op, conflict, and skip
 *     before anything is written;
 *   - an idempotency check, by re-deriving each change against the current
 *     workbook so a second import of the same patch is provably a no-op;
 *   - the fail-closed readiness gate, so no code path reaches `--apply`
 *     without a human-approved scope.
 */

const RUNNER = path.join(repoRoot, 'scripts/data/apply-workbook-patch.mjs')

function runRunner(args, { env = {} } = {}) {
  const result = spawnSync(process.execPath, [RUNNER, ...args], {
    cwd: repoRoot,
    encoding: 'utf8',
    env: { ...process.env, ...env },
  })
  return {
    ok: result.status === 0,
    status: result.status,
    output: [result.stdout, result.stderr].filter(Boolean).join('\n').trim(),
  }
}

/**
 * Classify every change in a patch against the live workbook without writing.
 *
 * `addition`  — canonical cell is empty and the patch fills it
 * `change`    — canonical cell holds a different value
 * `no-op`     — canonical cell already equals the proposed value
 * `conflict`  — canonical cell no longer matches expected_old_value (stale)
 * `skip`      — the target row or column is not resolvable
 */
export async function classifyPatch(patchPath, { canonical } = {}) {
  const patch = JSON.parse(fs.readFileSync(patchPath, 'utf8'))
  const data = canonical || (await loadCanonical())
  const rows = []

  for (const change of patch.changes || []) {
    const slug = String(change.slug ?? '').trim().toLowerCase()
    const entity = data.bySlug.get(slug)
    const base = { slug, column: change.column }

    if (!entity) {
      rows.push({ ...base, kind: 'skip', reason: `slug not present in ${data.entitySheet}` })
      continue
    }
    if (!Object.prototype.hasOwnProperty.call(entity.row, change.column)) {
      rows.push({ ...base, kind: 'skip', reason: `column not present in ${data.entitySheet}` })
      continue
    }

    const current = normalizeText(entity.row[change.column])
    const expected = normalizeText(change.expected_old_value)
    const proposed = normalizeText(change.new_value)

    if (current === proposed) {
      rows.push({ ...base, kind: 'no-op', current, proposed })
      continue
    }
    if (current !== expected) {
      rows.push({ ...base, kind: 'conflict', current, expected, proposed })
      continue
    }
    rows.push({
      ...base,
      kind: current === '' ? 'addition' : 'change',
      current,
      proposed,
      requires_human_review: change.requires_human_review === true,
    })
  }

  const counts = rows.reduce((acc, row) => {
    acc[row.kind] = (acc[row.kind] || 0) + 1
    return acc
  }, {})

  return {
    patch_id: patch.id,
    patch_status: patch.status,
    patch_path: relative(patchPath),
    job_ids: patch.job_ids || [],
    fields: [...new Set((patch.changes || []).map((c) => c.column))].sort(),
    touched_records: [...new Set((patch.changes || []).map((c) => c.slug))].sort(),
    citations: (patch.sources || []).length,
    counts,
    rows,
  }
}

/**
 * Dry run. Never writes the workbook: it runs the existing runner in its
 * default check mode and pairs the result with the classification report.
 */
export async function dryRun(patchPath, { canonical, writeReport = true, workbook = workbookPath } = {}) {
  const external = path.resolve(workbook) !== path.resolve(workbookPath)
  const before = fs.statSync(workbook)
  const classification = await classifyPatch(patchPath, {
    canonical: canonical || (await loadCanonical({ workbookPath: workbook })),
  })
  const validation = runRunner(
    ['--patch', patchPath, ...(external ? ['--workbook', workbook] : [])],
    external ? { env: { ALLOW_EXTERNAL_WORKBOOK_PATH: 'true', HERB_XLSX_PATH: workbook } } : {},
  )
  const after = fs.statSync(workbook)

  const report = {
    mode: 'dry-run',
    ...classification,
    runner_ok: validation.ok,
    runner_output: validation.output,
    workbook_unchanged: before.size === after.size && before.mtimeMs === after.mtimeMs,
  }

  if (!report.workbook_unchanged) {
    throw new Error('Dry run modified the workbook. This is a bug — refusing to continue.')
  }
  if (writeReport) report.report_path = relative(writeImportReport(report, `${classification.patch_id}-dry-run`))
  return report
}

/**
 * Apply a patch to canonical data.
 *
 * Blocked unless an approved readiness record authorises this command, these
 * fields, and these jobs. The patch itself must also already be `approved` —
 * that flip is a human edit reviewed in Git, and the runner enforces it too.
 */
export async function importPatch(
  patchPath,
  { approveHumanReview = false, canonical, workbook = workbookPath } = {},
) {
  const external = path.resolve(workbook) !== path.resolve(workbookPath)
  const classification = await classifyPatch(patchPath, {
    canonical: canonical || (await loadCanonical({ workbookPath: workbook })),
  })

  assertProductionImportAllowed({
    command: 'import',
    fields: classification.fields,
    jobIds: classification.job_ids,
  })

  if (classification.patch_status !== 'approved') {
    throw new Error(
      `Patch ${classification.patch_id} has status "${classification.patch_status}". ` +
        'A human must set it to "approved" before it can be applied.',
    )
  }
  if (classification.counts.conflict) {
    throw new Error(
      `Patch ${classification.patch_id} has ${classification.counts.conflict} conflicting change(s). ` +
        'Resolve them before importing.',
    )
  }

  // Idempotency is decided here, not by relaxing the runner. If every change
  // already reads as a no-op the patch has been applied, so re-running it is a
  // no-op too — and the runner is never invoked, which keeps its stale-patch
  // guard strict for the cases that genuinely are stale.
  const pending = (classification.counts.addition || 0) + (classification.counts.change || 0)
  if (pending === 0) {
    const report = {
      mode: 'import',
      ...classification,
      runner_ok: true,
      runner_output: '',
      already_applied: true,
      idempotency: { verified: true, counts_after: classification.counts },
    }
    report.report_path = relative(writeImportReport(report, `${classification.patch_id}-import-noop`))
    return report
  }

  const args = ['--patch', patchPath, '--apply', '--in-place']
  if (external) args.push('--workbook', workbook)
  if (approveHumanReview) args.push('--approve-human-review')
  const applied = runRunner(
    args,
    external ? { env: { ALLOW_EXTERNAL_WORKBOOK_PATH: 'true', HERB_XLSX_PATH: workbook } } : {},
  )

  const report = {
    mode: 'import',
    ...classification,
    runner_ok: applied.ok,
    runner_output: applied.output,
  }
  if (!applied.ok) {
    report.error = 'runner failed; the workbook is unchanged (the runner writes atomically)'
    report.report_path = relative(writeImportReport(report, `${classification.patch_id}-import-failed`))
    throw new Error(`${report.error}\n${applied.output}`)
  }

  // Re-classify against the freshly written workbook: every applied change must
  // now read as a no-op, which is what makes a repeated import safe.
  const after = await classifyPatch(patchPath, {
    canonical: await loadCanonical({ workbookPath: workbook, force: true }),
  })
  report.idempotency = {
    verified: !after.counts.addition && !after.counts.change && !after.counts.conflict,
    counts_after: after.counts,
  }
  report.report_path = relative(writeImportReport(report, `${classification.patch_id}-import`))

  if (!report.idempotency.verified) {
    throw new Error(
      `Import of ${classification.patch_id} is not idempotent: re-reading the workbook still reports ` +
        `${JSON.stringify(after.counts)}.`,
    )
  }
  return report
}

export function writeImportReport(report, label) {
  const target = path.join(reportsDir, `${label}.json`)
  assertPipelineWritePath(target)
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  return target
}

export function formatDryRun(report) {
  const lines = []
  lines.push(`patch ${report.patch_id} (${report.patch_status}) — ${report.patch_path}`)
  lines.push(`  records touched: ${report.touched_records.length}`)
  lines.push(`  fields:          ${report.fields.join(', ') || '(none)'}`)
  lines.push(`  citations:       ${report.citations}`)
  for (const kind of ['addition', 'change', 'no-op', 'conflict', 'skip']) {
    if (report.counts[kind]) lines.push(`  ${kind.padEnd(9)} ${report.counts[kind]}`)
  }
  for (const row of report.rows.filter((r) => r.kind === 'conflict')) {
    lines.push(`  ! conflict ${row.slug}.${row.column}`)
    lines.push(`      expected: ${row.expected}`)
    lines.push(`      actual:   ${row.current}`)
  }
  lines.push(`  workbook unchanged by dry run: ${report.workbook_unchanged}`)
  return lines.join('\n')
}
