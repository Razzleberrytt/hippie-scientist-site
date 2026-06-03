#!/usr/bin/env node
/**
 * Usage:
 *   node scripts/enrichment/validate-schema.mjs [patch-file] [--run-id run-xxxx] [--dry-run]
 */
import { basename, join, resolve } from 'node:path';
import { readdirSync, readFileSync } from 'node:fs';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { REPO_ROOT, bootstrapStateDb, runSqlite } from './_shared.mjs';

function parseArgs(argv) {
  const out = { explicitTarget: null, runId: null, dryRun: false };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--') && !out.explicitTarget) out.explicitTarget = resolve(arg);
    else if (arg === '--run-id' && argv[i + 1]) {
      out.runId = argv[i + 1];
      i += 1;
    } else if (arg.startsWith('--run-id=')) out.runId = arg.slice('--run-id='.length);
    else if (arg === '--dry-run') out.dryRun = true;
  }
  return out;
}

const patchesDir = join(REPO_ROOT, 'patches');
const schemaPath = join(REPO_ROOT, 'schemas', 'patch.schema.json');
const options = parseArgs(process.argv);
bootstrapStateDb();

const ajv = new Ajv2020({ allErrors: true, strict: true, strictRequired: true });
addFormats(ajv);
const schema = JSON.parse(readFileSync(schemaPath, 'utf8'));
const validate = ajv.compile(schema);

const targets = options.explicitTarget
  ? [options.explicitTarget]
  : readdirSync(patchesDir)
      .filter((name) => name.endsWith('.json'))
      .sort()
      .map((name) => join(patchesDir, name));

if (targets.length === 0) {
  console.log('[validate-schema] No patch files found.');
  process.exit(0);
}

let failed = 0;
for (const target of targets) {
  const payload = JSON.parse(readFileSync(target, 'utf8'));
  const ok = validate(payload);
  runSqlite({
    sql: 'INSERT INTO validation_results(patch_id, validation_type, ok, details_json) VALUES(?, ?, ?, ?)',
    args: [
      payload.patch_id ?? basename(target, '.json'),
      options.dryRun ? 'schema-dry-run' : 'schema',
      ok ? 1 : 0,
      JSON.stringify({ runId: options.runId, file: target, errors: validate.errors ?? [] }),
    ],
  });
  if (!ok) {
    failed += 1;
    console.error(`[validate-schema] FAIL ${target}`);
    console.error(JSON.stringify(validate.errors, null, 2));
  } else {
    console.log(`[validate-schema] PASS ${target}`);
  }
}

if (failed > 0) process.exit(1);
