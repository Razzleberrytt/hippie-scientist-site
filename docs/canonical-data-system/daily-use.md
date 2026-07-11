# Daily-Use Guide

Everyday workflows for the canonical data system.

## 1. Apply enrichment patches from a GPT

1. Drop the GPT's output file into `data/patches/inbox/` (JSON, JSONL, YAML,
   CSV, or Markdown — see `data/patches/inbox/examples/` for accepted shapes).
2. Normalize: `npm run data:normalize-inbox`.
3. Review what will happen: `npm run data:review-patches`.
4. Preview the exact diff: `npm run data:patches:dry-run`.
5. If the diff looks right: `npm run data:patches:apply`.
   - A snapshot is taken automatically before anything is written.
   - Applied patches move to `data/patches/applied/`; rejected ones to
     `data/patches/rejected/` with a reason.
6. Commit the changed `data/canonical/**` files (and the audit log).

Flags: `--force` (allow overwriting sourced fields), `--allow-destructive`
(permit `deprecate`). `merge_candidates` is never auto-applied.

## 2. Edit data by hand

Edit the relevant `data/canonical/**/*.jsonl` line, then:

```bash
npm run data:canonical:validate   # confirm it still validates
npm run data:build-db             # refresh the SQLite DB
```

For structured/bulk changes prefer a patch (audited + reversible) over hand edits.

## 3. Re-run the workbook migration (idempotent)

```bash
npm run data:migrate-workbook -- --dry-run          # inspect reconciliation + reports
npm run data:migrate-workbook -- --write --promote  # re-stage + promote
```

Unchanged rows keep their IDs (deterministic), so this is safe to repeat.

## 4. Explore the graph

```bash
npm run data:query -- --list
npm run data:query -- compounds-in-herb --arg ashwagandha
npm run data:graph-report
npm run data:gaps          # where relationships/sources are missing
npm run data:conflicts     # contradictory claims + duplicate candidates
npm run data:export-graph  # portable nodes/edges/GraphML
```

## 5. Refresh site data + check parity

```bash
npm run data:export                  # canonical → data/generated/site/*.json
npm run data:compare-site            # diff vs live public/data
npm run validate:generated-freshness # ensure the committed export is current
```

## 6. Before committing

```bash
npm run data:ci      # validate + SQLite + graph smoke + export + freshness
npm run lint && npm run typecheck && npm run test
```
