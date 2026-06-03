#!/usr/bin/env node
/**
 * Usage:
 *   node scripts/enrichment/plan-run.mjs --task mechanism-herb --batch-size 10 --dry-run
 * Identity model:
 *   runId: unique ULID-like run identifier for operational rows and provenance links.
 *   deterministicRunKey: reproducible key from stable planning inputs for replay/audit.
 */
import { join } from 'node:path';
import matter from 'gray-matter';
import {
  bootstrapStateDb,
  deterministicRunId,
  deterministicRunKey,
  ensureDir,
  loadJson,
  nowIso,
  REPO_ROOT,
  runSqlite,
  writeJson,
} from './_shared.mjs';

const TASK_PACKS = {
  'mechanism-herb': 'mechanism-herb.v3.md',
  'mechanism-compound': 'mechanism-compound.v3.md',
  dosage: 'dosage.v3.md',
  interactions: 'interactions.v3.md',
  sources: 'sources.v3.md',
};

function parseArgs(argv) {
  const out = { task: 'mechanism-herb', provider: undefined, batchSize: 10, dryRun: false };
  for (let i = 2; i < argv.length; i += 1) {
    const current = argv[i];
    if (current === '--task' && argv[i + 1]) {
      out.task = argv[i + 1];
      i += 1;
    } else if (current.startsWith('--task=')) {
      out.task = current.slice('--task='.length);
    } else if (current === '--provider' && argv[i + 1]) {
      out.provider = argv[i + 1];
      i += 1;
    } else if (current.startsWith('--provider=')) {
      out.provider = current.slice('--provider='.length);
    } else if (current === '--batch-size' && argv[i + 1]) {
      out.batchSize = Number.parseInt(argv[i + 1], 10);
      i += 1;
    } else if (current.startsWith('--batch-size=')) {
      out.batchSize = Number.parseInt(current.slice('--batch-size='.length), 10);
    } else if (current === '--dry-run') {
      out.dryRun = true;
    }
  }
  if (!Number.isInteger(out.batchSize) || out.batchSize <= 0) throw new Error('batch-size must be a positive integer');
  return out;
}

function splitPromptId(promptId) {
  const match = /^(?<base>.+)\.(?<version>v\d+)$/u.exec(promptId);
  if (!match?.groups) throw new Error(`Invalid prompt pack id "${promptId}".`);
  return { taskId: match.groups.base, promptVersion: match.groups.version };
}

function resolveProvider(config, providerOverride) {
  const selectedId = providerOverride || config.default;
  const providerEntry = config.providers?.find((provider) => provider.id === selectedId);
  if (!providerEntry) throw new Error(`Provider "${selectedId}" not found in config/providers.json`);
  if (!providerEntry.enabled) throw new Error(`Provider "${selectedId}" is disabled in config/providers.json`);
  return providerEntry;
}

function selectEntities(task, batchSize) {
  const rows = runSqlite({
    select: true,
    sql: `SELECT entity_type, entity_id, task
      FROM claim_backlog
      WHERE status='pending' AND task=?
      ORDER BY priority ASC, created_at ASC, entity_type ASC, entity_id ASC
      LIMIT ?`,
    args: [task, batchSize],
  });
  return rows.map((row) => `${row.entity_type}:${row.entity_id}`);
}

const providersConfigPath = join(REPO_ROOT, 'config', 'providers.json');
const manifestsDir = join(REPO_ROOT, 'ops', 'manifests');
ensureDir(manifestsDir);

const options = parseArgs(process.argv);
const migrationState = bootstrapStateDb();
const providers = loadJson(providersConfigPath);
const provider = resolveProvider(providers, options.provider);
const promptFile = TASK_PACKS[options.task];
if (!promptFile) throw new Error(`Unsupported task "${options.task}".`);
const promptRaw = matter.read(join(REPO_ROOT, 'prompts', promptFile));
const { promptVersion } = splitPromptId(promptRaw.data.id);
const schema = loadJson(join(REPO_ROOT, promptRaw.data.schemaRef));
const selectedEntities = selectEntities(options.task, options.batchSize);

const runKey = {
  phase: 'plan',
  task: options.task,
  dryRun: options.dryRun,
  provider: provider.id,
  model: provider.model,
  temperature: provider.temperature,
  promptVersion,
  schemaVersion: schema.$id ?? promptRaw.data.schemaRef,
  selectedEntities,
  batchSize: options.batchSize,
};
const runId = deterministicRunId(runKey);
const deterministicKey = deterministicRunKey(runKey, 'plan');

const manifest = {
  runId,
  deterministicRunKey: deterministicKey,
  phase: 'plan',
  task: options.task,
  createdAt: nowIso(),
  dryRun: options.dryRun,
  provider: {
    id: provider.id,
    model: provider.model,
    temperature: provider.temperature,
  },
  selectedEntities,
  batchSize: options.batchSize,
  promptVersion,
  schemaVersion: schema.$id ?? promptRaw.data.schemaRef,
};

writeJson(join(manifestsDir, `${runId}.plan.json`), manifest);
runSqlite({
  sql: 'INSERT OR REPLACE INTO runs(run_uuid, status, provider_id, notes) VALUES(?, ?, ?, ?)',
  args: [runId, 'planned', provider.id, JSON.stringify({ dryRun: options.dryRun, phase: 'plan', task: options.task, deterministicRunKey: deterministicKey, selectedEntities })],
});

console.log(
  JSON.stringify(
    {
      status: 'planned',
      migrationCount: migrationState.count,
      runId,
      deterministicRunKey: deterministicKey,
      manifest: `ops/manifests/${runId}.plan.json`,
      selectedEntities: selectedEntities.length,
      dryRun: options.dryRun,
    },
    null,
    2,
  ),
);
