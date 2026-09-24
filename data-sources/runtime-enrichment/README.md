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

## Regression contract

`tests/runtime-enrichment.test.ts` validates every manifest-backed batch, verifies each digest before decoding, checks reviewed counts and cross-batch source/evidence identifiers, enforces the entity-context allowlist, verifies virtual-workbook growth, and prevents the medication batch from carrying publication/governance fields.
