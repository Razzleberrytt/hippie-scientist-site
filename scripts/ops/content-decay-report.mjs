#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

const OPPORTUNITY_PATH = 'ops/reports/search-opportunities.json';
const OUTPUT_PATH = 'ops/reports/content-decay.json';

async function readJson(file) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
}

const n = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;

function getPages(report) {
  if (!report) return [];
  for (const key of ['pages', 'pageOpportunities', 'page_opportunities', 'results']) {
    if (Array.isArray(report[key])) return report[key];
  }
  return [];
}

export function buildDecayReport(opportunityReport) {
  const pages = getPages(opportunityReport);
  const candidates = pages.map((page) => {
    const actions = Array.isArray(page.actions) ? page.actions : [];
    const impressions = n(page.impressions);
    const clicks = n(page.clicks);
    const position = n(page.position);
    const upside = n(page.totalUpsideClicks ?? page.priority ?? page.ctrUpsideClicks);

    let decayScore = 0;
    const reasons = [];

    if (actions.includes('needs-substantive-upgrade')) {
      decayScore += 40;
      reasons.push('search visibility exists but the page needs a substantive upgrade');
    }
    if (actions.includes('rewrite-title-and-meta')) {
      decayScore += 15;
      reasons.push('CTR is underperforming for the current ranking position');
    }
    if (position > 10 && impressions >= 100) {
      decayScore += Math.min(25, Math.round(Math.log10(impressions + 1) * 7));
      reasons.push('meaningful impressions are stranded outside the top 10');
    }
    if (upside > 0) decayScore += Math.min(20, Math.round(Math.log10(upside + 1) * 8));
    if (impressions >= 250 && clicks === 0) {
      decayScore += 20;
      reasons.push('high impressions with zero clicks');
    }

    return {
      url: page.url ?? page.page ?? null,
      decayScore,
      impressions,
      clicks,
      position,
      estimatedUpsideClicks: upside,
      reasons,
      sourceActions: actions,
    };
  }).filter((page) => page.url && page.decayScore > 0)
    .sort((a, b) => b.decayScore - a.decayScore || b.impressions - a.impressions);

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    sourceGeneratedAt: opportunityReport?.generatedAt ?? null,
    methodology: 'Ranks existing pages showing search-performance decay/underperformance signals; missing Search Console data produces an empty, non-failing report.',
    candidateCount: candidates.length,
    topCandidate: candidates[0] ?? null,
    candidates,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const arg = (name, fallback) => {
    const exact = args.indexOf(name);
    if (exact >= 0) return args[exact + 1] ?? fallback;
    const prefixed = args.find((value) => value.startsWith(`${name}=`));
    return prefixed ? prefixed.slice(name.length + 1) : fallback;
  };

  const input = arg('--input', OPPORTUNITY_PATH);
  const output = arg('--output', OUTPUT_PATH);
  const opportunities = await readJson(input);
  const report = buildDecayReport(opportunities);
  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Content decay report: ${report.candidateCount} candidates → ${output}`);
  if (!opportunities) console.log(`No opportunity report found at ${input}; wrote an empty report.`);
  if (report.topCandidate) console.log(`Top decay candidate: ${report.topCandidate.url} (${report.topCandidate.decayScore})`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
