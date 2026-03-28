#!/usr/bin/env node
import { join } from 'node:path';
import { readdirSync, readFileSync } from 'node:fs';
import { REPO_ROOT } from './_shared.mjs';

const TASK_VALIDATORS = {
  herb_mechanism: validateMechanism,
  compound_mechanism: validateMechanism,
  dosage: validateDosage,
  interactions: validateInteraction,
  sources_suggestion: validateSources,
};

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
  if (errors.length > 0) {
    failed += 1;
    console.error(`[validate-domain] FAIL ${patchFile}`);
    errors.forEach((entry) => console.error(`  - ${entry}`));
  } else {
    console.log(`[validate-domain] PASS ${patchFile}`);
  }
}

if (failed > 0) process.exit(1);
