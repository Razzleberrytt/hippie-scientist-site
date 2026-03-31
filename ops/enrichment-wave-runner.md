# Governed Enrichment Wave Runner

Stable entry point:

- `npm run run:enrichment-wave -- --targets <path> --mode <full|source-review|authoring|submission-review|rollup-refresh>`

## Why this exists

This runner reduces manual script chaining for enrichment waves while preserving governance controls already enforced by existing source/submission/rollup validation scripts.

It requires a declared target artifact and stages deterministic wave inputs from that artifact before executing phases.

## Required input

A targets JSON file with a top-level `targets` array:

```json
{
  "generatedAt": "2026-03-31T12:00:00.000Z",
  "deterministicModelVersion": "example-wave-v1",
  "targets": [
    {
      "entityType": "herb",
      "entitySlug": "henbane",
      "selectionWhy": "Carryover unresolved safety gaps",
      "highestPriorityMissingTopics": ["safety", "evidence"],
      "criticality": ["safety-critical"]
    }
  ]
}
```

## Phase behavior

- `source-review`
  - stages target/candidate wave artifacts
  - runs `npm run report:source-wave-2-review`
- `authoring`
  - runs `npm run report:enrichment-authoring-packs`
- `submission-review`
  - runs `npm run report:enrichment-submission-review`
- `rollup-refresh`
  - runs `node scripts/report-enrichment-wave-2-rollup.mjs`
- `full`
  - runs phases in strict order:
    1. source-review
    2. authoring
    3. submission-review
    4. rollup-refresh

## Output report

Each run writes:

- `ops/reports/enrichment-wave-runner-summary.json`

The summary includes:

- selected targets
- phases run and order
- approved/prompted source counts from source review
- promoted enrichment submission counts
- before/after governed coverage deltas
- unresolved critical gaps and blocker reasons

## Fail-closed behavior

The runner does not bypass existing governance scripts.

If any phase command fails, execution stops immediately and no remaining phases are run.

Use `--dry-run` to stage targets and emit a deterministic summary without executing phase commands.
