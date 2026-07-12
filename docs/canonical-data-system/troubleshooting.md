# Troubleshooting

## `data:canonical:validate` fails

- **Schema error** — the message names the record id, field path, and reason.
  Fix the offending line in `data/canonical/**/*.jsonl`.
- **Referential integrity** — a claim/edge points at a missing entity or source.
  Either add the missing record or fix the id. Common after a hand edit that
  renamed an id without updating references.
- **Duplicate id** — two records share an id; one is a stray copy.

## A patch is rejected

Check `data/patches/rejected/<patch_id>.json` → `_rejection.reason`:

- *ambiguous target* — the slug/name matched multiple entities. Add
  `entity_type` to the target, or target by `id`.
- *target not resolvable* — no matching id/slug/name/alias. Fix the target or add
  a `create_entity` op.
- *weaker_overwrite conflict* — refusing to overwrite a sourced field with
  unsourced data. Add a source to the patch, or pass `--force` if intentional.
- *destructive_blocked / merge_requires_approval* — pass `--allow-destructive`
  for `deprecate`; `merge_candidates` must be handled manually.

## A patch normalizes but does nothing on apply

It was likely already applied (idempotent skip — check
`data/patches/applied/`), or every operation was a no-op (alias already present,
claim already exists, value unchanged).

## `validate:generated-freshness` fails ("STALE")

The committed `data/generated/site/*.json` is out of date. Run
`npm run data:export` and commit the result.

## `node:sqlite` errors

- *Experimental warning* — harmless; `node:sqlite` is stable enough for
  build-time use and prints an experimental notice.
- *Cannot bundle "node:sqlite"* under Vitest — only import it from node scripts,
  not from files transformed by Vite's jsdom environment. `graph.mjs` imports it
  lazily with `@vite-ignore`; follow that pattern for new graph code.
- Requires Node ≥ 22 (see `.nvmrc` / `engines`).

## Migration counts don't match the workbook

Expected — see `docs/canonical-data-system/reports/migration-latest.json`
→ `discrepancy_explanations`. Deltas come from deterministic dedup (duplicate
citations/edges/claims) and unmatched subject slugs, all itemized.

## The site build broke after data changes

The live site still reads workbook-generated `public/data`, not
`data/canonical`. If `npm run build` fails, it's unrelated to the canonical
system unless you have explicitly switched the export. Roll back with
`npm run data:rollback` if a bad apply is involved.
