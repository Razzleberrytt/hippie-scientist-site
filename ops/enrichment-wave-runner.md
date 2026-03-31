# Governed Enrichment Wave Runner (Wave-Agnostic)

Stable entry point:

- `npm run run:enrichment-wave -- --wave-id <wave-id> --targets <path> --mode <full|source-review|authoring|submission-review|rollup-refresh>`

Examples:

- `npm run run:enrichment-wave -- --wave-id wave-1 --targets ops/reports/enrichment-wave-1-targets.json --mode full`
- `npm run run:enrichment-wave -- --wave-id wave-2b --targets ops/reports/enrichment-wave-2b-targets.json --mode source-review`
- `npm run run:enrichment-wave -- --wave-id wave-3 --targets ops/reports/enrichment-wave-3-targets.json --mode full`

## Why this exists

This runner preserves the existing governed source/submission/rollup guardrails while removing wave-specific orchestration assumptions from execution.

It takes explicit wave + targets input, stages deterministic wave artifacts, then runs the same ordered governed phases.

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
  - stages `source-<wave-id>-targets.json` and `source-<wave-id>-candidates.json`
  - runs governed source review with wave-parameterized paths
- `authoring`
  - runs governed authoring pack + wave-specific authoring summary
- `submission-review`
  - runs governed submission review (no auto-approval)
- `rollup-refresh`
  - runs governed rollup refresh using wave-parameterized outputs
- `full`
  - strict order: source-review → authoring → submission-review → rollup-refresh

## Outputs

Per wave run:

- `ops/reports/source-<wave-id>-review.json`
- `ops/reports/enrichment-<wave-id>-authoring.json`
- `ops/reports/enrichment-<wave-id>-rollup.json`
- `ops/reports/enrichment-wave-runner-<wave-id>-summary.json`

Genericization metadata:

- `ops/reports/enrichment-wave-runner-genericization.json`

## Fail-closed behavior

The runner does not bypass governance checks.

If any phase fails, execution halts immediately and remaining phases are not run.

Use `--dry-run` to stage metadata and write deterministic summaries without phase commands.
