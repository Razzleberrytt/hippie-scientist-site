# High-ROI content pass — 2026-07-15

## Decision

The repository has completed the recent trust, structured-safety, runtime, build, and dependency work. The next pass should therefore optimize existing pages that already combine search intent with realistic affiliate intent. It should not create another broad infrastructure project or bulk-publish new URLs.

## New deterministic ranking tool

Run:

```bash
node scripts/audit/high-roi-content-opportunities.mjs
```

Outputs:

- `reports/high-roi-content-opportunities.json`
- `reports/high-roi-content-opportunities.md`

The audit scans app-router pages and ranks commercially relevant routes using three factors:

1. **Intent** — best/review/comparison/product/dose/stack and goal-specific language.
2. **Readiness** — evidence links, answer-first copy, decision support, internal links, useful depth, and freshness signals.
3. **Monetization gap** — valuable intent without an approved recommendation module, revenue-product connection, evidence, or conversion-oriented decision support.

## First execution batch

Start with the top five routes produced by the audit. For each route, close only the highest-value gaps:

- sharpen title and description around the exact decision the searcher is making;
- give a direct answer above the fold;
- add a problem-to-option or comparison framework;
- connect only a context-matched approved product set;
- place the recommendation after enough evidence to earn the click;
- strengthen supporting internal links;
- remove unsupported certainty, especially dose, safety, and mechanism claims;
- preserve affiliate disclosure and restricted-ingredient safeguards.

## Immediate hand-audited candidate

`/guides/sleep/best-supplements-for-sleep/` is already a strong commercial-intent hub and has an approved magnesium recommendation module. It should be treated as a conversion-quality optimization target, not rebuilt.

Highest-value corrections for that page:

1. Replace claims that overstate magnesium sleep evidence in healthy populations.
2. Remove the unsupported claim that high-dose melatonin suppresses endogenous production.
3. Reframe supplement stacks as low-certainty combinations rather than evidence-backed protocols.
4. Remove broad claims that valerian requires two to four weeks or works best with hops/lemon balm unless directly supported on-page.
5. Replace the magnesium-form statement implying glycinate or threonate is established for sleep/cognition with a more evidence-bounded buying criterion: elemental dose, tolerability, formulation transparency, and kidney/medication precautions.
6. Move the product module closer to the magnesium decision context while keeping it below the evidence and safety explanation.
7. Update visible and structured modification dates only after substantive revision.

## Measurement

For every completed page, record:

- route;
- before/after audit score;
- title and description changes;
- answer-first or decision-support change;
- recommendation-module change;
- internal links added;
- unsupported claims removed;
- Bing/Google impressions and clicks at 14 and 28 days;
- affiliate outbound clicks and conversions when available.

## Stop condition

Do not expand the batch until the first five pages are revised, validated, deployed, and measured. The purpose is to learn which page-level changes produce impressions, clicks, and revenue—not to maximize the number of files touched.
