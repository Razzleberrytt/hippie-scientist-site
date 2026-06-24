#!/usr/bin/env node
/**
 * Usage: node scripts/enrichment/score-entities.mjs
 */
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { REPO_ROOT, bootstrapStateDb, loadJson, nowIso, runSqlite } from './_shared.mjs';

const TRAFFIC_FALLBACK_SCORE = 5;

function parseCsvRows(raw) {
  const lines = raw
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((header) => header.trim().toLowerCase());
  const slugIndex = headers.findIndex((header) => ['slug', 'path', 'url'].includes(header));
  const viewsIndex = headers.findIndex((header) => ['views', 'sessions', 'pageviews', 'traffic'].includes(header));
  if (slugIndex < 0 || viewsIndex < 0) return [];

  return lines.slice(1).map((line) => {
    const parts = line.split(',').map((part) => part.trim());
    const rawSlug = parts[slugIndex] ?? '';
    const slug = rawSlug
      .replace(/^https?:\/\/[^/]+/u, '')
      .replace(/^\/+(herbs|compounds)?\/?/u, '')
      .replace(/^.*\//u, '')
      .trim()
      .toLowerCase();
    const views = Number.parseFloat(parts[viewsIndex] ?? '0');
    return { slug, views: Number.isFinite(views) ? views : 0 };
  });
}

function mapTrafficScores(trafficRows) {
  const maxViews = Math.max(...trafficRows.map((row) => row.views), 1);
  const bySlug = new Map();
  for (const row of trafficRows) {
    if (!row.slug) continue;
    bySlug.set(row.slug, Math.round((row.views / maxViews) * 10 * 100) / 100);
  }
  return bySlug;
}

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function sentenceCount(text) {
  return String(text ?? '')
    .split(/(?<=[.!?])\s+/u)
    .map((entry) => entry.trim())
    .filter(Boolean).length;
}

const PHARMACOLOGY_RE =
  /\b(5-ht(?:1a|2a|2c|3|4|7)?|serotonin|dopamin(?:e|ergic)|gaba(?:ergic)?|nmda|ampar?|adrenergic|muscarinic|nicotinic|opioid|cb1|cb2|trpv1|cyp\d+[a-z0-9]*|kinase|phosphodiesterase|alkaloid|terpene|flavonoid|lignan|coumarin)\b/iu;

function toDaysOld(lastUpdated) {
  if (!hasText(lastUpdated)) return 3650;
  const parsed = Date.parse(lastUpdated);
  if (Number.isNaN(parsed)) return 3650;
  const elapsedMs = Date.now() - parsed;
  return Math.max(0, Math.round(elapsedMs / 86_400_000));
}

function mechanismGap(entity, entityType) {
  const mechanism = String(entity.mechanism ?? '').trim();
  if (!mechanism) return 1;
  let gap = 0;
  const minSentences = entityType === 'herb' ? 2 : 2;
  const maxSentences = entityType === 'herb' ? 4 : 5;
  const count = sentenceCount(mechanism);
  if (count < minSentences || count > maxSentences) gap += 0.45;
  if (!PHARMACOLOGY_RE.test(mechanism)) gap += 0.45;
  if (mechanism.length < 80) gap += 0.2;
  return Math.min(1, gap);
}

function computeSignals(entity, entityType, trafficBySlug, trafficFallbackUsed) {
  const slug = String(entity.slug ?? entity.id ?? '').trim().toLowerCase();
  const trafficScore = trafficFallbackUsed ? TRAFFIC_FALLBACK_SCORE : (trafficBySlug.get(slug) ?? TRAFFIC_FALLBACK_SCORE);

  const sources = Array.isArray(entity.sources) ? entity.sources : [];
  const effects = Array.isArray(entity.effects) ? entity.effects : [];
  const contraindications = Array.isArray(entity.contraindications) ? entity.contraindications : [];

  const missingSources = sources.length === 0 ? 10 : Math.max(0, 8 - Math.min(sources.length, 8));
  const missingMechanism = Math.round(mechanismGap(entity, entityType) * 10 * 100) / 100;

  const safetySignals = contraindications.length + (hasText(entity.safetyNotes) ? 1 : 0) + (Array.isArray(entity.interactions) ? entity.interactions.length : 0);
  const safetyGap = safetySignals === 0 ? 10 : Math.max(0, 6 - Math.min(safetySignals, 6));

  const internalLinks = entityType === 'herb' ? (Array.isArray(entity.activeCompounds) ? entity.activeCompounds.length : 0) : (Array.isArray(entity.herbs) ? entity.herbs.length : 0);
  const internalLinkGap = internalLinks === 0 ? 10 : Math.max(0, 6 - Math.min(internalLinks, 6));

  const daysOld = toDaysOld(entity.lastUpdated);
  const freshnessPenalty = Math.min(10, Math.round((daysOld / 365) * 10 * 100) / 100);

  const qualityBoost = Math.min(4, effects.length * 0.5);

  return {
    trafficScore,
    missingSources,
    missingMechanism,
    safetyGap,
    internalLinkGap,
    freshnessPenalty,
    qualityBoost,
  };
}

function main() {
  const migrationState = bootstrapStateDb();
  const herbs = loadJson(join(REPO_ROOT, 'public', 'data', 'herbs.json'));
  const compounds = loadJson(join(REPO_ROOT, 'public', 'data', 'compounds.json'));

  const trafficPath = join(REPO_ROOT, 'ops', 'traffic-export.csv');
  let trafficFallbackUsed = true;
  let trafficBySlug = new Map();

  try {
    const trafficRows = parseCsvRows(readFileSync(trafficPath, 'utf8'));
    if (trafficRows.length > 0) {
      trafficBySlug = mapTrafficScores(trafficRows);
      trafficFallbackUsed = false;
      console.log(`[score-entities] Loaded ${trafficRows.length} traffic rows from ops/traffic-export.csv`);
    } else {
      console.log(`[score-entities] ops/traffic-export.csv present but unusable; falling back to trafficScore=${TRAFFIC_FALLBACK_SCORE}`);
    }
  } catch {
    console.log(`[score-entities] ops/traffic-export.csv not found; falling back to trafficScore=${TRAFFIC_FALLBACK_SCORE}`);
  }

  const formula = 'priorityScore = trafficScore*3 + missingSources*2 + missingMechanism*4 + safetyGap*2 + internalLinkGap + freshnessPenalty - qualityBoost';

  const rows = [];
  for (const [entityType, items, task] of [
    ['herb', herbs, 'mechanism-herb'],
    ['compound', compounds, 'mechanism-compound'],
  ]) {
    for (const entity of items) {
      const entityId = String(entity.id ?? entity.slug ?? '').trim();
      if (!entityId) continue;
      const signals = computeSignals(entity, entityType, trafficBySlug, trafficFallbackUsed);
      const score =
        signals.trafficScore * 3 +
        signals.missingSources * 2 +
        signals.missingMechanism * 4 +
        signals.safetyGap * 2 +
        signals.internalLinkGap +
        signals.freshnessPenalty -
        signals.qualityBoost;
      rows.push({
        entity_type: entityType,
        entity_id: entityId,
        task,
        score: Math.round(score * 100) / 100,
        rationale_json: JSON.stringify({ ...signals, formula, scoredAt: nowIso() }),
      });
    }
  }

  const rankedByTask = new Map();
  for (const row of rows) {
    if (!rankedByTask.has(row.task)) rankedByTask.set(row.task, []);
    rankedByTask.get(row.task).push(row);
  }
  for (const list of rankedByTask.values()) {
    list.sort((a, b) => b.score - a.score || a.entity_type.localeCompare(b.entity_type) || a.entity_id.localeCompare(b.entity_id));
  }

  runSqlite({ sql: 'DELETE FROM entity_scores' });
  runSqlite({ sql: 'DELETE FROM claim_backlog WHERE task IN (?, ?)', args: ['mechanism-herb', 'mechanism-compound'] });

  runSqlite({
    many: true,
    sql: 'INSERT OR REPLACE INTO entity_scores(entity_type, entity_id, score, rationale_json) VALUES(?, ?, ?, ?)',
    args: rows.map((row) => [row.entity_type, row.entity_id, row.score, row.rationale_json]),
  });

  const backlogRows = [];
  for (const [task, list] of rankedByTask.entries()) {
    list.forEach((row, index) => {
      backlogRows.push([row.entity_type, row.entity_id, task, index + 1, 'pending']);
    });
  }
  runSqlite({
    many: true,
    sql: 'INSERT OR REPLACE INTO claim_backlog(entity_type, entity_id, task, priority, status) VALUES(?, ?, ?, ?, ?)',
    args: backlogRows,
  });

  console.log(
    JSON.stringify(
      {
        status: 'scored',
        migrationCount: migrationState.count,
        trafficFallbackUsed,
        trafficFallbackScore: TRAFFIC_FALLBACK_SCORE,
        scoringFormula: formula,
        totals: {
          herbs: herbs.length,
          compounds: compounds.length,
          scoresWritten: rows.length,
          backlogRows: backlogRows.length,
        },
      },
      null,
      2,
    ),
  );
}

main();
