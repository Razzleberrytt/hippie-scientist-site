# Governed analytics event inventory

- Generated at: 2026-03-31T16:43:16.172Z
- Deterministic model version: governed-analytics-v1

## Event model
- Namespace: governed_*
- Fields:
  - type
  - pageType
  - entityType
  - entitySlug|surfaceId
  - componentType
  - eventAction
  - variantId?
  - profile?
  - evidenceLabel?
  - safetySignalPresent?
  - reviewedStatus?
  - freshnessState?
- Guardrails:
  - Only publish-approved/user-safe governed summaries are included.
  - No internal workflow metadata is emitted.
  - Event names avoid implying stronger evidence than rendered UI labels.

## Governed surfaces and events
- **governed_intro**
  - Events: governed_intro_visible, governed_intro_step_click
  - Instrumented in: `src/components/detail/StructuredDetailIntro.tsx`
- **governed_faq_and_related_questions**
  - Events: governed_faq_visible, governed_related_question_click
  - Instrumented in: `src/components/detail/GovernedResearchSections.tsx`
- **governed_quick_compare**
  - Events: governed_quick_compare_visible, governed_quick_compare_click
  - Instrumented in: `src/components/detail/GovernedQuickCompareBlock.tsx`
- **governed_review_freshness**
  - Events: governed_review_freshness_visible, governed_review_freshness_toggle
  - Instrumented in: `src/components/detail/GovernedReviewFreshnessPanel.tsx`
- **browse_search_filters**
  - Events: governed_browse_filter_change, governed_card_summary_visible
  - Instrumented in: `src/pages/Herbs.tsx`
  - Instrumented in: `src/pages/Compounds.tsx`
- **collection_and_compare_filters**
  - Events: governed_collection_filter_change, governed_card_summary_visible
  - Instrumented in: `src/pages/CollectionPage.tsx`
  - Instrumented in: `src/pages/Compare.tsx`
- **governed_cta_refresh**
  - Events: governed_cta_click
  - Instrumented in: `src/lib/contentJourneyTracking.ts`
  - Instrumented in: `src/pages/CollectionPage.tsx`

## Instrumentation exclusions
- blocked_or_unreviewed_enrichment_fields: No analytics payload includes blocked/rejected/revision_requested workflow status fields or internal reviewer metadata.
- fine_grained_text_capture: Component body text and source-level notes are intentionally excluded to avoid noisy or misleading claims.
- combo_collections_governed_filters: Combo collections keep existing funnel events only; governed comparison filter events are not emitted there.

## Verification status
- supportedSurfaceOnlyEmission: PASS
- weakOrPartialPagesGraceful: PASS
- existingCtaToolAffiliateEventsStillPresent: PASS
- noBroadAnalyticsRegression: PASS
