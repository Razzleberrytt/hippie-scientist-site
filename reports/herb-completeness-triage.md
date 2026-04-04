# Herb Completeness & Usefulness Triage

Generated: 2026-04-04T01:44:11.880Z

## Scope
- public/data/herbs.json
- public/data/herbs-detail/*.json
- reports/data-audit-report.json
- reports/data-audit-report.md

## Weighted completeness model

Total possible score: **144** points.

### Core user-usefulness fields
- slug: 10
- name: 10
- summaryOrDescription: 16
- effects: 16
- mechanism: 14
- safetyNotes: 14
- interactions: 12

### Secondary useful fields
- dosage: 7
- preparation: 5
- region: 4
- activeCompounds: 8

### Supporting trust/context fields
- class: 4
- legalStatus: 5
- traditionalUse: 4
- sourcesTitle: 5
- sourcesUrl: 10

Tier thresholds:
- TIER_1_READY: >= 80
- TIER_2_NEAR_READY: 60–79.9
- TIER_3_THIN: 35–59.9
- TIER_4_STUB: < 35

## Tier distribution
- TIER_1_READY: **135**
- TIER_2_NEAR_READY: **529**
- TIER_3_THIN: **35**
- TIER_4_STUB: **0**

## Top missing fields by weighted product impact
| Field | Missing % | Weight | Impact points | Recoverable missing | Genuinely absent |
|---|---:|---:|---:|---:|---:|
| sourcesUrl | 99.1% | 10 | 6930 | 0 | 693 |
| interactions | 80% | 12 | 6708 | 2 | 557 |
| activeCompounds | 73.7% | 8 | 4120 | 0 | 515 |
| class | 79.5% | 4 | 2224 | 0 | 556 |
| safetyNotes | 20.3% | 14 | 1988 | 0 | 142 |
| sourcesTitle | 35.2% | 5 | 1230 | 0 | 246 |
| dosage | 20.3% | 7 | 994 | 0 | 142 |
| legalStatus | 6.7% | 5 | 235 | 0 | 47 |

## Fields mostly internally recoverable
- interactions (recoverable share: 0.4%, missing: 559)
- sourcesUrl (recoverable share: 0%, missing: 693)
- activeCompounds (recoverable share: 0%, missing: 515)
- class (recoverable share: 0%, missing: 556)
- safetyNotes (recoverable share: 0%, missing: 142)
- sourcesTitle (recoverable share: 0%, missing: 246)
- dosage (recoverable share: 0%, missing: 142)
- legalStatus (recoverable share: 0%, missing: 47)

## Fields mostly genuinely absent
- sourcesUrl (recoverable share: 0%, missing: 693)
- activeCompounds (recoverable share: 0%, missing: 515)
- class (recoverable share: 0%, missing: 556)
- safetyNotes (recoverable share: 0%, missing: 142)
- sourcesTitle (recoverable share: 0%, missing: 246)
- dosage (recoverable share: 0%, missing: 142)
- legalStatus (recoverable share: 0%, missing: 47)
- traditionalUse (recoverable share: 0%, missing: 22)

## Strongest predictors that a record feels useful
(Using mean completeness lift when field is present vs absent.)
- slug: +75.6 points (Tier1/2 present: 95%, absent: 0%)
- name: +75.6 points (Tier1/2 present: 95%, absent: 0%)
- summaryOrDescription: +75.6 points (Tier1/2 present: 95%, absent: 0%)
- effects: +75.6 points (Tier1/2 present: 95%, absent: 0%)
- mechanism: +75.6 points (Tier1/2 present: 95%, absent: 0%)

## Explicit answers
1. **Is the site feeling empty mainly due to a few critical missing fields, or too many fundamentally thin herbs?**
   - Primarily driven by critical field gaps across many herbs.
2. **Which exact fields most strongly predict usefulness?**
   - slug, name, summaryOrDescription, effects, mechanism

## Operational recommendation
- **Single best next cleanup pass:** Run a targeted safety+evidence pass on the Core 50: fill mechanism, safetyNotes, interactions, and at least one valid sources.url per herb.
- **Single worst time-wasting pass:** Alphabet-wide low-weight cleanup (e.g., region/preparation/class touch-ups) without fixing core safety/evidence fields first.
- **Continue alphabet-wide validator cleanup?** No — switch to tier-based completion on Core 50/100 and gate progress on weighted usefulness improvements.

## Prioritized subsets
- Recommended Core 50 (next pass): see `recommendedCore50` in JSON output.
- Recommended Core 100 (after Core 50): see `recommendedCore100` in JSON output.

## Top 100 highest / lowest scoring
- Included in JSON output as `top100Highest` and `top100Lowest`.
