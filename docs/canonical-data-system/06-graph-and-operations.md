# Semantic Graph & Operations (Phase 7)

> Status: **implemented**. Graph queries, CLI tools, exports, CI, and docs.

## Graph capabilities (SQLite, no hosted graph DB)

`npm run data:build-db` builds `data/db/canonical.sqlite` with indexes and these
query views:

| View | Answers |
|---|---|
| `v_herb_compounds` | herbs containing a compound |
| `v_entity_effects` | compounds/herbs associated with an effect |
| `v_herbs_sharing_compound` | herbs sharing compounds |
| `v_shared_mechanism` | entities linked through shared mechanisms/pathways |
| `v_multi_effect_compounds` | compounds connected to multiple effects/goals |
| `v_shared_safety` | safety warnings shared across entities |
| `v_conflicting_claims` | conflicting dosage/safety/contraindication claims |
| `v_weak_claims` | weakly-sourced / low-evidence claims |
| `v_entity_degree`, `v_highly_connected` | most-connected entities |
| `v_isolated_entities` | orphans (no relationships) |
| `v_duplicate_candidates` | potential duplicate entities |

## Query & report CLIs

```bash
npm run data:query -- --list                              # list named queries
npm run data:query -- compounds-in-herb --arg ashwagandha
npm run data:query -- --sql "SELECT entity_type, COUNT(*) FROM entities GROUP BY 1"  # read-only
npm run data:graph-report      # graph health summary → data/generated/reports/graph-report.json
npm run data:gaps              # isolated entities, weak claims, suggested edges
npm run data:orphans           # isolated entities by type
npm run data:conflicts         # conflicting claims + duplicate candidates
npm run data:export-graph      # nodes.jsonl + edges.jsonl + graph.graphml
```

`--sql` accepts only a single read-only `SELECT`/`WITH` (writes and
multi-statements are rejected).

## Relationship honesty: explicit / derived / suggested

Edges carry an `origin`:

- **explicit** — asserted/sourced in canonical data (from workbook or a patch).
- **derived** — deterministically computed (reserved for future derivations).
- **suggested** — INFERRED (e.g. two herbs share ≥3 compounds but have no direct
  edge). Suggested edges are **never** written into canonical data, are exported
  only in `data/generated/graph/edges.jsonl` tagged `origin: suggested`, and
  every one carries a human-readable `explanation`. The schema enforces that a
  `suggested` edge must have an explanation.

## Graph export formats

`data/generated/graph/`: `nodes.jsonl`, `edges.jsonl` (explicit + suggested,
tagged), and `graph.graphml` (standard interchange for Gephi/Cytoscape/etc.).

## CI

`npm run data:ci` (validate canonical → build SQLite → graph smoke → export →
freshness) runs in `.github/workflows/ci.yml` on every PR/push, alongside the
existing lint/typecheck/test/build gate.

## Files created

- Graph views in `scripts/data/build-sqlite.mjs`.
- `scripts/data/canonical/graph.mjs` — query registry + suggested-edge inference.
- CLIs: `query.mjs`, `graph-report.mjs`, `gaps.mjs`, `orphans.mjs`, `conflicts.mjs`, `export-graph.mjs`.
- `scripts/data/canonical/__tests__/graph.test.mjs` (unit) + `graph-smoke.mjs` (node smoke).
- npm scripts: `data:query`, `data:graph-report`, `data:gaps`, `data:orphans`, `data:conflicts`, `data:export-graph`, `data:ci`.
- CI step in `.github/workflows/ci.yml`.
- Example patches in `data/patches/inbox/examples/`.
