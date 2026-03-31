# Structured data enrichment report

- Generated at: 2026-03-31T14:00:27.141Z
- Deterministic model version: structured-data-enrichment-v1

## Totals
- Evaluated pages: 32
- Pages with gained schema types: 7
- Pages with governed semantic upgrades: 8
- Intentionally unchanged pages: 24

## Page types now emitting schema
- herb_detail (12 pages)
  - WebPage: 12
  - BreadcrumbList: 12
- collection_page (20 pages)
  - CollectionPage: 7
  - WebPage: 7
  - ItemList: 7
  - BreadcrumbList: 7

## Governed signals used
- governed_enrichment:reviewed: 1
- evidence_label:limited_human_support: 1
- breadcrumb_context:linked: 8
- evidence_summary_presence:visible: 1
- collection_page_schema:enabled: 7
- item_list_schema:enabled: 7
- webpage_schema:enabled: 7

## Governed/schema candidates excluded
- governed_enrichment:absent_or_not_reviewed: 11
- supported_use_presence:not_available: 1
- safety_caution_presence:not_available: 1
- mechanism_or_constituent_presence:not_available: 1
- conflict_uncertainty_presence:not_flagged: 1
- medical_authority_schema:policy_excluded: 8
- product_review_rating_schema:policy_excluded: 8
- faq_schema:excluded_no_visible_faq: 21
- governed_collection_summary:absent: 7
- item_entity_type:combo_link_only: 2
- collection_schema:excluded_noindex_or_low_quality: 13
- itemlist_schema:excluded_noindex_or_low_quality: 13

## Verification
- approvedGovernedOnlyInfluence: true
- noDuplicateOrConflictingSchemaBlocks: true
- requiredFieldsDefinedForSupportedTypes: true
- noindexPagesDoNotEmitIndexOrientedSchema: true
