# Enrichment Wave Target Proposals (Balanced)

- Generated at: 2026-03-31T11:46:29.370Z
- Deterministic model version: enrichment-wave-target-proposals-v2-balancing
- Selected profile: mixed-balanced
- Candidate count: 15

## Raw-score concentration audit
- Raw top-8 composition: herbs=8, compounds=0.
- Over-concentration is addressed by deterministic profile constraints and score adjustments (not by replacing base scoring).

## Selected profile composition
- mixed-balanced: total=7, herbs=5, compounds=2, safetyCritical=7, carryover=6

## Selected profile target list
| Order | Entity | Raw score | Adjustment | Final score | Inclusion basis |
| ---: | --- | ---: | ---: | ---: | --- |
| 1 | herb:calliandra-anomala | 269 | 35 | 304 | safety-override, topic:evidence-critical:+6, topic:mechanism-critical:+4, topic:safety-critical:+12, carryover-blocked:+9, stale:+4 |
| 2 | herb:alectra-sessiliflora | 265 | 35 | 300 | safety-override, topic:evidence-critical:+6, topic:mechanism-critical:+4, topic:safety-critical:+12, carryover-blocked:+9, stale:+4 |
| 3 | compound:luteolin | 216 | 33 | 249 | carryover-rescue-floor, type:compound:+4, topic:mechanism-critical:+4, topic:safety-critical:+12, carryover-blocked:+9, stale:+4 |
| 4 | compound:cbd | 214 | 33 | 247 | carryover-rescue-floor, type:compound:+4, topic:mechanism-critical:+4, topic:safety-critical:+12, carryover-blocked:+9, stale:+4 |
| 5 | herb:henbane | 255 | 29 | 284 | type-min-floor:herb, topic:mechanism-critical:+4, topic:safety-critical:+12, carryover-blocked:+9, stale:+4 |
| 6 | herb:anisoptera-thurifera | 240 | 26 | 266 | adjusted-score-rank, topic:evidence-critical:+6, topic:mechanism-critical:+4, topic:safety-critical:+12, stale:+4 |
| 7 | herb:mandrake-root | 233 | 29 | 262 | adjusted-score-rank, topic:mechanism-critical:+4, topic:safety-critical:+12, carryover-blocked:+9, stale:+4 |

## High-scoring exclusions caused by balancing
| Entity | Raw rank | Raw score | Final score | Exclusion reason |
| --- | ---: | ---: | ---: | --- |
| herb:rivea-corymbosa | 5 | 240 | 260 | Excluded by balancing policy after raw-score top set selection. |
| herb:ipomoea-tricolor-heavenly-blue | 6 | 236 | 256 | Excluded by balancing policy after raw-score top set selection. |
| herb:delosperma-cooperi | 7 | 234 | 260 | Excluded by balancing policy after raw-score top set selection. |

## Generated runner-ready target artifacts
- `ops/targets/enrichment-wave-mixed-balanced.json`
- `ops/targets/enrichment-wave-herb-heavy.json`
- `ops/targets/enrichment-wave-compound-heavy.json`
- `ops/targets/enrichment-wave-safety-priority-mixed.json`
- `ops/targets/enrichment-wave-carryover-rescue-mixed.json`
