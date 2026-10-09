# Cross-instrument semantic relay — capability 1.06

## Decision and boundaries

This is a **capability-layer upgrade** on top of the current Semantic Intelligence **1.05 research payload**. It deliberately does not change the 500-PMID static dataset schema or re-admit any staged 500-record research batch. The eight original canonical instruments remain at one URL: `/research/intelligence/`.

Issue: https://github.com/Razzleberrytt/hippie-scientist-site/issues/6420

## Real interoperation, not merely shared tabs

The source-focused case already verifies the exact PubMed PMID, source signature and independently published citation crosswalk. `lib/research-intelligence-relay.ts` now provides a deterministic, visible route graph between the tools:

- Study DNA → Time Machine: exact PMID in a dated source timeline.
- Study DNA → Ask the Evidence: literal source concept index.
- Study DNA → Semantic Voyages: original PMID has concept-indexed neighboring papers.
- Study DNA → Knowledge Frontier / Interaction Matrix / Content Reactor: only explicit PMID membership in an existing sampled coverage question, safety index or draft editorial work order.
- Study DNA → Contradiction Observatory: only an **exact independently published citation identity** matches the selected source.
- Time Machine → Contradiction Observatory, Frontier → Reactor, Safety → Reactor, Voyages → Ask, and Contradiction Observatory → Reactor: constructed only when both destination and origin have the same explicit PMID or, where claimed, the same exact reviewed citation ID.

Every junction has a stable ID, origin and destination instrument, one source PMID, a provenance basis, an explanation and a limitation. Selecting a destination invokes the v1.05 exact-source handoff, which checks the source signature, indexed concept IDs, reviewed citation IDs and instrument target. No background jobs, paid provider, new source truth or duplicate dataset.

The relay **also shows independently reviewed semantic annotations and flags separately** from source-title/abstract co-mentions. It never converts the annotations into an efficacy rating, an interaction verdict, causal relationship, independent trial count, or publishable medical statement.

## Negative controls

`scripts/ci/validate-research-intelligence-studio.ts` checks:
- A real PMID has guarded routes across multiple instruments.
- Unrelated reviewed studies cannot be recruited by shared ingredient name.
- Forged reviewed-citation identifiers, stale source signatures and mismatching PMID handoffs fail closed.
- Independently reviewed annotations filter to exact PMID and remain isolated from the speculative source-text graph; they cannot generate clinical links by themselves.
- The UI actually renders the relay, navigation actions, uncertainty language and the distinct reviewed overlay.

## Measurement and delivery

- Canonical routes: 1 → 1.
- Source intake admission: 500 → 500 exact verified PMIDs.
- Eight existing instruments: 8 → 8; all receive source-verified handoffs.
- Shared source-bound inter-instrument relay: no explicit junction board → up to 12 displayed deterministic, evidence-limited junctions for a selected PMID.
- Automatic clinical promotions, dosage claims and publication approvals: 0 → 0.
- User benefit, search impact, speed and usage: **unmeasured** pending actual production analytics.

Requires all exact-head required checks green before merge; merging to GitHub does not prove Cloudflare production receipt.
