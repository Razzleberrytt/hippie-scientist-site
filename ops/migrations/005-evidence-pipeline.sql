CREATE TABLE IF NOT EXISTS evidence_review_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_uuid TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  confidence_score REAL NOT NULL,
  payload_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(run_uuid, entity_type, entity_id, reason)
);

CREATE INDEX IF NOT EXISTS idx_evidence_review_queue_status
  ON evidence_review_queue(status, run_uuid, created_at ASC);

CREATE TABLE IF NOT EXISTS evidence_conflict_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_uuid TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  conflict_code TEXT NOT NULL,
  details_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(run_uuid, entity_type, entity_id, conflict_code, details_json)
);

CREATE INDEX IF NOT EXISTS idx_evidence_conflict_queue_status
  ON evidence_conflict_queue(status, run_uuid, created_at ASC);

CREATE TABLE IF NOT EXISTS enrichment_batch_state (
  run_uuid TEXT PRIMARY KEY,
  operations_file TEXT NOT NULL,
  task TEXT NOT NULL,
  cursor INTEGER NOT NULL DEFAULT 0,
  total_operations INTEGER NOT NULL,
  counters_json TEXT NOT NULL,
  finished_at TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
