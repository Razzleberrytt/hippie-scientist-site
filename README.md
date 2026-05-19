# The Hippie Scientist

Data-driven educational site for herbs and compounds.

## Quick start

```bash
npm install
npm run dev
```

## Current MVP Architecture

- Framework/runtime: **Next.js App Router** with static export.
- Canonical production host: **Cloudflare Pages**.
- Build command: `npm run build`.
- Verification command: `npm run verify:build`.
- Static deploy directory: `out/` (Cloudflare deploy target).
- Data source of truth: `data-sources/herb_monograph_master.xlsx` (workbook-only policy).
- Generated runtime data: `public/data/**` and `public/blogdata/**` are disposable generated artifacts and must not be manually edited.
- Blog pages are rendered by the Next.js App Router under `app/blog/**`. Do not commit generated `public/blog/**/index.html` files that duplicate active App Router blog routes.
- Legacy feature sets (lead capture, affiliate/product modules, recommendations, graph/effect search, governed enrichment tooling, old client-router paths) are removed from active MVP scope or deferred unless explicitly reintroduced through approved routes and passing build checks.

## Data pipeline (production default)

Production data is generated from a single workbook source of truth:

- Source workbook: `data-sources/herb_monograph_master.xlsx`
- Generated output: `public/data/**`
- Do not manually edit generated JSON in `public/data`
- Build runtime data with: `npm run data:build`

Build path summary:

- `npm run build` runs workbook generation + validation + source-of-truth guards + `next build` + `npm run verify:build`

If a content issue is found, classify and fix at the proper layer:

- `WORKBOOK_FIX`
- `WORKBOOK_GPT_FIX`
- `GENERATOR_FIX`

See `docs/workbook-only-data-contract.md`.

## Active App Router routes

Document only active Next.js App Router routes backed by `app/**/page.tsx`. Keep this inventory synchronized with the filesystem because CI validates this section.

### Canonical route inventory

- `/`
- `/a-tier`
- `/about`
- `/analytics`
- `/best/:slug`
- `/best-for/:slug`
- `/best-for/non-stimulant-focus`
- `/best-for/sleep-support`
- `/best-supplements-for-fat-loss`
- `/best-supplements-for-focus`
- `/best-supplements-for-gut-health`
- `/best-supplements-for-sleep`
- `/blog`
- `/build`
- `/collections`
- `/compare/:slug`
- `/compare/rhodiola-vs-ashwagandha`
- `/comparisons/recovery-oriented-cognition-systems`
- `/compounds/:slug`
- `/contact`
- `/data-fix`
- `/data-report`
- `/dev`
- `/disclaimer`
- `/drafts`
- `/education/evidence-hierarchy`
- `/education/how-learning-affects-neuroplasticity`
- `/education/how-memory-formation-works`
- `/education/how-receptors-work`
- `/education/how-sleep-affects-neurochemistry`
- `/education/how-stress-affects-the-brain`
- `/education/how-the-brain-recovers-from-fatigue`
- `/education/how-to-read-scientific-studies`
- `/education/placebo-and-context-effects`
- `/education/scientific-but-human-neuroscience`
- `/education/understanding-placebo-and-expectancy`
- `/education/what-are-adaptogens`
- `/education/what-is-a-nootropic`
- `/education/why-burnout-affects-cognition`
- `/education/why-human-trials-matter`
- `/education/why-neurochemistry-is-complex`
- `/education/why-neuroscience-is-difficult`
- `/education/why-online-supplement-claims-spread`
- `/education/why-studies-conflict`
- `/explore/:topic`
- `/explore/sleep`
- `/graph`
- `/guides/best-natural-sleep-aids-that-work`
- `/guides/focus-without-caffeine-crash`
- `/guides/supplements-for-brain-fog-and-fatigue`
- `/herbs/:slug`
- `/learn`
- `/natural-testosterone-boosters`
- `/pathways/cholinergic-system`
- `/pathways/gaba`
- `/preview`
- `/privacy`
- `/protocols/burnout-recovery`
- `/protocols/non-stimulant-focus`
- `/protocols/overstimulation-recovery`
- `/protocols/recovery-oriented-productivity`
- `/psychedelic-adjacent-herbs`
- `/psychoactive/serotonergic-stacking-risks`
- `/sleep-herbs-vs-melatonin`
- `/stacks/:slug`
- `/temp`
- `/test`
- `/theme`
- `/tmp`
- `/top/best-supplements-for-brain-fog`
- `/top/focus`
- `/top/stress`
- `/top/top-3-herbs-for-anxiety`
- `/top/top-3-natural-sleep-aids`
- `/top/top-3-supplements-for-focus`

## Deployment (production)

This repository is a **source repo**. Deploy static output from `out/`.

- Host: Cloudflare Pages
- Build command: `npm run build`
- Verify before deploy: `npm run verify:build`
- Deploy directory: `out/`
- Redirect and header infrastructure is static and Cloudflare-compatible via `public/_redirects` and `public/_headers` (exported into `out/`)

Do **not** commit generated deploy output.
