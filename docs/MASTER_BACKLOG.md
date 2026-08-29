# Master Backlog

**Status:** Authoritative ranked backlog  
**Updated:** 2026-08-29  
**GitHub snapshot:** `2026-08-29T01:11Z` on `main@4a4d4a7ef195f651911454eabb5949b5d5e71733`  
**Open PRs at snapshot:** 5  
**Normal WIP cap:** 3 — one active implementation each in Discovery/SEO (D), Revenue/Conversion (R), and Authority/Content (A).  
**Admission:** **Frozen.** All three normal slots are occupied and CI incident owner #4553 is active. Operations/control is not a fourth normal workstream.

Immediate work must agree with [CURRENT_SPRINT.md](CURRENT_SPRINT.md). Closed serialized PRs are preserved work, not active implementation and not discarded work.

## Scoring and hard gates

`Score = (Business Impact × User Value × Traffic Potential × Strategic Leverage × Confidence) / Effort`

Safety, scientific correctness, provenance, publication integrity, accessibility, production incidents, dependency ownership, review blockers, and exact-head/current-base validation override numeric score.

### Backlog hygiene rules

- GitHub state outranks stale prose.
- Exactly one normal D/R/A owner may be open at a time.
- Distribution lanes L1–L5 describe ownership, not extra slots.
- Non-owner work is serialized by closing the PR unmerged with branch/history and reopen condition preserved.
- Research-only staging cannot create source-registry/scientific authority.
- An explicit control incident freezes **new** admission but does not create a fourth normal slot.
- Missing external observations remain `Unknown`.
- A merged/closed item never occupies `Now`.
- An existing preserved branch outranks creating a duplicate implementation.

## Now — active exact work

| Class | Issue / PR | Title | Status | Proof boundary |
|---|---|---|---|---|
| D | #4532 / PR #4525 | Nighttime stress/sleep citation bridge | In review | Preserve canonical/H1/evidence hierarchy; no stronger efficacy claims; exact-head gates |
| R | #4545 / PR #4546 | Governed carousel semantic accessibility | In review | Accessibility/trust override; preserve governed copy/disclosure/source semantically and visually |
| A | #4486 / PR #4497 | Candidate promotion-history reconciliation | In review | Highest active provenance blocker; no invented history; exact-head hosted gates |
| Control | #4550 / PR #4553 | Serialize autonomous merge refresh ownership | Active incident | PR-event monitor read-only/single-snapshot; only serialized controller writes; all merge/scientific/provenance gates preserved |
| Docs-only | #4544 / PR #4551 | Reconcile live WIP admission state | In review | Sprint/backlog match exact GitHub snapshot; no scientific/public mutation |

## Next — strict legal order

### Authority/Content

1. **#4530** — reopen preserved source-identity-attestation branch after #4497 clears and a fresh snapshot admits A work. Refresh to current main; exact-head validate.
2. **#4521** — reopen only after #4497; rebuild on main and fix the verified mutating-wave-review P1 before admission.
3. **#4526** — fail-closed evidence classification after higher-priority source-promotion integrity; refresh stale base.
4. **#4529** — AI-cited supplement-quality evidence repair, preserving retraction/wrong-PMID corrections.
5. **#4536** — orphan runtime-source remediation classifier; informational only until governed apply paths exist.
6. **AUTH-001** and ordinary enrichment only after the integrity chain and a fresh free A slot.

### Discovery/SEO

1. Current owner **#4525**.
2. Preserved **#4527** may be reopened after #4525 clears and overlap is rechecked.
3. **SEO-003** only after a genuinely free D slot and current-main reproduction.
4. **SEO-004** remains externally blocked by missing authorized fixed-window GSC evidence.

### Revenue/Conversion

1. Current owner **#4546** due accessibility/trust override.
2. Preserved **#4499** may be reopened only after #4546 clears, its prior review debt is repaired, and the branch is refreshed.
3. Bounded pilot work remains later and must use a genuinely free R slot plus governed provenance/presentation/lifecycle boundaries.

### Control / CI

1. **#4553** — current single incident owner; remove PR-event write fanout/long polling while preserving exact-current-base merge authority.
2. **#4541** — preserved workflow concurrency/coalescing follow-up; reopen only after #4553 and runner remeasurement.
3. **#4523** — preserved exact-head static-export reuse; reopen only if duplication remains material after #4553/#4541.
4. **#4554** — preserved superseded fallback only if #4553 fails/rejected.

Control work never creates D/R/A capacity.

## Preserved serialized PR queue — closed unmerged

| PR | Preserved branch/work | Reopen boundary |
|---|---|---|
| #4530 | Bibliographic identity attestation | First A after #4497 + control clearance |
| #4521 | Duplicate-target registry integrity | After #4497; fix mutating wave reviewer P1 first |
| #4526 | Fail-closed evidence classification | After source-promotion blockers; refresh stale base |
| #4529 | AI-cited supplement-quality evidence repair | After systemic integrity blockers |
| #4536 | Orphan-source remediation classifier | Later A/provenance slot; informational only |
| #4527 | Sleep decision breadth | After #4525 |
| #4499 | Distribution rank/platform isolation | After #4546 + review repair |
| #4514 | Session A Crocus pregnancy fragment | Research pipeline readiness; no WIP entitlement |
| #4541 | Workflow concurrency coalescing | After #4553 and runner remeasurement |
| #4523 | Governed static-export reuse | After earlier CI control fixes if still needed |
| #4554 | Bounded merge-controller residency | Superseded by #4553; fallback only |

## Session H — preserved, not admitted

H implementation remains blocked until:

- a fresh snapshot proves the A slot free;
- #4530 is merged/current;
- #4521's mutating-path P1 is repaired and merged/current;
- #4537 provides the governed fragment → review/promotion bridge;
- #4538 source candidates pass canonical admission and become active before `approved_for_rollup`;
- current canonical entity identity and deterministic shard ownership are rechecked.

Preserve:
- Batch 2 `research/session-h-batch-20260828-2` @ `83f62ec6a28f137c23ef7490c538a8731dac081a`;
- Batch 3 `research/session-h-batch-20260828-3` @ `055abcf684796d9d7fae5868cf2f47aac4fe5cff`;
- research queue #4441;
- source-intake issue #4538.

No manual fragment copy into legacy intake.

## Blocked — external or hard dependency

| ID | Title | Class | Blocker / next legal action |
|---|---|---|---|
| REV-001 / #4280 | Production analytics receipt | R | Authorized production GA4/Ahrefs receipt evidence |
| SEO-004 | Aligned 28-day GSC baseline | D | Authorized dated Search Console access/export |
| REV-002 | Aligned funnel/revenue baseline | R | REV-001 + aligned GA4/GSC/Amazon/Mailchimp data |
| REV-003 | Flagship commercial decision page | R | Aligned SEO/revenue evidence |
| AUTH-003 | Flagship decision-page upgrade | A | Selected page + evidence review |
| #4014 | `main` branch protection/ruleset | Control | Authorized repository-settings action |
| #4341 | Recurring Cloudflare production failure | Control | External deployment logs/root-cause evidence |

## Recent retired capability

- #4549 merged at `main@4a4d4a7e…`: atomic/retry-safe generated-data writes.
- #4519 merged at `0581bbaf…`: governed runtime→registry orphan inventory.
- #4528 merged: `approved_for_rollup` requires active canonical source-registry eligibility.
- #4410/#4412/#4413/#4414/#4415/#4406/#4407 and earlier governed distribution foundations remain historical capability, not active admission.

## Mechanical reconciliation contract

After every material WIP-state change:

1. record one snapshot time and current `main` SHA;
2. list all open PRs;
3. identify exactly one normal D/R/A owner;
4. classify additional open PRs only as docs-only or explicit control incident;
5. keep closed serialized branches in this preserved queue rather than `Now`;
6. name the next legal A owner and H blockers;
7. remove merged/closed work from active sections; and
8. update this file and `CURRENT_SPRINT.md` in the same change.

Historical backlog files and closed PRs are discovery/preserved inputs only. Revalidate against current main, open ownership, external evidence, and experiment history before reopening.
