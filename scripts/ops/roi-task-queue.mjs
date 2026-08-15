#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_INPUT = 'ops/roi-tasks.json';
const DEFAULT_OUTPUT = 'artifacts/ops/roi-task-queue.json';
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function normalizeConfidence(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) throw new TypeError('confidence must be numeric');
  if (n >= 0 && n <= 1) return n;
  if (n > 1 && n <= 100) return n / 100;
  throw new RangeError('confidence must be between 0–1 or 0–100');
}

export function validateTask(task) {
  if (!task || typeof task !== 'object') throw new TypeError('task must be an object');
  if (!task.id) throw new Error('task.id is required');
  if (!task.title) throw new Error(`task ${task.id}: title is required`);
  const impact = Number(task.impact);
  const effort = Number(task.effort);
  if (!Number.isFinite(impact) || impact < 0) throw new Error(`task ${task.id}: impact must be >= 0`);
  if (!Number.isFinite(effort) || effort <= 0) throw new Error(`task ${task.id}: effort must be > 0`);
  normalizeConfidence(task.confidence);
  return task;
}

function observedSignal(performance = {}) {
  const signals = [];
  const push = (value, scale) => {
    const n = Number(value);
    if (Number.isFinite(n)) signals.push(clamp(n / scale, -1, 1));
  };
  push(performance.organicClicksDeltaPct, 50);
  push(performance.impressionsDeltaPct, 75);
  push(performance.ctrDeltaPct, 30);
  push(performance.conversionRateDeltaPct, 30);
  push(performance.revenueDeltaPct, 50);
  push(performance.referringDomainsDeltaPct, 50);
  push(performance.aiCitationsDeltaPct, 50);
  return signals.length ? signals.reduce((sum, value) => sum + value, 0) / signals.length : null;
}

export function scoreTask(task) {
  validateTask(task);
  const impact = Number(task.impact);
  const effort = Number(task.effort);
  const confidence = normalizeConfidence(task.confidence);
  const assumptionScore = (impact * confidence) / effort;
  const performance = task.performance ?? {};
  const signal = observedSignal(performance);
  const sampleSize = Math.max(0, Number(performance.sampleSize) || 0);
  const observationDays = Math.max(0, Number(performance.observationDays) || 0);
  const hasObservedEvidence = signal !== null && (sampleSize >= 100 || observationDays >= 14);

  let observedWeight = 0;
  let observedMultiplier = 1;
  if (hasObservedEvidence) {
    const sampleWeight = clamp(Math.log10(Math.max(100, sampleSize)) / 5, 0.35, 0.85);
    const timeWeight = clamp(observationDays / 56, 0.25, 0.85);
    observedWeight = clamp(Math.max(sampleWeight, timeWeight), 0.35, 0.85);
    observedMultiplier = clamp(1 + signal, 0.1, 2);
  }

  const observedScore = assumptionScore * observedMultiplier;
  const priorityScore = assumptionScore * (1 - observedWeight) + observedScore * observedWeight;
  return {
    ...task,
    confidence,
    assumptionScore: Number(assumptionScore.toFixed(4)),
    observedWeight: Number(observedWeight.toFixed(4)),
    observedMultiplier: Number(observedMultiplier.toFixed(4)),
    priorityScore: Number(priorityScore.toFixed(4)),
    scoreFormula: '(impact × confidence) / effort',
    rankingBasis: observedWeight > 0 ? 'blended-with-observed-performance' : 'assumptions-only',
  };
}

export function rankTasks(tasks) {
  if (!Array.isArray(tasks)) throw new TypeError('tasks must be an array');
  return tasks.map(scoreTask).sort((a, b) => b.priorityScore - a.priorityScore || String(a.id).localeCompare(String(b.id)));
}

export function buildQueue(tasks, meta = {}) {
  const ranked = rankTasks(tasks);
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    formula: '(impact × confidence) / effort',
    policy: 'Measured performance progressively outranks assumptions once sample or observation thresholds are met.',
    sourceDeployment: meta.sourceDeployment ?? process.env.CF_PAGES_COMMIT_SHA ?? process.env.GITHUB_SHA ?? null,
    taskCount: ranked.length,
    nextTask: ranked[0] ?? null,
    tasks: ranked,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const getArg = (name, fallback) => {
    const index = args.indexOf(name);
    return index >= 0 ? args[index + 1] : fallback;
  };
  const inputPath = getArg('--input', DEFAULT_INPUT);
  const outputPath = getArg('--output', DEFAULT_OUTPUT);
  const raw = JSON.parse(await fs.readFile(inputPath, 'utf8'));
  const tasks = Array.isArray(raw) ? raw : raw.tasks;
  const queue = buildQueue(tasks, { sourceDeployment: raw.sourceDeployment });
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(queue, null, 2)}\n`);
  console.log(`ROI queue: ${queue.taskCount} tasks ranked → ${outputPath}`);
  if (queue.nextTask) console.log(`Next: ${queue.nextTask.id} — ${queue.nextTask.title} (${queue.nextTask.priorityScore})`);
}

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isDirectRun) main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
