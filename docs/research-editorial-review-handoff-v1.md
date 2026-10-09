# Exact-source → editorial review request v1

**Owner:** #6466 / existing Research Intelligence + Semantic Fabric
**Authority:** research-only, read-only; not an editorial approval or publication service.
**Status:** Implementation in review; no production or field outcome claim until exact-head release proof.

## Existing producers and consumers

`buildIntegratedResearchCase` already constructs one **canonical PMID** case across the eight research projections, twelve bounded scientific intelligence capabilities, reviewed-publication identity crosswalk, and **Semantic Fabric 1.07** distribution candidates. The `reviewRequest` returned by that same integration is the new typed handoff. There is no new persistent evidence ledger or server API.

The **only source** is the validated, current `studio + graph + pmid` and existing distribution-object inputs. `validateResearchEditorialReviewRequest` rebuilds the canonical case and refuses any changed source signature, different publication DOI, stale witness ID, foreign claim/source ID, unknown envelope version, additional permissions, or changed review target. A consumer must supply those governed inputs, not merely trust an inbound review request.

## Handoff schema and limits

- `schemaVersion:1`, `kind:'research-editorial-review-request'`
- `source.pmid`, exact `sourceSignature`, original PubMed URL, normalized exact DOI or `null`, pinned title/abstract witness IDs
- `indexedReviewedCitationIds`: *identities only* from an existing independently published citation crosswalk; **not** approved research-intake findings
- `instrumentIds` / `scientificCapabilityIds`: current eight + twelve exact-source projection IDs
- `reviewTargets`: existing distribution object ID, canonical target path, existing claim/source identifier labels, exact primary DOI and mandatory `qualified-human-editorial-review-required` disposition
- `heldReasons`: explicit lack of an exact source DOI or existing DOI+claim/source link. Held is **not** a global finding that research is absent.
- `evidenceAuthority:'research-source-identity-only'`, `approvalAuthority:'not-provided'`, `underlyingTrialIndependence:'unknown'`, `clinicalPromotions:0`, `publicationAllowed:false`, `mutationAllowed:false`

An exact publication join does **not** establish a reviewed claim, participant/trial independence, comparable formulations, a clinical benefit, or an approved article/video. It merely supplies a proposed address to an existing qualified editorial review pathway. Matching words, nearby semantic graph papers and brand/drug synonyms do not create targets. Missing targets remain held.

The packet is deterministic with stable sorting. To retry, rebuild from the exact current source and artifact state. Any source revision invalidates the prior packet. The permission boundary cannot widen downstream. A separate reviewer receipt and existing publisher governance are needed for an actual authorized article or social post.

## Validation and rollback

Run `npx tsx scripts/ci/validate-research-intelligence-studio.ts`, plus the repository's exact-head full CI/build, Atomic, scientific identity, SEO, accessibility and release gates. Negative fixtures reject forged/mismatched PMIDs, source signatures, witness IDs, DOI, claim/citation IDs, unknown version, asserted review approval and publish/mutate flags; positive synthetic target plus held/no-link are required. Main deployment proof is a **separate** T3 event.

Rollback the single integration-file addition and its validator/docs in one atomic PR. Existing studio/fabric/case routes remain stable; no new runtime or storage binding is necessary. The source-of-truth workbook, governed citations, editorial approvals, and native/manual publishing permissions remain unchanged.
