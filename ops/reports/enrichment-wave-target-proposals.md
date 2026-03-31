# Enrichment Wave Target Proposals (Balanced)

- Generated at: 2026-03-31T12:12:58.574Z
- Deterministic model version: enrichment-wave-target-proposals-v2-balancing
- Selected profile: mixed-balanced
- Candidate count: 27

## Raw-score concentration audit
- Raw top-8 composition: herbs=8, compounds=0.
- Over-concentration is addressed by deterministic profile constraints and score adjustments (not by replacing base scoring).

## Selected profile composition
- mixed-balanced: total=8, herbs=5, compounds=3, safetyCritical=8, carryover=6

## Selected profile target list
| Order | Entity | Raw score | Adjustment | Final score | Inclusion basis |
| ---: | --- | ---: | ---: | ---: | --- |
| 1 | herb:calliandra-anomala | 269 | 35 | 304 | safety-override, topic:evidence-critical:+6, topic:mechanism-critical:+4, topic:safety-critical:+12, carryover-blocked:+9, stale:+4 |
| 2 | herb:alectra-sessiliflora | 265 | 35 | 300 | safety-override, topic:evidence-critical:+6, topic:mechanism-critical:+4, topic:safety-critical:+12, carryover-blocked:+9, stale:+4 |
| 3 | compound:luteolin | 216 | 33 | 249 | carryover-rescue-floor, type:compound:+4, topic:mechanism-critical:+4, topic:safety-critical:+12, carryover-blocked:+9, stale:+4 |
| 4 | compound:cbd | 214 | 33 | 247 | carryover-rescue-floor, type:compound:+4, topic:mechanism-critical:+4, topic:safety-critical:+12, carryover-blocked:+9, stale:+4 |
| 5 | herb:mandrake-root | 257 | 29 | 286 | type-min-floor:herb, topic:mechanism-critical:+4, topic:safety-critical:+12, carryover-blocked:+9, stale:+4 |
| 6 | compound:flavonoids | 210 | 30 | 240 | type-min-floor:compound, type:compound:+4, topic:evidence-critical:+6, topic:mechanism-critical:+4, topic:safety-critical:+12, stale:+4 |
| 7 | herb:henbane | 255 | 29 | 284 | adjusted-score-rank, topic:mechanism-critical:+4, topic:safety-critical:+12, carryover-blocked:+9, stale:+4 |
| 8 | herb:ipomoea-tricolor-heavenly-blue | 244 | 26 | 270 | adjusted-score-rank, topic:evidence-critical:+6, topic:mechanism-critical:+4, topic:safety-critical:+12, stale:+4 |

## High-scoring exclusions caused by balancing
| Entity | Raw rank | Raw score | Final score | Exclusion reason |
| --- | ---: | ---: | ---: | --- |
| herb:anisoptera-thurifera | 6 | 240 | 266 | Excluded by balancing policy after raw-score top set selection. |
| herb:rivea-corymbosa | 7 | 240 | 260 | Excluded by balancing policy after raw-score top set selection. |
| herb:delosperma-cooperi | 8 | 234 | 260 | Excluded by balancing policy after raw-score top set selection. |

## Generated runner-ready target artifacts
- `ops/targets/enrichment-wave-mixed-balanced.json`
- `ops/targets/enrichment-wave-herb-heavy.json`
- `ops/targets/enrichment-wave-compound-heavy.json`
- `ops/targets/enrichment-wave-safety-priority-mixed.json`
- `ops/targets/enrichment-wave-carryover-rescue-mixed.json`
