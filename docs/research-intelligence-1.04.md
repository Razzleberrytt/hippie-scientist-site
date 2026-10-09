# Semantic Intelligence 1.04 — Eight-Instrument Case Files

## Canonical state

Inherits merged 1.03 publication identity, 1.02 exact quotation/adjudication, 1.01 question-integrity, and the source-register semantic graph. The earlier #6406 eight-tool experiment was superseded by the canonical #6407 → #6408 → #6414 progression; it must not be merged as a competing /research/intelligence implementation.

**Eight shared projections, one source authority:** Study DNA, Contradiction Observatory, Knowledge Frontier, Evidence Time Machine, Semantic Voyages, Interaction Matrix, Ask the Evidence, and Content Reactor.

## 1.04 functional change: the PMID case workbench

- Any of the 500 exact-source-verified research-intake PMIDs can open one persistent case file shared by all eight instruments.
- The reader can trace a source directly from Study DNA, sampled frontier/safety/timeline leads, semantic voyages, Ask the Evidence results, or source-bound Content Reactor briefs. Contradiction Observatory adds a case link **only** when the independent published-citation data supply an exact PMID/DOI cross-reference.
- Each case shows pinned source identity, quotation count, controlled concepts, explicit missingness and a per-instrument availability/limitation ledger.
- Navigating to Study DNA selects the PMID; Time Machine selects the real publication year; Ask the Evidence receives actual indexed aliases; Voyages selects literal controlled concepts where available.
- Workbench state is in the current browser session, not a new paid API, model endpoint, database or scheduler. It inherits the existing click-to-load static dataset and the browser's separate, validated published-evidence join.

## Epistemic guards

Every link is a **navigation lead**, not adjudicated scientific evidence:

- An exact publication identity can link a reviewed *citation record* to a research-intake source. It cannot verify independent underlying trials.
- A frontier, safety or draft PMIDs list may be sampled. A zero count means zero in the displayed local index, not zero papers in the literature.
- Study DNA methods/comparators may be text-derived and require scientific validation. Bibliographic co-mentions or concept routes do not prove effects, mechanisms, adverse events or interactions.
- The study case file refuses snapshots with mismatched version, nonzero automated clinical promotions or source-signature mismatches. Unknown PMIDs cannot be silently substituted.
- This PR leaves the staged 7501–8000 research batch alone until its independent semantic review and merge. The 1.04 eight-tool case surface remains honestly scoped to the merged 7001–7500 exact-verified 500-paper semantic cohort.
- Zero autonomous claim promotion, dosing advice, publication or clinical grading.

## Validation and rollout

Run `npx tsx scripts/ci/validate-research-intelligence-studio.ts`, `npm run typecheck`, `npm run check:fast`, and `npm run build`. CI must pass on the exact PR head before merging/deploying. After production deploy, inspect `/research/intelligence/` on mobile, exercise representative PMID handoffs across all eight tabs, and confirm noindex and publication-identity disclaimers remain visible. No performance or ROI uplift is asserted without field measurement.

## Atomic ownership

The scoped acceptance issue is [#6416](https://github.com/Razzleberrytt/hippie-scientist-site/issues/6416) and its single implementation branch is [PR #6415](https://github.com/Razzleberrytt/hippie-scientist-site/pull/6415). Subsequent expansions of the cohort, clinical interpretation, or autonomous review must be admitted as separate governed changes; they are explicitly excluded here.
