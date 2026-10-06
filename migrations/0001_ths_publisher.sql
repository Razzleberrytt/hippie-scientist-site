-- THS Publisher v0.1 canonical publication queue.
-- Provider IDs are receipts only; publication_id is the durable identity.
CREATE TABLE IF NOT EXISTS ths_publications (
  publication_id TEXT PRIMARY KEY,
  experiment_id TEXT NOT NULL,
  artifact_sha256 TEXT NOT NULL,
  platform TEXT NOT NULL,
  intended_time TEXT NOT NULL,
  state TEXT NOT NULL CHECK (
    state IN (
      'QUEUED',
      'DISPATCHING',
      'PROVIDER_ACCEPTED',
      'AWAITING_USER_POST',
      'PUBLISHED',
      'FAILED',
      'NEEDS_RECONCILIATION',
      'CANCELLED'
    )
  ),
  attempts INTEGER NOT NULL DEFAULT 0,
  provider TEXT,
  provider_operation_id TEXT,
  job_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS ths_publications_due_idx
  ON ths_publications (state, intended_time);

CREATE INDEX IF NOT EXISTS ths_publications_experiment_idx
  ON ths_publications (experiment_id, platform, intended_time);

-- One platform/time slot has one canonical writer. A retry stays under the same publication_id.
CREATE UNIQUE INDEX IF NOT EXISTS ths_publications_slot_idx
  ON ths_publications (platform, intended_time);
