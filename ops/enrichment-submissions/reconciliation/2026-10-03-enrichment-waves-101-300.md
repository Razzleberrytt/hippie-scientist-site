# Research enrichment Waves 101–300 — consolidated 200-finding run

## Result

Eight 25-finding passes are complete: **200 / 200** waves, numbered consecutively from 101 through 300.

### Authoring disposition

- `reviewed_receipt_pending_source_specific_materialization`: **37**
- `review_ready_for_materialization`: **146**
- `research_only_combination_firewall`: **6**
- `research_only_no_canonical_promotion`: **1**
- `research_only_product_level`: **4**
- `research_only_pending_entity_resolution`: **3**
- `correction_metadata_only`: **1**
- `research_only_cross_entity_safety`: **2**

## Quality policy

Completion of a research wave is not permission to publish shorthand. The final runtime ledger is intentionally smaller than the 200-wave research corpus and admits only source-specific, reader-ready evidence that can resolve to an existing canonical entity and survives duplicate/source-identity screening.

The consolidated run preserves:
- null, negative, mixed, and low-certainty findings;
- disease, age, pregnancy, route, strain, species, extract, and formulation boundaries;
- combination-product firewalls;
- surrogate/biomarker versus clinical-outcome distinctions;
- safety, interaction, correction, retraction, and adverse-event context;
- studied exposures as evidence metadata rather than consumer dosing.

## Validation sequence

1. Verify all eight selection files form Waves 101–300 with no gaps or duplicate entity+PMID identity.
2. Materialize only independently extracted reader-ready rows.
3. Audit runtime admission against canonical data and earlier enrichment.
4. Run runtime-enrichment integrity and source-of-truth checks.
5. Open a single PR for the complete 200-wave batch.
6. Run exact-head repository checks once.
7. Merge only after the required final head is clean.

Research-only, product-level, unresolved-entity, combination-only, correction-only, and cross-entity safety receipts remain durable research records rather than being forced into generic public claims.


## Exact-head validation note

After automatic synchronization with current `main`, this consolidation receives a normal branch commit so required pull-request workflows execute against the current enrichment head rather than stopping in GitHub's `action_required` state for the bot-authored sync commit.
