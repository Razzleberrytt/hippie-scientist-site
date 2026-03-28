CREATE TABLE IF NOT EXISTS claim_backlog (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  task TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 100,
  status TEXT NOT NULL DEFAULT 'pending',
  claimed_by_run_uuid TEXT,
  claimed_at TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(entity_type, entity_id, task)
);

CREATE INDEX IF NOT EXISTS idx_claim_backlog_status_priority
  ON claim_backlog(status, priority ASC, created_at ASC);
