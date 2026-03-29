#!/usr/bin/env node
/**
 * Usage:
 *   node scripts/enrichment/apply-patches.mjs [--dry-run]
 * Rules:
 *   - Dry-run never mutates public/data files.
 *   - Lane C patches require an approved review_decisions row.
 */
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { bootstrapStateDb, deterministicRunId, ensureDir, nowIso, REPO_ROOT, runSqlite, writeJson } from './_shared.mjs';

function parseArgs(argv) {
  return { dryRun: argv.includes('--dry-run') };
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function isLaneCPatch(patchFile, patch) {
  const fingerprint = `${patchFile} ${patch.patch_id ?? ''} ${patch.producer ?? ''}`.toLowerCase();
  return fingerprint.includes('lane-c') || fingerprint.includes('lane_c') || fingerprint.includes('lanec');
}

function detectLane(patchFile, patch) {
  const fingerprint = `${patchFile} ${patch.patch_id ?? ''} ${patch.producer ?? ''}`.toLowerCase();
  if (fingerprint.includes('lane-a') || fingerprint.includes('lane_a') || fingerprint.includes('lanea')) return 'A';
  if (fingerprint.includes('lane-b') || fingerprint.includes('lane_b') || fingerprint.includes('laneb')) return 'B';
  if (fingerprint.includes('lane-c') || fingerprint.includes('lane_c') || fingerprint.includes('lanec')) return 'C';
  return 'unknown';
}

function collectReviewStatuses(patch) {
  const statuses = [];
  for (const operation of patch.operations ?? []) {
    if (operation.field === '/_review' && operation.op === 'set' && operation.value && typeof operation.value === 'object') {
      statuses.push(String(operation.value.status ?? '').toLowerCase());
    }
  }
  return statuses;
}

function hasMechanismOperations(patch) {
  return (patch.operations ?? []).some((operation) => operation.task === 'herb_mechanism' || operation.task === 'compound_mechanism');
}

function findEntityIndex(data, entityId) {
  const target = String(entityId).toLowerCase();
  return data.findIndex((entry) => [entry.id, entry.slug, entry.name, entry.displayName].some((value) => String(value ?? '').toLowerCase() === target));
}

function applyOperation(entity, operation) {
  const fieldPath = String(operation.field ?? '');
  const isPointer = fieldPath.startsWith('/');
  const parts = isPointer ? fieldPath.split('/').slice(1).map((part) => part.replace(/~1/g, '/').replace(/~0/g, '~')) : [fieldPath];
  const last = parts.at(-1);
  const parent = parts.slice(0, -1).reduce((cursor, part) => {
    if (!cursor[part] || typeof cursor[part] !== 'object') cursor[part] = {};
    return cursor[part];
  }, entity);

  if (operation.op === 'set') {
    parent[last] = operation.value;
    return;
  }
  if (operation.op === 'append') {
    if (last === '-') {
      const arrayKey = parts.at(-2);
      const container = parts.slice(0, -2).reduce((cursor, part) => {
        if (!cursor[part] || typeof cursor[part] !== 'object') cursor[part] = {};
        return cursor[part];
      }, entity);
      if (!Array.isArray(container[arrayKey])) container[arrayKey] = [];
      container[arrayKey] = [...container[arrayKey], operation.value];
      return;
    }
    if (!Array.isArray(parent[last])) parent[last] = [];
    parent[last] = [...parent[last], operation.value];
    return;
  }
  if (operation.op === 'remove') delete parent[last];
}

const manifestsDir = join(REPO_ROOT, 'ops', 'manifests');
const rollbackDir = join(REPO_ROOT, 'ops', 'rollback-manifests');
const patchesDir = join(REPO_ROOT, 'patches');
const targetFiles = {
  herb: join(REPO_ROOT, 'public', 'data', 'herbs.json'),
  compound: join(REPO_ROOT, 'public', 'data', 'compounds.json'),
};
const options = parseArgs(process.argv);

ensureDir(manifestsDir);
ensureDir(rollbackDir);
bootstrapStateDb();

const patchFiles = readdirSync(patchesDir)
  .filter((name) => name.endsWith('.json'))
  .sort();

const runId = deterministicRunId({ phase: 'apply', dryRun: options.dryRun, patchFiles });
const manifest = {
  runId,
  phase: 'apply',
  createdAt: nowIso(),
  dryRun: options.dryRun,
  appliedPatches: [],
  blockedPatches: [],
  writes: [],
  skippedByReason: {
    pending: 0,
    rejected: 0,
    'non-lane-a': 0,
    'non-mechanism': 0,
    'missing-approval': 0,
  },
};
const rollbackManifest = {
  runId,
  createdAt: nowIso(),
  dryRun: options.dryRun,
  appliedPatchFiles: [],
  mutatedTargets: [],
};

const cache = new Map();
function loadTarget(entityType) {
  const path = targetFiles[entityType];
  if (!path) throw new Error(`Unsupported entity_type ${entityType}`);
  if (!cache.has(path)) {
    const beforeRaw = readFileSync(path, 'utf8');
    cache.set(path, { path, beforeRaw, data: JSON.parse(beforeRaw), changed: false });
  }
  return cache.get(path);
}

for (const patchFile of patchFiles) {
  const patchPath = join(patchesDir, patchFile);
  const payload = JSON.parse(readFileSync(patchPath, 'utf8'));
  const lane = detectLane(patchFile, payload);
  const reviewStatuses = collectReviewStatuses(payload);

  if (!hasMechanismOperations(payload)) {
    manifest.blockedPatches.push({ patchFile, patchId: payload.patch_id, reason: 'non-mechanism' });
    manifest.skippedByReason['non-mechanism'] += 1;
    continue;
  }

  if (lane !== 'A') {
    manifest.blockedPatches.push({ patchFile, patchId: payload.patch_id, reason: 'non-lane-a', lane });
    manifest.skippedByReason['non-lane-a'] += 1;
    continue;
  }

  if (reviewStatuses.includes('rejected')) {
    manifest.blockedPatches.push({ patchFile, patchId: payload.patch_id, reason: 'rejected' });
    manifest.skippedByReason.rejected += 1;
    continue;
  }

  if (reviewStatuses.includes('pending')) {
    manifest.blockedPatches.push({ patchFile, patchId: payload.patch_id, reason: 'pending' });
    manifest.skippedByReason.pending += 1;
    continue;
  }

  const laneAApproval = runSqlite({
    select: true,
    sql: `SELECT id FROM review_decisions
      WHERE patch_id = ? AND lane = 'A' AND decision = 'approved'
      ORDER BY created_at DESC LIMIT 1`,
    args: [payload.patch_id],
  });
  const approvedInPatch = reviewStatuses.includes('approved');
  const approved = approvedInPatch || laneAApproval.length > 0;
  if (!approved) {
    manifest.blockedPatches.push({ patchFile, patchId: payload.patch_id, reason: 'missing-approval' });
    manifest.skippedByReason['missing-approval'] += 1;
    continue;
  }

  if (isLaneCPatch(patchFile, payload)) {
    const rows = runSqlite({
      select: true,
      sql: `SELECT id FROM review_decisions
        WHERE patch_id = ? AND lane = 'C' AND decision = 'approved'
        ORDER BY created_at DESC LIMIT 1`,
      args: [payload.patch_id],
    });
    if (rows.length === 0) {
      manifest.blockedPatches.push({ patchFile, reason: 'lane-c-without-approval' });
      writeJson(join(manifestsDir, `${runId}.apply.json`), manifest);
      writeJson(join(rollbackDir, `${runId}.json`), rollbackManifest);
      console.error(`[apply-patches] Lane C guard blocked patch ${patchFile}: missing approved review_decisions row.`);
      process.exit(1);
    }
  }

  manifest.appliedPatches.push(patchFile);
  rollbackManifest.appliedPatchFiles.push(patchFile);

  for (const operation of payload.operations ?? []) {
    const target = loadTarget(operation.entity_type);
    const entityIndex = findEntityIndex(target.data, operation.entity_id);
    if (entityIndex < 0) {
      manifest.writes.push({ patchFile, entityType: operation.entity_type, entityId: operation.entity_id, field: operation.field, status: 'skipped-entity-not-found' });
      continue;
    }

    if (options.dryRun) {
      manifest.writes.push({ patchFile, entityType: operation.entity_type, entityId: operation.entity_id, field: operation.field, status: 'dry-run-skipped' });
      continue;
    }

    applyOperation(target.data[entityIndex], operation);
    if (Object.prototype.hasOwnProperty.call(target.data[entityIndex], 'lastUpdated')) {
      target.data[entityIndex].lastUpdated = nowIso().slice(0, 10);
    }
    target.changed = true;
    manifest.writes.push({ patchFile, entityType: operation.entity_type, entityId: operation.entity_id, field: operation.field, status: 'applied' });
  }

  runSqlite({
    sql: 'UPDATE patches SET applied_at=CURRENT_TIMESTAMP, status=? WHERE patch_id=?',
    args: [options.dryRun ? 'dry-run' : 'applied', payload.patch_id],
  });
}

for (const target of cache.values()) {
  if (!target.changed || options.dryRun) continue;
  const afterRaw = JSON.stringify(target.data, null, 2);
  writeFileSync(target.path, `${afterRaw}\n`);
  rollbackManifest.mutatedTargets.push({
    file: target.path.replace(`${REPO_ROOT}/`, ''),
    beforeSha256: sha256(target.beforeRaw),
    afterSha256: sha256(`${afterRaw}\n`),
  });
}

runSqlite({
  sql: 'INSERT OR REPLACE INTO runs(run_uuid, status, provider_id, notes, finished_at) VALUES(?, ?, ?, ?, CURRENT_TIMESTAMP)',
  args: [runId, options.dryRun ? 'dry-run' : 'applied', 'n/a', JSON.stringify({ dryRun: options.dryRun, phase: 'apply' })],
});
writeJson(join(manifestsDir, `${runId}.apply.json`), manifest);
writeJson(join(rollbackDir, `${runId}.json`), rollbackManifest);

console.log(`[apply-patches] Wrote apply manifest ops/manifests/${runId}.apply.json`);
console.log(`[apply-patches] Wrote rollback manifest ops/rollback-manifests/${runId}.json`);
console.log(`[apply-patches] Applied patches: ${manifest.appliedPatches.length}`);
console.log(
  `[apply-patches] Skipped patches: pending=${manifest.skippedByReason.pending} rejected=${manifest.skippedByReason.rejected} non-lane-a=${manifest.skippedByReason['non-lane-a']}`,
);
console.log(`[apply-patches] Mutated targets: ${rollbackManifest.mutatedTargets.map((entry) => entry.file).join(', ') || '(none)'}`);
if (options.dryRun) console.log('[apply-patches] Dry-run enabled; no public/data files were mutated.');
