#!/usr/bin/env node
import { join } from 'node:path';
import { readdirSync, writeFileSync } from 'node:fs';
import { REPO_ROOT, ensureDir, loadJson, nowIso, writeJson } from './_shared.mjs';

const TARGET_FIELDS = ['activeCompounds', 'effects', 'mechanism', 'contraindications', 'traditionalUse'];
const FIELD_LABELS = {
  activeCompounds: 'activeCompounds',
  effects: 'effects',
  mechanism: 'mechanism',
  contraindications: 'contraindications',
  traditionalUse: 'traditionalUse',
};
const INDEXABILITY_WEIGHTS = {
  activeCompounds: 1.35,
  effects: 1.25,
  mechanism: 1.4,
  contraindications: 1.2,
  traditionalUse: 0.9,
};

function herbKey(herb) {
  return String(herb?.slug ?? herb?.id ?? herb?.name ?? herb?.displayName ?? '').trim();
}

function parseArgs(argv) {
  const out = { outDir: 'ops/evidence-acquisition/reports', runId: null };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--out-dir' && argv[i + 1]) {
      out.outDir = argv[i + 1];
      i += 1;
    } else if (arg.startsWith('--out-dir=')) out.outDir = arg.slice('--out-dir='.length);
    else if (arg === '--run-id' && argv[i + 1]) {
      out.runId = argv[i + 1];
      i += 1;
    } else if (arg.startsWith('--run-id=')) out.runId = arg.slice('--run-id='.length);
  }
  return out;
}

function isMissing(value) {
  if (value == null) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'string') return value.trim().length === 0;
  return false;
}

function normalizeReason(reason = '') {
  const text = String(reason || '').toLowerCase();
  if (!text) return 'unknown';
  if (text.includes('tier-policy') || text.includes('tier3_active_compounds_not_corroborated') || text.includes('structured_active_compounds_not_corroborated')) return 'tier_policy_rejection';
  if (text.includes('no-high-quality-source') || text.includes('no high-quality source')) return 'no_high_quality_source_found';
  if (text.includes('sparse')) return 'extraction_too_sparse';
  if (text.includes('normalization') || text.includes('no_clean_compound_names') || text.includes('no_structured_phrase_extracted')) return 'normalization_failed';
  if (text.includes('confidence') || text.includes('low')) return 'confidence_too_low';
  if (text.includes('schema')) return 'schema_mismatch';
  if (text.includes('duplicate') || text.includes('weak evidence')) return 'duplicate_or_weak_evidence';
  return 'other';
}

function summarizeSourceTiers(latestRun) {
  const acceptedTierCounts = { tier1: 0, tier2: 0, tier3: 0, unclassified: 0 };
  for (const row of latestRun.payload.accepted ?? []) {
    const tier = row?.source?.tier ?? 'unclassified';
    acceptedTierCounts[tier] = (acceptedTierCounts[tier] ?? 0) + 1;
  }
  return acceptedTierCounts;
}

function summarizeAcceptedSourceContributions(latestRun) {
  const byHost = {};
  for (const row of latestRun.payload.accepted ?? []) {
    const url = String(row?.source?.url ?? '');
    let host = 'unknown';
    try {
      host = new URL(url).hostname.toLowerCase();
    } catch {
      host = 'unknown';
    }
    byHost[host] = (byHost[host] ?? 0) + 1;
  }
  return Object.fromEntries(Object.entries(byHost).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])));
}

function summarizeProviderMetrics(latestRun) {
  const metrics = latestRun?.payload?.retrievalSummary?.providerMetrics;
  return metrics && typeof metrics === 'object' ? metrics : {};
}

function loadEvidenceRuns() {
  const runDir = join(REPO_ROOT, 'ops', 'evidence-acquisition');
  const files = readdirSync(runDir)
    .filter((file) => /^run_.*\.json$/u.test(file))
    .sort();

  return files.map((file) => {
    const payload = loadJson(join(runDir, file));
    return {
      file,
      runId: payload.runId,
      createdAt: payload.createdAt ?? null,
      payload,
    };
  });
}

function summarizeCoverage({ herbs, latestRun, allRuns }) {
  const byField = Object.fromEntries(TARGET_FIELDS.map((field) => [field, { total: herbs.length, completed: 0, missing: 0 }]));
  const byHerb = [];

  let totalCompleted = 0;
  let totalMissing = 0;

  for (const herb of herbs) {
    const currentHerbKey = herbKey(herb);
    if (!currentHerbKey) continue;
    const missingFields = [];
    let completedCount = 0;

    for (const field of TARGET_FIELDS) {
      if (isMissing(herb[field])) {
        byField[field].missing += 1;
        totalMissing += 1;
        missingFields.push(field);
      } else {
        byField[field].completed += 1;
        totalCompleted += 1;
        completedCount += 1;
      }
    }

    byHerb.push({
      herb: currentHerbKey,
      completed: completedCount,
      missing: missingFields.length,
      completionPct: Number(((completedCount / TARGET_FIELDS.length) * 100).toFixed(2)),
      missingFields,
    });
  }

  const fieldFillMap = new Map();
  const fieldRejectMap = new Map();
  for (const run of allRuns) {
    for (const row of run.payload.accepted ?? []) {
      fieldFillMap.set(`${row.herb}:${row.schemaField}`, row);
    }
    for (const row of run.payload.rejected ?? []) {
      fieldRejectMap.set(`${row.herb}:${row.schemaField}`, row);
    }
  }

  const selectedHerbSet = new Set(latestRun.payload.selectedHerbs ?? []);
  let unresolved = 0;
  let engineFilled = 0;
  let engineRejected = 0;

  for (const herb of herbs) {
    const currentHerbKey = herbKey(herb);
    if (!currentHerbKey || !selectedHerbSet.has(currentHerbKey)) continue;
    for (const field of TARGET_FIELDS) {
      if (!isMissing(herb[field])) continue;
      const key = `${currentHerbKey}:${field}`;
      if (fieldFillMap.has(key)) engineFilled += 1;
      else if (fieldRejectMap.has(key)) engineRejected += 1;
      else unresolved += 1;
    }
  }

  return {
    totals: {
      totalHerbs: herbs.length,
      totalTargetFields: herbs.length * TARGET_FIELDS.length,
      completedFields: totalCompleted,
      missingFields: totalMissing,
      fieldsFilledByEvidenceEngine: engineFilled,
      fieldsRejectedByEvidenceEngine: engineRejected,
      unresolvedFields: unresolved,
      completionPctOverall: Number(((totalCompleted / Math.max(herbs.length * TARGET_FIELDS.length, 1)) * 100).toFixed(2)),
    },
    completionByFieldType: Object.fromEntries(
      TARGET_FIELDS.map((field) => [
        field,
        {
          total: byField[field].total,
          completed: byField[field].completed,
          missing: byField[field].missing,
          completionPct: Number(((byField[field].completed / Math.max(byField[field].total, 1)) * 100).toFixed(2)),
        },
      ]),
    ),
    completionByHerb: byHerb.sort((a, b) => a.completionPct - b.completionPct || a.herb.localeCompare(b.herb)),
  };
}

function fieldLevelBreakdown({ latestRun, herbsBySlug }) {
  const selectedHerbs = (latestRun.payload.selectedHerbs ?? []).map((slug) => herbsBySlug.get(slug)).filter(Boolean);
  const base = Object.fromEntries(
    TARGET_FIELDS.map((field) => [
      field,
      { totalMissingBeforeRun: 0, acceptedFills: 0, rejectedAttempts: 0, stillUnresolved: 0, rejectionReasons: {} },
    ]),
  );

  for (const herb of selectedHerbs) {
    for (const field of TARGET_FIELDS) {
      if (isMissing(herb[field])) base[field].totalMissingBeforeRun += 1;
    }
  }

  for (const row of latestRun.payload.accepted ?? []) {
    if (!TARGET_FIELDS.includes(row.schemaField)) continue;
    base[row.schemaField].acceptedFills += 1;
  }

  for (const row of latestRun.payload.rejected ?? []) {
    if (!TARGET_FIELDS.includes(row.schemaField)) continue;
    base[row.schemaField].rejectedAttempts += 1;
    const bucket = normalizeReason(row.reason);
    base[row.schemaField].rejectionReasons[bucket] = (base[row.schemaField].rejectionReasons[bucket] ?? 0) + 1;
  }

  for (const field of TARGET_FIELDS) {
    const resolved = base[field].acceptedFills + base[field].rejectedAttempts;
    base[field].stillUnresolved = Math.max(base[field].totalMissingBeforeRun - resolved, 0);
    base[field].acceptanceRate =
      base[field].totalMissingBeforeRun === 0
        ? 0
        : Number(((base[field].acceptedFills / base[field].totalMissingBeforeRun) * 100).toFixed(2));
  }

  return base;
}

function buildRejectionAnalysis({ allRuns }) {
  const byCause = {};
  const byField = {};
  const byHerb = {};

  for (const run of allRuns) {
    for (const row of run.payload.rejected ?? []) {
      const cause = normalizeReason(row.reason);
      byCause[cause] = (byCause[cause] ?? 0) + 1;
      byField[row.schemaField] = byField[row.schemaField] ?? {};
      byField[row.schemaField][cause] = (byField[row.schemaField][cause] ?? 0) + 1;
      byHerb[row.herb] = (byHerb[row.herb] ?? 0) + 1;
    }
  }

  return {
    totalRejectedRows: Object.values(byCause).reduce((sum, value) => sum + value, 0),
    rejectionCauses: Object.entries(byCause)
      .map(([cause, count]) => ({ cause, count }))
      .sort((a, b) => b.count - a.count || a.cause.localeCompare(b.cause)),
    rejectionByField: byField,
    mostRejectedHerbs: Object.entries(byHerb)
      .map(([herb, rejectedCount]) => ({ herb, rejectedCount }))
      .sort((a, b) => b.rejectedCount - a.rejectedCount || a.herb.localeCompare(b.herb)),
  };
}

function buildPriorityQueue({ herbs, allRuns }) {
  const acceptedByHerbField = new Set();
  const rejectedByHerbField = new Map();
  const acceptedByHerb = new Map();
  const lastRunStatusByHerb = new Map();
  const sourceSignalsByHerb = new Map();

  for (const run of allRuns) {
    for (const row of run.payload.accepted ?? []) {
      acceptedByHerbField.add(`${row.herb}:${row.schemaField}`);
      acceptedByHerb.set(row.herb, (acceptedByHerb.get(row.herb) ?? 0) + 1);
      lastRunStatusByHerb.set(row.herb, 'accepted');
      sourceSignalsByHerb.set(row.herb, (sourceSignalsByHerb.get(row.herb) ?? 0) + (row.source?.quality === 'primary_pubmed' ? 2 : 1));
    }
    for (const row of run.payload.rejected ?? []) {
      const key = `${row.herb}:${row.schemaField}`;
      rejectedByHerbField.set(key, (rejectedByHerbField.get(key) ?? 0) + 1);
      if (!lastRunStatusByHerb.has(row.herb)) lastRunStatusByHerb.set(row.herb, 'rejected');
    }
  }

  const queue = [];
  for (const herb of herbs) {
    const currentHerbKey = herbKey(herb);
    if (!currentHerbKey) continue;
    const missingFields = TARGET_FIELDS.filter((field) => isMissing(herb[field]));
    if (missingFields.length === 0) continue;

    let recoverableCount = 0;
    let normalizationGapSignals = 0;
    let repeatedRejections = 0;
    let indexabilityUpside = 0;

    for (const field of missingFields) {
      indexabilityUpside += INDEXABILITY_WEIGHTS[field] ?? 1;
      const key = `${currentHerbKey}:${field}`;
      if (acceptedByHerbField.has(key)) recoverableCount += 1;
      const rejections = rejectedByHerbField.get(key) ?? 0;
      repeatedRejections += rejections;
      if (rejections >= 2) normalizationGapSignals += 1;
    }

    const sourceSignal = sourceSignalsByHerb.get(currentHerbKey) ?? 0;
    const acceptedCount = acceptedByHerb.get(currentHerbKey) ?? 0;
    const rejectedCount = TARGET_FIELDS.reduce((sum, field) => sum + (rejectedByHerbField.get(`${currentHerbKey}:${field}`) ?? 0), 0);

    const priorityScore = Number((indexabilityUpside * 20 + recoverableCount * 16 + normalizationGapSignals * 14 + sourceSignal * 4 + missingFields.length * 7 - repeatedRejections * 3).toFixed(2));

    let recommendedNextAction = 'run_evidence_acquisition';
    if (normalizationGapSignals > 0) recommendedNextAction = 'manual_normalization_review';
    else if (rejectedCount > 0 && sourceSignal === 0) recommendedNextAction = 'expand_source_search_terms';
    else if (acceptedCount > 0 && missingFields.length <= 2) recommendedNextAction = 'promote_patch_and_validate';

    queue.push({
      herb: currentHerbKey,
      missingFields,
      lastRunStatus: lastRunStatusByHerb.get(currentHerbKey) ?? 'not_attempted',
      acceptedCount,
      rejectedCount,
      recommendedNextAction,
      priorityScore,
      signals: {
        indexabilityUpside: Number(indexabilityUpside.toFixed(2)),
        likelyRecoverableFields: recoverableCount,
        normalizationGapSignals,
        sourceAvailabilitySignal: sourceSignal,
      },
    });
  }

  return queue.sort((a, b) => b.priorityScore - a.priorityScore || a.herb.localeCompare(b.herb));
}

function markdownReport({
  generatedAt,
  runId,
  coverageSummary,
  fieldBreakdown,
  priorityQueue,
  rejectionAnalysis,
  sourceTierDistribution,
  sourceContributionBreakdown,
  providerMetrics,
}) {
  const topFields = Object.entries(coverageSummary.completionByFieldType)
    .sort((a, b) => b[1].missing - a[1].missing)
    .slice(0, 5)
    .map(([field, stats]) => `- ${FIELD_LABELS[field]}: missing ${stats.missing}/${stats.total} (${stats.completionPct}% complete)`)
    .join('\n');

  const topQueue = priorityQueue
    .slice(0, 10)
    .map((item, i) => `${i + 1}. ${item.herb} — score ${item.priorityScore}, missing=${item.missingFields.join(', ')}, action=${item.recommendedNextAction}`)
    .join('\n');

  const topRejections = rejectionAnalysis.rejectionCauses
    .slice(0, 5)
    .map((row) => `- ${row.cause}: ${row.count}`)
    .join('\n');
  const tierLines = Object.entries(sourceTierDistribution).map(([tier, count]) => `- ${tier}: ${count}`).join('\n');
  const sourceContributionLines = Object.entries(sourceContributionBreakdown).map(([source, count]) => `- ${source}: ${count}`).join('\n') || '- none';
  const providerLines = Object.entries(providerMetrics)
    .map(([provider, row]) => `- ${provider}: queried=${row.queried}, candidates=${row.candidates}, accepted=${row.accepted}, acceptanceRate=${row.acceptanceRate}%`)
    .join('\n') || '- none';

  const fieldTable = TARGET_FIELDS.map((field) => {
    const row = fieldBreakdown[field];
    return `| ${field} | ${row.totalMissingBeforeRun} | ${row.acceptedFills} | ${row.rejectedAttempts} | ${row.stillUnresolved} | ${row.acceptanceRate}% |`;
  }).join('\n');

  return `# Evidence Acquisition Coverage + Prioritization\n\n- Generated at: ${generatedAt}\n- Run ID: ${runId}\n\n## Coverage Summary\n\n- Total herbs: ${coverageSummary.totals.totalHerbs}\n- Total target fields: ${coverageSummary.totals.totalTargetFields}\n- Completed fields: ${coverageSummary.totals.completedFields}\n- Missing fields: ${coverageSummary.totals.missingFields}\n- Fields filled by evidence engine: ${coverageSummary.totals.fieldsFilledByEvidenceEngine}\n- Fields rejected by evidence engine: ${coverageSummary.totals.fieldsRejectedByEvidenceEngine}\n- Unresolved fields: ${coverageSummary.totals.unresolvedFields}\n- Completion overall: ${coverageSummary.totals.completionPctOverall}%\n\n### Top unresolved field types\n${topFields}\n\n## Field-level Breakdown (latest run)\n\n| Field | Missing before run | Accepted fills | Rejected attempts | Still unresolved | Acceptance rate |\n|---|---:|---:|---:|---:|---:|\n${fieldTable}\n\n## Top 10 Priority Herbs\n\n${topQueue}\n\n## Rejection Analytics\n\n${topRejections}\n\n## Accepted Source Tier Distribution (latest run)\n\n${tierLines}\n\n## Accepted Source Contributions (latest run)\n\n${sourceContributionLines}\n\n## Provider Performance (latest run)\n\n${providerLines}\n`;
}

function main() {
  const options = parseArgs(process.argv);
  const herbs = loadJson(join(REPO_ROOT, 'public', 'data', 'herbs.json'));
  const allRuns = loadEvidenceRuns();
  if (allRuns.length === 0) throw new Error('No evidence acquisition run artifacts found in ops/evidence-acquisition');

  const latestRun = options.runId
    ? allRuns.find((run) => run.runId === options.runId || run.file.includes(options.runId))
    : [...allRuns].sort((a, b) => String(b.createdAt ?? '').localeCompare(String(a.createdAt ?? '')))[0];

  if (!latestRun) throw new Error(`Unable to resolve run id: ${options.runId}`);

  const coverageSummary = summarizeCoverage({ herbs, latestRun, allRuns });
  const herbsBySlug = new Map(herbs.map((herb) => [herbKey(herb), herb]).filter(([key]) => key));
  const fieldBreakdown = fieldLevelBreakdown({ latestRun, herbsBySlug });
  const rejectionAnalysis = buildRejectionAnalysis({ allRuns });
  const priorityQueue = buildPriorityQueue({ herbs, allRuns });
  const sourceTierDistribution = summarizeSourceTiers(latestRun);
  const sourceContributionBreakdown = summarizeAcceptedSourceContributions(latestRun);
  const providerMetrics = summarizeProviderMetrics(latestRun);

  const generatedAt = nowIso();
  const artifact = {
    generatedAt,
    runId: latestRun.runId,
    sourceArtifacts: allRuns.map((run) => `ops/evidence-acquisition/${run.file}`),
    coverageSummary,
    fieldLevelBreakdown: fieldBreakdown,
    priorityQueue,
    rejectionAnalysis,
    sourceTierDistribution,
    sourceContributionBreakdown,
    providerMetrics,
  };

  const outDir = join(REPO_ROOT, options.outDir);
  const historyDir = join(outDir, 'history');
  ensureDir(outDir);
  ensureDir(historyDir);

  writeJson(join(outDir, 'coverage-prioritization.latest.json'), artifact);
  writeJson(join(outDir, 'herb-priority-queue.latest.json'), {
    generatedAt,
    runId: latestRun.runId,
    queue: priorityQueue,
  });
  writeJson(join(outDir, 'rejection-analysis.latest.json'), {
    generatedAt,
    runId: latestRun.runId,
    ...rejectionAnalysis,
  });

  writeJson(join(historyDir, `coverage-prioritization.${latestRun.runId}.json`), artifact);
  writeJson(join(historyDir, `herb-priority-queue.${latestRun.runId}.json`), {
    generatedAt,
    runId: latestRun.runId,
    queue: priorityQueue,
  });
  writeJson(join(historyDir, `rejection-analysis.${latestRun.runId}.json`), {
    generatedAt,
    runId: latestRun.runId,
    ...rejectionAnalysis,
  });

  const markdown = markdownReport({
    generatedAt,
    runId: latestRun.runId,
    coverageSummary,
    fieldBreakdown,
    priorityQueue,
    rejectionAnalysis,
    sourceTierDistribution,
    sourceContributionBreakdown,
    providerMetrics,
  });
  writeFileSync(join(outDir, 'coverage-prioritization.latest.md'), markdown);
  writeFileSync(join(historyDir, `coverage-prioritization.${latestRun.runId}.md`), markdown);

  const topUnresolved = Object.entries(coverageSummary.completionByFieldType)
    .sort((a, b) => b[1].missing - a[1].missing)
    .slice(0, 5)
    .map(([field, row]) => `${field}:${row.missing}`)
    .join(', ');
  const topRejections = rejectionAnalysis.rejectionCauses.slice(0, 5).map((row) => `${row.cause}:${row.count}`).join(', ');
  const tierSummary = Object.entries(sourceTierDistribution).map(([tier, count]) => `${tier}:${count}`).join(', ');
  const sourceSummary = Object.entries(sourceContributionBreakdown).slice(0, 5).map(([source, count]) => `${source}:${count}`).join(', ');
  const providerSummary = Object.entries(providerMetrics).slice(0, 6).map(([provider, row]) => `${provider}:q${row.queried}/c${row.candidates}/a${row.accepted}`).join(', ');

  console.log(`[evidence-report] run=${latestRun.runId} queue=${priorityQueue.length}`);
  console.log(`[evidence-report] top-10=${priorityQueue.slice(0, 10).map((item) => item.herb).join(',')}`);
  console.log(`[evidence-report] top-unresolved-fields=${topUnresolved}`);
  console.log(`[evidence-report] top-rejection-causes=${topRejections}`);
  console.log(`[evidence-report] accepted-tier-distribution=${tierSummary}`);
  console.log(`[evidence-report] accepted-source-contributions=${sourceSummary}`);
  console.log(`[evidence-report] provider-performance=${providerSummary}`);
  console.log(`[evidence-report] output=${options.outDir}`);
}

try {
  main();
} catch (error) {
  console.error(`[evidence-report] FAIL ${error.message}`);
  process.exit(1);
}
