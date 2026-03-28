#!/usr/bin/env node
import { join } from 'node:path';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { ensureDir, nowIso, REPO_ROOT } from './_shared.mjs';

const manifestsDir = join(REPO_ROOT, 'ops', 'manifests');
const rollbackDir = join(REPO_ROOT, 'ops', 'rollback-manifests');
const patchesDir = join(REPO_ROOT, 'patches');

ensureDir(manifestsDir);
ensureDir(rollbackDir);

const patchFiles = readdirSync(patchesDir)
  .filter((name) => name.endsWith('.json'))
  .sort();

const manifest = {
  generatedAt: nowIso(),
  mode: 'patch-first',
  appliedPatches: patchFiles,
  writes: [],
  contract: {
    directModelWriteToPublicData: false,
    details: 'Model outputs are accepted only as patch artifacts under /patches. This script writes manifests only in skeleton mode.',
  },
};

for (const patchFile of patchFiles) {
  const payload = JSON.parse(readFileSync(join(patchesDir, patchFile), 'utf8'));
  for (const operation of payload.operations ?? []) {
    manifest.writes.push({
      patchFile,
      entityType: operation.entity_type,
      entityId: operation.entity_id,
      field: operation.field,
      status: 'planned',
    });
  }
}

const runId = `apply-${Date.now()}`;
writeFileSync(join(manifestsDir, `${runId}.json`), JSON.stringify(manifest, null, 2));
writeFileSync(
  join(rollbackDir, `${runId}.json`),
  JSON.stringify({ generatedAt: nowIso(), runId, rollback: [], note: 'Skeleton mode: no data files modified.' }, null, 2),
);

console.log(`[apply-patches] Wrote manifest ${runId}.json`);
console.log('[apply-patches] No changes were written to public/data/*.json (contract enforced).');
