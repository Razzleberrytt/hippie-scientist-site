#!/usr/bin/env node
/**
 * Usage:
 *   node scripts/enrichment/release-gate.mjs [--run-id run_x] [--coverage-tolerance 0.5]
 */
import { join } from 'node:path';
import { existsSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { bootstrapStateDb, loadJson, REPO_ROOT, runSqlite } from './_shared.mjs';

function parseArgs(argv) {
  const out = { runId: null, coverageTolerance: 0.5 };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--run-id' && argv[i + 1]) {
      out.runId = argv[i + 1];
      i += 1;
    } else if (arg.startsWith('--run-id=')) out.runId = arg.slice('--run-id='.length);
    else if (arg === '--coverage-tolerance' && argv[i + 1]) {
      out.coverageTolerance = Number.parseFloat(argv[i + 1]);
      i += 1;
    } else if (arg.startsWith('--coverage-tolerance=')) out.coverageTolerance = Number.parseFloat(arg.slice('--coverage-tolerance='.length));
  }
  return out;
}

function runCommand(label, command, args) {
  console.log(`[release-gate] RUN ${label}: ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, { cwd: REPO_ROOT, stdio: 'inherit', env: process.env });
  if (result.status !== 0) {
    throw new Error(`${label} failed with exit code ${result.status}`);
  }
}

function listReports(prefix) {
  const reportsDir = join(REPO_ROOT, 'ops', 'reports');
  if (!existsSync(reportsDir)) return [];
  return readdirSync(reportsDir)
    .filter((name) => name.startsWith(prefix) && name.endsWith('.json'))
    .sort()
    .map((name) => ({ file: name, payload: loadJson(join(reportsDir, name)) }));
}

function assertValidationPasses(runId = null) {
  const runFilter = runId ? 'AND json_extract(details_json, "$.runId") = ?' : '';
  const args = runId ? [runId] : [];

  const schemaFail = runSqlite({
    select: true,
    sql: `SELECT COUNT(*) AS count FROM validation_results WHERE validation_type IN ('schema', 'schema-dry-run') AND ok=0 ${runFilter}`,
    args,
  })[0]?.count;

  const domainFail = runSqlite({
    select: true,
    sql: `SELECT COUNT(*) AS count FROM validation_results WHERE validation_type IN ('domain', 'domain-dry-run') AND ok=0 ${runFilter}`,
    args,
  })[0]?.count;

  if (Number(schemaFail) > 0) throw new Error(`schema validation has ${schemaFail} failing record(s)`);
  if (Number(domainFail) > 0) throw new Error(`domain validation has ${domainFail} failing record(s)`);
}

function assertNoPendingLaneC() {
  const patchRows = runSqlite({
    select: true,
    sql: 'SELECT patch_id, patch_file FROM patches ORDER BY id DESC',
  });

  const laneCPatchIds = [];
  for (const row of patchRows) {
    const patchPath = join(REPO_ROOT, 'patches', row.patch_file);
    if (!existsSync(patchPath)) continue;
    const patch = loadJson(patchPath);
    const lane = String(patch.lane ?? '').toUpperCase();
    const hasLaneCInteraction = (patch.operations ?? []).some(
      (op) => op.task === 'interactions' && op.field === '/interactions',
    );
    if (lane === 'C' || hasLaneCInteraction) laneCPatchIds.push(row.patch_id);
  }

  if (laneCPatchIds.length === 0) return;

  const approvedRows = runSqlite({
    select: true,
    sql: `SELECT patch_id FROM review_decisions
      WHERE lane='C' AND decision='approved' AND patch_id IN (${laneCPatchIds.map(() => '?').join(',')})`,
    args: laneCPatchIds,
  });
  const approvedSet = new Set(approvedRows.map((row) => row.patch_id));
  const pendingOrUnapproved = laneCPatchIds.filter((patchId) => !approvedSet.has(patchId));

  if (pendingOrUnapproved.length > 0) {
    throw new Error(`pending/unapproved Lane C patches remain: ${pendingOrUnapproved.join(', ')}`);
  }
}

function assertCoverageTolerance(maxRegressionPct) {
  const reports = listReports('coverage-');
  if (reports.length === 0) throw new Error('missing coverage report in ops/reports');
  const latest = reports.at(-1);
  const previous = reports.length > 1 ? reports.at(-2) : null;

  if (!previous) {
    console.log('[release-gate] WARN no previous coverage report found; using in-report delta.');
  }

  const herbDelta = previous
    ? Number(
        (
          Number(latest.payload.snapshot?.mechanismCoverage?.herbs?.coveragePct ?? 0) -
          Number(previous.payload.snapshot?.mechanismCoverage?.herbs?.coveragePct ?? 0)
        ).toFixed(2),
      )
    : Number(latest.payload.beforeAfter?.delta?.herbCoveragePct ?? 0);
  const compoundDelta = previous
    ? Number(
        (
          Number(latest.payload.snapshot?.mechanismCoverage?.compounds?.coveragePct ?? 0) -
          Number(previous.payload.snapshot?.mechanismCoverage?.compounds?.coveragePct ?? 0)
        ).toFixed(2),
      )
    : Number(latest.payload.beforeAfter?.delta?.compoundCoveragePct ?? 0);

  if (herbDelta < -Math.abs(maxRegressionPct) || compoundDelta < -Math.abs(maxRegressionPct)) {
    throw new Error(
      `coverage regressed beyond tolerance=${maxRegressionPct} (herbDelta=${herbDelta}, compoundDelta=${compoundDelta})`,
    );
  }
}

function main() {
  const options = parseArgs(process.argv);
  bootstrapStateDb();

  runCommand('prebuild', 'npm', ['run', 'prebuild']);
  runCommand('build', 'npm', ['run', 'build']);
  runCommand('schema validation', 'npm', ['run', 'enrichment:validate:schema']);
  runCommand('domain validation', 'npm', ['run', 'enrichment:validate:domain']);
  runCommand('coverage report', 'npm', ['run', 'enrichment:coverage', '--', ...(options.runId ? ['--run-id', options.runId] : [])]);
  runCommand('structured-data smoke', 'node', ['scripts/validate-structured-data-smoke.mjs']);

  assertValidationPasses(options.runId);
  assertNoPendingLaneC();
  assertCoverageTolerance(options.coverageTolerance);

  console.log('[release-gate] PASS all release-gate checks succeeded.');
  console.log('[release-gate] Conditions enforced: schema pass, domain pass, lane-c approvals, prebuild pass, build pass, structured-data smoke pass, coverage tolerance.');
}

try {
  main();
} catch (error) {
  console.error(`[release-gate] FAIL ${error.message}`);
  process.exit(1);
}
