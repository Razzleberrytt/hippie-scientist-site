#!/usr/bin/env node
import { join } from 'node:path';
import { REPO_ROOT, loadJson } from './_shared.mjs';
import { canonicalizeMechanismPhrase, extractMechanismAtomicPhrases } from './evidence-acquisition-engine.mjs';

const fixturePath = join(REPO_ROOT, 'scripts', 'enrichment', 'fixtures', 'mechanism-regression.fixtures.json');
const fixtures = loadJson(fixturePath);

const pass = Array.isArray(fixtures.pass) ? fixtures.pass.map((v) => String(v).trim()).filter(Boolean) : [];
const fail = Array.isArray(fixtures.fail) ? fixtures.fail.map((v) => String(v).trim()).filter(Boolean) : [];

if (pass.length === 0 || fail.length === 0) {
  console.error('[test-mechanism-regression-fixtures] FAIL fixture file must include non-empty pass and fail arrays');
  process.exit(1);
}

const passSet = new Set(pass.map((value) => value.toLowerCase()));
const failSet = new Set(fail.map((value) => value.toLowerCase()));
const overlap = [...passSet].filter((value) => failSet.has(value));
if (overlap.length > 0) {
  console.error('[test-mechanism-regression-fixtures] FAIL pass/fail overlap detected');
  console.error(JSON.stringify({ overlap }, null, 2));
  process.exit(1);
}

function scorePassFixture(input) {
  const extraction = extractMechanismAtomicPhrases(input);
  const matched = extraction.phrases.length > 0;
  return {
    input,
    matched_correctly: matched,
    normalized_output: matched ? extraction.phrases : [],
    rejection_reason: matched ? null : (extraction.rejectionReasons[0] ?? canonicalizeMechanismPhrase(input).reason ?? 'unknown_rejection'),
  };
}

function classifyLeakageCategory(text) {
  const lower = String(text).toLowerCase();
  if (/\b(pathway|signaling|signalling|cascade|process|response|nf-?κ?b|nitric oxide)\b/u.test(lower)) return 'pathway_or_process_target';
  if (/\b(antioxidant|anti-inflammatory|activity|oxidative stress reduction|effect)\b/u.test(lower)) return 'effect_only_target';
  if (/\b(expression|mrna|transcript|upregulat|downregulat)\b/u.test(lower)) return 'expression_regulation_claim';
  if (/\b(sac|multiple targets|various targets|different targets)\b/u.test(lower)) return 'ambiguous_target_alias';
  if (/\b(excitotoxicity|cell viability|inflammation)\b/u.test(lower)) return 'wrong_object_action_binding';
  return 'other_leakage';
}

function scoreFailFixture(input) {
  const extraction = extractMechanismAtomicPhrases(input);
  const rejected = extraction.phrases.length === 0;
  return {
    input,
    rejected_correctly: rejected,
    leaked_output: rejected ? [] : extraction.phrases,
    leakage_reason_category: rejected ? null : classifyLeakageCategory(input),
  };
}

const passResults = pass.map(scorePassFixture);
const failResults = fail.map(scoreFailFixture);

const summary = {
  fixturePath: 'scripts/enrichment/fixtures/mechanism-regression.fixtures.json',
  total_pass_fixtures: passResults.length,
  pass_matched_correctly: passResults.filter((row) => row.matched_correctly).length,
  pass_missed: passResults.filter((row) => !row.matched_correctly).length,
  total_fail_fixtures: failResults.length,
  fail_rejected_correctly: failResults.filter((row) => row.rejected_correctly).length,
  fail_leaked_incorrectly: failResults.filter((row) => !row.rejected_correctly).length,
};

const output = {
  summary,
  pass_fixtures: passResults,
  fail_fixtures: failResults,
};

console.log('[test-mechanism-regression-fixtures] PASS');
console.log(JSON.stringify(output, null, 2));
console.log(`MECH_FIXTURE_SCORE_JSON=${JSON.stringify(output)}`);
