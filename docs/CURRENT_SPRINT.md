# Current Sprint

**Status:** Authoritative immediate execution queue
**Sprint:** Governed Distribution MVP + Measurement Foundation
**Updated:** 2026-08-27
**WIP limit:** Maximum three concurrent implementation tickets. The Evidence → Distribution initiative may use separate lanes only when scopes are orthogonal and one ticket per lane is active.

## Sprint objective

Finish the smallest trustworthy Evidence → Distribution loop that can produce a governed asset, preserve exact factual provenance through presentation/rendering, move it through an idempotent dry-run publishing lifecycle, and accept attributable outcome observations for deterministic feedback.

This sprint is an **acceleration track inside M1**, not a declaration that the Revenue Foundation is complete. GA4/GSC/affiliate alignment and production analytics receipt remain blocked by authorized external access. Those blockers stay visible, but they do not freeze unrelated governed distribution work.

The sprint does **not** authorize broad/high-volume auto-posting, scientific rewriting, evidence-grade mutation, invented safety language, consumer-dose directives, a second factual dataset, speculative content volume, or milestone completion without proof.

## Execution rules

- Start only tickets listed under `Active` or `Ready next` below.
- GitHub issue/PR state outranks stale document wording.
- When a ticket merges/closes, remove it from `Active` on the next control sync.
- One lane may not edit another lane's source-of-truth surface merely to move faster.
- L1 owns rendering/media infrastructure; L2 factual/provenance; L3 opportunity/measurement; L4 presentation/experiments; L5 lifecycle/publishing.
- Canonical research objects and governed upstream evidence remain factual authority.
- Every distribution asset must retain canonical source URL/content hash and the exact approved factual/limitation boundary.
- Missing production/external metrics remain `Unknown`, never zero and never inferred success.
- Positive performance feedback must preserve the existing minimum-exposure threshold and may re-rank only already-eligible opportunities.
- Deterministic failures found inside scope are repaired before merge. Merge only on exact intended head when required gates are green and no blocking review/governance defect remains.

## Active — WIP 3/3

| Lane | Issue / PR | Ticket | Status | Must prove before merge |
|---|---|---|---|---|
| L1 Rendering | #4389 / PR #4388 | Deterministic provenance-bound SVG carousel renderer | In Review | Identical validated inputs → byte-stable SVGs/manifest hashes; source URL/content hash retained; no factual rewrite/truncation; oversized copy fails closed; Research Distribution + release gates green |
| L2 Provenance | #4400 / PR #4401 | Field-level factual provenance receipts | In Review | Finding/limitation and canonically owned study context map to exact canonical field/hash; null context is not fabricated; tampering fails; whole-object stale invalidation remains intact |
| L4 Presentation | #4404 / PR #4405 | Lossless creative presentation adapter | In Review | Ordered continuation slides reconstruct governed factual copy exactly; citations/color/safe-area metadata survive every continuation; no ellipsis, drop, reorder, paraphrase, or rewrite |

## Ready next — strict dependency order

A free slot should take the highest item whose dependencies are actually satisfied.

### 1. L5 — #4406 governed ready → publish → measured lifecycle

**Start when:** the renderer and presentation boundaries it consumes are merged/stable enough to bind exact asset identity.

**Required result:**

- one canonical lifecycle for generated/validated/ready/scheduled/published/measured (or the smallest equivalent compatible state model);
- state transitions bound to exact upstream research-object, pack, creative, render-manifest, destination, platform/format, and attribution identity;
- stale assets fail closed;
- idempotent scheduling/publishing with durable receipts;
- duplicate attempts cannot create duplicate publication;
- partial/external failures are explicit and retry-safe;
- pause/stop/rollback semantics exist before scale;
- dry-run is the default; absent provider credentials/support yields a waiting state, not fake success;
- no scientific or canonical-site mutation.

### 2. L3 — #4407 attributable outcome ingestion

**Start when:** #4406 provides a stable publication/asset receipt identity.

**Required result:**

- canonical observation schema keyed to campaign/asset/platform/format/source/hash/receipt/window;
- deterministic normalization and replay;
- missing/stale/mismatched/duplicate observations remain Unknown/rejected;
- platform results stay attribution-separated;
- existing anti-saturation and duplicate-angle penalties continue to work without performance data;
- positive rewards remain impossible below the existing ≥250 measured-view threshold;
- performance feedback cannot alter scientific eligibility, claims, evidence grades, limitations, safety, or canonical content.

### 3. First bounded pilot package

**Start when:** L1/L2/L4 + #4406 + #4407 boundaries are proven.

The first pilot should use already-governed research, deterministic assets, tagged destinations, durable lifecycle receipts, and an explicit observation window. It may be published only through a supported, attributable, policy-compliant path. If no provider integration/credentials are available, the sprint may complete the end-to-end dry-run and record the external execution blocker rather than inventing a live result.

## External blockers preserved from M0/M1

| ID | Blocker | Current truth | Next legal action |
|---|---|---|---|
| REV-001 / #4280 | Production analytics receipt | Code readiness merged; production GA4/Ahrefs configuration/event receipt remains Unknown | Obtain authorized environment/property/network/DebugView evidence without exposing secrets |
| SEO-004 | 28-day GSC baseline | No authorized fixed-window export in repo | Supply authorized Search Console access/export and record exact dates |
| REV-002 | Aligned funnel/revenue baseline | Cross-source baseline incomplete | Reconcile GA4/GSC/Amazon/Mailchimp once source access exists; partial source-level observations remain explicitly partial |
| #4014 | `main` branch protection/ruleset | Repository enforcement is not proven | Apply/verify required settings with authorized repository-settings access |
| #4341 | Recurring Cloudflare production failure class | Repository-side checks do not expose root-cause logs | Inspect failed production deployment logs; repair only if a deterministic repository/config cause is identified |

## Highest-value fallback work if the distribution dependency chain is blocked

These items are **not active while WIP is full**. Promote one only after checking overlap and current exact-main state.

1. **SEO-003** — reproduce and clear the current schema identity gate.
2. **AUTH-001** — resolve verified duplicate-intent owners using current route/query evidence.
3. **#4227** — reduce duplicated full production exports without weakening exact-SHA fail-closed validation.
4. **#4266 / #4260** — governed recent-evidence enrichment under the existing governor/lease/provenance contract.

## Sprint exit conditions

The sprint exits only when all of the following are true or have a precise external blocker:

- PRs #4388, #4401, and #4405 are merged or explicitly blocked with exact failing proof; no stale active status remains in control docs.
- The governed research object → validated pack → lossless creative plan → deterministic rendered asset chain is reproducible and provenance-bound.
- #4406 proves an idempotent dry-run lifecycle with stale-asset rejection, durable receipts, retry safety, and rollback/stop semantics.
- #4407 proves deterministic attributable observation ingestion, Unknown handling, replay, cross-platform isolation, and the existing minimum-exposure guard.
- A bounded pilot package can be generated end-to-end and is measurement-ready; live publication is optional only if a supported/authorized provider path exists.
- No broad auto-publishing or high-volume scheduling is enabled merely because the technical chain exists.
- Revenue/GSC/analytics blockers remain honestly labeled and do not silently satisfy M1/M2 exits.
- Backlog and sprint agree with current GitHub state: no completed issue or merged PR occupies an active slot.
- Required scientific, provenance, safety, accessibility, release, and exact-head validation gates remain intact.

## Recently retired from this sprint

- **#4182:** closed/completed; five herb/compound identity correction is no longer active.
- **#4238:** closed/completed; normalized source-registry provenance continuation is no longer active.
- **AUTH-004 / PR #4145:** merged; visual browse refinement is no longer active.
- **SEO-005 / PR #4331:** merged; monitor remains file-fed until a supported Bing AI Performance acquisition path exists.
- **I18N-001 / PR #4332:** merged; Japanese/Korean core localization is live while detailed scientific profiles remain fail-closed.
- **REV-005 / PR #4358:** merged; the validated media-pack foundation is now upstream infrastructure for this sprint.