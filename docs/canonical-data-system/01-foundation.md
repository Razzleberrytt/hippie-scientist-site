# Canonical Data Foundation (Phase 2)

> Status: **implemented**. Empty foundation — no workbook data migrated yet.

This phase builds the Git-diffable canonical data layer, its Zod schemas, and a
generated SQLite database, plus the npm scripts and tests that exercise them.
The canonical JSONL files are the source of truth; SQLite is a disposable,
rebuildable analytics/query artifact; nothing here requires a hosted database or
a runtime database on Cloudflare Pages.

## Files created

| Path | Purpose |
|---|---|
| `data/canonical/entities/` | `<type>.jsonl` per entity type (herb, compound, effect, condition, mechanism, study, source, safety_issue, drug_interaction, preparation). |
| `data/canonical/claims/claims.jsonl` | Factual claims (subject → predicate → object/literal). |
| `data/canonical/relationships/edges.jsonl` | Graph edges. |
| `data/canonical/sources/sources.jsonl` | Citations / studies as source records. |
| `data/patches/{inbox,normalized,applied,rejected}/` | Patch lifecycle dirs (Phases 4–5). |
| `data/{generated,staging,snapshots,db}/` | Disposable outputs (gitignored). |
| `data/{schema,audit}/` | Schema mirrors + immutable audit log (committed). |
| `config/field-aliases.json` | Configurable patch field-alias map. |
| `scripts/data/canonical/paths.mjs` | Central filesystem layout. |
| `scripts/data/canonical/ids.mjs` | Deterministic ID + content hashing. |
| `scripts/data/canonical/jsonl.mjs` | Deterministic JSONL/JSON read/write. |
| `scripts/data/canonical/schema.mjs` | Zod schemas: entity, claim, edge, source, normalized patch. |
| `scripts/data/canonical/store.mjs` | Load/write the canonical dataset. |
| `scripts/data/canonical/field-aliases.mjs` | Alias config loader + resolver. |
| `scripts/data/validate-canonical.mjs` | Schema + referential-integrity validation. |
| `scripts/data/build-sqlite.mjs` | Rebuild `data/db/canonical.sqlite` from JSONL via `node:sqlite`. |
| `scripts/data/export-site-data.mjs` | Sample/summary export (extended in Phase 6). |
| `scripts/data/check-canonical.mjs` | One-shot gate: validate → build-db → export. |
| `scripts/data/canonical/__tests__/foundation.test.mjs` | 19 unit tests. |

## npm scripts

```bash
npm run data:canonical:validate   # Zod + referential integrity over data/canonical/**
npm run data:build-db             # rebuild data/db/canonical.sqlite from JSONL
npm run data:export               # export sample/summary to data/generated/
npm run data:check                # validate → build-db → export (CI-friendly, exit codes)
```

> The existing `data:validate` (workbook-based) is intentionally left untouched;
> the canonical validator is namespaced `data:canonical:validate` to avoid
> colliding with it during migration.

## Design decisions

- **Built-in `node:sqlite`** (Node ≥ 22) — no native `better-sqlite3` dependency,
  no compile step, no hosted service. The DB is rebuilt from scratch on every
  `data:build-db` and is gitignored, so the JSONL files are never the only copy.
- **Deterministic everything** — IDs are `sha256`-derived from normalized seeds;
  JSONL is written with sorted keys and records sorted by `id`; the exporter
  emits no wall-clock timestamps. Re-running produces byte-identical output when
  inputs are unchanged (idempotency + clean Git diffs).
- **Strict envelope, open payload** — every record shares a validated envelope
  (id, type, timestamps, provenance) while type-specific fields live in an open
  `data` object and anything unmapped is preserved in `legacy` (never discarded).
- **Referential integrity** is checked at validate time: unique ids, claim/edge
  endpoints must resolve, claim `source_ids` must resolve.

## Verification

`npm run data:check` passes on the empty dataset; `npx vitest run
scripts/data/canonical/__tests__/foundation.test.mjs` → 19/19; full `typecheck`,
`lint`, `vitest run` (491 tests) and the production build all pass with these
additions.
