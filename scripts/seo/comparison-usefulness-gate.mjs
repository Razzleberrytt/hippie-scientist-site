#!/usr/bin/env node
/**
 * Minimum-usefulness gate for comparison-page candidates.
 *
 * Input: ops/reports/comparison-opportunities-scored.json
 * Output: ops/reports/comparison-editorial-queue.json + .md
 *
 * Passing this gate means "worth editorial review", never "auto-publish".
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const REPORTS_DIR = path.join(ROOT, 'ops', 'reports')
const INPUT_PATH = path.join(REPORTS_DIR, 'comparison-opportunities-scored.json')
const JSON_PATH = path.join(REPORTS_DIR, 'comparison-editorial-queue.json')
const MD_PATH = path.join(REPORTS_DIR, 'comparison-editorial-queue.md')

export const COMPARISON_USEFULNESS_THRESHOLD = Object.freeze({
  minimumOpportunityScore: 55,
  minimumIntentScore: 65,
  minimumEvidenceScore: 30,
  minimumObservedImpressions: 10,
})

function loadJson(filePath, fallback) {
  if (!existsSync(filePath)) return fallback
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'))
  } catch {
    return fallback
  }
}

export function evaluateComparisonUsefulness(item, threshold = COMPARISON_USEFULNESS_THRESHOLD) {
  const reasons = []
  const pair = Array.isArray(item?.pair) ? item.pair.filter(Boolean) : []
  const sourceQueries = Array.isArray(item?.sourceQueries) ? item.sourceQueries : []
  const score = Number(item?.opportunityScore || 0)
  const intent = Number(item?.scoreComponents?.intent || 0)
  const evidence = Number(item?.scoreComponents?.evidence || 0)
  const impressions = Number(item?.impressions || 0)

  if (pair.length !== 2 || pair[0] === pair[1]) reasons.push('invalid-or-duplicate-pair')
  if (!sourceQueries.length) reasons.push('no-observed-query-evidence')
  if (score < threshold.minimumOpportunityScore) reasons.push('opportunity-score-below-threshold')
  if (intent < threshold.minimumIntentScore) reasons.push('decision-intent-too-weak')
  if (evidence < threshold.minimumEvidenceScore) reasons.push('evidence-availability-too-weak')
  if (impressions < threshold.minimumObservedImpressions) reasons.push('observed-demand-too-low')

  return {
    useful: reasons.length === 0,
    reasons,
    metrics: { score, intent, evidence, impressions },
  }
}

export function buildEditorialQueue(opportunities, threshold = COMPARISON_USEFULNESS_THRESHOLD) {
  const eligible = []
  const rejected = []

  for (const item of Array.isArray(opportunities) ? opportunities : []) {
    const evaluation = evaluateComparisonUsefulness(item, threshold)
    const result = { ...item, usefulness: evaluation }
    if (evaluation.useful) eligible.push(result)
    else rejected.push(result)
  }

  eligible.sort((a, b) => b.opportunityScore - a.opportunityScore || b.impressions - a.impressions)
  rejected.sort((a, b) => b.opportunityScore - a.opportunityScore || b.impressions - a.impressions)
  return { eligible, rejected }
}

function renderMarkdown(report) {
  const pairLabel = (item) => item.labels?.join(' vs ') || item.pair?.join(' vs ') || 'Unknown pair'
  return [
    '# Comparison editorial usefulness gate',
    '',
    'Passing means the pair is worth human/editorial review. It does **not** authorize automatic publication.',
    '',
    `Thresholds: score ≥ ${report.threshold.minimumOpportunityScore}, intent ≥ ${report.threshold.minimumIntentScore}, evidence ≥ ${report.threshold.minimumEvidenceScore}, observed impressions ≥ ${report.threshold.minimumObservedImpressions}.`,
    '',
    '## Eligible for editorial review',
    '',
    '| Pair | Score | Evidence | Intent | Impressions | Existing route |',
    '| --- | ---: | ---: | ---: | ---: | --- |',
    ...report.eligible.map((item) => `| ${pairLabel(item)} | ${item.opportunityScore} | ${item.scoreComponents?.evidence || 0} | ${item.scoreComponents?.intent || 0} | ${item.impressions || 0} | ${item.routeStatus || 'unknown'} |`),
    '',
    '## Rejected / hold',
    '',
    '| Pair | Reasons |',
    '| --- | --- |',
    ...report.rejected.map((item) => `| ${pairLabel(item)} | ${item.usefulness.reasons.join(', ')} |`),
    '',
  ].join('\n')
}

function main() {
  const source = loadJson(INPUT_PATH, null)
  if (!source?.opportunities) {
    console.error('Missing ops/reports/comparison-opportunities-scored.json. Run comparison-opportunity-scoring.mjs first.')
    process.exitCode = 1
    return
  }

  const queue = buildEditorialQueue(source.opportunities)
  const report = {
    generatedAt: new Date().toISOString(),
    sourceReport: path.relative(ROOT, INPUT_PATH),
    threshold: COMPARISON_USEFULNESS_THRESHOLD,
    eligible: queue.eligible,
    rejected: queue.rejected,
  }

  mkdirSync(REPORTS_DIR, { recursive: true })
  writeFileSync(JSON_PATH, `${JSON.stringify(report, null, 2)}\n`)
  writeFileSync(MD_PATH, renderMarkdown(report))
  console.log(`Comparison editorial queue: ${queue.eligible.length} eligible / ${queue.rejected.length} held`)
}

const isCli = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isCli) main()
