# Compound Quality Gate Audit

Date: 2026-03-28

## Scope

Audit focused on compound detail route indexability as implemented by `scripts/quality-gate-data.mjs` and current `public/data/compounds.json`.

## Current threshold rules

From the quality-gate script:

- `minDescriptionLength = 60`
- `minSources = 2`
- `minEffects = 1`
- `minCompletenessScore = 10`
- `minSlugLength = 2`

Compound record must satisfy all of the following to be indexable:

1. valid name/slug
2. usable narrative (`description`/`summary`/`mechanism`) with length >= 60 and no placeholder/nan text
3. no placeholder text anywhere in inspected text fields
4. no nan artifacts anywhere in inspected text fields
5. at least 1 non-placeholder, non-nan effect
6. evidence gate: `sourceCount >= 2` OR `completenessScore >= 10`

Scoring used by completeness gate:

- `sourceCount * 3`
- `+ effectCount`
- `+ 2` if mechanism present
- `+ 2` if usable narrative present
- `+ 1` if contraindications present

## Observed result (current data)

- total compounds: **393**
- indexable compounds: **0**
- excluded compounds: **393**

## Exclusion counts by reason

Counts are not mutually exclusive (one record can contribute to multiple reasons):

- `weakDescription`: **393**
- `insufficientEvidenceOrCompleteness`: **296**
- `placeholderText`: **222**
- `nanArtifacts`: **86**
- `insufficientEffects`: **52**
- `invalidNameOrSlug`: **11**

## Top 25 compounds that nearly passed

Sorted by fewest failing rules, then highest completeness score.

| #   | slug                              | sourceCount | missing fields                                      | failing rules                    |
| --- | --------------------------------- | ----------: | --------------------------------------------------- | -------------------------------- |
| 1   | limonene                          |           0 | usableDescription, sources(<2)                      | weakDescription                  |
| 2   | ephedrine                         |           0 | usableDescription, sources(<2)                      | weakDescription                  |
| 3   | harmalol                          |           0 | usableDescription, sources(<2)                      | weakDescription                  |
| 4   | mesembrenol                       |           0 | usableDescription, sources(<2)                      | weakDescription                  |
| 5   | mesembrenone                      |           0 | usableDescription, sources(<2)                      | weakDescription                  |
| 6   | tetrahydroharmine-beta-carbolines |           0 | usableDescription, sources(<2)                      | weakDescription                  |
| 7   | nmt                               |           0 | usableDescription, sources(<2)                      | weakDescription                  |
| 8   | alkylamides                       |           0 | usableDescription, sources(<2)                      | weakDescription                  |
| 9   | coumarins                         |           0 | usableDescription, sources(<2)                      | weakDescription                  |
| 10  | gallic-acid                       |           0 | usableDescription, sources(<2)                      | weakDescription                  |
| 11  | spilanthol                        |           0 | usableDescription, sources(<2)                      | weakDescription                  |
| 12  | luteolin                          |           0 | usableDescription, sources(<2)                      | weakDescription                  |
| 13  | nepetaefolin                      |           0 | usableDescription, sources(<2)                      | weakDescription                  |
| 14  | theophylline                      |           0 | usableDescription, sources(<2)                      | weakDescription                  |
| 15  | eugenol                           |           0 | usableDescription, sources(<2), placeholderFreeText | weakDescription, placeholderText |
| 16  | cineole                           |           0 | usableDescription, sources(<2), placeholderFreeText | weakDescription, placeholderText |
| 17  | atropine                          |           0 | usableDescription, sources(<2), placeholderFreeText | weakDescription, placeholderText |
| 18  | hyoscyamine                       |           0 | usableDescription, sources(<2), placeholderFreeText | weakDescription, placeholderText |
| 19  | scopolamine                       |           0 | usableDescription, sources(<2), placeholderFreeText | weakDescription, placeholderText |
| 20  | sesquiterpenes                    |           0 | usableDescription, sources(<2), placeholderFreeText | weakDescription, placeholderText |
| 21  | nuciferine                        |           0 | usableDescription, sources(<2), placeholderFreeText | weakDescription, placeholderText |
| 22  | thujone                           |           0 | usableDescription, sources(<2), placeholderFreeText | weakDescription, placeholderText |
| 23  | camphor                           |           0 | usableDescription, sources(<2), placeholderFreeText | weakDescription, placeholderText |
| 24  | apigenin                          |           0 | usableDescription, sources(<2), placeholderFreeText | weakDescription, placeholderText |
| 25  | aporphine                         |           0 | usableDescription, sources(<2), placeholderFreeText | weakDescription, placeholderText |

## Threshold sensitivity checks

Checked small changes without changing sanitization patterns:

- Lower `minDescriptionLength` from 60 -> 50: **still 0 indexable**
- Lower `minSources` from 2 -> 1: **still 0 indexable**
- Remove description requirement but keep other guards: **14 would pass**, but all 14 have `sourceCount=0` and no narrative field, so confidence is weak
- Remove both description requirement and source requirement: **168 would pass** (too permissive)

## Candidate compounds that could safely become indexable

No clearly safe candidates under small threshold-only relaxation.

Reason: the near-pass set is dominated by records with no usable narrative and effectively no counted sources. Admitting them via threshold relaxation would mostly allow sparse/inference-prone pages.

## Recommendation

**Keep current thresholds as-is** for compounds.

Rationale:

- 0 indexable is currently consistent with data quality in `public/data/compounds.json` under present guardrails.
- The bottleneck is not just strictness; it is missing narrative + missing usable sources across compound records.
- Small threshold-only changes (`minDescriptionLength` or `minSources`) do not produce safe wins.

Practical next step (data-side, not threshold-side):

1. backfill real narrative (`description` or `mechanism`) for a seed set of compounds
2. ensure `sources` include usable `url` or `title` values
3. rerun quality gate and re-evaluate whether threshold relaxation is needed
