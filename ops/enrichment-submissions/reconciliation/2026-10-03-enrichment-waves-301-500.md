# Research enrichment Waves 301–500 — consolidated

Second 200-finding enrichment cycle.

## Completion

- Completed waves: **200 / 200**
- First wave: **301**
- Last wave: **500**
- Unique PMID identities: **200**
- Duplicate PMID identities inside this cycle: **0**
- Authoring model: eight passes × 25 findings
- Full repository validation: deferred until this consolidated head

## Evidence policy

The 200 receipts are research findings, not 200 automatic runtime rows. Runtime promotion is fail-closed: exact source identity, canonical entity identity, population/formulation/route boundaries, null and mixed outcomes, safety context, and adequate source-specific extraction are required.

Research-only states remain first-class. This includes category-level reviews, multi-ingredient formulas, product-specific evidence without a canonical product node, route-specific evidence, identity corrections, retraction quarantine, unresolved entities, and evidence-quality/safety infrastructure.

## State distribution

- `reviewed_receipt_pending_final_admission`: 105
- `review_ready_for_final_admission`: 52
- `research_only_category_firewall`: 13
- `research_only_product_level`: 8
- `research_only_cross_entity_safety`: 7
- `research_only_pending_entity_resolution`: 5
- `research_only_combination_firewall`: 3
- `research_only_formulation_firewall`: 2
- `research_only_evidence_quality`: 1
- `research_only_source_integrity`: 1
- `retracted_quarantine_only`: 1
- `research_only_route_firewall`: 1
- `research_only_identity_firewall`: 1

## Most-covered entities in this cycle

- **curcumin**: 11 findings
- **melatonin**: 6 findings
- **omega-3**: 5 findings
- **cranberry**: 5 findings
- **ashwagandha**: 5 findings
- **magnesium**: 5 findings
- **creatine**: 4 findings
- **berberine**: 4 findings
- **salacia-reticulata**: 4 findings
- **rhodiola**: 3 findings
- **l-theanine**: 3 findings
- **fenugreek**: 3 findings
- **garlic**: 3 findings
- **ginger**: 3 findings
- **kanna-zembrin**: 3 findings
- **vitamin-d**: 3 findings
- **saffron**: 2 findings
- **bacopa-monnieri**: 2 findings
- **panax-ginseng**: 2 findings
- **chamomile**: 2 findings

## Source passes

- `ops/enrichment-submissions/reconciliation/2026-10-03-enrichment-waves-301-325-selection.json`
- `ops/enrichment-submissions/reconciliation/2026-10-03-enrichment-waves-326-350-selection.json`
- `ops/enrichment-submissions/reconciliation/2026-10-03-enrichment-waves-351-375-selection.json`
- `ops/enrichment-submissions/reconciliation/2026-10-03-enrichment-waves-376-400-selection.json`
- `ops/enrichment-submissions/reconciliation/2026-10-03-enrichment-waves-401-425-selection.json`
- `ops/enrichment-submissions/reconciliation/2026-10-03-enrichment-waves-426-450-selection.json`
- `ops/enrichment-submissions/reconciliation/2026-10-03-enrichment-waves-451-475-selection.json`
- `ops/enrichment-submissions/reconciliation/2026-10-03-enrichment-waves-476-500-selection.json`

## Closure rule

1. Revalidate source identity and canonical entity identity.
2. Materialize only reader-ready, source-specific evidence.
3. Preserve every non-admitted receipt in this consolidated research ledger.
4. Run runtime integrity and admission audit.
5. Run Workbook Patch, Atomic, Site Health, Build Quality, full CI/build/SEO on the exact final head.
6. Merge once, only after required gates are green.
