#!/usr/bin/env node
import { join, resolve } from 'node:path';
import { readdirSync, readFileSync } from 'node:fs';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { REPO_ROOT } from './_shared.mjs';

const patchesDir = join(REPO_ROOT, 'patches');
const schemaPath = join(REPO_ROOT, 'schemas', 'patch.schema.json');
const explicitTarget = process.argv[2] ? resolve(process.argv[2]) : null;

const ajv = new Ajv2020({ allErrors: true, strict: true, strictRequired: true });
addFormats(ajv);
const schema = JSON.parse(readFileSync(schemaPath, 'utf8'));
const validate = ajv.compile(schema);

const targets = explicitTarget
  ? [explicitTarget]
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
  if (!ok) {
    failed += 1;
    console.error(`[validate-schema] FAIL ${target}`);
    console.error(JSON.stringify(validate.errors, null, 2));
  } else {
    console.log(`[validate-schema] PASS ${target}`);
  }
}

if (failed > 0) process.exit(1);
