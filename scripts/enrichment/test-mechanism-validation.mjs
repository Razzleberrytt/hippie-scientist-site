#!/usr/bin/env node
import { join } from 'node:path';
import { REPO_ROOT, loadJson } from './_shared.mjs';
import { validateMechanismText } from './validate-domain.mjs';

const fixturePath = join(REPO_ROOT, 'scripts', 'enrichment', 'fixtures', 'mechanism-validation.fixtures.json');
const fixtures = loadJson(fixturePath);

const failures = [];
const results = { validPassed: 0, invalidPassed: 0 };

for (const test of fixtures.valid) {
  const error = validateMechanismText(test.task, test.text);
  if (error) failures.push({ kind: 'valid', task: test.task, error, text: test.text });
  else results.validPassed += 1;
}

for (const test of fixtures.invalid) {
  const error = validateMechanismText(test.task, test.text);
  if (!error) failures.push({ kind: 'invalid', task: test.task, reason: test.reason, text: test.text });
  else results.invalidPassed += 1;
}

if (failures.length > 0) {
  console.error('[test-mechanism-validation] FAIL');
  console.error(JSON.stringify({ results, failures }, null, 2));
  process.exit(1);
}

console.log('[test-mechanism-validation] PASS');
console.log(JSON.stringify(results, null, 2));
