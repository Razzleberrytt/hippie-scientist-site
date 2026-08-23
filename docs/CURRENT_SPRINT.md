# Current Sprint

**Status:** Authoritative immediate execution queue
**Sprint:** Revenue Foundation Baseline
**Updated:** 2026-08-23
**WIP limit:** Maximum three concurrent workstreams; within each workstream, activate one ticket at a time. An agent works one scoped ticket and stops after proof and record updates.

## Sprint objective

Establish trustworthy production measurement, reconcile indexability truth, and prepare exactly one evidence-safe commercial journey for improvement. The sprint does not authorize broad content creation, robot overrides, redesign, or infrastructure replacement. **Exceptions:** on 2026-08-22 the project owner directly authorized one scoped visual-system refinement (`AUTH-004`), then explicitly asked that the refinement continue through the primary library browse experience; it must preserve routes, evidence/safety semantics, canonical CSS ownership, accessibility, and performance gates and does not authorize a second redesign system. On 2026-08-23 the project owner directly authorized an exhaustive data-enrichment pass. That pass is scoped as `SEO-006`: verify and repair the existing source/claim backlog through the governed evidence pipeline, never fabricate evidence, never use identifier presence alone as proof, and never auto-promote a profile merely because a source was verified.

## Queue rules

- Start the highest-priority unblocked ticket in a workstream.
- `Ready` means dependencies are satisfied; `Blocked` names the missing dependency.
- A direct owner instruction may temporarily displace queue order when the exception is recorded here before completion and remains within an existing workstream/WIP limit.
- Completion requires the acceptance criteria and proof below, relevant tests, and the production build unless the ticket is explicitly access-only.
- Analytics values remain `Unknown` until exported from an authorized source.

## 1. Discovery / SEO

| ID | Ticket | Priority | Owner | Dependencies | Acceptance criteria | Proof required | Relevant scope | Status | Effort | Expected impact |
|---|---|---|---|---|---|---|---|---|---|---|
| SEO-006 | Exhaustively verify and repair held-profile evidence enrichment | P0 owner-directed | Evidence/data engineer | Direct owner request 2026-08-23; preserve evidence/safety/indexability gates | Existing identifier-bearing held-profile citations are read and classified as verified, rejected, or repair-needed; only genuinely on-topic citations are registered as source-backed; misattributions and claim-role defects remain quarantined/documented; profiles are not auto-published; original-sourcing backlog is measured for follow-on waves | Source-by-source verification log, registry diff, rejected/repair-needed list, relevant governance/data validations, production build | `scripts/data/apply-governance-overlay.mjs`, generated profile evidence surfaces, evidence audit docs | Active | L | Converts the current enrichment backlog into trustworthy structured evidence without weakening scientific governance |
| SEO-001 | Reconcile post-build profile publication truth | P0 | Data/SEO engineer | None | One post-invariant artifact reports every profile's final robots, sitemap eligibility, and reason; counts match built HTML and sitemap in a clean production build | Command log, count diff before/after, passing parity regression, build result | `scripts/`, `public/data/publication-*`, sitemap/robots builders | Ready | M (1–2 d) | Restores reliable indexing decisions and prevents unsafe robot overrides |
| SEO-002 | Recover reviewed flagship profile source roles | P0 | Evidence/content engineer | SEO-001; review PR #4089 before duplicating work | Ashwagandha and L-theanine evidence roles are reviewed against sources; valid roles survive regeneration; pages index only if all existing gates pass | Source-review record, regenerated diff, route-specific tests, final HTML robots/sitemap proof | Workbook, source registry/overlays, `/herbs/ashwagandha/`, `/compounds/l-theanine/` | Blocked | L (2–4 d) | Can restore two high-value depth pages without weakening governance |
| SEO-003 | Clear current schema identity gate | P1 | SEO engineer | Reproduce latest workflow; coordinate open PRs | All first-party Person/Organization IDs are consistent on affected ADHD guides; full schema policy and regression suite pass | Failing/passing report, fixture or route tests, production build | JSON-LD helpers, `/guides/adhd/*`, schema workflows | Ready: full local policy reproduces 38 violations | M | Restores a current release gate and entity consistency |
| SEO-004 | Import 28-day GSC opportunity baseline | P0 | Growth analyst | Search Console access/service account | Scoreboard contains 28-day impressions, clicks, CTR, position, top landing pages, pages near top 20/top 10, and gainers/losers with exact dates | Read-only export/query, saved aggregate with no secrets, scoreboard update | Search Console, `scripts/seo/fetch-search-console.mjs` | Blocked: credentials | S | Replaces speculative SEO priorities with observed demand |

## 2. Revenue / Conversion

| ID | Ticket | Priority | Owner | Dependencies | Acceptance criteria | Proof required | Relevant scope | Status | Effort | Expected impact |
|---|---|---|---|---|---|---|---|---|---|---|
| REV-001 | Verify production analytics and governed funnel events | P0 | Analytics engineer | GA4/Ahrefs property access; production env visibility | Confirm identifiers load after consent, not before; verify page/guide view and affiliate-click events with page/CTA/destination context; document any missing configuration without inventing values | Network/DebugView screenshots or timestamped event log, consent test, env-name checklist, no secret values | `src/lib/loadAnalytics.ts`, `components/ClickTracker.tsx`, consent provider, live site | Ready; access may block final receipt | S (≤1 d) | Unlocks every traffic/conversion decision and detects broken tracking |
| REV-002 | Establish aligned funnel and revenue baseline | P0 | Growth analyst | REV-001; GA4, Amazon, Mailchimp access | Fixed 28-day sessions, landing engagement, affiliate clicks, CTR, revenue, RPM, and email signups are imported with source and date range; unavailable metrics remain explicitly Unknown | Read-only exports and reconciliation notes; scoreboard update | GA4, Amazon Associates, Mailchimp, `docs/SCOREBOARD.md` | Blocked: REV-001/access | S | Creates the first honest business baseline |
| REV-003 | Select one flagship commercial decision page | P1 | Product/growth lead | SEO-004 and REV-002 | One existing indexable page is selected using demand, intent, evidence completeness, safety, and conversion data; alternatives and non-selection reasons recorded | Scored shortlist and dated decision entry | Existing `/guides/compare/*`, `/guides/best/*`, `/guides/sleep/*` | Blocked | S | Focuses conversion work on the highest-confidence existing opportunity |
| REV-004 | Validate flagship disclosure and destinations | P1 | Commerce/editorial reviewer | REV-003 | Disclosure occurs before first affiliate link; every destination resolves to the intended product/form/market; search fallbacks are retained or replaced only with documented reason | Link audit, live screenshots, source diff, affiliate-tag audit | Selected route, `config/revenue-products.ts`, disclosure components | Blocked | S–M | Improves trust and reduces broken or low-relevance commercial exits |

## 3. Authority / Content

| ID | Ticket | Priority | Owner | Dependencies | Acceptance criteria | Proof required | Relevant scope | Status | Effort | Expected impact |
|---|---|---|---|---|---|---|---|---|---|---|
| AUTH-004 | Refine canonical visual system across flagship and primary browse surfaces | P0 owner-directed | UI/experience engineer | Direct owner requests 2026-08-22; avoid active Research PR overlap | Shared canvas, surfaces, typography, controls, chrome, homepage composition, and primary Herbs/Compounds browse journeys feel materially more coherent and premium; mobile goal navigation is balanced; library loading/filter/card/pagination states share one visual language; routes, content meaning, evidence/safety semantic colors, dark mode, reduced motion, and canonical ownership remain intact | Source diff, visual-system and library-browse regression tests, relevant UI checks, production build, rendered light/dark mobile/desktop review when available | Canonical premium CSS owners, homepage route-scoped CSS, shared decision/pagination components, `/herbs`, `/compounds` | In Review | M | Raises perceived authority and coherence across the highest-visibility discovery surfaces without creating redesign debt |
| AUTH-001 | Resolve four verified duplicate-intent route pairs | P1 | Content SEO editor | Inspect traffic/canonical/link evidence before deciding | Each pair has a documented canonical owner; content is differentiated or consolidated; any removed URL has a redirect; exact regressions pass | Intent matrix, GSC evidence or Unknown label, redirect/internal-link tests, build | Four pairs listed in `CURRENT_STATE.md`, `public/_redirects` | Ready | M | Concentrates relevance and removes misleading duplicate surfaces |
| AUTH-002 | Strengthen links to the selected flagship | P1 | Content editor | REV-003; link audit | Only contextually relevant existing pages link to the flagship with descriptive anchors; no redirect-hop or orphan regression | Before/after link graph, changed-route list, full link audit, build | Selected cluster and related monographs/guides | Blocked | M | Improves discovery and user journeys without new content volume |
| AUTH-003 | Upgrade the selected existing decision page | P1 | Evidence-first content editor | REV-003, REV-004; evidence review | Page meets the decision-page standard, separates outcomes, includes contrary/null evidence and safety/directness boundaries, and improves CTA clarity without ranking by commission | Claim-source review, route-specific regressions, disclosure/link audit, visual check, build | Selected flagship route and evidence sources | Blocked | L | Creates the first measurable evidence-safe revenue-loop experiment |

## Sprint exit conditions

- REV-001 and SEO-001 are complete or have precise external-access blockers.
- SEO-006 either closes the current identifier-bearing verification backlog or leaves each unresolved record in an explicit rejected/repair-needed state without weakening evidence gates.
- The current schema and safety/runtime failures have owners and reproducible proof.
- A fixed-period search and business baseline exists, or every unavailable field has an owner and acquisition step.
- One flagship page is selected only after evidence and measurement dependencies are satisfied.
- No more than three workstreams were active, and no speculative page production was added.
- AUTH-004 either passes its visual/build proof or remains In Review with the limitation recorded; it does not relax evidence, safety, accessibility, or performance gates.

## Completed during the reset

- **SAFE-001:** Search interaction flags now honor generated interaction edges; the runtime regression and strict four-profile trust audit pass with zero actionable findings.
- **OPS-002:** Generated-data governance and citation writes retry bounded transient Windows file locks, while non-transient failures such as `ENOSPC` still fail immediately. Unit tests and the production build pass.
