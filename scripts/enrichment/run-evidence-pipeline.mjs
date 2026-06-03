#!/usr/bin/env node
/**
 * Usage:
 *   node scripts/enrichment/run-evidence-pipeline.mjs --operations-file scripts/enrichment/fixtures/sample-mechanism-operations.json --task mechanism-herb --batch-size 50
 *   node scripts/enrichment/run-evidence-pipeline.mjs --resume-run-id run_xxx --batch-size 50
 */
import { join } from 'node:path';
import {
  REPO_ROOT,
  bootstrapStateDb,
  deterministicRunId,
  ensureDir,
  loadJson,
  nowIso,
  runSqlite,
} from './_shared.mjs';

function parseArgs(argv) {
  const out = {
    task: 'mechanism-herb',
    operationsFile: null,
    batchSize: 50,
    runId: null,
    resumeRunId: null,
    dryRun: false,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--task' && argv[i + 1]) {
      out.task = argv[i + 1];
      i += 1;
    } else if (arg.startsWith('--task=')) out.task = arg.slice('--task='.length);
    else if (arg === '--operations-file' && argv[i + 1]) {
      out.operationsFile = argv[i + 1];
      i += 1;
    } else if (arg.startsWith('--operations-file=')) out.operationsFile = arg.slice('--operations-file='.length);
    else if (arg === '--batch-size' && argv[i + 1]) {
      out.batchSize = Number.parseInt(argv[i + 1], 10);
      i += 1;
    } else if (arg.startsWith('--batch-size=')) out.batchSize = Number.parseInt(arg.slice('--batch-size='.length), 10);
    else if (arg === '--run-id' && argv[i + 1]) {
      out.runId = argv[i + 1];
      i += 1;
    } else if (arg.startsWith('--run-id=')) out.runId = arg.slice('--run-id='.length);
    else if (arg === '--resume-run-id' && argv[i + 1]) {
      out.resumeRunId = argv[i + 1];
      i += 1;
    } else if (arg.startsWith('--resume-run-id=')) out.resumeRunId = arg.slice('--resume-run-id='.length);
    else if (arg === '--dry-run') out.dryRun = true;
  }

  if (!Number.isInteger(out.batchSize) || out.batchSize <= 0) {
    throw new Error('batch-size must be a positive integer');
  }

  if (!out.resumeRunId && !out.operationsFile) {
    throw new Error('operations-file is required unless --resume-run-id is supplied');
  }

  return out;
}

function getEntityKey(operation) {
  return `${operation.entity_type}:${operation.entity_id}`;
}

function requiredFieldsForOperation(operation) {
  if (operation.task === 'herb_mechanism' || operation.task === 'compound_mechanism') {
    return ['/mechanism', '/claims/-', '/_provenance', '/_review'];
  }
  if (operation.task === 'interactions') return ['/interactions', '/_review', '/_provenance'];
  if (operation.task === 'sources_suggestion') return ['/sources/-'];
  return [];
}

function scanMissingFields(operations) {
  const matrix = new Map();
  for (const op of operations) {
    const key = getEntityKey(op);
    const required = requiredFieldsForOperation(op);
    if (required.length === 0) continue;
    if (!matrix.has(key)) matrix.set(key, { required: new Set(required), seen: new Set(), task: op.task, entity_type: op.entity_type, entity_id: op.entity_id });
    const row = matrix.get(key);
    for (const item of required) row.required.add(item);
    row.seen.add(op.field);
  }

  const out = [];
  for (const row of matrix.values()) {
    const missing = Array.from(row.required).filter((field) => !row.seen.has(field));
    if (missing.length > 0) {
      out.push({
        task: row.task,
        entity_type: row.entity_type,
        entity_id: row.entity_id,
        missing_fields: missing,
      });
    }
  }
  return out;
}

function toSourceQuality(source) {
  const hasDoi = typeof source?.doi === 'string' && source.doi.trim().length > 0;
  const hasUrl = typeof source?.url === 'string' && /^https?:\/\//iu.test(source.url.trim());
  const verified = source?.verified === true;
  const year = Number(source?.year);
  const recency = Number.isFinite(year) ? (year >= 2020 ? 10 : year >= 2010 ? 5 : 2) : 0;
  const base = (hasDoi ? 25 : 0) + (hasUrl ? 15 : 0) + (verified ? 20 : 0) + recency;
  return {
    score: base,
    hasDoi,
    hasUrl,
    verified,
    year: Number.isFinite(year) ? year : null,
  };
}

function buildEvidenceCapture(operations) {
  const capture = [];
  const conflicts = [];
  const claimsByEntity = new Map();
  const provenanceByEntity = new Map();
  const reviewByEntity = new Map();

  for (const op of operations) {
    const key = getEntityKey(op);
    if (op.field === '/claims/-' && op.op === 'append' && op.value && typeof op.value === 'object') {
      if (!claimsByEntity.has(key)) claimsByEntity.set(key, []);
      claimsByEntity.get(key).push(op.value);
    }
    if (op.field === '/_provenance' && op.op === 'set' && op.value && typeof op.value === 'object') {
      provenanceByEntity.set(key, op.value);
    }
    if (op.field === '/_review' && op.op === 'set' && op.value && typeof op.value === 'object') {
      reviewByEntity.set(key, op.value);
    }
  }

  for (const [entityKey, claims] of claimsByEntity.entries()) {
    const provenance = provenanceByEntity.get(entityKey) ?? {};
    const review = reviewByEntity.get(entityKey) ?? { status: 'pending' };
    const sources = Array.isArray(provenance.sources) ? provenance.sources : [];
    const sourceById = new Map(sources.map((source) => [String(source?.id ?? '').trim(), source]));
    const [entityType, entityId] = entityKey.split(':');

    claims.forEach((claim, claimIndex) => {
      const sourceIds = Array.isArray(claim.source_ids) ? claim.source_ids.map((entry) => String(entry ?? '').trim()) : [];
      const uniqueSourceIds = new Set(sourceIds);
      if (uniqueSourceIds.size !== sourceIds.length) {
        conflicts.push({
          entity_type: entityType,
          entity_id: entityId,
          conflict_code: 'duplicate_source_index',
          details: { claim_id: claim.id ?? null, source_ids: sourceIds },
        });
      }
      if (sourceIds.some((sourceId) => !sourceId.startsWith('src_'))) {
        conflicts.push({
          entity_type: entityType,
          entity_id: entityId,
          conflict_code: 'invalid_source_index_prefix',
          details: { claim_id: claim.id ?? null, source_ids: sourceIds },
        });
      }

      sourceIds.forEach((sourceId, sourceOffset) => {
        const source = sourceById.get(sourceId);
        if (!source) {
          conflicts.push({
            entity_type: entityType,
            entity_id: entityId,
            conflict_code: 'source_not_in_provenance',
            details: { claim_id: claim.id ?? null, source_id: sourceId },
          });
          return;
        }
        const quality = toSourceQuality(source);
        const evidenceIndex = claimIndex + 1 + sourceOffset / 100;
        capture.push({
          entity_type: entityType,
          entity_id: entityId,
          claim_id: String(claim.id ?? ''),
          claim_text: String(claim.claim ?? ''),
          source_id: sourceId,
          evidence_index: evidenceIndex,
          source_quality: quality,
          review_status: String(review.status ?? 'pending'),
        });
      });
    });
  }

  return { capture, conflicts };
}

function scoreConfidence(capturedEvidence, missingFieldRows) {
  const byEntity = new Map();
  for (const evidence of capturedEvidence) {
    const key = `${evidence.entity_type}:${evidence.entity_id}`;
    if (!byEntity.has(key)) byEntity.set(key, []);
    byEntity.get(key).push(evidence);
  }

  const missingByEntity = new Map(missingFieldRows.map((row) => [`${row.entity_type}:${row.entity_id}`, row]));

  const scored = [];
  for (const [key, evidenceRows] of byEntity.entries()) {
    const base = evidenceRows.reduce((sum, row) => sum + row.source_quality.score, 0) / Math.max(evidenceRows.length, 1);
    const reviewPenalty = evidenceRows.some((row) => row.review_status === 'rejected') ? 35 : evidenceRows.some((row) => row.review_status === 'pending') ? 10 : 0;
    const missingPenalty = missingByEntity.has(key) ? missingByEntity.get(key).missing_fields.length * 8 : 0;
    const confidence = Math.max(0, Math.min(100, Number((base + 30 - reviewPenalty - missingPenalty).toFixed(2))));

    const [entity_type, entity_id] = key.split(':');
    scored.push({
      entity_type,
      entity_id,
      confidence,
      evidence_count: evidenceRows.length,
      missing_fields: missingByEntity.get(key)?.missing_fields ?? [],
      review_status: evidenceRows[0]?.review_status ?? 'pending',
    });
  }

  return scored;
}

function loadOperations(pathLike) {
  const payload = loadJson(join(REPO_ROOT, pathLike));
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.operations)) return payload.operations;
  throw new Error('operations-file must be an array or {operations:[...]}');
}

function saveState(state, dryRun) {
  if (dryRun) return;
  runSqlite({
    sql: `INSERT INTO enrichment_batch_state(run_uuid, operations_file, task, cursor, total_operations, counters_json, finished_at, updated_at)
      VALUES(?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(run_uuid) DO UPDATE SET
        cursor=excluded.cursor,
        counters_json=excluded.counters_json,
        total_operations=excluded.total_operations,
        finished_at=excluded.finished_at,
        updated_at=CURRENT_TIMESTAMP`,
    args: [
      state.run_uuid,
      state.operations_file,
      state.task,
      state.cursor,
      state.total_operations,
      JSON.stringify(state.counters),
      state.finished_at,
    ],
  });
}

function upsertReviewQueue(runId, rows, dryRun) {
  if (rows.length === 0 || dryRun) return 0;
  runSqlite({
    many: true,
    sql: `INSERT OR IGNORE INTO evidence_review_queue(run_uuid, entity_type, entity_id, reason, confidence_score, payload_json)
      VALUES(?, ?, ?, ?, ?, ?)`,
    args: rows.map((row) => [runId, row.entity_type, row.entity_id, row.reason, row.confidence, JSON.stringify(row.payload)]),
  });
  return rows.length;
}

function upsertConflictQueue(runId, rows, dryRun) {
  if (rows.length === 0 || dryRun) return 0;
  runSqlite({
    many: true,
    sql: `INSERT OR IGNORE INTO evidence_conflict_queue(run_uuid, entity_type, entity_id, conflict_code, details_json)
      VALUES(?, ?, ?, ?, ?)`,
    args: rows.map((row) => [runId, row.entity_type, row.entity_id, row.conflict_code, JSON.stringify(row.details)]),
  });
  return rows.length;
}

function loadState(runId) {
  const rows = runSqlite({
    select: true,
    sql: 'SELECT run_uuid, operations_file, task, cursor, total_operations, counters_json, finished_at FROM enrichment_batch_state WHERE run_uuid=?',
    args: [runId],
  });
  if (rows.length === 0) return null;
  const row = rows[0];
  return {
    run_uuid: row.run_uuid,
    operations_file: row.operations_file,
    task: row.task,
    cursor: Number(row.cursor),
    total_operations: Number(row.total_operations),
    counters: JSON.parse(row.counters_json ?? '{}'),
    finished_at: row.finished_at,
  };
}

function main() {
  bootstrapStateDb();
  ensureDir(join(REPO_ROOT, 'ops', 'reports'));
  const options = parseArgs(process.argv);

  let state = null;
  if (options.resumeRunId) {
    state = loadState(options.resumeRunId);
    if (!state) throw new Error(`No enrichment_batch_state found for run ${options.resumeRunId}`);
  }

  const runId = state?.run_uuid ?? options.runId ?? deterministicRunId({ phase: 'evidence-pipeline', task: options.task });
  const operationsFile = state?.operations_file ?? options.operationsFile;
  const task = state?.task ?? options.task;
  const operations = loadOperations(operationsFile);

  const startCursor = state?.cursor ?? 0;
  const endCursor = Math.min(startCursor + options.batchSize, operations.length);
  const batch = operations.slice(startCursor, endCursor);

  const missingFields = scanMissingFields(batch);
  const { capture, conflicts } = buildEvidenceCapture(batch);
  const confidenceRows = scoreConfidence(capture, missingFields);

  const reviewRows = [];
  for (const row of confidenceRows) {
    if (row.review_status !== 'approved') {
      reviewRows.push({
        ...row,
        reason: 'review_status_not_approved',
        payload: { review_status: row.review_status, evidence_count: row.evidence_count, missing_fields: row.missing_fields },
      });
    }
    if (row.confidence < 70) {
      reviewRows.push({
        ...row,
        reason: 'confidence_below_threshold',
        payload: { threshold: 70, confidence: row.confidence, evidence_count: row.evidence_count },
      });
    }
    if (row.missing_fields.length > 0) {
      reviewRows.push({
        ...row,
        reason: 'missing_required_fields',
        payload: { missing_fields: row.missing_fields },
      });
    }
  }

  const counterBase = state?.counters ?? {
    processed_operations: 0,
    captured_evidence: 0,
    review_queue_added: 0,
    conflict_queue_added: 0,
    missing_field_entities: 0,
  };

  const reviewAdded = upsertReviewQueue(runId, reviewRows, options.dryRun);
  const conflictsAdded = upsertConflictQueue(runId, conflicts, options.dryRun);

  const nextState = {
    run_uuid: runId,
    operations_file: operationsFile,
    task,
    cursor: endCursor,
    total_operations: operations.length,
    counters: {
      processed_operations: counterBase.processed_operations + batch.length,
      captured_evidence: counterBase.captured_evidence + capture.length,
      review_queue_added: counterBase.review_queue_added + reviewAdded,
      conflict_queue_added: counterBase.conflict_queue_added + conflictsAdded,
      missing_field_entities: counterBase.missing_field_entities + missingFields.length,
    },
    finished_at: endCursor >= operations.length ? nowIso() : null,
  };

  saveState(nextState, options.dryRun);

  console.log(
    JSON.stringify(
      {
        status: endCursor >= operations.length ? 'completed' : 'in_progress',
        runId,
        resume: {
          nextCursor: endCursor,
          totalOperations: operations.length,
          done: endCursor >= operations.length,
        },
        strictEvidenceFirst: {
          missingFieldEntities: missingFields.length,
          capturedEvidence: capture.length,
          conflictsDetected: conflicts.length,
          reviewQueued: reviewRows.length,
        },
        counters: nextState.counters,
        dryRun: options.dryRun,
      },
      null,
      2,
    ),
  );
}

main();
