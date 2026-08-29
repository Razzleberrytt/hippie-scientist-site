# Current Sprint

**Status:** Authoritative immediate execution queue  
**Sprint:** Provenance recovery + governed distribution hardening  
**Updated:** 2026-08-29  
**GitHub snapshot:** `2026-08-29T01:11Z` on `main@4a4d4a7ef195f651911454eabb5949b5d5e71733`  
**Open PRs at snapshot:** 5  
**Normal WIP limit:** 3 total implementation tickets, one each in Discovery/SEO (D), Revenue/Conversion (R), and Authority/Content (A). Distribution lanes L1–L5 describe surface ownership only; Operations/control is not a fourth normal workstream.  
**Current admission:** **Frozen.** All three normal workstream slots are occupied and one explicit CI/control incident (#4553) is active. No new implementation may be admitted until the relevant normal slot is free, the control incident is resolved, and a fresh snapshot confirms legality.

## Sprint objective

Keep source/provenance and publication boundaries trustworthy while finishing a bounded measurable Evidence → Distribution loop. Immediate priority is to clear the active provenance owner and the CI backpressure incident without weakening exact-head validation, then resume preserved work one legal owner at a time.

## Execution rules

- GitHub state outranks stale planning prose.
- Exactly one normal D, one normal R, and one normal A implementation owner may be open at a time.
- Existing non-owner work is serialized by closing its PR unmerged while preserving branch/history and an explicit reopen condition.
- Research-only staging does not consume a normal WIP slot and cannot manufacture source-registry or scientific authority.
- A temporary control/incident owner is explicit and blocks **new** admission until resolved.
- Deterministic defects discovered inside scope are repaired before merge.
- Merge only the exact intended head when the current base is still exact, required hosted gates are terminal green, and no blocking review/governance defect remains.
- Canonical registry membership, bibliographic identity, semantic claim relevance, evidence class, safety, dosing, and publication state remain separately governed.

## Active normal WIP — 3/3

| WS | Issue / PR | Owner | Status | Must prove before merge |
|---|---|---|---|---|
| D | #4532 / PR #4525 | Nighttime stress/sleep citation bridge | In review | Preserve canonical/H1/evidence hierarchy; no stronger efficacy claim; exact-head required gates |
| R | #4545 / PR #4546 | Governed carousel semantic accessibility | In review; accessibility/trust override | Accessible semantics preserve governed visible copy + disclosure/source without factual rewriting; exact-head gates |
| A | #4486 / PR #4497 | Candidate promotion-history reconciliation | In review; highest active provenance blocker | Exact-head CI/build/SEO/content gates; no invented promotion history; reconciled candidates remain non-promotable |

## Active control / reconciliation

| PR | Role | Status | Boundary |
|---|---|---|---|
| #4553 | CI incident owner — serialize autonomous merge refresh ownership | Active control exception | PR-event monitor becomes read-only/single-snapshot; only serialized controller may refresh/merge; no merge/scientific/provenance gate may weaken |
| #4551 | This GitHub → sprint/backlog reconciliation | Docs-only control | Must match one exact GitHub snapshot; no scientific/public mutation |

## Serialized preserved queue — closed unmerged

These branches/history are intentionally preserved. **Closed means not active, not discarded.** Reopen only at the documented dependency point after a fresh control snapshot.

| PR | Preserved work | Reopen condition / order |
|---|---|---|
| #4530 | Source identity attestation before registry promotion | **First legal A admission after #4497** and #4553/control reconciliation clear; refresh to current main and revalidate exact head |
| #4521 | Explicit duplicate-target referential integrity | After #4497; rebuild on current main; fix verified P1 in mutating `report-source-wave-review.ts`; add integration coverage; then compete for A admission |
| #4526 | Fail-closed evidence classification | After higher-priority source-promotion blockers; refresh stale base; preserve nonhuman/preclinical veto and independent source signals |
| #4529 | AI-cited supplement-quality evidence repair | After systemic source/evidence blockers; preserve retraction/wrong-PMID corrections |
| #4536 | Runtime orphan-source remediation classifier | After higher-priority provenance blockers; informational only, never registry authority |
| #4527 | Sleep supplement decision breadth | After #4525 clears and D overlap is rechecked |
| #4499 | Distribution page-rank/platform isolation | After #4546 clears, existing review debt is repaired, and branch is refreshed |
| #4514 | Session A Crocus pregnancy research fragment | Research-only; reopen when governed fragment/source pipeline is ready; no D/R/A slot implied |
| #4541 | Coalesce stale PR verification workflows | CI follow-up after #4553; remeasure runner behavior first |
| #4523 | Reuse exact-head governed static export across audits | CI follow-up after #4553/#4541 as warranted; retain exact head/base/lockfile/output receipts and full-build fallback |
| #4554 | Bound merge-controller runner residency | Superseded fallback for #4553; reopen only if #4553 fails/rejected |

## Authority/Content next legal sequence

The A slot is currently owned by **#4497**. After it clears, do not jump directly to Session H.

1. **#4530** — bibliographic source-identity attestation before registry promotion.
2. **#4521** — duplicate-target referential integrity, only after the mutating-wave-review P1 is repaired and integration-covered.
3. **#4526** — broad fail-closed evidence classification after current-base reconciliation.
4. **#4529** — AI-cited supplement-quality article evidence repair.
5. **#4536** — orphan-source remediation classifier, informational until separate governed apply paths exist.
6. Ordinary new enrichment/authority work only after the above integrity chain and a fresh admission snapshot.

A new safety/provenance incident may override this order, but it must be explicit.

## Session H boundary

Session H remains **research/staging only** until all of the following are true:

1. The Authority slot is explicitly free under a fresh current snapshot.
2. #4530 source-identity attestation is merged/current.
3. #4521's mutating-path duplicate-target integrity is repaired and merged/current.
4. #4537 provides a governed fragment → review/promotion bridge; no manual copy into legacy intake.
5. #4538 source candidates pass canonical source-candidate admission and are active before any `approved_for_rollup` state.
6. Current canonical entity identity and deterministic shard ownership are rechecked immediately before implementation.

Preserve losslessly:
- Session H Batch 2 branch `research/session-h-batch-20260828-2` @ `83f62ec6a28f137c23ef7490c538a8731dac081a`;
- Session H Batch 3 branch `research/session-h-batch-20260828-3` @ `055abcf684796d9d7fae5868cf2f47aac4fe5cff`;
- durable research queue #4441;
- H source-intake issue #4538.

## Recent infrastructure/provenance changes on main

- **#4549** merged at `main@4a4d4a7e…`: atomic/retry-safe generated-data writes with recurrence validation.
- **#4519** merged at `0581bbaf…`: governed runtime→registry orphan inventory.
- **#4528** merged: parallel enrichment cannot be `approved_for_rollup` unless its referenced source is active in the canonical registry.
- Previous distribution/control foundations #4410/#4412/#4413/#4414/#4415/#4406/#4407 remain historical capability, not active admission.

## External blockers

| ID | Blocker | Current truth | Next legal action |
|---|---|---|---|
| REV-001 / #4280 | Production analytics receipt | Production GA4/Ahrefs receipt remains Unknown | Obtain authorized environment/property evidence without exposing secrets |
| SEO-004 | Aligned 28-day GSC baseline | No authoritative fixed-window export in repo | Supply authorized Search Console access/export with exact dates |
| REV-002 | Aligned funnel/revenue baseline | Cross-source baseline incomplete | Reconcile GA4/GSC/Amazon/Mailchimp when source access exists |
| #4014 | `main` branch protection/ruleset | Repository enforcement is not proven | Apply/verify through authorized repository settings |
| #4341 | Recurring Cloudflare production failure class | Repository checks do not expose external root-cause logs | Inspect deployment logs; repair only proven repository/config cause |

## Mechanical reconciliation contract

Every material WIP-state change requires one new control snapshot that:

1. records snapshot time and current `main` SHA;
2. lists every open PR;
3. identifies exactly one normal D/R/A owner;
4. classifies any remaining open work as docs-only or explicit control incident;
5. keeps serialized closed branches in a preserved/reopen queue rather than Active;
6. names the next legal A owner and exact H blockers;
7. removes merged/closed work from Active; and
8. updates `CURRENT_SPRINT.md` and `MASTER_BACKLOG.md` together.

## Admission-unfreeze condition

New implementation admission may resume only when:

- the relevant normal D/R/A slot is actually free;
- #4553 or any successor control incident is resolved;
- no undocumented implementation overflow is open;
- a fresh GitHub snapshot confirms the state; and
- exact-head scientific/provenance/safety/accessibility/release gates remain intact.
