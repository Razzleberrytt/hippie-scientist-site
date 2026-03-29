#!/usr/bin/env node
/**
 * Usage:
 *   node scripts/enrichment/run-batch.mjs --task mechanism-herb --batch-size 5 --dry-run
 *   node scripts/enrichment/run-batch.mjs --task mechanism-herb --operations-file ./ops/sample-operations.json --dry-run
 * Identity model:
 *   runId: unique ULID-like run identifier for operational rows and provenance links.
 *   deterministicRunKey: reproducible key from stable planning inputs for replay/audit.
 * Notes:
 *   This script resolves provider + prompt metadata and writes run manifests.
 *   It only creates patch files when --operations-file is provided (no mocked provider output).
 */
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import matter from 'gray-matter';
import {
  bootstrapStateDb,
  deterministicRunId,
  deterministicRunKey,
  ensureDir,
  generatePrefixedUlid,
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
  const options = { task: 'mechanism-herb', provider: undefined, dryRun: false, batchSize: 10, operationsFile: undefined };
  for (let i = 2; i < argv.length; i += 1) {
    const current = argv[i];
    if (current === '--task' && argv[i + 1]) {
      options.task = argv[i + 1];
      i += 1;
      continue;
    }
    if (current.startsWith('--task=')) {
      options.task = current.slice('--task='.length);
      continue;
    }
    if (current === '--provider' && argv[i + 1]) {
      options.provider = argv[i + 1];
      i += 1;
      continue;
    }
    if (current.startsWith('--provider=')) {
      options.provider = current.slice('--provider='.length);
      continue;
    }
    if (current === '--batch-size' && argv[i + 1]) {
      options.batchSize = Number.parseInt(argv[i + 1], 10);
      i += 1;
      continue;
    }
    if (current.startsWith('--batch-size=')) {
      options.batchSize = Number.parseInt(current.slice('--batch-size='.length), 10);
      continue;
    }
    if (current === '--operations-file' && argv[i + 1]) {
      options.operationsFile = argv[i + 1];
      i += 1;
      continue;
    }
    if (current.startsWith('--operations-file=')) {
      options.operationsFile = current.slice('--operations-file='.length);
      continue;
    }
    if (current === '--dry-run') {
      options.dryRun = true;
    }
  }

  if (!Number.isInteger(options.batchSize) || options.batchSize <= 0) {
    throw new Error('batch-size must be a positive integer');
  }

  return options;
}

function splitPromptId(promptId) {
  const match = /^(?<base>.+)\.(?<version>v\d+)$/u.exec(promptId);
  if (!match?.groups) {
    throw new Error(`Invalid prompt pack id "${promptId}". Expected suffix like .v3`);
  }

  return {
    taskId: match.groups.base,
    promptVersion: match.groups.version,
  };
}

function loadPromptPack(task) {
  const file = TASK_PACKS[task];
  if (!file) {
    throw new Error(`Unsupported task "${task}". Supported tasks: ${Object.keys(TASK_PACKS).join(', ')}`);
  }

  const promptPath = join(REPO_ROOT, 'prompts', file);
  const promptRaw = matter.read(promptPath);
  const schemaPath = join(REPO_ROOT, promptRaw.data.schemaRef);
  const schema = loadJson(schemaPath);

  const { id, objective, input, rules, failureMode, schemaRef, task: promptTask } = promptRaw.data;

  if (!id || !promptTask || !schemaRef || !objective || !input || !rules || !failureMode) {
    throw new Error(`Prompt pack ${file} is missing required frontmatter fields.`);
  }

  const { taskId, promptVersion } = splitPromptId(id);

  return {
    file,
    promptPath,
    schemaPath,
    schemaRef,
    prompt: {
      id,
      task: promptTask,
      objective,
      input,
      rules,
      failureMode,
      body: promptRaw.content.trim(),
    },
    schema,
    taskId,
    promptVersion,
  };
}

function resolveProvider(config, providerOverride) {
  const selectedId = providerOverride || config.default;
  const providerEntry = config.providers?.find((provider) => provider.id === selectedId);

  if (!providerEntry) {
    throw new Error(`Provider "${selectedId}" not found in config/providers.json`);
  }

  if (!providerEntry.enabled) {
    throw new Error(`Provider "${selectedId}" is disabled in config/providers.json`);
  }

  return {
    id: providerEntry.id,
    model: providerEntry.model,
    temperature: Number.isFinite(providerEntry.temperature) ? providerEntry.temperature : 0,
    temperatureSource: 'config/providers.json',
    requiredEnv: providerEntry.env ?? [],
  };
}

function selectEntities(task, batchSize) {
  const rows = runSqlite({
    select: true,
    sql: `SELECT entity_type, entity_id FROM claim_backlog
      WHERE status='pending' AND task=?
      ORDER BY priority ASC, created_at ASC, entity_type ASC, entity_id ASC
      LIMIT ?`,
    args: [task, batchSize],
  });
  return rows.map((row) => `${row.entity_type}:${row.entity_id}`);
}

const ULID_PAYLOAD_RE = /^[0-9A-HJKMNP-TV-Z]{26}$/u;
function hasPrefixedUlid(value, prefix) {
  return typeof value === 'string' && value.startsWith(`${prefix}_`) && ULID_PAYLOAD_RE.test(value.slice(prefix.length + 1));
}

function normalizeMechanismOperation(operation, runId) {
  if (operation.field === '/claims/-') {
    const claim = operation.value && typeof operation.value === 'object' ? { ...operation.value } : { claim: String(operation.value ?? '') };
    if (!hasPrefixedUlid(claim.id, 'clm')) claim.id = generatePrefixedUlid('clm');
    if (!Array.isArray(claim.source_ids) || claim.source_ids.length === 0) claim.source_ids = [generatePrefixedUlid('src')];
    claim.source_ids = claim.source_ids.map((id) => (hasPrefixedUlid(id, 'src') ? id : generatePrefixedUlid('src')));
    return { ...operation, value: claim };
  }

  if (operation.field === '/_provenance') {
    const provenance = operation.value && typeof operation.value === 'object' ? { ...operation.value } : {};
    provenance.run_id = hasPrefixedUlid(provenance.run_id, 'run') ? provenance.run_id : runId;
    const sources = Array.isArray(provenance.sources) ? provenance.sources : [];
    provenance.sources = sources.map((source) => {
      const next = source && typeof source === 'object' ? { ...source } : {};
      if (!hasPrefixedUlid(next.id, 'src')) next.id = generatePrefixedUlid('src');
      return next;
    });
    if (provenance.sources.length === 0) provenance.sources = [{ id: generatePrefixedUlid('src') }];
    return { ...operation, value: provenance };
  }

  return operation;
}

function normalizeOperation(operation, runId) {
  if (operation.task === 'herb_mechanism' || operation.task === 'compound_mechanism') {
    return normalizeMechanismOperation(operation, runId);
  }
  return operation;
}

const providersConfigPath = join(REPO_ROOT, 'config', 'providers.json');
const options = parseArgs(process.argv);
const migrationState = bootstrapStateDb();
const providersConfig = loadJson(providersConfigPath);

const pack = loadPromptPack(options.task);
const provider = resolveProvider(providersConfig, options.provider);
const selectedEntities = selectEntities(options.task, options.batchSize);

const runId = deterministicRunId({
  phase: 'batch',
  task: options.task,
  dryRun: options.dryRun,
  provider: provider.id,
  model: provider.model,
  temperature: provider.temperature,
  promptVersion: pack.promptVersion,
  schemaVersion: pack.schema.$id ?? pack.schemaRef,
  selectedEntities,
  batchSize: options.batchSize,
});
const deterministicKey = deterministicRunKey(
  {
    phase: 'batch',
    task: options.task,
    dryRun: options.dryRun,
    provider: provider.id,
    model: provider.model,
    temperature: provider.temperature,
    promptVersion: pack.promptVersion,
    schemaVersion: pack.schema.$id ?? pack.schemaRef,
    selectedEntities,
    batchSize: options.batchSize,
    operationsFile: options.operationsFile ?? null,
  },
  'batch',
);

const providerRequest = {
  task: pack.prompt.task,
  taskId: pack.taskId,
  promptVersion: pack.promptVersion,
  prompt: pack.prompt.body,
  schema: pack.schema,
  model: provider.model,
  temperature: provider.temperature,
  temperatureSource: provider.temperatureSource,
  metadata: {
    objective: pack.prompt.objective,
    input: pack.prompt.input,
    rules: pack.prompt.rules,
    failureMode: pack.prompt.failureMode,
    schemaRef: pack.schemaRef,
    runId,
    deterministicRunKey: deterministicKey,
    dryRun: options.dryRun,
  },
};

const manifestsDir = join(REPO_ROOT, 'ops', 'manifests');
const patchesDir = join(REPO_ROOT, 'patches');
ensureDir(manifestsDir);
ensureDir(patchesDir);

const batchManifest = {
  runId,
  deterministicRunKey: deterministicKey,
  phase: 'batch',
  task: options.task,
  createdAt: nowIso(),
  dryRun: options.dryRun,
  provider: { id: provider.id, model: provider.model, temperature: provider.temperature },
  selectedEntities,
  batchSize: options.batchSize,
  promptVersion: pack.promptVersion,
  schemaVersion: pack.schema.$id ?? pack.schemaRef,
  operationsFile: options.operationsFile ?? null,
  generatedPatchFiles: [],
};

if (options.operationsFile) {
  const operationsPayload = loadJson(join(REPO_ROOT, options.operationsFile));
  const operationsRaw = Array.isArray(operationsPayload) ? operationsPayload : operationsPayload.operations;
  const operations = operationsRaw.map((operation) => normalizeOperation(operation, runId));
  if (!Array.isArray(operations) || operations.length === 0) {
    throw new Error('--operations-file must contain an array or {operations:[...]} with at least one operation.');
  }
  const patchId = `patch-${createHash('sha256').update(`${runId}:${options.operationsFile}`).digest('hex').slice(0, 16)}`;
  const patch = {
    patch_id: patchId,
    created_at: nowIso(),
    producer: `${provider.id}:${provider.model}`,
    operations,
  };
  const patchFile = `${patchId}.json`;
  writeJson(join(patchesDir, patchFile), patch);
  batchManifest.generatedPatchFiles.push(`patches/${patchFile}`);
  runSqlite({
    sql: 'INSERT OR REPLACE INTO patches(patch_id, patch_file, patch_sha256, status) VALUES(?, ?, ?, ?)',
    args: [patchId, patchFile, createHash('sha256').update(JSON.stringify(patch)).digest('hex'), 'staged'],
  });
}

writeJson(join(manifestsDir, `${runId}.batch.json`), batchManifest);
runSqlite({
  sql: 'INSERT OR REPLACE INTO runs(run_uuid, status, provider_id, notes) VALUES(?, ?, ?, ?)',
  args: [
    runId,
    options.dryRun ? 'dry-run' : 'running',
    provider.id,
    JSON.stringify({ dryRun: options.dryRun, phase: 'batch', task: options.task, deterministicRunKey: deterministicKey }),
  ],
});

console.log(
  JSON.stringify(
    {
      status: 'resolved',
      message: 'Task resolved to prompt pack, schema, and provider config.',
      migrationCount: migrationState.count,
      runId,
      deterministicRunKey: deterministicKey,
      dryRun: options.dryRun,
      resolution: {
        task: options.task,
        promptPack: {
          id: pack.prompt.id,
          file: `prompts/${pack.file}`,
          schemaRef: pack.schemaRef,
        },
        schema: {
          path: pack.schemaPath.replace(`${REPO_ROOT}/`, ''),
          id: pack.schema.$id,
          required: pack.schema.required ?? [],
        },
        provider,
      },
      providerRequest,
      manifest: `ops/manifests/${runId}.batch.json`,
      todo: ['Dispatch providerRequest to provider adapters in /providers.', 'Write model outputs to /patches only.'],
    },
    null,
    2,
  ),
);
