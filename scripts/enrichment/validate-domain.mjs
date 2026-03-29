#!/usr/bin/env node
/**
 * Usage:
 *   node scripts/enrichment/validate-domain.mjs [--run-id run-xxxx] [--dry-run]
 */
import { join } from 'node:path';
import { readdirSync, readFileSync } from 'node:fs';
import { REPO_ROOT, bootstrapStateDb, runSqlite } from './_shared.mjs';

const TASK_VALIDATORS = {
  herb_mechanism: validateMechanism,
  compound_mechanism: validateMechanism,
  dosage: validateDosage,
  interactions: validateInteraction,
  sources_suggestion: validateSources,
};

function parseArgs(argv) {
  const out = { runId: null, dryRun: false };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--run-id' && argv[i + 1]) {
      out.runId = argv[i + 1];
      i += 1;
    } else if (arg.startsWith('--run-id=')) out.runId = arg.slice('--run-id='.length);
    else if (arg === '--dry-run') out.dryRun = true;
  }
  return out;
}

function hasString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function validateMechanism(operation) {
  if (!hasString(operation.value?.mechanism_summary)) return 'mechanism_summary is required.';
  return null;
}

function validateDosage(operation) {
  const range = operation.value?.range;
  if (!range || typeof range !== 'object') return 'range object is required.';
  if (typeof range.low !== 'number' || typeof range.high !== 'number') return 'range.low and range.high numbers are required.';
  if (range.low > range.high) return 'range.low must be <= range.high.';
  return null;
}

function validateInteraction(operation) {
  const severity = operation.value?.severity;
  if (!['low', 'moderate', 'high', 'unknown'].includes(severity)) return 'severity must be one of low|moderate|high|unknown.';
  return null;
}

function validateSources(operation) {
  const sources = operation.value?.sources;
  if (!Array.isArray(sources) || sources.length === 0) return 'sources must be a non-empty array.';
  return null;
}

function validatePatchDomain(patch) {
  const errors = [];
  if (!Array.isArray(patch.operations)) return ['operations must be an array.'];

  patch.operations.forEach((operation, index) => {
    const validator = TASK_VALIDATORS[operation.task];
    if (!validator) {
      errors.push(`operations[${index}]: no validator for task ${operation.task}`);
      return;
    }
    const error = validator(operation);
    if (error) errors.push(`operations[${index}]: ${error}`);
  });

  return errors;
}

const options = parseArgs(process.argv);
bootstrapStateDb();
const patchesDir = join(REPO_ROOT, 'patches');
const patchFiles = readdirSync(patchesDir)
  .filter((name) => name.endsWith('.json'))
  .map((name) => join(patchesDir, name));

if (patchFiles.length === 0) {
  console.log('[validate-domain] No patch files found.');
  process.exit(0);
}

let failed = 0;
for (const patchFile of patchFiles) {
  const patch = JSON.parse(readFileSync(patchFile, 'utf8'));
  const errors = validatePatchDomain(patch);
  runSqlite({
    sql: 'INSERT INTO validation_results(patch_id, validation_type, ok, details_json) VALUES(?, ?, ?, ?)',
    args: [
      patch.patch_id,
      options.dryRun ? 'domain-dry-run' : 'domain',
      errors.length === 0 ? 1 : 0,
      JSON.stringify({ runId: options.runId, file: patchFile, errors }),
    ],
  });
  if (errors.length > 0) {
    failed += 1;
    console.error(`[validate-domain] FAIL ${patchFile}`);
    errors.forEach((entry) => console.error(`  - ${entry}`));
  } else {
    console.log(`[validate-domain] PASS ${patchFile}`);
  }
}

if (failed > 0) process.exit(1);
