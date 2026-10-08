# Semantic Fabric 1.07 — source-to-publishing provenance bridge

**Stage A, read-only interoperability** | Issue: #6423 | Follows Semantic Intelligence 1.06 / PR #6422.

## Why this is a separate, narrow capability

The eight-instrument relay already joins research *navigation* by exact PMID. Distribution and articles use another authority: reviewed research objects with `primarySourceId`, `findingClaimId`, `primarySourceUrl`, and the website evidence-page `sourceUrl`. Joining on ingredient names, titles or keyword similarity would incorrectly turn source discovery into an asserted scientific claim.

This capability performs a conservative, deterministic **exact-primary-DOI candidate join** between one canonical research case and existing reviewed-distribution metadata. It also shows already-source-linked Content Reactor editorial briefs. It does not create a distribution item, rewrite an article, schedule social posts, infer that a specific finding is supported by a matched DOI, or authorize any publication.

## Concrete execution path

1. `buildResearchCaseFile` re-establishes exact PMID/source signature, published-citation IDs and no clinical promotion.
2. `buildResearchCaseScope` restricts editorial queue candidates to explicit PMID or exact independently reviewed citation-ID membership.
3. `buildInstrumentRelay` supplies eligible inter-instrument navigation without losing source context.
4. `planResearchSemanticFabric` reads existing `data/distribution/research-objects.json` objects and proposes downstream **review targets** only where `primarySourceUrl` is an *exact* DOI match to the source DNA, site `sourceUrl` is a canonical local page, and existing claim and source identifiers are present. The fact that a record appears in a governed distribution registry is not enough to establish clinical evidence.
5. The case workbench shows editorial draft review candidates and exact-DOI distribution targets in a dedicated, review-only impact map; unmatched records remain explicitly unresolved.

The bridge is read-only, static-first and requires no subscription, additional provider, webhook or persistence service. No new paper admission or serialized medical facts. The active 1.05 static dataset remains the source of truth.

## Identity/trust and forbidden promotions

| Producer | Output | Allowed consumer | Identity required | Forbidden |
| --- | --- | --- | --- | --- |
| PubMed source register | Verified PMID, DOI, text witness, source signature | Source case and semantic index | Exact PMID plus source signature | Claim approval |
| Semantic index | Title/abstract concept and source graph | Eight research instruments | Same source exact PMID | Causality, efficacy, known interactions |
| Independent citation review | Reviewed citation ID and identity | Contradiction/editorial source scope | Explicit citation ID to exact publication crosswalk | Independent trial count |
| Content Reactor | Draft review briefs | Editorial review workbench | Explicit source PMID or reviewed ID | Auto-publishing |
| Existing distribution research objects | Local article destination, primary citation DOI, claim ID | Downstream review-only impact map | Exact DOI + existing `primarySourceId` and `findingClaimId` | Treat source match as claim support; modify article or publish |

## Negative gates

The regression suite checks exact DOI joins, unrelated DOI lookalikes, topic/page-only overlap, missing claim IDs, duplicate-object DOI conflict, forged case signatures, another PMID, and use of genuine distribution metadata against the 500-source register. All targets remain `publication-matched-editorial-review-required` and `publicationAllowed=false`, `mutationAllowed=false`.

## Acceptance and measurement

- Existing eight instruments: eight preserved, original one-route studio preserved.
- Source corpus: 500 exact verified PMIDs, no new records admitted by this feature.
- Source-to-editorial candidates: limited to reviewed-citation or explicit PMID admission.
- Source-to-distribution candidates: **only** exact primary DOI plus existing claim/source IDs; source count and matching targets may legitimately be zero.
- Real human-review completion, content freshness, accuracy, traffic/engagement: not yet measured. No ROI claims.
- Change remains staged until exact-head lint/typecheck, research gate, CI, build and atomic contract pass; verify deployment separately by production receipt.

## Next stages (not implicitly accomplished here)

1. Typed immutable change-event ledger with revision signatures and bounded idempotent sinks.
2. Exact claim-lineage graph crossing articles, evidence blocks, review ledger, social scripts and published artifacts.
3. Authenticated stale-source detection, human-approved correction queues, and public explanations of evidence changes.
4. Telemetry and reviewer feedback loops that prioritize investigation without upgrading unreviewed observations to scientific authority.
