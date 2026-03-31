# Enrichment Wave Target Balancing Profiles

- Generated at: 2026-03-31T11:46:29.370Z
- Deterministic model version: enrichment-wave-target-proposals-v2-balancing

## Profile composition summary
| Profile | Description | Total | Herbs | Compounds | Safety-critical | Carryover |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| mixed-balanced | Evenly balance herb/compound representation while preserving safety and stale carryover pressure. | 7 | 5 | 2 | 7 | 6 |
| herb-heavy | Favor herb throughput while preserving guaranteed compound slots and safety overrides. | 8 | 6 | 2 | 8 | 6 |
| compound-heavy | Favor compounds while preserving guaranteed herb slots and safety overrides. | 5 | 3 | 2 | 5 | 5 |
| safety-priority-mixed | Mixed entity distribution with explicit safety critical escalation. | 7 | 5 | 2 | 7 | 6 |
| carryover-rescue-mixed | Mixed distribution that reserves slots for stale/blocked carryover entities, especially compounds. | 7 | 5 | 2 | 7 | 6 |

## Verification checkpoints
- Raw vs final scores are available in `ops/reports/enrichment-wave-target-balancing.json` (per-profile decisions).
- Exclusion reasons are explicit for omitted high-scoring entities.
- Safety overrides and carryover-rescue floors are deterministic and profile-configured.
