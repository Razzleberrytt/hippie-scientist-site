CREATE TABLE IF NOT EXISTS review_decisions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patch_id TEXT NOT NULL,
  lane TEXT NOT NULL,
  decision TEXT NOT NULL,
  reviewer TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK(lane IN ('A','B','C')),
  CHECK(decision IN ('approved','rejected'))
);

CREATE INDEX IF NOT EXISTS idx_review_decisions_patch_lane_decision
  ON review_decisions(patch_id, lane, decision, created_at DESC);
