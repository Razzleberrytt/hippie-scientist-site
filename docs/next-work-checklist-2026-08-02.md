# Next Website Work Checklist

Created: August 2, 2026
Scope: Finish the current batch, establish trustworthy measurement, and improve conversion on existing high-intent pages before expanding the content footprint.

## Execution status — August 2, 2026

### Completed in code

- [x] Reviewed, regenerated, validated, committed, pushed, and merged the original batch in PR #2401.
- [x] Improved the answer-first, evidence, safety, references, internal links, schema path, and recommendation logic on all five priority guides.
- [x] Removed duplicate or overly broad product searches from the L-theanine guide and duplicate monetization from the rhodiola comparison.
- [x] Removed the unsupported full-stack product search from the sleep-stack buyer guide.
- [x] Confirmed the ADHD checklist CTA is present on the ADHD hub and primary ADHD supplements guide.
- [x] Confirmed consent-aware lead-magnet click tracking and added regression coverage for CTA placement and priority-guide readiness.
- [x] Aligned the cluster-member runtime test with governed build-time indexability values so a sourced `NEEDS_REVIEW` decision is not overwritten by a stale hardcoded expectation.

### Still requires production access or elapsed data

- [ ] Verify Cloudflare environment variables and bindings (`NEXT_PUBLIC_GA4_ID`, Mailchimp, Turnstile, and `RATE_LIMIT_KV`).
- [ ] Observe real GA4 events, complete a production test signup, and verify the welcome sequence and source attribution.
- [ ] Record Search Console, Bing, Amazon Associates, Mailchimp, and route-level conversion baselines.
- [ ] Replace remaining generic affiliate searches only after direct destinations, ASINs, availability, labels, and restrictions are manually verified.
- [ ] Record mobile/desktop and light/dark production spot checks after the follow-up deployment.
- [ ] Wait 14 and 28 days, record conversion results, then select the next content batch from observed data.

## Working rules

- [ ] Preserve stable routes and add redirects for any unavoidable route change.
- [ ] Keep the static-export deployment model compatible with Cloudflare Pages.
- [ ] Make structured content changes in `data-sources/herb_monograph_master.xlsx`, then regenerate `public/data`.
- [ ] Keep efficacy claims conservative and cited; separate human evidence from mechanistic, animal, in vitro, and traditional-use support.
- [ ] Keep safety information visible even when efficacy evidence is limited.
- [ ] Render the affiliate disclosure before the first affiliate link.
- [ ] Use `AFFILIATE_TAGS.amazon`; do not hardcode affiliate tags.
- [ ] Do not start another broad infrastructure project or bulk content expansion during this cycle.

## Phase 1 — Finish and ship the current batch

### Review the existing worktree

- [ ] Group the current modifications into route/content, workbook/data, generated reports, and shared-component changes.
- [ ] Confirm every modified file belongs to the intended batch.
- [ ] Review the workbook changes before regenerating artifacts.
- [ ] Confirm generated files were produced by the current pipeline rather than edited accidentally.
- [ ] Review the current changes to these high-intent routes first:
  - [ ] `/guides/anxiety/ashwagandha-for-anxiety`
  - [ ] `/guides/sleep/magnesium-types-for-sleep`
  - [ ] `/guides/herbs/kava`
  - [ ] `/guides/other/sleep-supplements-guide`
  - [ ] `/guides/stress`
- [ ] Review the newsletter component and footer changes for consistent signup behavior.

### Validate the data pipeline

- [ ] Run `npm run data:build`.
- [ ] Confirm `public/data/publication-manifest.json` was regenerated.
- [ ] Confirm `counts.herbs_eligible > 0`.
- [ ] Reconcile the compound count across the publication manifest, indexability report, runtime data, sitemap, and homepage.
- [ ] Confirm slugs and required fields validate successfully.
- [ ] Review the regenerated diff for unexpected large-scale content changes.

### Run release checks

- [ ] Run `npm run check:fast`.
- [ ] Run `npm run build`.
- [ ] Run `npm run verify:output`.
- [ ] Confirm performance budgets still pass.
- [ ] Spot-check representative pages on mobile and desktop.
- [ ] Spot-check light and dark mode.
- [ ] Verify the homepage, guide hubs, herb profiles, compound profiles, search, robots, and sitemap outputs.
- [ ] Commit and deploy only after the intended diff and checks are clean.

### Phase 1 completion gate

- [ ] The current worktree batch is reviewed, validated, committed, and deployed.
- [ ] Production routes return the expected status and canonical URL.
- [ ] No generated-data, sitemap, internal-link, schema, or static-export blocker remains.

## Phase 2 — Establish the measurement baseline

### Production analytics

- [ ] Verify `NEXT_PUBLIC_GA4_ID` is set for the production Cloudflare Pages build.
- [ ] Confirm analytics loads only after consent.
- [ ] Verify these events in GA4 Realtime or DebugView:
  - [ ] `affiliate_click`
  - [ ] `email_signup`
  - [ ] `guide_view`
  - [ ] lead-magnet click/download event
- [ ] Confirm each conversion event includes the source route and useful product or CTA context.
- [ ] Confirm internal development/local-storage analytics are not being mistaken for production reporting.

### Search and revenue reporting

- [ ] Verify Google Search Console ownership and sitemap submission.
- [ ] Verify Bing Webmaster Tools ownership and sitemap submission.
- [ ] Record current clicks, impressions, CTR, and average position for the target pages.
- [ ] Confirm Amazon Associates click and ordered-item reporting is available.
- [ ] Confirm Mailchimp subscriber and source reporting is available.
- [ ] Enter the baseline in `docs/marketing/weekly-cro-tracker.md`.

### Phase 2 completion gate

- [ ] A real production event has been observed for every critical conversion event.
- [ ] Search, affiliate, and email reporting can be reviewed by route or campaign where supported.
- [ ] The baseline date and values are recorded before page optimization begins.

## Phase 3 — Optimize the first five high-intent pages

Work in this order unless production traffic data supports a different order:

1. `/guides/anxiety/ashwagandha-for-anxiety`
2. `/guides/sleep/magnesium-types-for-sleep`
3. `/guides/sleep/sleep-stack-guide`
4. `/guides/anxiety/l-theanine-for-anxiety`
5. `/guides/herbs/rhodiola-extract-vs-powder`

For each page:

- [ ] Record the current title, description, audit score, impressions, clicks, and conversions.
- [ ] State the searcher's decision clearly above the fold.
- [ ] Add or improve the concise answer-first block.
- [ ] Add a problem-to-option or symmetrical comparison framework where useful.
- [ ] Separate evidence strength from mechanism plausibility.
- [ ] Remove or soften unsupported efficacy, dose, timing, stacking, and safety certainty.
- [ ] Keep contraindications, interactions, and clinician-routing language visible.
- [ ] Add contextual links to relevant herb or compound profiles.
- [ ] Add at least one relevant guide, comparison, or commercial decision page.
- [ ] Confirm breadcrumbs, FAQ schema, and other applicable structured data are present without duplication.
- [ ] Place any recommendation module after enough evidence and safety context to earn the click.
- [ ] Confirm every recommended product has a distinct role and matches the page's decision logic.
- [ ] Confirm disclosure appears before the first affiliate link.
- [ ] Test mobile, desktop, light mode, and dark mode.
- [ ] Run the appropriate content, build, and output checks.
- [ ] Record the after score and exact changes made.

### Phase 3 completion gate

- [ ] All five pages are deployed.
- [ ] Each page has before/after measurements documented.
- [ ] No additional page batch begins until the first five have at least 14 days of production data.

## Phase 4 — Improve affiliate link quality

- [ ] Rank product modules by page traffic and affiliate-click volume.
- [ ] Begin with sleep, ADHD, anxiety, and focus pages that already receive qualified traffic.
- [ ] Review the products currently shown on each selected page.
- [ ] Replace generic Amazon search links with verified direct ASIN links where appropriate.
- [ ] Confirm product availability, formulation, dose labeling, and brand identity before publishing.
- [ ] Avoid implying that brand reputation proves efficacy or safety.
- [ ] Keep restricted ingredients excluded from affiliate recommendations.
- [ ] Confirm the configured affiliate tag is applied through `AFFILIATE_TAGS.amazon`.
- [ ] Check affiliate links on production after deployment.
- [ ] Record outbound CTR and ordered-item results by page where reporting allows.

### Phase 4 completion gate

- [ ] The highest-traffic product modules use reviewed, context-matched destinations.
- [ ] No broken, restricted, misleading, or undisclosed affiliate link remains in the first batch.
- [ ] Affiliate changes have at least 14 days of measured performance before broad rollout.

## Phase 5 — Activate the ADHD checklist funnel

- [ ] Confirm `/lead-magnets/adhd-supplement-starter-checklist/` renders correctly in production.
- [ ] Confirm its intentional indexability decision and canonical metadata.
- [ ] Add contextual checklist CTAs to the ADHD hub and the strongest ADHD guide pages.
- [ ] Keep CTA placement helpful and secondary to medical and safety context.
- [ ] Verify the print/download interaction on mobile and desktop.
- [ ] Verify Mailchimp production credentials.
- [ ] Verify the Cloudflare Turnstile secret.
- [ ] Verify the `RATE_LIMIT_KV` binding.
- [ ] Submit a real test signup and confirm list delivery and source attribution.
- [ ] Create and activate the welcome sequence.
- [ ] Track checklist visits, CTA clicks, signup attempts, successful signups, and confirmation rate.

### Phase 5 completion gate

- [ ] A production test subscriber completes the full funnel successfully.
- [ ] The welcome sequence is active.
- [ ] Signup conversion is recorded at 14 and 28 days.

## Phase 6 — Select the next content batch from evidence

- [ ] Wait for at least 14 days of data from the first optimization batch.
- [ ] Compare sleep, ADHD, anxiety, and focus by:
  - [ ] organic impressions and clicks;
  - [ ] search CTR and average position;
  - [ ] profile-to-guide and guide-to-comparison engagement;
  - [ ] affiliate outbound CTR and ordered items;
  - [ ] email signup conversion;
  - [ ] revenue per 1,000 sessions where data is sufficient.
- [ ] Re-run `node scripts/audit/high-roi-content-opportunities.mjs`.
- [ ] Select no more than five existing pages for the next batch.
- [ ] Enrich noindex or needs-review profiles only when search demand, internal-link value, or commercial relevance justifies the work.
- [ ] Prefer improving existing URLs over creating new ones.

## Deferred until the first measurement review

- [ ] Bulk compound-profile enrichment.
- [ ] Large navigation or homepage redesigns.
- [ ] New server-dependent features that conflict with static export.
- [ ] New analytics infrastructure beyond what is needed for trustworthy production measurement.
- [ ] Large batches of unrelated long-tail articles.
- [ ] Broad visual polish without a demonstrated usability or conversion problem.

## Cycle definition of done

- [ ] The current local batch is safely deployed.
- [ ] Generated data and public counts are consistent.
- [ ] Production analytics, search, affiliate, and email reporting are verified.
- [ ] Five high-intent pages are improved and measured.
- [ ] Priority affiliate destinations are reviewed and upgraded.
- [ ] The ADHD checklist funnel works end to end.
- [ ] The next batch is selected from observed results rather than assumptions.
