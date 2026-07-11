# Recovery & Rollback

## Snapshots

Every `npm run data:patches:apply` first writes a timestamped snapshot of
`data/canonical/**` to `data/snapshots/<timestamp>_pre-apply/`. Snapshots are
local (gitignored).

```bash
npm run data:rollback -- --list      # show available snapshots
npm run data:rollback                # restore the LATEST snapshot + rebuild SQLite
npm run data:rollback -- --to 2026-07-11T12-45-58-761Z_pre-apply
```

Rollback replaces `data/canonical/**` with the snapshot's contents, rebuilds the
SQLite DB, and records a `rollback` entry in the audit log.

## Audit log

`data/audit/audit-log.jsonl` is append-only and hash-chained (each entry
references the previous entry's hash). Verify integrity:

```bash
npm run data:audit-log     # prints entries; exits non-zero if the chain is broken
```

Every apply and rollback is recorded with the snapshot name and the
applied/rejected patch ids, so any change is traceable and reversible.

## Rebuild everything from canonical JSONL

The JSONL files are the source of truth; all other artifacts are disposable.

```bash
npm run data:build-db      # rebuild data/db/canonical.sqlite
npm run data:export        # rebuild data/generated/site/*.json
npm run data:export-graph  # rebuild data/generated/graph/*
```

## Rebuild canonical from the workbook

If canonical data is lost or corrupted, re-derive it from the workbook (the
migration is idempotent, so ids are stable):

```bash
npm run data:migrate-workbook -- --write --promote
npm run data:check
```

## Recover from a bad hand edit

1. If uncommitted: `git checkout -- data/canonical/`.
2. If committed but a snapshot predates it: `npm run data:rollback -- --to <snapshot>`.
3. Otherwise re-run the workbook migration and re-apply any patches from
   `data/patches/applied/`.

## Disaster recovery order

1. `git` history of `data/canonical/**` (primary — it is committed).
2. `data/snapshots/**` (recent pre-apply copies).
3. `data/patches/applied/**` (re-applyable patch record).
4. `data-sources/herb_monograph_master.xlsx` via `data:migrate-workbook`.
