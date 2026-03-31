# Governed refinement pass

Generated: 2026-03-31T17:04:16.124Z
Deterministic model: governed-refinement-pass-v1

## Weak refinement targets
- governed_review_freshness (herb_detail|compound_detail): Trust cue is visible in baseline but does not drive any observed engagement signal. Signal: baselineVisibility=1, trackedVisibility=0, interactions=0, ctr=n/a
- governed_collection_compare_controls (collection_page|compare_page): High baseline visibility with zero interaction indicates weak follow-through on governed next steps. Signal: baselineVisibility=19, trackedVisibility=0, interactions=0, ctr=n/a
- governed_cta (herb_detail|compound_detail|collection_page): High baseline visibility with zero interaction indicates weak follow-through on governed next steps. Signal: baselineVisibility=12, trackedVisibility=0, interactions=0, ctr=n/a
- tool_affiliate_related_journey (herb_detail|compound_detail|collection_page): High baseline visibility with zero interaction indicates weak follow-through on governed next steps. Signal: baselineVisibility=12, trackedVisibility=0, interactions=0, ctr=n/a

## Targeted changes (before/after intent)
- governed_review_freshness: Trust cue visible but low interaction and unclear next action
  - Added a concise trust-use note so freshness is framed as a cue, not a standalone decision signal.
  - Added a deterministic next-step anchor link to safety/evidence section for follow-through.
  - Renamed collapse title to "Review freshness details" to reduce ambiguity.
- governed_quick_compare: Visibility present but weak click-through into deeper governed context
  - Added explicit shortlisting guidance under quick compare heading.
  - Added explicit "Open full governed profile" link per card to improve next-step clarity.
- governed_collection_compare_controls: Highest-visibility governed controls had zero measured interaction in scorecard snapshot
  - Added deterministic inline guidance to start with "Reviewed recently" and then sort by "Review freshness".
- governed_intro_summary: Intro visibility with low next-step engagement
  - Added a compact suggested action order below quick facts to clarify the next click path.

## Left unchanged intentionally
- governed_browse_search_filters: Baseline visibility is low (2) in this snapshot; deferred until post-instrumentation evidence is richer.
- governed_faq_related_questions: Low baseline volume (2) and sparse evidence make copy tightening less impactful than high-visibility control surfaces.

## Deterministic verification
- onlyGovernedSignalsInfluenceRefinements: true
- sparseCoverageDegradesGracefully: true
- noBlockedRejectedRevisionRequestedInfluence: true
