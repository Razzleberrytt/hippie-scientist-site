# Additive workbook research enrichment

This directory stores the reviewed Aug. 23, 2026 enrichment as a deterministic gzip-compressed JSON ledger. The canonical workbook remains authoritative for entity identity, slugs, publishing decisions, governance, safety gates, evidence grades, and other core profile fields.

The ledger is applied only through the normal workbook parser and is deliberately additive. It may add evidence and source-provenance rows for existing entities, descriptive context fields from a strict allowlist, and herb → compound relationships only when both canonical entities already exist with the expected types. It cannot create entities, change slugs, alter publishing/governance fields, replace safety/contraindication/dose fields, or create live links to missing entities.

## Aug. 23 batch

- 85 entity-context rows
- 308 evidence rows (306 net-new after canonical deduplication)
- 298 source rows (294 net-new after canonical deduplication)
- 152 relationship/context rows
- 41 relationships have canonical endpoints; 16 already exist, leaving 25 net-new live mappings
- 111 missing-target relationship candidates stay research-only and never become live links

`2026-08-23-manifest.json` records the reviewed counts, source-workbook provenance, deduplication policy, and ledger hash. `tests/runtime-enrichment.test.ts` verifies counts, provenance linkage, the entity-field allowlist, canonical deduplication, and the exact virtual-workbook additions.
