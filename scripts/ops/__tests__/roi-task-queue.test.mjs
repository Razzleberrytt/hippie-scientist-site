import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeConfidence, rankTasks, scoreTask } from '../roi-task-queue.mjs';

test('normalizes percentage confidence values', () => {
  assert.equal(normalizeConfidence(80), 0.8);
  assert.equal(normalizeConfidence(0.8), 0.8);
});

test('uses impact × confidence / effort as the assumption score', () => {
  const scored = scoreTask({ id: 1, title: 'Example', impact: 10, confidence: 80, effort: 2 });
  assert.equal(scored.assumptionScore, 4);
  assert.equal(scored.priorityScore, 4);
});

test('fresh observed performance can outrank assumptions', () => {
  const ranked = rankTasks([
    { id: 'assumed', title: 'Assumed winner', impact: 10, confidence: 90, effort: 2 },
    {
      id: 'measured', title: 'Measured winner', impact: 8, confidence: 70, effort: 2,
      performance: { sampleSize: 5000, observationDays: 28, organicClicksDeltaPct: 50, revenueDeltaPct: 60 },
    },
  ]);
  assert.equal(ranked[0].id, 'measured');
  assert.equal(ranked[0].rankingBasis, 'blended-with-observed-performance');
});

test('rejects tasks without confidence', () => {
  assert.throws(() => scoreTask({ id: 1, title: 'Missing confidence', impact: 10, effort: 2 }), /confidence/);
});
