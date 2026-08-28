# Authoritative project-control reconciliation

Issue #4412. This read-only checker validates the current Markdown planning projection, not the legacy `ops/backlog` board. It never rewrites documents, changes GitHub state, publishes assets, or touches scientific/public data.

## Commands and evidence

- `node scripts/ci/reconcile-project-control.mjs --github --repository OWNER/REPO --revision EXACT_SHA` uses the existing `GITHUB_TOKEN` with read-only permissions. Do not put tokens on the command line or in committed files.
- `node scripts/ci/reconcile-project-control.mjs --snapshot snapshot.json --repository OWNER/REPO --revision EXACT_SHA --now ISO_TIMESTAMP` replays an operator-supplied snapshot. Snapshot proof is not a fresh network observation.
- With neither source (or unavailable/malformed inputs), the result is explicitly UNKNOWN/waiting and admission is blocked.
- `npx vitest run scripts/ci/reconcile-project-control.test.mjs` runs deterministic regression fixtures; standard CI includes these tests and the production build.
- The path-scoped Project control reconciliation workflow checks the exact PR head or main revision and retains JSON evidence. It is not an automatic prose-rewriting or scheduling system.

JSON goes to stdout; a concise human report goes to stderr. Exit codes are 0 PASS, 1 DRIFT, 2 UNKNOWN. PASS does not imply permission to start: admission remains blocked at the cap or under an exception. Dependency waiting is reported separately. Missing external analytics/access stays Unknown in the existing blocker records.

The report includes the repository/revision and SHA-256 of each inspected control document. Snapshot format: `{version:1, repository, revision, available:true, records:{"123":{kind:"issue",state:"open"},"124":{kind:"pr",state:"open",merged:false,head:"SHA"}}, openPulls:[{number:124,closes:[123]}]}`. Supply every referenced identifier and the complete paginated open-PR ownership list. Partial evidence cannot pass; snapshots must be captured by an authorized read-only source and must not be described as current after GitHub changes.

## Markdown contract

- Sprint has exactly one `## Active` and `## Ready next`; backlog has exactly one `## Now` and `## Next`.
- Active work uses the existing tables: the sprint's second column or backlog's first column names the issue and owning PR. Status is the fourth column. Explicit Completed/Historical/Retired rows are not active, but should be moved into history on control sync.
- Sprint ready tickets use third-level headings; backlog ready/planned tickets use its Next table. Stable local ticket IDs remain supported; GitHub verification applies to numeric references only.
- Both queue documents declare `**WIP cap:** 3`. The parser counts active tickets, not mentions or stale headline counts.
- All three documents carry M0–M6 milestone/status rows and the same `**Control dependencies:** #ticket <- #pr; #next <- #ticket` immediate dependency declaration. These are part of the existing authoritative documents, not a fourth planning authority. Update them together when the immediate chain changes.
- An exceptional overflow must use the same bounded line in both queue documents: `**WIP exception:** owner=#123; maximum=4; expires=2026-08-29T00:00:00Z; admission=blocked; reason=Named incident`. Owner must be active, maximum must exceed the normal cap, expiry must be future, and admission always stays blocked. No permanent limit increase is inferred.
- Exact identifier overlap and explicit GitHub closing-keyword ownership are checked. Semantic duplicates with different identifiers or undeclared ownership still require operator review.

## Lifecycle and limitations

A merge/closure can intentionally make yesterday's active projection stale. The next control sync must move that entry to history and refresh owning PRs before new admission; do not suppress that finding or call a merged ticket current. GitHub API state is observed over a read window, not an atomic multi-resource transaction: rerun immediately before admission. No current analytics, production receipt, scientific correctness, or business outcome is inferred from a PASS.

Rollback removes this checker, its tests/workflow, and the explicit control annotations; preserve the corrected historical dispositions. No provider integration or repository-protection setting is changed.
