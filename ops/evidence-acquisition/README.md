# Evidence Acquisition Reporting

Canonical report artifacts are written to:

- `ops/evidence-acquisition/reports/coverage-prioritization.latest.json`
- `ops/evidence-acquisition/reports/herb-priority-queue.latest.json`
- `ops/evidence-acquisition/reports/rejection-analysis.latest.json`
- `ops/evidence-acquisition/reports/coverage-prioritization.latest.md`

Timestamped history snapshots are written under:

- `ops/evidence-acquisition/reports/history/`

## Run the report

```bash
npm run enrichment:evidence:report
```

Optional:

- `--run-id <run_id>` to anchor the field-level breakdown to a specific run artifact.
- `--out-dir <path>` to write artifacts to an alternate output location.

The report reuses existing evidence acquisition run artifacts (`ops/evidence-acquisition/run_*.json`) and does not modify retrieval, extraction, normalization, or patch-application logic.
## Canonical source policy

For herb/compound enrichment prompts and field-level evidence hierarchy, use:

- `ops/enrichment-source-policy.md`

