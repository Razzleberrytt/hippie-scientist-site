# Transactional Patch Application (Phase 5)

> Status: **implemented and verified** end-to-end (apply → idempotent re-apply →
> rollback) against the real migrated canonical data.

## Workflow

```
read normalized patches → schema-validate → resolve targets → plan diff
→ (dry-run stops here) → snapshot → apply batch → validate resulting dataset
→ write canonical → rebuild SQLite + export → move applied/rejected → audit-log
```

## Commands

```bash
npm run data:patches:dry-run                    # plan + diff, commit nothing (default)
npm run data:patches:apply                      # snapshot, apply, validate, commit
npm run data:patches:apply -- --file <patch.json>
npm run data:patches:apply -- --force           # allow overwriting sourced fields
npm run data:patches:apply -- --allow-destructive   # permit deprecate ops
npm run data:rollback                           # restore latest snapshot (or --to <name>)
npm run data:rollback -- --list
npm run data:audit-log                          # print + verify the audit hash chain
```

Exit codes: `0` ok · `1` rejections/validation failure · `2` usage error.

## Target resolution

Stable **id → slug → canonical_name → unique alias**. `entity_type` narrows
candidates. **Ambiguous matches (>1) are rejected, never guessed.** Unresolved
targets are rejected unless the patch contains a `create_entity` op (then a new
entity is created with `review_status: needs_review`).

## Safety features

| Feature | How |
|---|---|
| Dry-run by default | `--apply` required to write. |
| Automatic snapshot | Timestamped copy of `data/canonical/**` before every apply. |
| All-or-none batch | Resulting dataset is schema + referential-integrity validated; if invalid, **nothing** is written. |
| Per-patch atomicity | Each patch applies against a clone; a rejected patch leaves **no trace**, even its otherwise-valid operations. |
| Idempotency | Already-applied `patch_id` (present in `applied/`) is skipped; re-running operations is a no-op (alias exists, claim id matches, etc.). |
| Never weaken data | Refuses to overwrite a non-empty evidence-bearing field (description, effects, mechanisms, dosage, evidence_grade, safety…) with unsourced patch data unless `--force`. |
| Never delete on absence | Omitted fields are never removed. |
| No unverified research | Claims/safety/interaction ops without a traceable source are kept `needs_review`. |
| Destructive gate | `deprecate` needs `--allow-destructive`; `merge_candidates` is never auto-applied. |
| Rollback | `data:rollback` restores any snapshot and rebuilds the DB. |
| Immutable audit log | `data/audit/audit-log.jsonl`, append-only, hash-chained (tamper-evident); every apply/rollback recorded. |
| Content hashing | Dataset structural hash reported before/after; patch `original_hash` preserved. |

## Dry-run diff shows

Files/entities affected, old → proposed field values, claims/edges added or
changed, conflicts, warnings, rejected operations, and whether human review is
required — per patch, with an applied/no-op/rejected/invalid summary.

## Files created

- `scripts/data/canonical/apply.mjs` — pure transactional engine (resolve, plan, apply, conflict/idempotency rules).
- `scripts/data/canonical/snapshot.mjs` — snapshot/rollback (injectable dirs).
- `scripts/data/canonical/audit-log.mjs` — append-only hash-chained log.
- `scripts/data/canonical/validate.mjs` — shared dataset validator.
- `scripts/data/apply-patches.mjs`, `rollback.mjs`, `audit.mjs` — CLIs.
- `scripts/data/canonical/__tests__/apply.test.mjs` — 15 tests (updates, ambiguity, strength rule, idempotency, invalid/destructive ops, partial-failure prevention, create_entity, snapshot+rollback).
- npm scripts: `data:patches:dry-run`, `data:patches:apply`, `data:rollback`, `data:audit-log`.

## Verification

15 engine tests + 534 total tests pass. End-to-end on real data: a sourced/
aliased patch applied, snapshot taken, audit chain intact, re-apply skipped
(idempotent), rollback restored `data/canonical/**` byte-identical to pre-apply.
