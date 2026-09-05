# AI Citation Growth Loop

**Status:** Supporting execution standard for issue #5206
**Updated:** 2026-09-04
**Source snapshot:** user-supplied Bing Webmaster Tools AI Page Stats export captured 2026-09-04

## Why this exists

The site now has fresh page-level evidence that Bing's AI surfaces are repeatedly citing The Hippie Scientist. That signal is strategically useful because it shows which published answers are already being reused as grounding sources. It is **not** a substitute for traffic, ranking, conversion, or revenue measurement.

The objective is to turn citation reuse into a controlled feedback loop:

`research → publish → AI reuse observed → protect winners → expand adjacent evidence → strengthen clusters → add bounded downstream conversion → measure again`

This loop must preserve the site's existing scientific, safety, provenance, canonical ownership, accessibility, experiment-memory, WIP, and release gates.

## 2026-09-04 page-level baseline

The supplied Page Stats export contains:

- **16,204 citations** across **91 cited URLs**.
- `/guides/sleep/best-natural-sleep-aids-that-work/`: **5,424 citations**.
- `/guides/best/supplements-for-stress/`: **3,192 citations**.
- The top two pages account for **53.17%** of citations in the export.
- Sleep-classified URLs account for **7,235 citations / 44.65%**.
- Stress/anxiety-classified URLs account for **5,164 citations / 31.87%**.
- Sleep + stress/anxiety therefore account for about **76.5%** of this derived topical classification.
- ADHD/focus is unusual: **19 cited URLs** but only **341 citations** in aggregate. That breadth with low density is a strong consolidation/hub-strengthening test, not evidence of poor content quality.

The dashboard screenshot from the same reporting period showed a rounded **18K Total Citations**, **42 Avg. Cited Pages**, and, for September 2, approximately **1.1K citations across 61 cited pages**. The CSV and dashboard are different reporting surfaces; do not force them to reconcile by inventing missing rows.

## Highest-value winners

The current defend/scale set begins with:

| Rank | URL | Citations | Treatment |
|---:|---|---:|---|
| 1 | `/guides/sleep/best-natural-sleep-aids-that-work/` | 5,424 | Protect cited identity/answer structure; expand around it rather than rewrite it aggressively |
| 2 | `/guides/best/supplements-for-stress/` | 3,192 | Protect; deepen stress/cortisol/adaptogen adjacency and downstream paths |
| 3 | `/articles/valerian-root/` | 827 | Strengthen sleep cluster and evidence/safety spokes |
| 4 | `/guides/anxiety/best-herbs-for-anxiety/` | 685 | Strengthen anxiety cluster and comparison pathways |
| 5 | `/articles/mushroom-coffee-benefits-review/` | 472 | Preserve evidence boundaries; add transparent comparison/conversion pathways |
| 6 | `/articles/how-to-choose-supplement-quality/` | 444 | Treat as a trust/methodology hub for commercial-adjacent journeys |
| 7 | `/articles/kava/` | 417 | Expand stress/anxiety adjacency with safety prominent |
| 8 | `/guides/anxiety/best-supplements-for-overthinking/` | 397 | Expand answer coverage and internal links |
| 9 | `/guides/sleep/best-herbs-for-sleep/` | 385 | Strengthen sleep herb cluster |
| 10 | `/articles/2c-b-effects/` | 319 | Preserve safety/provenance; do not let demand override higher-risk-content gates |

The checked-in derived signal manifest is `config/ai-citation-swarm-priorities.json`. Raw authenticated Bing exports stay outside Git.

## Execution order

### 1. Defend proven winners before changing them

High-citation pages are production assets. For the dominant winners:

- preserve canonical URL, title/H1 intent, direct-answer placement, evidence tables/blocks, limitations, and safety ordering unless there is a documented reason to change them;
- prefer additive, reversible improvements over broad rewrites;
- if identity or route migration is necessary, require canonical/redirect/rollback proof;
- record pre-change citation snapshot and evaluate later against a fresh snapshot.

A citation winner is not untouchable, but it should carry a higher change bar.

### 2. Expand the winning clusters

Use the two dominant clusters as the first place to spend discretionary enrichment effort:

- Sleep: natural sleep aids, sleep supplements, herbs for sleep, glycine, magnesium, L-theanine, valerian, circadian/melatonin questions, comparisons, safety/interactions.
- Stress/anxiety: supplements for stress, herbs for anxiety, adaptogens, overthinking, cortisol/stress-mechanism answers, kava, rhodiola, L-theanine, comparisons, safety/interactions.

Do not manufacture pages merely because a keyword can be imagined. Expansion still requires clear user intent, non-duplicate route ownership, evidence availability, and a useful answer boundary.

### 3. Fix citation cannibalization before multiplying it

The Page Stats export contains near-overlapping sleep-supplement and comparison intents. Before creating adjacent pages:

- map each overlapping URL to a distinct intent;
- verify canonical tags, redirects, sitemap ownership, internal links, and preferred host;
- merge/redirect only when a real duplicate is proven and existing equity can be preserved;
- otherwise sharply differentiate the answer scope.

The export also contained one `www` host URL. Treat that as a canonical/redirect consistency check, not proof of an active host split by itself.

### 4. Build the ADHD hub from the spokes

The ADHD/focus footprint is broad but thin. The first test should be consolidation rather than another wave of disconnected pages:

- select one canonical broad ADHD-supplement hub;
- link cited long-tail ADHD pages into it;
- pull the strongest evidence/safety summaries upward without duplicating unsupported claims;
- make intent boundaries between the hub and compound-specific pages explicit;
- measure whether the hub begins earning citations while preserving citations to useful spokes.

### 5. Monetize downstream, not inside the answer boundary

Citation winners are trust assets first. Commercialization should happen after the user receives the direct answer, evidence context, limitations, and safety information.

Good downstream paths include:

- evidence-based comparison pages;
- transparent evaluation methodology;
- newsletter/research updates;
- clearly disclosed affiliate journeys where appropriate;
- related deeper guides.

Do not turn citation-rich scientific passages into product pitches. Conversion gains remain `Unknown` until attributable observations exist.

### 6. Replicate the structure, not the wording

The swarm should learn which structural patterns repeatedly appear on cited pages:

- direct answer near the top;
- specific scope and population/preparation boundaries;
- concise evidence summaries;
- source-visible tables/ledgers;
- explicit uncertainty/null evidence;
- safety and interaction sections;
- useful comparisons and FAQs;
- strong internal links into a coherent cluster.

Reuse those **information architecture patterns** across eligible pages. Do not clone text or force a single template onto every topic.

## Swarm allocation policy

For discretionary Discovery/SEO and research-enrichment selection, the coordinator should target roughly:

- **65% citation-adjacent capacity**: defend winners, fill adjacent evidence gaps, repair cluster/canonical problems, strengthen cited spokes/hubs, and improve conversion paths downstream of cited answers;
- **35% exploration floor**: uncited topics, new research, emerging demand, safety gaps, and novel high-value opportunities.

This is a portfolio target, **not a new backlog score formula** and not a reason to violate the three-workstream WIP cap. Safety/scientific/canonical/governance blockers override it.

## Lane behavior

### Coordinator

- Read `config/ai-citation-swarm-priorities.json` at the start of a selection cycle.
- Re-rank eligible work when a fresh citation snapshot materially changes demand evidence.
- Protect the 35% exploration floor.
- Prevent two lanes from independently editing the same winner or cluster hub.

### Discovery / SEO

- Own winner protection, canonical/intent audits, internal-link architecture, cluster maps, cited-page spread, and citation measurement.
- Treat page-level citation telemetry as a first-party demand/authority signal inside the existing backlog scoring inputs, especially Traffic Potential, Strategic Leverage, and Confidence.
- Never treat citations as traffic or revenue.

### Authority / Evidence / Safety

- Prioritize high-value evidence gaps adjacent to proven citation clusters when all scientific gates are satisfied.
- Strengthen contradiction/null evidence, interactions, contraindications, and preparation/population boundaries on cited or citation-adjacent pages.
- Never let commercial or citation demand lower evidence thresholds.

### Revenue / Growth

- Build post-answer next actions on proven winner pages only after the evidence/safety boundary.
- Prefer trust-preserving journeys over intrusive monetization.
- Require attributable observation before calling a conversion treatment successful.

### Engineering / QA

- Keep winner identities and canonical routes regression-protected.
- Add deterministic checks when a repeated failure class is discovered.
- Validate responsive/a11y behavior for any new post-answer component or information architecture.

## Measurement cadence

Every fresh Bing page-level export should update:

1. total citations and cited URL count;
2. top-page concentration;
3. unique cited URLs and first-time cited URLs;
4. rising/falling citations when a comparable prior snapshot exists;
5. cluster citation share;
6. citation density per cluster;
7. protected winner set;
8. cited-but-low-search-traffic opportunities when aligned search data exists;
9. downstream attributable conversion only when valid analytics receipts exist.

A rolling-window vendor export is not a causal experiment. Preserve dated snapshots so velocity can eventually be measured.

## Stop rules

Stop or downgrade a citation-driven change when:

- citations fall materially after a change and no stronger explanation is supported;
- canonical/route ownership becomes ambiguous;
- evidence/safety quality degrades;
- the work duplicates an existing page without a clear intent split;
- conversion UI displaces answer/evidence/safety content;
- a fresh snapshot shows the assumed cluster signal has materially weakened;
- the exploration floor is being starved by winner-chasing.

## Current first actions

Issue #5206 owns this activation pass. In order:

1. Promote the fresh page-level snapshot into the authoritative planning docs.
2. Use the derived signal manifest in swarm selection.
3. Protect the two dominant winner pages from gratuitous identity/structure churn.
4. Audit the overlapping sleep-supplement URLs and preferred-host/canonical consistency.
5. Strengthen the canonical ADHD hub from its 19 cited spokes.
6. Add bounded post-answer conversion paths to selected citation winners under the existing Revenue/Conversion lane rules.
7. Refresh the snapshot on the next reporting cycle and re-rank based on observed movement.
