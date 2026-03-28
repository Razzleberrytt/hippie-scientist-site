#!/usr/bin/env node
import { join } from 'node:path';
import { bootstrapStateDb, ensureDir, loadJson, nowIso, REPO_ROOT } from './_shared.mjs';

const providersConfigPath = join(REPO_ROOT, 'config', 'providers.json');
const graphConfigPath = join(REPO_ROOT, 'config', 'entity-graph.json');
const reportsDir = join(REPO_ROOT, 'ops', 'reports');

ensureDir(reportsDir);
const migrationState = bootstrapStateDb();
const providers = loadJson(providersConfigPath);
const entityGraph = loadJson(graphConfigPath);

const plan = {
  generatedAt: nowIso(),
  mode: 'skeleton',
  migrationState,
  providers: providers.providers?.map((p) => ({ id: p.id, enabled: !!p.enabled })) ?? [],
  entityTypes: entityGraph.entityTypes ?? [],
  notes: [
    'Patch-first contract is active.',
    'Model output must be written to /patches/*.json only.',
    'Use apply-patches.mjs for deterministic, reviewed application.',
  ],
};

console.log(JSON.stringify(plan, null, 2));
