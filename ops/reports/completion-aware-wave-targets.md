# Completion-Aware Enrichment Wave Targets

- Generated at: 2026-03-31T20:00:56.192Z
- Deterministic model version: completion-aware-wave-targets-v1
- Selected profile: balanced-completion

## Scoring inputs (deterministic)
- completionPercent
- criticalMissingFieldCount
- blockerSeverity
- retryExhausted
- manualReviewNeeded
- readyForNextStage

## Selected profile decisions
| Order | Entity | Raw | Completion adj | Blocker adj | Actionability adj | Final | Outcome |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | --- |
| 1 | herb:calliandra-anomala | 247 | -10.2 | -2.8000000000000007 | -12 | 232 | selected |
| 2 | herb:alectra-sessiliflora | 243 | -10.2 | -2.8000000000000007 | -12 | 228 | selected |
| 3 | herb:mandrake-root | 229 | -3.4 | -2.5 | -12 | 221.1 | selected |
| 4 | compound:luteolin | 188 | -3.4 | -2.5 | -12 | 180.1 | selected |
| 5 | compound:cbd | 186 | -3.4 | -2.5 | -12 | 178.1 | selected |
| 6 | compound:flavonoids | 200 | -10.2 | -9.9 | -12 | 167.9 | selected |
| 7 | herb:henbane | 227 | -3.4 | -2.5 | -12 | 219.1 | selected |
| 8 | herb:ipomoea-tricolor-heavenly-blue | 231 | -10.2 | -10.13 | -12 | 198.67 | selected |
| - | herb:anisoptera-thurifera | 227 | -10.2 | -10.13 | -12 | 194.67 | High-value entity omitted from this profile due to low actionability/manual-review burden. |
| - | herb:delosperma-cooperi | 221 | -10.2 | -10.13 | -12 | 188.67 | High-value entity omitted from this profile due to low actionability/manual-review burden. |
| - | herb:rivea-corymbosa | 218 | -3.4 | -10.2 | -12 | 192.4 | High-value entity omitted from this profile due to low actionability/manual-review burden. |
| - | herb:iresine-herbstii | 206 | -3.4 | -10.2 | -12 | 180.4 | High-value entity omitted from this profile due to low actionability/manual-review burden. |
| - | herb:jatropha-podagrica | 205 | -3.4 | -10.2 | -12 | 179.4 | High-value entity omitted from this profile due to low actionability/manual-review burden. |
| - | herb:pedicularis-groenlandica | 201 | -3.4 | -10.2 | -12 | 175.4 | High-value entity omitted from this profile due to low actionability/manual-review burden. |
| - | compound:quercetin | 199 | -10.2 | -9.9 | -12 | 166.9 | High-value entity omitted from this profile due to low actionability/manual-review burden. |
| - | compound:asarone | 197 | -10.2 | -9.9 | -12 | 164.9 | High-value entity omitted from this profile due to low actionability/manual-review burden. |

## High-value exclusions
- herb:anisoptera-thurifera (raw=227, final=194.67) -> High-value entity omitted from this profile due to low actionability/manual-review burden.
- herb:delosperma-cooperi (raw=221, final=188.67) -> High-value entity omitted from this profile due to low actionability/manual-review burden.
- herb:rivea-corymbosa (raw=218, final=192.4) -> High-value entity omitted from this profile due to low actionability/manual-review burden.
- herb:iresine-herbstii (raw=206, final=180.4) -> High-value entity omitted from this profile due to low actionability/manual-review burden.
- herb:jatropha-podagrica (raw=205, final=179.4) -> High-value entity omitted from this profile due to low actionability/manual-review burden.
- herb:pedicularis-groenlandica (raw=201, final=175.4) -> High-value entity omitted from this profile due to low actionability/manual-review burden.
- compound:quercetin (raw=199, final=166.9) -> High-value entity omitted from this profile due to low actionability/manual-review burden.
- compound:asarone (raw=197, final=164.9) -> High-value entity omitted from this profile due to low actionability/manual-review burden.
- compound:saponins (raw=196, final=163.9) -> High-value entity omitted from this profile due to low actionability/manual-review burden.
- compound:volatile-oils (raw=195, final=162.9) -> High-value entity omitted from this profile due to low actionability/manual-review burden.

## Runner-ready target artifacts
- `ops/targets/enrichment-wave-actionability.json`
- `ops/targets/enrichment-wave-blocker-rescue.json`
- `ops/targets/enrichment-wave-balanced-completion.json`
