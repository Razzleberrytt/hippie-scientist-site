# Canonical Data System

A Git-friendly, database-free data platform for The Hippie Scientist: canonical
JSONL source of truth, a generated SQLite database for querying/graph analysis, a
multi-format GPT patch inbox with transactional application, and an export
adapter to the existing Next.js static site — all with no hosted database and no
runtime database on Cloudflare Pages.

## Architecture at a glance

```
data-sources/herb_monograph_master.xlsx      (legacy source; migration input only)
        │  migrate-workbook (idempotent, provenance-preserving)
        ▼
data/canonical/**  ── JSONL source of truth (entities, claims, edges, sources)
        │                    ▲
        │  patches           │ apply (dry-run → snapshot → validate → commit → audit)
        │                    │
        │            data/patches/{inbox,normalized,applied,rejected}
        │
        ├── build-sqlite ──▶ data/db/canonical.sqlite   (queries + graph views; disposable)
        └── export-site ──▶ data/generated/site/*.json  (site record shape; shadow of public/data)
                                     │
                                     ▼  (once parity closes)
                             public/data → next build → Cloudflare Pages (static)
```

- **Canonical JSONL** is the only source of truth. SQLite and generated JSON are
  rebuildable and never the sole copy.
- **Deterministic** everywhere: hashed IDs, sorted keys, no wall-clock
  timestamps → clean diffs and idempotent reruns.
- **Cloudflare-safe**: SQLite + workbook are build-time only; the site ships
  static JSON exactly as today.

## Phase docs

| Doc | Contents |
|---|---|
| `00-audit-and-plan.md` | Repository audit + full implementation plan. |
| `01-foundation.md` | Schemas, JSONL store, SQLite build (Phase 2). |
| `02-workbook-migration.md` | Workbook → canonical migration (Phase 3). |
| `03-patch-normalization.md` | Multi-format GPT patch normalization (Phase 4). |
| `04-patch-application.md` | Transactional apply, snapshots, rollback, audit (Phase 5). |
| `05-site-integration.md` | Export adapter + comparison report (Phase 6). |
| `06-graph-and-operations.md` | Graph views, query CLIs, exports, CI (Phase 7). |
| `daily-use.md` | Day-to-day commands. |
| `troubleshooting.md` | Common failures and fixes. |
| `recovery.md` | Snapshots, rollback, rebuild-from-scratch. |

## Command index

```bash
# Migration
npm run data:migrate-workbook -- --dry-run          # inspect
npm run data:migrate-workbook -- --write --promote  # stage + promote to canonical

# Foundation / validation
npm run data:canonical:validate   # Zod + referential integrity
npm run data:build-db             # rebuild SQLite from JSONL
npm run data:export               # canonical → site-shaped JSON
npm run data:check                # validate + build-db + export
npm run data:ci                   # full CI gate (adds graph smoke + freshness)

# Patches
npm run data:normalize-inbox      # normalize data/patches/inbox/**
npm run data:review-patches       # summarize normalized patches
npm run data:patches:dry-run      # plan a diff, commit nothing
npm run data:patches:apply        # snapshot + apply + validate + audit
npm run data:rollback             # restore latest snapshot
npm run data:audit-log            # print + verify audit hash chain

# Graph
npm run data:query -- --list
npm run data:graph-report
npm run data:gaps
npm run data:orphans
npm run data:conflicts
npm run data:export-graph

# Site comparison
npm run data:compare-site
npm run validate:generated-freshness
```

## Current status

- Canonical data populated from the workbook: **1624 entities** (293 herbs, 588
  compounds, 223 effects, 520 studies), **572 claims**, **2819 edges**, **479
  sources** — all schema-valid.
- Site export matches live `public/data` **exactly** — slugs, names, and all 22
  tracked derived fields (mechanisms, indexability, robots, visibility,
  regulatory, affiliate, summary) with **zero value mismatches** (herbs 291/291,
  compounds 565/565). The workbook path is kept as a fallback; switching the site
  to canonical-sourced data is now a safe mechanical change — see
  `05-site-integration.md`.
