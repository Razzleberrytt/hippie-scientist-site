# Enrichment Wave Target Proposals

- Generated at: 2026-03-31T11:31:56.079Z
- Deterministic model version: enrichment-wave-target-proposals-v1
- Candidates ranked: 15
- Recommended compact set: 8

## Inputs used
- `ops/reports/enrichment-workpacks.json`
- `ops/reports/source-gaps.json`
- `ops/reports/source-intake-queue.json`
- `ops/reports/source-wave-2-review.json`
- `ops/reports/enrichment-wave-2-blockers.json`
- `ops/reports/enrichment-wave-2-rollup.json`
- `ops/reports/enrichment-wave-1-targets.json`
- `ops/reports/enrichment-wave-2-targets.json`
- `ops/reports/enrichment-wave-2b-targets.json`
- `public/data/publication-manifest.json`

## Deterministic scoring rules
- Public/indexable status and workpack public priority are the base score.
- Critical gaps boost score in this order: safety > evidence > mechanism > constituent.
- Stale/review-due states and governance-fix buckets increase score.
- Publish-blocking/safety-critical source gaps and prior blocker signals increase score.
- Prior carryover and promotable-source likelihood adjust score with explicit weights.

## Recommended next-wave targets
| Rank | Entity | Score | Priority | Gap types | Carryover |
| --- | --- | ---: | --- | --- | --- |
| 1 | herb:calliandra-anomala | 269 | critical | evidence-critical, mechanism-critical, safety-critical | wave-2 |
| 2 | herb:alectra-sessiliflora | 265 | critical | evidence-critical, mechanism-critical, safety-critical | wave-2 |
| 3 | herb:henbane | 255 | critical | mechanism-critical, safety-critical | wave-2 |
| 4 | herb:anisoptera-thurifera | 240 | critical | evidence-critical, mechanism-critical, safety-critical | new |
| 5 | herb:rivea-corymbosa | 240 | critical | mechanism-critical, safety-critical | new |
| 6 | herb:ipomoea-tricolor-heavenly-blue | 236 | critical | mechanism-critical, safety-critical | new |
| 7 | herb:delosperma-cooperi | 234 | critical | evidence-critical, mechanism-critical, safety-critical | new |
| 8 | herb:mandrake-root | 233 | critical | mechanism-critical, safety-critical | wave-2, wave-2b |

## Output artifacts
- `ops/reports/enrichment-wave-target-proposals.json`: full ranked proposal model with explicit excluded reasons.
- `ops/targets/enrichment-wave-next.json`: compact recommended runner-ready target list.
- `ops/targets/enrichment-wave-carryover.json`: carryover rescue wave target list.
- `ops/targets/enrichment-wave-safety.json`: safety-priority runner-ready target list.
- `ops/targets/enrichment-wave-mechanism.json`: mechanism-priority runner-ready target list.

## Verification notes
- Every selected target appears in the ranked proposal output and in runner target format.
- Excluded items keep explicit excludedReason values in the proposal JSON.
- Stale/review-due and blocker signals are incorporated into the deterministic score components.
