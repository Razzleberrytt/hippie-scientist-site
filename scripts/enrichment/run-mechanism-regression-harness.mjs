#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { REPO_ROOT, loadJson } from './_shared.mjs';

function runStep(name, args, { capture = false } = {}) {
  console.log(`[mechanism-harness] step=${name} cmd=node ${args.join(' ')}`);
  const result = spawnSync('node', args, { encoding: 'utf8', stdio: capture ? 'pipe' : 'inherit' });
  if (result.status !== 0) {
    if (capture) {
      if (result.stdout) process.stdout.write(result.stdout);
      if (result.stderr) process.stderr.write(result.stderr);
    }
    throw new Error(`[mechanism-harness] ${name} failed with exit code ${result.status ?? 'unknown'}`);
  }
  if (capture) {
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
  }
  return result;
}

function classifyGuardrailViolation(text) {
  const lower = String(text).toLowerCase();
  if (/\b(pathway|signaling|signalling|cascade|process|response|nf-?κ?b|nitric oxide)\b/u.test(lower)) return 'pathway_or_process_target';
  if (/\b(antioxidant|anti-inflammatory|activity|effect|oxidative stress reduction)\b/u.test(lower)) return 'effect_only_target';
  if (/\b(expression|mrna|transcript|upregulat|downregulat|gene level|protein level)\b/u.test(lower)) return 'expression_regulation_claim';
  if (/\b(sac|multiple targets|various targets|different targets|unknown target)\b/u.test(lower)) return 'ambiguous_target_alias';
  if (/\b(excitotoxicity|cell viability|inflammation|immune response)\b/u.test(lower)) return 'wrong_object_action_binding';
  return null;
}

function summarizeAcceptedMechanisms(rows) {
  const mechanismRows = rows.filter((row) => row?.schemaField === 'mechanism');
  const expanded = [];
  for (const row of mechanismRows) {
    const bits = String(row?.value ?? '').split(/\s*;\s*/u).map((v) => v.trim()).filter(Boolean);
    if (bits.length === 0) continue;
    for (const value of bits) {
      expanded.push({ herb: row.herb, value, evidence: String(row?.evidence ?? '').trim() });
    }
  }
  const unique = new Set(expanded.map((row) => `${row.herb}::${row.value.toLowerCase()}`));
  return {
    mechanismRows,
    expanded,
    accepted_rows_count: mechanismRows.length,
    accepted_mechanism_count: expanded.length,
    unique_accepted_mechanism_count: unique.size,
    duplicate_dropped_count: expanded.length - unique.size,
  };
}

const fixtureResult = runStep('mechanism-regression-fixture-check', ['scripts/enrichment/test-mechanism-regression-fixtures.mjs'], { capture: true });
runStep('existing-mechanism-semantic-fixture-check', ['scripts/enrichment/evidence-acquisition-engine.mjs', '--mechanism-self-test-only']);
const batchResult = runStep('mechanism-10-herb-batch', ['scripts/enrichment/evidence-acquisition-engine.mjs', '--max-herbs=10', '--focus-field=mechanism'], { capture: true });

const fixtureJsonLine = String(fixtureResult.stdout)
  .split('\n')
  .find((line) => line.startsWith('MECH_FIXTURE_SCORE_JSON='));
if (!fixtureJsonLine) throw new Error('[mechanism-harness] fixture scorer output missing MECH_FIXTURE_SCORE_JSON line');
const fixtureScore = JSON.parse(fixtureJsonLine.slice('MECH_FIXTURE_SCORE_JSON='.length));

const reportLine = String(batchResult.stdout)
  .split('\n')
  .find((line) => line.includes('[evidence-acquisition] report='));
if (!reportLine) throw new Error('[mechanism-harness] unable to locate evidence-acquisition report path from 10-herb batch output');
const reportRelPath = reportLine.split('report=')[1].trim();
const report = loadJson(join(REPO_ROOT, reportRelPath));

const acceptedSummary = summarizeAcceptedMechanisms(Array.isArray(report.accepted) ? report.accepted : []);
const violations = acceptedSummary.expanded
  .map((entry) => ({ ...entry, reason: classifyGuardrailViolation(entry.value) }))
  .filter((entry) => entry.reason);
const precision_guardrail_status = violations.length === 0 ? 'PASS' : 'FAIL';

const baselinePath = join(REPO_ROOT, 'scripts', 'enrichment', 'fixtures', 'mechanism-10-herb.baseline.json');
const baseline = existsSync(baselinePath) ? loadJson(baselinePath) : { accepted: [] };
const baselineAccepted = Array.isArray(baseline.accepted) ? baseline.accepted : [];
const currentAccepted = acceptedSummary.expanded;
const baselineKeys = new Set(baselineAccepted.map((row) => `${row.herb}::${String(row.value).toLowerCase()}`));
const currentKeys = new Set(currentAccepted.map((row) => `${row.herb}::${String(row.value).toLowerCase()}`));
const addedAccepts = currentAccepted.filter((row) => !baselineKeys.has(`${row.herb}::${String(row.value).toLowerCase()}`));
const removedAccepts = baselineAccepted.filter((row) => !currentKeys.has(`${row.herb}::${String(row.value).toLowerCase()}`));
const baselineSpanByKey = new Map(baselineAccepted.map((row) => [`${row.herb}::${String(row.value).toLowerCase()}`, String(row.evidence ?? '')]));
const currentSpanByKey = new Map(currentAccepted.map((row) => [`${row.herb}::${String(row.value).toLowerCase()}`, String(row.evidence ?? '')]));
const changedRawSpans = [];
for (const [key, beforeEvidence] of baselineSpanByKey.entries()) {
  if (!currentSpanByKey.has(key)) continue;
  const afterEvidence = currentSpanByKey.get(key);
  if (beforeEvidence !== afterEvidence) {
    changedRawSpans.push({
      key,
      baseline_evidence: beforeEvidence,
      current_evidence: afterEvidence,
    });
  }
}

const machineReadable = {
  fixture_scoring: fixtureScore,
  precision_guardrail_status,
  precision_guardrail_violations: violations,
  baseline_vs_current: {
    baseline_accepted_mechanisms: baselineAccepted,
    current_accepted_mechanisms: currentAccepted,
    added_accepts: addedAccepts,
    removed_accepts: removedAccepts,
    changed_raw_spans: changedRawSpans,
  },
  accepted_rows_count: acceptedSummary.accepted_rows_count,
  accepted_mechanism_count: acceptedSummary.accepted_mechanism_count,
  unique_accepted_mechanism_count: acceptedSummary.unique_accepted_mechanism_count,
  duplicate_dropped_count: acceptedSummary.duplicate_dropped_count,
  report_path: reportRelPath,
};

console.log('[mechanism-harness] human-summary');
console.log(`- total_pass_fixtures: ${fixtureScore.summary.total_pass_fixtures}`);
console.log(`- pass_matched_correctly: ${fixtureScore.summary.pass_matched_correctly}`);
console.log(`- pass_missed: ${fixtureScore.summary.pass_missed}`);
console.log(`- total_fail_fixtures: ${fixtureScore.summary.total_fail_fixtures}`);
console.log(`- fail_rejected_correctly: ${fixtureScore.summary.fail_rejected_correctly}`);
console.log(`- fail_leaked_incorrectly: ${fixtureScore.summary.fail_leaked_incorrectly}`);
console.log(`- precision_guardrail_status: ${precision_guardrail_status}`);
console.log(`- accepted_rows_count: ${acceptedSummary.accepted_rows_count}`);
console.log(`- accepted_mechanism_count: ${acceptedSummary.accepted_mechanism_count}`);
console.log(`- unique_accepted_mechanism_count: ${acceptedSummary.unique_accepted_mechanism_count}`);
console.log(`- duplicate_dropped_count: ${acceptedSummary.duplicate_dropped_count}`);
console.log('[mechanism-harness] machine-readable-json');
console.log(JSON.stringify(machineReadable, null, 2));
console.log(`MECH_HARNESS_RESULT_JSON=${JSON.stringify(machineReadable)}`);
console.log('[mechanism-harness] PASS');
