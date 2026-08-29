# ADHD Magnesium Route Consolidation

Date: 2026-08-02

## Decision

Consolidate magnesium-for-ADHD buying intent into one canonical page:

- Canonical: `/guides/adhd/best-magnesium-supplement-for-adhd/`
- Retired alias: `/guides/best/magnesium-supplements-for-adhd/`
- Legacy alias: `/best-magnesium-supplements-for-adhd/`

Both aliases permanently redirect to the canonical route.

## Why consolidation is higher value than differentiation

The two live guide pages had nearly identical jobs:

- compare glycinate, citrate, oxide, and L-threonate;
- recommend a practical first form;
- discuss elemental magnesium, dosing, GI tolerance, and product quality;
- answer whether magnesium is safe or effective for ADHD;
- monetize the same magnesium product set.

That is not meaningfully distinct search intent. Keeping both pages would split internal links, backlinks, engagement signals, update effort, and topical authority while increasing the chance that evidence or safety language diverges.

The earlier roadmap suggested preserving one as a product roundup and one as a form guide. The completed canonical page now covers both decisions without becoming a generic listicle, so that separation no longer produces enough user value to justify two indexable URLs.

## Canonical ownership

The canonical ADHD-cluster page owns:

1. the immediate answer that no form has proven superiority for core ADHD symptoms;
2. goal-based form selection for low intake, sleep context, constipation, tolerability, and cost;
3. form-by-form evidence and label comparison;
4. NIH supplemental upper-limit, kidney, pediatric, and medication-spacing context;
5. governed product recommendations and affiliate disclosure;
6. links into the broader ADHD supplements and magnesium-comparison cluster.

The `/guides/best/` hub links directly to this canonical page.

## Redirect behavior

`public/redirect-overrides/adhd-magnesium-canonical.redirects` supplies exact 301 rules. The build override system automatically creates slash and non-slash variants, and the existing redirect verifier confirms that every target exists and that no redirected source remains in the sitemap.

## Regression controls

`app/__tests__/adhd-magnesium-route-consolidation.test.ts` verifies that:

- the retired page file is absent;
- the best-guides hub links only to the canonical route;
- both alias families point to the canonical route;
- the retired page specification remains explicitly retired;
- the canonical page retains evidence, safety, and commercial-intent boundaries.

## Measurement

After deployment, evaluate the combined route rather than comparing aliases:

- impressions and clicks for magnesium + ADHD form/best/buying queries;
- average position and query diversity;
- internal entrances from the ADHD hub and best-guides hub;
- affiliate click-through rate without increasing product prominence above evidence;
- crawl activity and index removal for the retired alias;
- backlinks or external citations that continue to hit an alias and are successfully transferred through the 301.
