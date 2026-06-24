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
    mechanismCoverage: {
      herbs: {
        total: herbs.length,
        covered: herbCovered,
        coveragePct: Number(((herbCovered / Math.max(herbs.length, 1)) * 100).toFixed(2)),
      },
      compounds: {
        total: compounds.length,
        covered: compoundCovered,
        coveragePct: Number(((compoundCovered / Math.max(compounds.length, 1)) * 100).toFixed(2)),
      },
    },
    verifiedSourceCount: {
      herbs: herbs.reduce((acc, herb) => acc + (Array.isArray(herb.sources) ? herb.sources.filter((src) => src?.verified === true).length : 0), 0),
      compounds: compounds.reduce(
        (acc, compound) => acc + (Array.isArray(compound.sources) ? compound.sources.filter((src) => src?.verified === true).length : 0),
        0,
      ),
    },
  };
}

function normalizeSnapshotShape(snapshot) {
  if (snapshot?.mechanismCoverage?.herbs && snapshot?.mechanismCoverage?.compounds) return snapshot;
  return {
    mechanismCoverage: {
      herbs: snapshot?.herbs ?? { total: 0, covered: 0, coveragePct: 0 },
      compounds: snapshot?.compounds ?? { total: 0, covered: 0, coveragePct: 0 },
    },
    verifiedSourceCount: snapshot?.verifiedSourceCount ?? { herbs: 0, compounds: 0 },
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
      if (!byEntity.has(key)) byEntity.set(key, { review: null, hasMechanism: false, hasSevereInteraction: false });
      const item = byEntity.get(key);
      if (op.field === '/_review' && op.value && typeof op.value === 'object') item.review = op.value.status;
      if (op.field === '/mechanism' && op.op === 'set') item.hasMechanism = true;
      if (
        op.task === 'interactions' &&
        op.field === '/interactions' &&
        Array.isArray(op.value) &&
        op.value.some((interaction) => ['severe', 'contraindicated'].includes(String(interaction?.severity ?? '').toLowerCase()))
      ) {
        item.hasSevereInteraction = true;
      }
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

  const severeReviewRows = runSqlite({
    select: true,
    sql: `SELECT decision FROM review_decisions WHERE lane='C' ${
      selectedPatchIds.length ? `AND patch_id IN (${selectedPatchIds.map(() => '?').join(',')})` : ''
    }`,
    args: selectedPatchIds,
  });

  return {
    planned: runId
      ? (() => {
          const rows = runSqlite({
            select: true,
            sql: 'SELECT notes FROM runs WHERE run_uuid=? ORDER BY id DESC LIMIT 1',
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
    severe_interaction_review_completion_pct:
      severeReviewRows.length === 0
        ? 0
        : Number(((severeReviewRows.filter((row) => ['approved', 'rejected'].includes(row.decision)).length / severeReviewRows.length) * 100).toFixed(2)),
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
  const totalLinks =
    herbs.reduce((sum, herb) => sum + (Array.isArray(herb.activeCompounds) ? herb.activeCompounds.length : 0), 0) +
    compounds.reduce(
      (sum, compound) => sum + (Array.isArray(compound.foundIn) ? compound.foundIn.length : 0) + (Array.isArray(compound.herbs) ? compound.herbs.length : 0),
      0,
    );
  const completeLinks = Math.max(totalLinks - audit.mismatchCount, 0);

  return {
    canonicalCompoundCount: audit.canonicalCompounds.length,
    bidirectionalMismatchOps: audit.mismatchCount,
    totalLinks,
    bidirectionalLinkCompletenessPct: Number(((completeLinks / Math.max(totalLinks, 1)) * 100).toFixed(2)),
    unmatchedCount: audit.unmatched.length,
    unmatched: audit.unmatched.slice(0, 25),
    generatedPatchFile,
  };
}

function buildClaimBacklogBurnDown() {
  const rows = runSqlite({
    select: true,
    sql: 'SELECT status, COUNT(*) AS count FROM claim_backlog GROUP BY status',
  });
  const byStatus = Object.fromEntries(rows.map((row) => [row.status, Number(row.count)]));
  const total = Object.values(byStatus).reduce((sum, value) => sum + Number(value || 0), 0);
  const done = Number(byStatus.completed ?? 0);
  const pending = Number(byStatus.pending ?? 0);

  return {
    total,
    pending,
    completed: done,
    completionPct: total === 0 ? 0 : Number(((done / total) * 100).toFixed(2)),
    byStatus,
  };
}

const options = parseArgs(process.argv);
bootstrapStateDb();

const reportsDir = join(REPO_ROOT, 'ops', 'reports');
ensureDir(reportsDir);

const beforeRaw = options.baselineFile ? JSON.parse(readFileSync(join(REPO_ROOT, options.baselineFile), 'utf8')).snapshot : loadCoverageSnapshot();
const before = normalizeSnapshotShape(beforeRaw);
const after = loadCoverageSnapshot();
const statuses = derivePatchStatusCounts(options.runId);
const linkIntegrity = buildLinkIntegrityReport();
const claimBacklogBurnDown = buildClaimBacklogBurnDown();

const report = {
  generatedAt: nowIso(),
  mode: 'lane-a-mechanism-dry-run',
  runId: options.runId,
  snapshot: {
    mechanismCoverage: after.mechanismCoverage,
    verifiedSourceCount: {
      ...after.verifiedSourceCount,
      total: after.verifiedSourceCount.herbs + after.verifiedSourceCount.compounds,
    },
    severeInteractionReviewCompletionPct: statuses.severe_interaction_review_completion_pct,
    bidirectionalLinkCompletenessPct: linkIntegrity.bidirectionalLinkCompletenessPct,
    claimBacklogBurnDown,
    patchRejectionRatePct: statuses.patch_rejection_rate_pct,
  },
  beforeAfter: {
    before,
    after,
    delta: {
      herbCoveragePct: Number((after.mechanismCoverage.herbs.coveragePct - before.mechanismCoverage.herbs.coveragePct).toFixed(2)),
      compoundCoveragePct: Number((after.mechanismCoverage.compounds.coveragePct - before.mechanismCoverage.compounds.coveragePct).toFixed(2)),
      verifiedSourceCount:
        after.verifiedSourceCount.herbs +
        after.verifiedSourceCount.compounds -
        ((before.verifiedSourceCount?.herbs ?? 0) + (before.verifiedSourceCount?.compounds ?? 0)),
    },
  },
  statuses,
  linkIntegrity,
};

const tag = options.runId ?? 'latest';
const target = join(reportsDir, `coverage-${tag}.json`);
writeJson(target, report);

console.log(`[report-coverage] Wrote ${target}`);
console.log(
  `[report-coverage] mechanism.herbs=${report.snapshot.mechanismCoverage.herbs.coveragePct}% mechanism.compounds=${report.snapshot.mechanismCoverage.compounds.coveragePct}% verified_sources=${report.snapshot.verifiedSourceCount.total} severe_review=${report.snapshot.severeInteractionReviewCompletionPct}% bidirectional=${report.snapshot.bidirectionalLinkCompletenessPct}% claim_backlog_completion=${report.snapshot.claimBacklogBurnDown.completionPct}% patch_rejection=${report.snapshot.patchRejectionRatePct}%`,
);
