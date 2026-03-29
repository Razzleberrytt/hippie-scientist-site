#!/usr/bin/env node
/**
 * Usage: node scripts/enrichment/report-coverage.mjs [--run-id run_x] [--baseline-file ops/reports/coverage-before.json]
 */
import { join } from 'node:path';
import { readdirSync, readFileSync } from 'node:fs';
import { ensureDir, nowIso, REPO_ROOT, bootstrapStateDb, runSqlite, writeJson, loadJson } from './_shared.mjs';
import { auditCompoundLinks, writeLinkPatch } from './_compound-linking.mjs';

function parseArgs(argv) {
  const out = { runId: null, baselineFile: null };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--run-id' && argv[i + 1]) {
      out.runId = argv[i + 1];
      i += 1;
    } else if (arg.startsWith('--run-id=')) out.runId = arg.slice('--run-id='.length);
    else if (arg === '--baseline-file' && argv[i + 1]) {
      out.baselineFile = argv[i + 1];
      i += 1;
    } else if (arg.startsWith('--baseline-file=')) out.baselineFile = arg.slice('--baseline-file='.length);
  }
  return out;
}

function hasMechanismCoverage(entry) {
  return typeof entry.mechanism === 'string' && entry.mechanism.trim().length > 0;
}

function loadCoverageSnapshot() {
  const herbs = JSON.parse(readFileSync(join(REPO_ROOT, 'public', 'data', 'herbs.json'), 'utf8'));
  const compounds = JSON.parse(readFileSync(join(REPO_ROOT, 'public', 'data', 'compounds.json'), 'utf8'));

  const herbCovered = herbs.filter(hasMechanismCoverage).length;
  const compoundCovered = compounds.filter(hasMechanismCoverage).length;

  return {
    herbs: { total: herbs.length, covered: herbCovered, coveragePct: Number(((herbCovered / Math.max(herbs.length, 1)) * 100).toFixed(2)) },
    compounds: {
      total: compounds.length,
      covered: compoundCovered,
      coveragePct: Number(((compoundCovered / Math.max(compounds.length, 1)) * 100).toFixed(2)),
    },
  };
}

function listPatchFilesForRun(runId) {
  const manifestsDir = join(REPO_ROOT, 'ops', 'manifests');
  const candidates = readdirSync(manifestsDir).filter((name) => name.endsWith('.batch.json')).sort();
  const matched = candidates.find((name) => name.startsWith(`${runId}.`));
  if (!matched) return [];
  const manifest = JSON.parse(readFileSync(join(manifestsDir, matched), 'utf8'));
  return Array.isArray(manifest.generatedPatchFiles) ? manifest.generatedPatchFiles : [];
}

function readPatch(pathRelative) {
  return JSON.parse(readFileSync(join(REPO_ROOT, pathRelative), 'utf8'));
}

function derivePatchStatusCounts(runId) {
  const patchFiles = runId ? listPatchFilesForRun(runId) : [];
  const selectedPatchIds = patchFiles.map((file) => readPatch(file).patch_id);

  const schemaResults = runSqlite({
    select: true,
    sql: `SELECT patch_id, ok FROM validation_results WHERE validation_type IN ('schema', 'schema-dry-run') ${
      selectedPatchIds.length ? `AND patch_id IN (${selectedPatchIds.map(() => '?').join(',')})` : ''
    }`,
    args: selectedPatchIds,
  });
  const domainResults = runSqlite({
    select: true,
    sql: `SELECT patch_id, ok FROM validation_results WHERE validation_type IN ('domain', 'domain-dry-run') ${
      selectedPatchIds.length ? `AND patch_id IN (${selectedPatchIds.map(() => '?').join(',')})` : ''
    }`,
    args: selectedPatchIds,
  });

  const schemaFailSet = new Set(schemaResults.filter((row) => Number(row.ok) === 0).map((row) => row.patch_id));
  const domainFailSet = new Set(domainResults.filter((row) => Number(row.ok) === 0).map((row) => row.patch_id));

  let reviewPending = 0;
  let eligibleForApply = 0;
  for (const patchFile of patchFiles) {
    const patch = readPatch(patchFile);
    const byEntity = new Map();
    for (const op of patch.operations ?? []) {
      const key = `${op.entity_type}:${op.entity_id}`;
      if (!byEntity.has(key)) byEntity.set(key, { review: null, hasMechanism: false });
      const item = byEntity.get(key);
      if (op.field === '/_review' && op.value && typeof op.value === 'object') item.review = op.value.status;
      if (op.field === '/mechanism' && op.op === 'set') item.hasMechanism = true;
    }
    for (const item of byEntity.values()) {
      if (item.review === 'pending') reviewPending += 1;
      if (item.hasMechanism && item.review === 'approved') eligibleForApply += 1;
    }
  }

  const generated = patchFiles.length;
  const schemaFail = schemaFailSet.size;
  const domainFail = domainFailSet.size;
  const rejected = new Set([...schemaFailSet, ...domainFailSet]).size;
  const rejectionRate = generated === 0 ? 0 : Number(((rejected / generated) * 100).toFixed(2));

  return {
    planned: runId
      ? (() => {
          const rows = runSqlite({
            select: true,
            sql: "SELECT notes FROM runs WHERE run_uuid=? ORDER BY id DESC LIMIT 1",
            args: [runId],
          });
          if (rows.length === 0) return null;
          try {
            const notes = JSON.parse(rows[0].notes ?? '{}');
            return Array.isArray(notes.selectedEntities) ? notes.selectedEntities.length : null;
          } catch {
            return null;
          }
        })()
      : null,
    generated,
    schema_fail: schemaFail,
    domain_fail: domainFail,
    review_pending: reviewPending,
    eligible_for_apply: eligibleForApply,
    patch_rejection_rate_pct: rejectionRate,
    patchFiles,
  };
}


function buildLinkIntegrityReport() {
  const herbs = loadJson(join(REPO_ROOT, 'public', 'data', 'herbs.json'));
  const compounds = loadJson(join(REPO_ROOT, 'public', 'data', 'compounds.json'));
  const entityGraph = loadJson(join(REPO_ROOT, 'config', 'entity-graph.json'));

  const audit = auditCompoundLinks({
    herbs,
    compounds,
    entityGraph,
    producer: 'report-coverage:link-integrity',
  });

  const generatedPatchFile = writeLinkPatch(audit.patch);

  return {
    canonicalCompoundCount: audit.canonicalCompounds.length,
    bidirectionalMismatchOps: audit.mismatchCount,
    unmatchedCount: audit.unmatched.length,
    unmatched: audit.unmatched.slice(0, 25),
    generatedPatchFile,
  };
}

const options = parseArgs(process.argv);
bootstrapStateDb();

const reportsDir = join(REPO_ROOT, 'ops', 'reports');
ensureDir(reportsDir);

const before = options.baselineFile
  ? JSON.parse(readFileSync(join(REPO_ROOT, options.baselineFile), 'utf8')).snapshot
  : loadCoverageSnapshot();
const after = loadCoverageSnapshot();
const statuses = derivePatchStatusCounts(options.runId);
const linkIntegrity = buildLinkIntegrityReport();

const report = {
  generatedAt: nowIso(),
  mode: 'lane-a-mechanism-dry-run',
  runId: options.runId,
  snapshot: after,
  beforeAfter: {
    before,
    after,
    delta: {
      herbCoveragePct: Number((after.herbs.coveragePct - before.herbs.coveragePct).toFixed(2)),
      compoundCoveragePct: Number((after.compounds.coveragePct - before.compounds.coveragePct).toFixed(2)),
    },
  },
  statuses,
  linkIntegrity,
};

const tag = options.runId ?? 'latest';
const target = join(reportsDir, `coverage-${tag}.json`);
writeJson(target, report);
console.log(`[report-coverage] Wrote ${target}`);
