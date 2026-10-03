# Additive workbook research enrichment

This directory stores reviewed research enrichment as deterministic, manifest-backed additive ledgers. The canonical workbook remains authoritative for entity identity, slugs, publishing decisions, governance, safety gates, evidence grades, and other core profile fields.

The parser discovers dated `*-manifest.json` files in lexical order. Each manifest names one local ledger file and records its exact byte count and SHA-256 digest. A ledger may be plain JSON or gzip-compressed JSON; the parser verifies the bytes **before** decoding the payload and fails closed on missing, corrupt, or mismatched files.

Historical ledgers are immutable. New reviewed work lands as a new dated ledger + manifest instead of rewriting an older batch. The merged virtual workbook remains additive and deduplicated across canonical workbook rows and all ledger batches.

Ledgers may add evidence and source-provenance rows for existing entities, descriptive context fields from a strict allowlist, and herb → compound relationships only when both canonical entities already exist with the expected types. They cannot create entities, change slugs, alter publishing/governance fields, replace safety/contraindication/dose fields, or create live links to missing entities.

## Aug. 23 batch

- Ledger: `2026-08-23-enrichment.json.gz`
- 85 entity-context rows
- 308 evidence rows (306 net-new after canonical deduplication)
- 298 source rows (294 net-new after canonical deduplication)
- 152 relationship/context rows
- 41 relationships have canonical endpoints; 16 already exist, leaving 25 net-new live mappings
- 111 missing-target relationship candidates stay research-only and never become live links

`2026-08-23-manifest.json` records the reviewed counts, source-workbook provenance, deduplication policy, and ledger hash.

## Sep. 24 medication-anchor batch

- Ledger: `2026-09-24-medication-enrichment.json`
- Targets: `sertraline`, `fluoxetine`
- 4 evidence rows
- 4 source rows
- 0 entity-context rows
- 0 relationships
- Sources include current U.S. DailyMed prescribing information plus human randomized-trial syntheses.
- The batch is evidence-only: it contains no runtime-export, profile-status, robots, sitemap, indexability, governance, or monetization fields.

`2026-09-24-medication-manifest.json` records the exact source anchors, reviewed counts, append-only policy, and ledger hash.

## Sep. 24 medication sleep/stimulant batch

- Ledger: `2026-09-24-medication-sleep-stimulant-enrichment.json`
- Targets: `dextroamphetamine`, `zolpidem`
- 5 evidence rows
- 5 source rows
- 0 entity-context rows
- 0 relationships
- Dextroamphetamine evidence keeps adult narcolepsy guidance separate from current Schedule II label safety/provenance.
- Zolpidem evidence keeps short-term insomnia efficacy separate from boxed-warning and complex-sleep-behavior safety evidence.
- The batch is evidence-only and cannot carry publication/governance fields.

`2026-09-24-medication-sleep-stimulant-manifest.json` records the exact source anchors, reviewed counts, append-only policy, and ledger hash.

## Sep. 25 ADHD stimulant medication batch

- Ledger: `2026-09-25-medication-adhd-stimulant-enrichment.json`
- Targets: `lisdexamfetamine`, `methylphenidate`
- 8 evidence rows
- 6 source rows
- 0 entity-context rows
- 0 relationships
- Both canonical entities are Schedule II controlled-substance restricted-reference records and remain research-only / hidden-until-grounded / NOINDEX / outside sitemap.
- Evidence keeps molecule-specific lisdexamfetamine findings distinct from amphetamine-class synthesis and preserves age-group, cardiovascular, formulation, and follow-up-duration limitations.
- The batch is evidence-only and cannot carry publication/governance fields.

`2026-09-25-medication-adhd-stimulant-manifest.json` records the exact DailyMed and PubMed anchors, reviewed counts, append-only policy, and ledger hash.

## Sep. 25 antidepressant medication batch

- Ledger: `2026-09-25-medication-antidepressant-enrichment.json`
- Targets: `escitalopram`, `bupropion`
- 8 evidence rows
- 6 source rows (5 net-new after canonical source deduplication because PMID `29477251` is already registered)
- 0 entity-context rows
- 0 relationships
- Both canonical entities remain Evidence-Limited / research-only / hidden-until-grounded / NOINDEX / outside sitemap.
- Evidence preserves product/formulation boundaries for bupropion XL, pediatric versus adult indication boundaries for escitalopram, short-term trial limits, and the difference between comparative adverse-effect evidence and overall treatment choice.
- The batch is evidence-only and cannot carry publication/governance fields.

`2026-09-25-medication-antidepressant-manifest.json` records the exact DailyMed and PubMed anchors, reviewed counts, append-only policy, and ledger hash.

## Sep. 26 trazodone / hydroxyzine medication batch

- Ledger: `2026-09-26-medication-trazodone-hydroxyzine-enrichment.json`
- Targets: `trazodone`, `hydroxyzine`
- 8 evidence rows
- 8 source rows (7 net-new after canonical source deduplication because PMID `29477251` is already registered)
- 0 entity-context rows
- 0 relationships
- Both proposals remain Evidence-Limited / research-only / hidden-until-grounded; this batch stages governed evidence and does not promote indexing, sitemap inclusion, or monetization.
- Trazodone evidence keeps the approved major-depression indication distinct from off-label sleep evidence and preserves QT/cardiac, serotonin-syndrome, orthostatic, and priapism safety boundaries.
- Hydroxyzine evidence preserves the short-term GAD evidence ceiling, the label's unassessed >4-month antianxiety boundary, and QT/Torsade plus CNS-depressant safety context.
- The batch is evidence-only and cannot carry publication/governance fields.

`2026-09-26-medication-trazodone-hydroxyzine-manifest.json` records the exact DailyMed and PubMed anchors, reviewed counts, append-only policy, and ledger hash.

Canonical materialization receipt: the reviewed workbook and exact generator-owned compound runtime were applied together; both new medication records remain fail-closed and outside indexing/promotion.


## Sep. 27 buspirone / modafinil medication batch

- Ledger: `2026-09-27-medication-buspirone-modafinil-enrichment.json`
- Targets: `buspirone`, `modafinil`
- 8 evidence rows
- 8 source rows
- 0 entity-context rows
- 0 relationships
- Both proposals remain Evidence-Limited / research-only / hidden-until-grounded; this batch stages governed evidence and does not promote indexing, sitemap inclusion, or monetization.
- Buspirone evidence preserves molecule-vs-azapirone-class distinctions and the label's controlled long-term evidence ceiling beyond 3 to 4 weeks.
- Modafinil evidence preserves narcolepsy / OSA / shift-work indication boundaries, the OSA underlying-obstruction limitation, serious-rash/hypersensitivity and psychiatric warnings, contraceptive interaction context, and Schedule IV status.
- The batch is evidence-only and cannot carry publication/governance fields.

`2026-09-27-medication-buspirone-modafinil-manifest.json` records the exact DailyMed and PubMed anchors, reviewed counts, append-only policy, and ledger hash.

The workbook review workflow persists the exact generated `compounds.preview.json` beside the fail-closed review workbook and, on trusted same-repository `manual/*` PRs, materializes that reviewed workbook/runtime pair only when the branch still matches the exact validated head.

Canonical materialization receipt: the reviewed workbook and exact generator-owned compound runtime were applied together on this PR; `buspirone` and `modafinil` remain research-only, NOINDEX, outside sitemap inclusion, and non-monetized.

Canonical materialization receipt: PR #6022 committed the reviewed workbook and exact generated compound runtime together as `f15d6afd1bfc49a626be99f3f8ea72601b6481c6`; both new medication records remain research-only, NOINDEX, outside the sitemap, and unmonetized.

## Sep. 27 PMID 9809861 source-identity correction

- Ledger: `2026-09-27-source-identity-correction-enrichment.json`
- Corrects bibliographic metadata for PMID `9809861` / DOI `10.1007/s002130050731` without rewriting the immutable Sep. 26 ledger.
- The original identifier already pointed to the 244-patient hydroxyzine/buspirone/placebo trial, but its title and authors had been copied from a different hydroxyzine review.
- The correction is fail-closed: parser reconciliation requires the same source ID and identifier key plus an exact `expected_prior_identity` match before replacement.
- The historical ledger remains byte-for-byte immutable; only the merged virtual source record is corrected.

`2026-09-27-source-identity-correction-manifest.json` records the correction provenance, reviewed count, guard policy, and ledger hash.

## Oct. 2 research enrichment Waves 1–50

- Ledger: `2026-10-02-enrichment-waves-01-50.json`
- Manifest: `2026-10-02-enrichment-waves-01-50-manifest.json`
- 50 enrichment waves completed before repository-wide verification
- 123 unique evidence rows after deterministic last-revision dedupe
- 95 unique source rows after stable PMID/source-ID dedupe
- 0 entity-context rows
- 0 relationships
- Coverage spans sleep, stress/anxiety, cognition, exercise/performance, metabolic and cardiovascular biomarkers, GI, women's health, osteoarthritis, safety/interactions, retraction handling, and formulation/species identity.
- Null and mixed findings remain first-class evidence; studied exposures are not converted into consumer dosing; product, species, population, endpoint, and route boundaries are preserved.
- The batch is evidence-only and cannot alter publishing, indexing, recommendation, monetization, or governance state.
- Full repository validation is intentionally run once after consolidation rather than once per wave.

Tracking: enrichment batching `#6198`; 50-wave follow-on planning `#6200`; canonical citation-integrity repairs `#6197` (magnesium) and `#6201` (taurine/citrulline-malate).

## Oct. 2 fifty-wave enrichment program

- Wave 01 ledger: `2026-10-02-supplement-evidence-enrichment.json`
- Waves 02–50 ledger: `2026-10-02-enrichment-waves-02-50.json`
- Waves 02–50 manifest: `2026-10-02-enrichment-waves-02-50-manifest.json`
- 123 staged evidence rows across both Oct. 2 ledgers
- 95 unique staged source identities across both Oct. 2 ledgers
- 0 entity-context rows
- 0 relationships
- 0 publishing/indexing/recommendation/monetization changes
- Coverage spans sleep, stress/anxiety, cognition, safety/interactions, metabolic and cardiovascular biomarkers, performance, gastrointestinal outcomes, women's health, osteoarthritis, formulation/species identity, and citation-integrity safeguards.
- Null findings, mixed endpoints, retractions, low-certainty results, product-specific evidence, and population boundaries remain explicit rather than being filtered out.

The bulk ledger is hash-pinned at `b78a5876ef232d25b5591a50c3b5e94737372127d5d4c3821fc7b42aaa0c38cc`. Expensive repository-wide verification was intentionally deferred until the entire 50-wave batch was assembled.

## Regression contract

`tests/runtime-enrichment.test.ts` validates every manifest-backed batch, verifies each digest before decoding, checks reviewed counts, requires globally unique evidence record IDs, allows repeat source identities to deduplicate deterministically across batches, enforces the entity-context allowlist, verifies virtual-workbook growth, and prevents every medication batch from carrying publication/governance fields.
