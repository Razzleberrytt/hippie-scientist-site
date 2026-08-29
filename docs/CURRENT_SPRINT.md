# Current Sprint

**Status:** Authoritative immediate execution queue  
**Sprint:** Provenance recovery + governed distribution hardening  
**Updated:** 2026-08-29  
**GitHub snapshot:** `2026-08-29T00:59Z` on `main@4a4d4a7ef195f651911454eabb5949b5d5e71733`  
**Normal WIP limit:** 3 total implementation tickets, one each in Discovery/SEO (D), Revenue/Conversion (R), and Authority/Content (A). Distribution lanes L1-L5 describe surface ownership only; they do not create additional workstream slots. Operations/control is not a fourth normal workstream.  
**Current admission:** **Frozen.** The three normal workstream slots are occupied and temporary control/implementation overflow is explicitly present. No new implementation may be admitted until the live overflow is reduced and this ledger is resynchronized.

## Sprint objective

Keep the site’s provenance and publication boundaries trustworthy while completing the smallest measurable Evidence → Distribution loop. Immediate priority is to clear source/provenance integrity blockers without weakening exact-head validation, then resume bounded distribution and scientific enrichment only through the normal D/R/A admission model.

The sprint does **not** authorize broad auto-publishing, speculative scientific rewriting, evidence-grade inflation, invented source identity, unsafe dosing authority, a second factual dataset, or extra implementation simply because a distribution lane is numerically free.

## Execution rules

- GitHub state outranks stale planning prose.
- Normal WIP is exactly one D, one R, and one A implementation owner at a time.
- A stacked/dependent PR is recorded but does not create a free slot.
- Research-only fragments do not consume a normal implementation slot and do not create source-registry or scientific authority.
- A temporary incident/control exception must be explicit. While any such overflow is open, **new admission remains frozen**.
- Existing overflow may be validated, repaired, merged, closed, or preserved; it may not be used as precedent for admitting additional work.
- Deterministic defects discovered inside scope are repaired before merge.
- Merge only the exact intended head when required hosted gates are terminal green, the current base is still exact, and no blocking review/governance defect remains.
- Canonical source-registry membership, source identity, scientific evidence class, safety, dosing, and publication state remain governed separately; no staging artifact can manufacture those authorities.

## Active normal WIP — 3/3

These are the **only normal workstream owners** at the snapshot above.

| WS | Lane / surface | Issue / PR | Owner | Current state | Must prove before merge |
|---|---|---|---|---|---|
| D | Discovery/SEO | #4532 / PR #4525 | Nighttime stress/sleep citation bridge | In review | Preserve canonical/H1/source hierarchy; no stronger efficacy claim; exact-head required gates |
| R | L4 presentation/accessibility | #4545 / PR #4546 | Governed carousel semantic accessibility | In review; accessibility/trust override | Accessible semantics must expose governed visible copy + disclosure/source without factual rewriting; exact-head gates |
| A | L2 factual/provenance | #4486 / PR #4497 | Candidate promotion-history reconciliation | In review; highest active provenance blocker | Exact-head CI/build/SEO/content gates; no invented historical promotion state; reconciled candidates remain non-promotable |

## Existing overflow, dependencies, and non-implementation staging

Recording an item here is **not admission**. These PRs already exist and must be serialized, repaired, merged, closed, or preserved before new work is admitted.

| PR | Classification | State at snapshot | Disposition / dependency |
|---|---|---|---|
| #4527 | D overflow | Independent Discovery/SEO implementation | Wait behind D owner #4525. Do not admit another D ticket. |
| #4499 | R overflow | Independent Revenue/Distribution implementation; known review debt remains | Wait behind R owner #4546; repair its existing review findings before it can become R owner. |
| #4530 | A overflow | Independent source-identity attestation; mergeable | **Next legal A admission after #4497 clears**, subject to current-base refresh and exact-head gates. This is the highest-leverage source-promotion safety prerequisite for new intake. |
| #4521 | A stacked dependency | Stacked on #4497; mergeable as a stack but has a real P1 | Do not merge ahead of #4497. After parent merge, rebuild on `main`, apply duplicate-target integrity to the mutating wave reviewer, add integration coverage, then compete for A admission. |
| #4526 | A overflow | Broad fail-closed evidence-classification repair; currently stale/non-mergeable against old base | Rebase/repair only after higher-priority source-promotion blockers; preserve nonhuman-before-human classification and independent source signals. |
| #4529 | A overflow | Public AI-cited article evidence repair | Wait behind systemic source/evidence integrity work; retain retraction/wrong-PMID corrections and exact-head gates. |
| #4536 | A/provenance overflow | Informational orphan-source remediation classifier | Wait behind source identity/evidence blockers; classifier may prioritize work but cannot create registry authority or mutate public claims. |
| #4514 | Research staging only | Session A append-only Crocus pregnancy evidence | Does **not** consume D/R/A WIP. Remains promotion-blocked until source/fragment governance permits rollup. |
| #4541 | Temporary control exception | CI concurrency/coalescing improvement | Priority control exception because stale-head churn is actively consuming runners. Its existence blocks **new** admission until reconciled/closed. |
| #4523 | Control overflow | Larger exact-head static-export reuse optimization | Preserve behind #4541; do not expand CI-control work while #4541 is unresolved. |

## Next legal workstream sequence

### Authority/Content

The Authority slot is currently owned by **#4497**. No H implementation or other A implementation may start while it remains active.

When #4497 merges/closes and the live snapshot still supports the ordering, the next legal A admission is:

1. **#4530 — source identity attestation before registry promotion.** Highest priority because a plausible PMID/DOI/title tuple can otherwise promote an unrelated publication.
2. **#4521 — duplicate-target referential integrity**, but only after its P1 is repaired in the mutating wave reviewer and the child is rebuilt on current `main`.
3. **#4526 — fail-closed evidence classification**, after current-base reconciliation; broad systemic prevention of preclinical/nonhuman → human leakage.
4. **#4529 — AI-cited supplement-quality article evidence repair**, preserving its known retraction/wrong-PMID corrections.
5. **#4536 — orphan runtime-source remediation classification**, informational only until separate governed apply paths exist.

A fresh GitHub snapshot may reorder items if a safety incident, review defect, base conflict, or merge changes the dependency graph.

### Discovery/SEO

- Current D owner: **#4525**.
- Existing overflow **#4527** may become the next D owner only after #4525 is merged/closed and current overlap is rechecked.

### Revenue/Conversion

- Current R owner: **#4546** because accessibility/trust correctness overrides ordinary growth ordering.
- **#4499** remains preserved overflow and must resolve its existing review debt before it can become the R owner.

### Control / CI

- **#4541** is the first control closeout because stale-run coalescing directly reduces repeated exact-head runner waste.
- **#4523** remains second; its broader artifact-reuse design must retain exact head/base/lockfile/output receipts and full-build fallbacks.
- Control work does not create a fourth normal implementation slot.

## Session H boundary

Session H remains **research/staging only** until all of the following are true:

1. #4544 control reconciliation is merged/current and the Authority slot is explicitly free.
2. Higher-priority source-promotion integrity is cleared, including #4530 and the repaired mutating-path contract from #4521.
3. Parallel fragment reconciliation/promotion bridge #4537 exists and is governed; fragments are not manually copied into legacy intake.
4. H source-intake #4538 is admitted through canonical source-candidate governance; unregistered sources cannot become `approved_for_rollup`.
5. Current canonical identity/shard ownership is rechecked immediately before implementation.

Preserve losslessly:
- corrected Batch 2 branch `research/session-h-batch-20260828-2` head `83f62ec6a28f137c23ef7490c538a8731dac081a` (closed unmerged PR history preserved);
- staged Batch 3 branch `research/session-h-batch-20260828-3` head `055abcf684796d9d7fae5868cf2f47aac4fe5cff`;
- research findings in #4441 and source-intake issue #4538.

Do not reopen H implementation merely because #4497 merges.

## Recent control/provenance changes already on main

These are retired from active WIP and must not be re-admitted from stale prose:

- **#4549** — atomic/retry-safe generated-data writes merged at `main@4a4d4a7e…`; build-output semantics were intended to remain byte-equivalent apart from generated timestamp metadata.
- **#4519** — runtime → registry orphan inventory merged at `0581bbaf…`; it is inventory authority for follow-up remediation classification.
- **#4528** — parallel-enrichment registry-eligibility gate merged; `approved_for_rollup` requires an active canonical registry source.
- Previous distribution/control foundations #4410/#4412/#4413/#4414/#4415/#4406/#4407 and their merged PRs remain historical capability, not active admission.

## External blockers

| ID | Blocker | Current truth | Next legal action |
|---|---|---|---|
| REV-001 / #4280 | Production analytics receipt | Code readiness exists; production GA4/Ahrefs receipt remains Unknown | Obtain authorized environment/property receipt without exposing secrets |
| SEO-004 | Aligned 28-day GSC baseline | No authorized fixed-window export is currently authoritative in repo | Supply authorized Search Console access/export with exact dates |
| REV-002 | Aligned funnel/revenue baseline | Cross-source baseline incomplete | Reconcile GA4/GSC/Amazon/Mailchimp when authorized source access exists |
| #4014 | `main` branch protection/ruleset | Repository enforcement is not proven | Apply/verify through authorized repository settings |
| #4341 | Recurring Cloudflare production failure class | Repository-side checks do not expose external root-cause logs | Inspect failed production deployment logs; repair only a proven repository/config cause |

## Reconciliation check for future control sync

A control sync is valid only if it mechanically performs all of the following against one explicit GitHub snapshot:

1. list all open PRs;
2. classify every implementation as D, R, A, stacked/dependent, research-only, or explicit control/incident overflow;
3. verify exactly one normal owner per D/R/A before allowing new admission;
4. remove merged/closed PRs from active tables;
5. record the current `main` SHA and snapshot time;
6. re-evaluate the next legal A owner and H blockers;
7. keep `CURRENT_SPRINT.md` and `MASTER_BACKLOG.md` consistent in the same change.

## Sprint exit conditions

The current admission freeze can be lifted only when:

- live D/R/A ownership is compliant with one normal owner per workstream;
- temporary control/incident overflow has been explicitly resolved or reduced enough that no undocumented overflow remains;
- the planning docs match a fresh GitHub snapshot;
- source/provenance/safety/accessibility blockers are not being bypassed by numeric WIP capacity;
- exact-head merge gates remain intact; and
- external analytics/revenue blockers remain honestly Unknown rather than being treated as implementation success.
