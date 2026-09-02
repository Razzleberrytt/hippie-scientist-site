# Current Sprint

**Status:** Authoritative immediate execution queue
**Sprint:** Governed Distribution MVP + Measurement Foundation
**Updated:** 2026-08-31
**Normal WIP limit:** `AGENTS.md` permits Discovery/SEO, Revenue/Conversion, and Authority/Content only, with one active ticket per workstream. Distribution lanes do not independently grant additional Revenue/Conversion slots; Operations is not a fourth normal workstream.
**WIP cap:** 3
**Current admission:** Live GitHub reconciliation at `4461ac4c59aa48bafca85125f86e4a37e6ee4610` on 2026-09-02 records 0/3 normal implementation workstreams occupied. #4992 / PR #5016 completed the governed Propionate closure, post-merge Session E bootstrap proved 4/4 terminal promoted findings with 0 pending, and PR #5020 released the verified lease. Authority/Content, Revenue/Conversion, and Discovery/SEO are free. #5021 is the first Ready-next Authority/Content candidate; canonical Vitamin B6 mutation still requires a narrow `compound:vitamin-b6` governor lease. Research-only enrichment PRs remain non-canonical staging and do not consume normal implementation WIP.

**Control dependencies:** #4412 <- #4411; #4406 <- #4388, #4401, #4405; #4407 <- #4406

## Sprint objective

Finish the smallest trustworthy Evidence → Distribution loop that can produce a governed asset, preserve exact factual provenance through presentation/rendering, move it through an idempotent dry-run publishing lifecycle, and accept attributable outcome observations for deterministic feedback.

At the same time, finish the smallest control-plane hardening needed to keep autonomous execution trustworthy as throughput increases: changed-file-relevant merge gates first (#4410/#4411), then machine reconciliation of GitHub state against the planning docs (#4412). Freshness/unlock-aware prioritization (#4413), durable experiment memory (#4414), and marginal-resource economics (#4415) are merged. Their implementation is not ready work; using them with real observations remains subject to evidence and admission gates.

This sprint is an **acceleration track inside M1**, not a declaration that the Revenue Foundation is complete. GA4/GSC/affiliate alignment and production analytics receipt remain blocked by authorized external access. Those blockers stay visible, but they do not freeze unrelated governed distribution work.

The sprint does **not** authorize broad/high-volume auto-posting, scientific rewriting, evidence-grade mutation, invented safety language, consumer-dose directives, a second factual dataset, speculative content volume, a second prioritization formula, or milestone completion without proof.

## Execution rules

- Start only tickets listed under `Active` or `Ready next` below, and only when a real WIP slot exists. Merged control-hardening implementations are history, not admission candidates.
- GitHub issue/PR state outranks stale document wording.
- When a ticket merges/closes, remove it from `Active` on the next control sync.
- The normal WIP cap remains three. A temporary incident/control overflow must be explicitly documented and blocks admission of further work until active WIP is below the cap.
- One lane may not edit another lane's source-of-truth surface merely to move faster.
- L1 owns rendering/media infrastructure; L2 factual/provenance; L3 opportunity/measurement; L4 presentation/experiments; L5 lifecycle/publishing. These surface owners do not override the one-ticket-per-workstream limit.
- Canonical research objects and governed upstream evidence remain factual authority.
- Every distribution asset must retain canonical source URL/content hash and the exact approved factual/limitation boundary.
- Missing production/external metrics remain `Unknown`, never zero and never inferred success.
- Positive performance feedback must preserve the existing minimum-exposure threshold and may re-rank only already-eligible opportunities.
- The backlog keeps exactly one score formula. Dependency-unlock value belongs inside Strategic Leverage; stale external assumptions reduce Confidence or force revalidation before promotion.
- Externally contingent work must expose a current `last_verified` date/scope at promotion time under merged #4413; stale hypotheses may not remain perpetually `Ready` by inertia.
- Before repeating a governed experiment using merged #4414, check durable experiment history; a materially equivalent prior test requires a named changed assumption/retest condition.
- When comparable resource observations exist, scale based on marginal qualified outcomes per incremental resource, not gross output alone. Missing resource/outcome data remains `Unknown`.
- Deterministic failures found inside scope are repaired before merge. Merge only on exact intended head when required gates are green and no blocking review/governance defect remains.

## Milestone projection

| Milestone | Status |
|---|---|
| M0 | In progress |
| M1 | In progress |
| M2 | Blocked |
| M3 | Not started |
| M4 | Not started |
| M5 | Not started |
| M6 | Not started |

## Active / in review — observed implementation WIP 0/3

| Workstream | Ticket | Owner | Status | Scope |
|---|---|---|---|---|

- **Revenue/Conversion:** free. #4732 / PR #4734 is merged/closed; provider configuration, credentials, live scheduling, publication confirmation, and outcomes remain externally gated or Unknown.
- **Authority/Content:** free after #4992 / PR #5016 completed and verified lease-release PR #5020 merged. #5021 is Ready next for governed Vitamin B6 evidence/safety closure; implementation remains blocked until a narrow `compound:vitamin-b6` lease is acquired.
- **Discovery/SEO:** free. #4949 and #4951 are closed; PR #4952 merged the comparison-hub discovery repair plus canonical `/evidence/` and `/info/` sitemap/redirect alignment. Post-merge release and deploy checks passed.

Research-only enrichment PRs are non-canonical staging and do not consume, create, or authorize scientific-promotion WIP.

## Ready next — strict dependency order

**A free slot exists only when the candidate's dependencies and lane ownership are current and no higher-risk incident overrides admission. A Ready-next item assigned to an occupied workstream must wait for that workstream's active ticket to merge/close.**

### Next legal admission candidates

| Order | Candidate | Workstream | Admission state | Proof required before implementation |
|---:|---|---|---|---|
| 1 | #5021 | Authority/Content | Ready next — governor lease required | Fresh Session F bootstrap; acquire narrow `compound:vitamin-b6` lease, verify/register journal sources, terminally govern all six staged findings, preserve neuropathy dose/duration boundaries and null/low-quality evidence, then prove post-merge Session F closure. |

Discovery/SEO is free after #4949 and #4951 closed through merged PR #4952. No stale SEO item is promoted merely to fill the slot; any future admission still requires current evidence and this queue.

## Control hardening — merged implementation, observed use still gated

#4413 / PR #4469, #4414 / PR #4490, and #4415 / PR #4492 are merged and retired below. Do not recreate them from an older queue.

- Consult the durable experiment-learning ledger before repeating an equivalent experiment; a retest requires a changed assumption and fresh evidence. Ledger capability does not prove that every producer already emits history.
- The economics contract derives ratios from named observations; missing values remain Unknown. Comparable metric definitions, scope, attribution boundary and window duration are required.
- Positive scale eligibility requires explicit attribution/quality-debt observations and source-bound exposure at the unchanged 250-view floor in both periods. Estimates and merged-code throughput cannot authorize scaling; other domain-specific sufficiency policies are not invented.
- Real CI/resource and attributable growth ratios remain waiting until their supplying observations exist. Neither merge advances M1/M2 or proves business impact.

## External blockers preserved from M0/M1

| ID | Blocker | Current truth | Next legal action |
|---|---|---|---|
| REV-001 / #4280 | Production analytics receipt | Code readiness merged; production GA4/Ahrefs configuration/event receipt remains Unknown | Obtain authorized environment/property/network/DebugView evidence without exposing secrets |
| SEO-004 | 28-day GSC baseline | No authorized fixed-window export in repo | Supply authorized Search Console access/export and record exact dates |
| REV-002 | Aligned funnel/revenue baseline | Cross-source baseline incomplete | Reconcile GA4/GSC/Amazon/Mailchimp once source access exists; partial source-level observations remain explicitly partial |
| #4014 | `main` branch protection/ruleset | Repository enforcement is not proven | Apply/verify required settings with authorized repository-settings access |
| #4341 | Recurring Cloudflare production failure class | Repository-side checks do not expose root-cause logs | Inspect failed production deployment logs; repair only if a deterministic repository/config cause is identified |

## Additional fallback work when every named candidate above is blocked

Promote only after checking overlap, current exact-main state, source freshness, and the canonical governor/lease/provenance contract.

No fallback ticket is currently promoted. #4260 is completed and retired; the next admission requires a fresh authoritative queue decision.

## Sprint exit conditions

The sprint exits only when all of the following are true or have a precise external blocker:

- PRs #4388, #4401, and #4405 are merged or explicitly blocked with exact failing proof; no stale active status remains in control docs.
- PR #4411 / #4410 is merged or explicitly blocked, and active implementation WIP is within the normal three-ticket cap.
- #4412 has proven machine reconciliation and merged; known stale active state must still be reconciled rather than suppressed.
- The governed research object → validated pack → lossless creative plan → deterministic rendered asset chain is reproducible and provenance-bound.
- #4406 has proven an idempotent dry-run lifecycle with stale-asset rejection, durable receipts, retry safety, and rollback/stop semantics.
- #4407 proves deterministic attributable observation ingestion, Unknown handling, replay, cross-platform isolation, and the existing minimum-exposure guard.
- A bounded pilot package can be generated end-to-end and is measurement-ready; live publication is optional only if a supported/authorized provider path exists.
- #4413/#4414/#4415 implementations are merged, and their single-formula/freshness, experiment-memory, and marginal-efficiency boundaries remain preserved in actual use; their merges do not substitute for distribution MVP or observed-outcome proof.
- No broad auto-publishing or high-volume scheduling is enabled merely because the technical chain exists.
- Revenue/GSC/analytics blockers remain honestly labeled and do not silently satisfy M1/M2 exits.
- Backlog and sprint agree with current GitHub state: no completed issue or merged PR occupies an active slot.
- Required scientific, provenance, safety, accessibility, release, and exact-head validation gates remain intact.

## Recently retired from this sprint

- **#4992 / PR #5016 / PR #5020:** Propionate closure merged as `523ba9323dd3506e51f2d1aaab53b6d0a2e49aa5`; post-merge Session E bootstrap proved 4 findings terminal/promoted with 0 pending, and verified state-only lease release merged as `4461ac4c59aa48bafca85125f86e4a37e6ee4610`. No generic efficacy, consumer-dose, or business outcome is inferred.
- **#4266 / PR #4972:** merged as `8aba655daae2aba8d07cd2ba6f32ed52f8f3b498`; registered PMID 41943502 / DOI 10.1002/ptr.70315, added three formulation- and population-bounded KSM-66 safety records, regenerated the governed rollup, and added exact regression coverage without creating an efficacy or general-dose claim. All required exact-head checks passed; PR #4976 subsequently released the governed lease. The optional Cloudflare preview remained in progress at merge and no production outcome is inferred.
- **#4949 / #4951 / PR #4952:** merged as `0c667ca7bd9bf49279594e7df79a806cb4c1237a`; restored direct comparison-hub discovery for the caffeine/L-theanine route, aligned canonical `/evidence/` and `/info/` hubs with sitemap and redirect ownership, and preserved historical audit exports with canonical-source tombstones. Exact-head and post-merge required checks, Cloudflare Pages, and deploy passed. This proves deterministic crawl/release recovery, not traffic, ranking, indexing, analytics, or revenue outcomes.
- **#4731 / PR #4947:** merged as `6e32a773d908495f08fa297fc51da1cea6fb2659`; the factual-copy validator closes the scoped unbound dose-unit, onset/duration, and comparative-efficacy label bypasses with focused rejection/nonfactual controls. The separate Discovery/SEO incident later exposed by post-merge output verification is retired above.
- **#4730 / PR #4858:** merged as `44b019fa1f67ead0538076944224243a098dbfde`; stale published or paused-but-live assets retain a governed withdrawal path and receipt while stale non-live assets remain terminal-invalid. The reopened issue is closed complete.
- **#4784 / PR #4813:** merged as `1e8fae58a3499c9f6a79b4338e636244620ec629`; the least-privilege persistent governor transaction capability is on main. Capability does not equal an acquired lease, and current queue state has none.
- **#4732 / PR #4734:** merged as `4d26d1cfacb5fb577f9216b7fa116e006e7b0a0d`; the bounded Metricool adapter is repository capability only. Provider credentials/configuration, live scheduling, publication confirmation, and public/business outcomes remain externally gated or Unknown.
- **AUTH-001 / #4800 / PR #4803:** current content-audit diagnostic run `33316024891` completed successfully and explicitly printed `AUTH_DUPLICATE_COUNT=0`. PR #4803 closed unmerged because it only added a temporary diagnostic workflow; the historical four duplicate-intent pairs are stale and no redirect/consolidation work was manufactured.
- **SEO-003 / #4795 / PR #4796:** exact-current Schema and Media Governance run `33315511238` passed shared schema regressions, production static export, structured-data completeness, first-party identity/safety policy, and media checks. PR #4796 closed unmerged because its only change was a diagnostic comment; the historical 38-identity failure is stale.
- **#4719 / PR #4720:** merged as `90e2be7233f460919e3341f1aefd0053b1867df2`; governed static-export receipts now bind and restore producer-generated verification state plus the build manifest. Exact-head Build Check, Production Content Lint, and Lighthouse consumers passed; no validation gate was weakened.
- **#4717 / PR #4718:** merged as `97c877513da12137ba666451fff5f6c4f691c483`; accessible vertical-video motion is bounded to calm allowlisted transitions with an explicit zero-motion fallback. This is not live video publication or completion of the deferred encoding boundary.
- **#4715 / PR #4716:** merged as `f06b1d400b465c3997121e2af49b7d3eafc3b503`; the first provenance-bound carousel pilot completes dry-run scheduling only. Live publication remains unauthorized and the future 28-day observation window/value remain null/Unknown.
- **#4651 / PR #4673:** merged as `058326df0f27685072047c465a7b86729bb51b2d`; Session F staging added six append-only research fragments and made zero canonical/public scientific mutations.
- **PR #4631:** merged as `13d80681e32ff95a919651f1d0a4068fc972edee`; it staged the research boundaries later reviewed and promoted through completed #4266 / PR #4972.

- **#4227 / PR #4523:** merged as `9f1a4fe26e7a6caab56de07c5a0f25b2f39c6f15`; exact-head governed static-export reuse is complete and no longer a fallback candidate.
- **#4415 / PR #4492:** merged as `23dc2485720ff6b31043413b2b9295c4886944cb`. Final-head CI passed 2,866 tests across 593 files, real production build/output/SEO, and 42 focused economics regressions ([CI proof](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/33193431644), [focused proof](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/33193431712)). Repaired files verified on main; four review findings resolved after evidence review. Real efficiency observations remain Unknown.
- **#4414 / PR #4490:** merged as `2e67f9e55f4d96dc7d82a683a829a29b4e2298f1`; durable experiment-learning capability is no longer queued. Recorded outcomes and producer integration require their own evidence.
- **#4477 / PR #4478:** merged as `2b25ae9beed63afe1e6c045491828e3f096037e4`; the template catalog no longer active.
- **PR #4491:** merged as `d726f81bc5ababbb024b86782da2e94fbc15989e`; governed safety-line preservation is no longer active.

- **#4407 / PR #4484:** merged as `6fba155c6f241af7cee38981c413bde710d56c1b`; attributable outcome ingestion is no longer ready work. Final-head checks passed; this is implementation proof, not evidence of real observed performance or an executed pilot.

- **#4413 / PR #4469:** merged as `d0936fbe7d41c84c753a8374f2a7b25047322339`; freshness/unlock-aware prioritization no longer occupies active WIP.
- **#4476 / PR #4475:** merged as `65605fd2f4e9cfd85af63c14bd2a583471551bf2`; canonical evidence-grade binding no longer occupies active WIP.
- **#4482 / PR #4481:** research draft staging merged as `d6934eacff95b4b9dc1c3c5be2f0c8a91e9bc4a1`; this is not approval for scientific promotion and does not resolve the recorded source-registry blocker.

- **PR #4457:** completed/merged as `95ec9ba285f06c947f2844a2f81abce031b9e437`; complete canonical safety-warning preservation no longer occupies active WIP.

- **#4412 / PR #4446:** completed/merged as `96a07976dee22cf7b91c337c820cc83ff7e6b860`; machine reconciliation is on main and no longer occupies active WIP. Final-head hosted CI passed all 18 reconciliation cases and 2,785 tests across 587 files; production build/output/SEO passed in [run 33148069222](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/33148069222). Both review findings are verified/resolved. This is implementation proof, not a claim that later planning snapshots or business outcomes are healthy.
- **#4463:** completed/merged as `f300e0e8f3ef8b9a485f0cbd8c0993725bd425b1`; trust-safe thumbnail variants are on main and no longer occupy active WIP.
- **#4460:** completed/merged as `48bebb81e35c4bd605dedbfc15156cabeb915b06`; duplicate-angle suppression is on main and no longer occupies active WIP.
- **#4406:** completed; the governed ready → publish → measured lifecycle is merged and no longer occupies the ready queue.
- **#4439 / PR #4440:** completed/merged; canonical claim/source binding no longer occupies an active slot.
- **PR #4448:** closed unmerged; vertical MP4 implementation is preserved for later legal reuse and does not occupy active WIP.
- **#4447 / PR #4445:** merged as `692d85d1a496188b4bc48113f8f64b5e94c82098`; the hook trust contract no longer occupies an active slot.
- **#4410 / PR #4411:** merged; scoped changed-file-relevant gates are on main. The temporary overflow exception is retired.
- **PRs #4388, #4401, #4405:** merged; renderer, provenance-receipt, and lossless-presentation implementation no longer active.
- **PR #4408 / #4409:** merged/closed; roadmap, sprint, and master backlog synchronized to exact GitHub state on 2026-08-27.
- **#4182:** closed/completed; five herb/compound identity correction no longer active.
- **#4238:** closed/completed; normalized source-registry baseline/provenance continuation no longer active.
- **AUTH-004 / PR #4145:** merged; visual browse refinement no longer active.
- **SEO-005 / PR #4331:** merged; monitor remains file-fed until a supported Bing AI Performance acquisition path exists.
- **I18N-001 / PR #4332:** merged; Japanese/Korean core locale expansion is live while detailed scientific profiles remain fail-closed.
- **REV-005 / PR #4358:** merged; the validated media-pack foundation is now upstream infrastructure for this sprint.
