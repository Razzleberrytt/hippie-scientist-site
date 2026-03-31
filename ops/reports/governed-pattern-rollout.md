# Governed pattern rollout

Generated: 2026-03-31T17:10:38.022Z
Deterministic model: governed-pattern-rollout-v1

## Standardization targets
- herb_detail|compound_detail · intro_summary · insufficient_data → standardize. Refinement pass already established a deterministic intro action-order pattern; apply as default while data remains sparse. (baseline=0, tracked=0, interactions=0)
- herb_detail|compound_detail · faq_and_related_questions · insufficient_data → standardize. Governed FAQ/related content remains trusted context; standardize concise review-order framing without expanding claim scope. (baseline=0, tracked=0, interactions=0)
- herb_detail|compound_detail · quick_compare · insufficient_data → standardize. Refinement pass identified quick-compare next-step framing as the strongest governed discovery improvement candidate. (baseline=0, tracked=0, interactions=0)
- herb_detail|compound_detail · review_freshness_panel · insufficient_data → standardize. Trust-only freshness cue plus deterministic next-step guidance is the conservative default for caution-sensitive pages. (baseline=0, tracked=0, interactions=0)
- herbs_index|compounds_index · browse_governed_filters · insufficient_data → keep_experimental. Browse controls still have low governed baseline in this snapshot; retain but avoid broader expansion until richer evidence exists. (baseline=2, tracked=0, interactions=0)
- collection_page|compare_page · collection_compare_controls · insufficient_data → de_emphasize. Highest governed baseline visibility (19) still showed zero interactions; keep controls but reduce surrounding UI clutter and keep guidance conservative. (baseline=1, tracked=0, interactions=0)
- herb_detail|compound_detail|collection_page · governed_cta_stack · insufficient_data → de_emphasize. CTA surface had high baseline visibility (12) with zero interactions; reduce non-essential CTA chrome while preserving safety-first ordering. (baseline=0, tracked=0, interactions=0)
- herb_detail|compound_detail|collection_page · tool_affiliate_related_journey · insufficient_data → keep_experimental. Tool/affiliate journey signals remain zero-interaction in snapshot; keep conservative journey copy but do not expand UI footprint. (baseline=0, tracked=0, interactions=0)

## Standardized patterns
- Intro summary action-order microcopy (governed_intro_summary)
- FAQ/related review-order framing (governed_faq_related_questions)
- Quick compare shortlisting + profile handoff (governed_quick_compare)
- Review freshness trust-cue treatment with next-step link (governed_review_freshness)
- Collection/compare guidance to reviewed+freshness flow (governed_collection_compare_controls)

## De-emphasized / removed patterns
- Collection quick-action CTA strip duplicated the governed CTA stack [removed] — baselineVisibility=12, trackedVisibility=0, interactionCount=0 from scorecard governed_cta snapshot
- CTA variant-id chrome inside governed CTA section [de_emphasized] — supports low-noise CTA presentation while retaining safety-first slot ordering and deterministic impression tracking

## Experimental patterns kept
- governed_browse_search_filters: Baseline visibility is low (2) in this snapshot; deferred until post-instrumentation evidence is richer.
- governed_faq_related_questions: Low baseline volume (2) and sparse evidence make copy tightening less impactful than high-visibility control surfaces.

## Deterministic verification
- noBlockedRejectedRevisionRequestedInfluence: false
- sparseEnrichmentPagesDegradeGracefully: true
- removedOrDeEmphasizedElementsKeepPageStructure: true
