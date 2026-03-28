#!/usr/bin/env node
import { join } from 'node:path';
import matter from 'gray-matter';
import { bootstrapStateDb, loadJson, REPO_ROOT } from './_shared.mjs';

const TASK_PACKS = {
  'mechanism-herb': 'mechanism-herb.v3.md',
  'mechanism-compound': 'mechanism-compound.v3.md',
  dosage: 'dosage.v3.md',
  interactions: 'interactions.v3.md',
  sources: 'sources.v3.md',
};

function parseArgs(argv) {
  const options = {
    task: 'mechanism-herb',
    provider: undefined,
  };

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

const providersConfigPath = join(REPO_ROOT, 'config', 'providers.json');
const options = parseArgs(process.argv);
const migrationState = bootstrapStateDb();
const providersConfig = loadJson(providersConfigPath);

const pack = loadPromptPack(options.task);
const provider = resolveProvider(providersConfig, options.provider);

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
  },
};

console.log(
  JSON.stringify(
    {
      status: 'resolved',
      message: 'Task resolved to prompt pack, schema, and provider config.',
      migrationCount: migrationState.count,
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
      todo: [
        'Claim jobs from ops/state.db claim_backlog table.',
        'Dispatch providerRequest to provider adapters in /providers.',
        'Write model outputs to /patches only.',
      ],
    },
    null,
    2,
  ),
);
