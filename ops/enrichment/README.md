# Enrichment pipeline state

Everything else in this directory is generated and disposable. It is rebuilt from
the canonical workbook by:

```bash
npm run enrich:scan
npm run enrich:index
```

| Path | What it is |
|------|------------|
| `queue.json` | Latest gap-scan snapshot (read-only view of the scan). |
| `jobs.json` | Persistent job ledger: status, attempts, claims, history, errors. |
| `candidates/` | Isolated candidate deltas, one file per job attempt. |
| `reports/` | Dry-run, import, and migration reports. |
| `exports/` | Review exports and the Excel view. |
| `research-index.json` | Local index of sources already cited by the site. |
| `readiness.json` | The G13 production-enrichment readiness record. Written by a human. |
| `.lock` | Directory lock held while the job ledger is being mutated. Safe to delete when no worker is running. |

Nothing here is canonical. The canonical source of truth is
`data-sources/herb_monograph_master.xlsx`, and the only way this pipeline can
change it is a reviewed patch in `data-sources/workbook-patches/`.

See `docs/enrichment-pipeline.md`.
