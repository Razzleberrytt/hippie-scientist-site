PRAGMA foreign_keys=OFF;

CREATE TABLE IF NOT EXISTS claim_backlog_v2 (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  task TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 100,
  status TEXT NOT NULL DEFAULT 'pending',
  claim_id TEXT NOT NULL DEFAULT '',
  field_path TEXT NOT NULL DEFAULT '',
  claimed_by_run_uuid TEXT,
  claimed_at TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(entity_type, entity_id, task, claim_id, field_path)
);

INSERT OR IGNORE INTO claim_backlog_v2(
  id, entity_type, entity_id, task, priority, status, claim_id, field_path,
  claimed_by_run_uuid, claimed_at, completed_at, created_at
)
SELECT
  id, entity_type, entity_id, task, priority, status, '', '',
  claimed_by_run_uuid, claimed_at, completed_at, created_at
FROM claim_backlog;

DROP TABLE claim_backlog;
ALTER TABLE claim_backlog_v2 RENAME TO claim_backlog;

CREATE INDEX IF NOT EXISTS idx_claim_backlog_status_priority
  ON claim_backlog(status, priority ASC, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_claim_backlog_task_claim
  ON claim_backlog(task, entity_type, entity_id, claim_id, field_path);

PRAGMA foreign_keys=ON;
