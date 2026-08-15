#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { buildQueue } from './roi-task-queue.mjs';

const DEFAULT_TASKS = 'ops/roi-tasks.json';
const DEFAULT_SEARCH = 'ops/reports/search-opportunities.json';
const DEFAULT_SIGNALS = 'ops/content-command-center/signals.json';
const DEFAULT_JSON = 'ops/content-command-center/next-highest-roi-task.json';
const DEFAULT_MD = 'ops/content-command-center/next-highest-roi-task.md';

const clamp = (value, min = 0, max = 100) => Math.min(max, Math.max(min, Number(value) || 0));

async function readJson(file, fallback = null) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') return fallback;
    throw error;
  }
}

function taskUrls(task) {
  const urls = Array.isArray(task.urls) ? task.urls : task.url ? [task.url] : [];
  return [...new Set(urls.filter(Boolean))];
}

function searchPages(report) {
  if (!report) return [];
  for (const key of ['pages', 'pageOpportunities', 'page_opportunities', 'results']) {
    if (Array.isArray(report[key])) return report[key];
  }
  return [];
}

function normalizeUrl(value) {
  if (!value) return null;
  try {
    if (/^https?:\/\//i.test(value)) value = new URL(value).pathname;
  } catch {}
  const clean = String(value).split(/[?#]/)[0];
  if (!clean.startsWith('/')) return `/${clean}`;
  return clean;
}

function trafficFromSearch(task, report) {
  const wanted = new Set(taskUrls(task).map(normalizeUrl));
  if (!wanted.size) return null;
  const matches = searchPages(report).filter((page) => wanted.has(normalizeUrl(page.url ?? page.page)));
  if (!matches.length) return null;
  const upside = matches.reduce((sum, page) => sum + Number(page.totalUpsideClicks ?? page.ctrUpsideClicks ?? page.priority ?? 0), 0);
  const impressions = matches.reduce((sum, page) => sum + Number(page.impressions ?? 0), 0);
  // Smooth logarithmic normalization: a few dozen recoverable clicks matters,
  // but gigantic pages do not completely swamp every other signal.
  return clamp(Math.max(Math.log10(upside + 1) * 28, Math.log10(impressions + 1) * 18));
}

function signalForTask(task, signalReport) {
  const byTask = signalReport?.tasks ?? {};
  const byUrl = signalReport?.urls ?? {};
  const taskSignal = byTask[String(task.id)] ?? {};
  const urlSignals = taskUrls(task).map((url) => byUrl[normalizeUrl(url)] ?? {}).filter((value) => Object.keys(value).length);
  const mean = (key) => {
    const values = urlSignals.map((entry) => Number(entry[key])).filter(Number.isFinite);
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : undefined;
  };
  return {
    trafficOpportunity: taskSignal.trafficOpportunity ?? mean('trafficOpportunity'),
    evidenceCompleteness: taskSignal.evidenceCompleteness ?? mean('evidenceCompleteness'),
    revenueOpportunity: taskSignal.revenueOpportunity ?? mean('revenueOpportunity'),
    backlinkOpportunity: taskSignal.backlinkOpportunity ?? mean('backlinkOpportunity'),
    pageQuality: taskSignal.pageQuality ?? mean('pageQuality'),
    implementationEffort: taskSignal.implementationEffort ?? mean('implementationEffort'),
  };
}

export function enrichTask(task, { searchReport = null, signalReport = null } = {}) {
  const explicit = task.metrics ?? {};
  const external = signalForTask(task, signalReport);
  const trafficOpportunity = clamp(explicit.trafficOpportunity ?? external.trafficOpportunity ?? trafficFromSearch(task, searchReport));
  const evidenceCompleteness = clamp(explicit.evidenceCompleteness ?? external.evidenceCompleteness ?? 50);
  const revenueOpportunity = clamp(explicit.revenueOpportunity ?? external.revenueOpportunity ?? 0);
  const backlinkOpportunity = clamp(explicit.backlinkOpportunity ?? external.backlinkOpportunity ?? 0);
  const pageQuality = clamp(explicit.pageQuality ?? external.pageQuality ?? 50);
  const implementationEffort = Number(explicit.implementationEffort ?? external.implementationEffort ?? task.effort ?? 5);

  const evidenceGap = 100 - evidenceCompleteness;
  const qualityGap = 100 - pageQuality;
  const impact100 = (
    trafficOpportunity * 0.30 +
    evidenceGap * 0.20 +
    revenueOpportunity * 0.20 +
    backlinkOpportunity * 0.15 +
    qualityGap * 0.15
  );

  const missingSignals = [];
  if (explicit.trafficOpportunity == null && external.trafficOpportunity == null && trafficFromSearch(task, searchReport) == null) missingSignals.push('trafficOpportunity');
  if (explicit.evidenceCompleteness == null && external.evidenceCompleteness == null) missingSignals.push('evidenceCompleteness');
  if (explicit.revenueOpportunity == null && external.revenueOpportunity == null) missingSignals.push('revenueOpportunity');
  if (explicit.backlinkOpportunity == null && external.backlinkOpportunity == null) missingSignals.push('backlinkOpportunity');
  if (explicit.pageQuality == null && external.pageQuality == null) missingSignals.push('pageQuality');

  return {
    ...task,
    urls: taskUrls(task),
    impact: Number((impact100 / 10).toFixed(3)),
    effort: implementationEffort,
    confidence: task.confidence ?? 50,
    commandCenterSignals: {
      trafficOpportunity,
      evidenceCompleteness,
      evidenceGap,
      revenueOpportunity,
      backlinkOpportunity,
      pageQuality,
      qualityGap,
      implementationEffort,
      missingSignals,
    },
  };
}

function agentInstruction(task) {
  const urlText = task.urls?.length ? ` Relevant URLs: ${task.urls.join(', ')}.` : '';
  return `Implement only task ${task.id}: ${task.title}.${urlText} Work from the latest merged main, prefer generator-level fixes over generated-page patches, run the listed validation, compare against the regression baseline when applicable, and merge only if the change is independently useful and regression-free.`;
}

function markdown(result) {
  const task = result.nextTask;
  const lines = [
    '# Next Highest ROI Task',
    '',
    `Generated: ${result.generatedAt}`,
    '',
    task ? `## ${task.id} — ${task.title}` : 'No queued task is available.',
  ];
  if (!task) return `${lines.join('\n')}\n`;
  lines.push(
    '',
    `**Priority score:** ${task.priorityScore}`,
    `**Formula:** ${task.scoreFormula}`,
    `**Ranking basis:** ${task.rankingBasis}`,
    `**Impact:** ${task.impact} · **Confidence:** ${task.confidence} · **Effort:** ${task.effort}`,
    '',
    '### Command Center signals',
    '',
    `- Traffic opportunity: ${task.commandCenterSignals.trafficOpportunity}/100`,
    `- Evidence completeness: ${task.commandCenterSignals.evidenceCompleteness}/100`,
    `- Revenue opportunity: ${task.commandCenterSignals.revenueOpportunity}/100`,
    `- Backlink opportunity: ${task.commandCenterSignals.backlinkOpportunity}/100`,
    `- Page quality: ${task.commandCenterSignals.pageQuality}/100`,
    `- Implementation effort: ${task.commandCenterSignals.implementationEffort}`,
    `- Missing measured inputs: ${task.commandCenterSignals.missingSignals.join(', ') || 'none'}`,
    '',
    '### Agent instruction',
    '',
    agentInstruction(task),
    '',
  );
  return `${lines.join('\n')}\n`;
}

export async function buildNextTask({ tasksPath = DEFAULT_TASKS, searchPath = DEFAULT_SEARCH, signalsPath = DEFAULT_SIGNALS } = {}) {
  const rawTasks = await readJson(tasksPath, { tasks: [] });
  const tasks = Array.isArray(rawTasks) ? rawTasks : rawTasks.tasks ?? [];
  if (!tasks.length) throw new Error(`No ROI tasks found in ${tasksPath}`);
  const searchReport = await readJson(searchPath, null);
  const signalReport = await readJson(signalsPath, null);
  const enriched = tasks.map((task) => enrichTask(task, { searchReport, signalReport }));
  const queue = buildQueue(enriched, { sourceDeployment: process.env.GITHUB_SHA ?? process.env.CF_PAGES_COMMIT_SHA ?? null });
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    sourceDeployment: queue.sourceDeployment,
    policy: 'Choose exactly one atomic task by measured opportunity, evidence gap, monetization, backlink potential, quality gap, confidence, and implementation effort. Agents execute the queue instead of inventing work.',
    taskCount: queue.taskCount,
    nextTask: queue.nextTask ? { ...queue.nextTask, agentInstruction: agentInstruction(queue.nextTask) } : null,
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
  const result = await buildNextTask({
    tasksPath: arg('--tasks', DEFAULT_TASKS),
    searchPath: arg('--search', DEFAULT_SEARCH),
    signalsPath: arg('--signals', DEFAULT_SIGNALS),
  });
  const jsonPath = arg('--json', DEFAULT_JSON);
  const mdPath = arg('--md', DEFAULT_MD);
  await fs.mkdir(path.dirname(jsonPath), { recursive: true });
  await fs.mkdir(path.dirname(mdPath), { recursive: true });
  await fs.writeFile(jsonPath, `${JSON.stringify(result, null, 2)}\n`);
  await fs.writeFile(mdPath, markdown(result));
  console.log(`Next Highest ROI Task → ${result.nextTask?.id ?? 'none'} ${result.nextTask?.title ?? ''}`);
  console.log(`Wrote ${jsonPath} and ${mdPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
