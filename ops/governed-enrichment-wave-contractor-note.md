# Contractor Note: Running Arbitrary Governed Enrichment Waves

Use the single stable CLI:

```bash
npm run run:enrichment-wave -- --wave-id <wave-id> --targets <targets-json-path> --mode <full|source-review|authoring|submission-review|rollup-refresh>
```

Recommended dry run first:

```bash
npm run run:enrichment-wave -- --wave-id wave-3 --targets ops/reports/enrichment-wave-3-targets.json --mode full --dry-run
```

Then run without `--dry-run` when ready.

## Rules that did NOT change

- No automatic source approval.
- No automatic submission approval.
- Rejected / revision-requested / blocked submissions remain excluded from governed public artifacts.
- Any invalid inputs or phase failures stop execution (fail closed).

## Wave-aware file naming

- staged targets: `ops/reports/source-<wave-id>-targets.json`
- staged candidates: `ops/reports/source-<wave-id>-candidates.json`
- source review: `ops/reports/source-<wave-id>-review.json`
- authoring summary: `ops/reports/enrichment-<wave-id>-authoring.json`
- rollup report: `ops/reports/enrichment-<wave-id>-rollup.json`
- run summary: `ops/reports/enrichment-wave-runner-<wave-id>-summary.json`
