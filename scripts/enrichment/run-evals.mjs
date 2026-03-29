#!/usr/bin/env node
/**
 * Usage:
 *   node scripts/enrichment/run-evals.mjs [--run-id run_x] [--goldens evals/enrichment-goldens.json] [--baseline-file ops/reports/evals-baseline.json]
 */
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import {
  bootstrapStateDb,
  ensureDir,
  loadJson,
  nowIso,
  REPO_ROOT,
  runSqlite,
  writeJson,
} from './_shared.mjs';
import { auditCompoundLinks } from './_compound-linking.mjs';

function parseArgs(argv) {
  const out = {
    runId: null,
    goldens: 'evals/enrichment-goldens.json',
    baselineFile: null,
  };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--run-id' && argv[i + 1]) {
      out.runId = argv[i + 1];
      i += 1;
    } else if (arg.startsWith('--run-id=')) out.runId = arg.slice('--run-id='.length);
    else if (arg === '--goldens' && argv[i + 1]) {
      out.goldens = argv[i + 1];
      i += 1;
    } else if (arg.startsWith('--goldens=')) out.goldens = arg.slice('--goldens='.length);
    else if (arg === '--baseline-file' && argv[i + 1]) {
      out.baselineFile = argv[i + 1];
      i += 1;
    } else if (arg.startsWith('--baseline-file=')) out.baselineFile = arg.slice('--baseline-file='.length);
  }
  return out;
}

function findLatestValidationMap(type, runId = null) {
  const filterSql = runId ? 'WHERE json_extract(vr.details_json, "$.runId") = ?' : '';
  const rows = runSqlite({
    select: true,
    sql: `SELECT vr.patch_id, vr.ok, vr.details_json, vr.created_at
      FROM validation_results vr
      INNER JOIN (
        SELECT patch_id, MAX(id) AS max_id
        FROM validation_results
        WHERE validation_type IN (?, ?)
        GROUP BY patch_id
      ) latest ON latest.max_id = vr.id
      ${filterSql}`,
    args: [type, `${type}-dry-run`, ...(runId ? [runId] : [])],
  });
  const map = new Map();
  for (const row of rows) map.set(row.patch_id, Number(row.ok) === 1);
  return map;
}

function ratio(numerator, denominator) {
  if (!denominator) return 0;
  return Number(((numerator / denominator) * 100).toFixed(2));
}

function loadPatchIndex() {
  const rows = runSqlite({
    select: true,
    sql: 'SELECT patch_id, patch_file FROM patches ORDER BY id DESC',
  });

  const index = new Map();
  for (const row of rows) {
    if (!row.patch_file) continue;
    const patchPath = join(REPO_ROOT, 'patches', row.patch_file);
    if (!existsSync(patchPath)) continue;
    const patch = loadJson(patchPath);
    index.set(row.patch_id, patch);
  }
  return index;
}

function collectHumanAcceptance(runId = null) {
  const rows = runSqlite({
    select: true,
    sql: `SELECT decision FROM review_decisions
      ${runId ? 'WHERE patch_id IN (SELECT patch_id FROM patches WHERE patch_id IN (SELECT patch_id FROM validation_results WHERE json_extract(details_json, "$.runId") = ?))' : ''}`,
    args: runId ? [runId] : [],
  });

  const approved = rows.filter((row) => row.decision === 'approved').length;
  const rejected = rows.filter((row) => row.decision === 'rejected').length;
  return { approved, rejected, total: approved + rejected, ratePct: ratio(approved, approved + rejected) };
}

function readDataset() {
  return {
    herbs: loadJson(join(REPO_ROOT, 'public', 'data', 'herbs.json')),
    compounds: loadJson(join(REPO_ROOT, 'public', 'data', 'compounds.json')),
    entityGraph: loadJson(join(REPO_ROOT, 'config', 'entity-graph.json')),
  };
}

function metricSevereInteractionPrecision({ goldens, patchesById }) {
  const targets = goldens.samples.filter(
    (sample) => sample.task === 'interactions' && sample.expect?.severe_interaction_present === true,
  );
  let truePositive = 0;
  for (const sample of targets) {
    const match = [...patchesById.values()].find((patch) =>
      (patch.operations ?? []).some(
        (op) =>
          op.task === 'interactions' &&
          op.entity_type === sample.entity_type &&
          op.entity_id === sample.entity_id &&
          op.field === '/interactions' &&
          Array.isArray(op.value) &&
          op.value.some((item) => ['severe', 'contraindicated'].includes(String(item?.severity ?? '').toLowerCase())),
      ),
    );
    if (match) truePositive += 1;
  }

  return {
    numerator: truePositive,
    denominator: targets.length,
    precisionPct: ratio(truePositive, targets.length),
  };
}

function metricDosageNormalizationPrecision({ goldens, patchesById }) {
  const targets = goldens.samples.filter((sample) => sample.task === 'dosage' && sample.expect?.dosage_normalized === true);
  let normalized = 0;

  for (const sample of targets) {
    const match = [...patchesById.values()].find((patch) =>
      (patch.operations ?? []).some((op) => {
        if (op.task !== 'dosage' || op.entity_type !== sample.entity_type || op.entity_id !== sample.entity_id) return false;
        const range = op.value?.range;
        const unit = String(op.value?.unit ?? '').trim().toLowerCase();
        return (
          range &&
          typeof range.low === 'number' &&
          typeof range.high === 'number' &&
          range.low <= range.high &&
          ['mg', 'g', 'mcg', 'ml'].includes(unit)
        );
      }),
    );
    if (match) normalized += 1;
  }

  return {
    numerator: normalized,
    denominator: targets.length,
    precisionPct: ratio(normalized, targets.length),
  };
}

function metricInternalLinks() {
  const { herbs, compounds, entityGraph } = readDataset();
  const audit = auditCompoundLinks({ herbs, compounds, entityGraph, producer: 'run-evals:link-metrics' });
  const totalLinks =
    herbs.reduce((sum, herb) => sum + (Array.isArray(herb.activeCompounds) ? herb.activeCompounds.length : 0), 0) +
    compounds.reduce(
      (sum, compound) => sum + (Array.isArray(compound.foundIn) ? compound.foundIn.length : 0) + (Array.isArray(compound.herbs) ? compound.herbs.length : 0),
      0,
    );

  const brokenRatePct = ratio(audit.mismatchCount, Math.max(totalLinks, 1));
  const coveragePct = ratio(totalLinks - audit.mismatchCount, Math.max(totalLinks, 1));

  return {
    mismatchOps: audit.mismatchCount,
    totalLinks,
    brokenInternalLinkRatePct: brokenRatePct,
    internalLinkCoveragePct: coveragePct,
  };
}

function metricSchemaDomainPassRates(schemaMap, domainMap) {
  const patchIds = new Set([...schemaMap.keys(), ...domainMap.keys()]);
  let schemaPass = 0;
  let domainPass = 0;
  for (const patchId of patchIds) {
    if (schemaMap.get(patchId) === true) schemaPass += 1;
    if (domainMap.get(patchId) === true) domainPass += 1;
  }

  return {
    patchCount: patchIds.size,
    schemaPassRatePct: ratio(schemaPass, patchIds.size),
    domainPassRatePct: ratio(domainPass, patchIds.size),
  };
}

function computeGoldenCoverage(goldens, schemaMap, domainMap, patchesById) {
  let schemaMatches = 0;
  let domainMatches = 0;
  let acceptanceMatches = 0;

  const patchList = [...patchesById.entries()];
  for (const sample of goldens.samples ?? []) {
    const patchHit = patchList.find(([, patch]) =>
      (patch.operations ?? []).some(
        (op) => op.task === sample.task && op.entity_type === sample.entity_type && op.entity_id === sample.entity_id,
      ),
    );
    if (!patchHit) continue;
    const [patchId] = patchHit;

    if (typeof sample.expect?.schema_valid === 'boolean' && schemaMap.get(patchId) === sample.expect.schema_valid) schemaMatches += 1;
    if (typeof sample.expect?.domain_valid === 'boolean' && domainMap.get(patchId) === sample.expect.domain_valid) domainMatches += 1;

    if (typeof sample.expect?.accepted_by_human === 'boolean') {
      const rows = runSqlite({
        select: true,
        sql: 'SELECT decision FROM review_decisions WHERE patch_id=? ORDER BY id DESC LIMIT 1',
        args: [patchId],
      });
      const approved = rows[0]?.decision === 'approved';
      if (approved === sample.expect.accepted_by_human) acceptanceMatches += 1;
    }
  }

  return { schemaMatches, domainMatches, acceptanceMatches };
}

const options = parseArgs(process.argv);
bootstrapStateDb();

const reportsDir = join(REPO_ROOT, 'ops', 'reports');
ensureDir(reportsDir);

const goldensPath = join(REPO_ROOT, options.goldens);
if (!existsSync(goldensPath)) {
  console.error(`[run-evals] Missing goldens file: ${options.goldens}`);
  process.exit(1);
}

const goldens = loadJson(goldensPath);
const schemaMap = findLatestValidationMap('schema', options.runId);
const domainMap = findLatestValidationMap('domain', options.runId);
const patchIndex = loadPatchIndex();
const humanAcceptance = collectHumanAcceptance(options.runId);
const passRates = metricSchemaDomainPassRates(schemaMap, domainMap);
const severeInteraction = metricSevereInteractionPrecision({ goldens, patchesById: patchIndex });
const dosage = metricDosageNormalizationPrecision({ goldens, patchesById: patchIndex });
const links = metricInternalLinks();

const baseline = options.baselineFile
  ? loadJson(join(REPO_ROOT, options.baselineFile))
  : null;

const goldenCoverage = computeGoldenCoverage(goldens, schemaMap, domainMap, patchIndex);
const internalLinkCoverageDeltaPct = Number(
  (
    links.internalLinkCoveragePct - Number(baseline?.metrics?.internalLinkCoveragePct ?? links.internalLinkCoveragePct)
  ).toFixed(2),
);

const output = {
  generatedAt: nowIso(),
  runId: options.runId,
  goldensFile: options.goldens,
  metrics: {
    schemaPassRatePct: passRates.schemaPassRatePct,
    domainPassRatePct: passRates.domainPassRatePct,
    humanAcceptanceRatePct: humanAcceptance.ratePct,
    severeInteractionPrecisionPct: severeInteraction.precisionPct,
    dosageNormalizationPrecisionPct: dosage.precisionPct,
    brokenInternalLinkRatePct: links.brokenInternalLinkRatePct,
    internalLinkCoveragePct: links.internalLinkCoveragePct,
    internalLinkCoverageDeltaPct,
  },
  counts: {
    evaluatedPatches: passRates.patchCount,
    reviewDecisions: humanAcceptance.total,
    severeInteractionGoldens: severeInteraction.denominator,
    dosageGoldens: dosage.denominator,
    goldenSchemaMatches: goldenCoverage.schemaMatches,
    goldenDomainMatches: goldenCoverage.domainMatches,
    goldenAcceptanceMatches: goldenCoverage.acceptanceMatches,
  },
};

const tag = options.runId ?? 'latest';
const target = join(reportsDir, `evals-${tag}.json`);
writeJson(target, output);

console.log(`[run-evals] Wrote ${target}`);
console.log(
  `[run-evals] schema=${output.metrics.schemaPassRatePct}% domain=${output.metrics.domainPassRatePct}% acceptance=${output.metrics.humanAcceptanceRatePct}% severe_precision=${output.metrics.severeInteractionPrecisionPct}% dosage_precision=${output.metrics.dosageNormalizationPrecisionPct}% broken_links=${output.metrics.brokenInternalLinkRatePct}% link_coverage_delta=${output.metrics.internalLinkCoverageDeltaPct}%`,
);
