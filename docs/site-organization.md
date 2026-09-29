# Site Organization

Current as of September 2026.

## Navigation Policy

The header should stay simple and describe five distinct user jobs:

- Goals — start from an outcome or question.
- Guides — browse topic hubs and editorial decision guides.
- Ingredients — directly look up herbs and compounds.
- Safety — check interaction and contraindication context.
- Research — inspect studies, evidence tools, articles, and methodology.

Comparisons live under Guides rather than occupying a separate top-level slot. Mental Health is a first-class Guides destination. Desktop and mobile navigation use the same hierarchy so users do not have to learn two different site structures.

## Public Route Families

### Depth Layer

- `/herbs/:slug` - herb monograph profiles.
- `/compounds/:slug` - compound monograph profiles.

These are stable depth routes. They should receive the richest evidence, safety, mechanism, sourcing, related-link, and visual treatment.

### Discovery Layer

- `/guides` - guide index and primary topic front door.
- `/guides/mental-health/*` - mental-health conditions, relationships, treatment evidence, and stigma-aware explainers.
- `/guides/substance-use/*` - substance-use, dependence, withdrawal, and harm-reduction guides.
- `/guides/adhd/*` - ADHD supplement, nutrient, and treatment-context guides.
- `/guides/sleep/*` - sleep aids, melatonin alternatives, and wind-down guides.
- `/guides/anxiety/*` - anxiety and calm-support guides.
- `/guides/stress/*` - stress, burnout, adaptogen, and overload guides.
- `/guides/metabolic-health/*` - metabolic-health, blood-sugar, and weight-claim guides.
- `/guides/focus/*` - nootropic, focus, and stimulant-smoothing guides.
- `/guides/herbs/*` - editorial herb guide pages that complement `/herbs/:slug`.
- `/guides/compare/*` - comparison hub and pairwise tradeoff pages.
- `/guides/best/*` - curated best-of pages.
- `/guides/other/*` - valid guides that do not fit a primary cluster.

### Education And Trust

- `/learn/*` - educational explainers and evidence literacy.
- `/info/*` - about, methodology, dosing, legal, privacy, disclosure, and static resources.
- `/evidence/*` - evidence checker, digest, and report pages.
- `/safety-checker` - static interaction/safety tool.
- `/search` - site search.

## Redirect Policy

Superseded aliases and legacy route families such as `/stacks/*`, top-level `/compare/*`, and top-level `/best-supplements-for-*` may still exist in redirects or static compatibility routes. They should not be used as primary navigation targets unless a route migration plan explicitly reactivates them. Current first-class families such as `/goals/*`, `/guides/*`, `/research/`, and `/articles/*` are not legacy merely because older redirects also reference them.

When moving or deleting a route:

1. Add a redirect in `public/_redirects`.
2. Update `lib/navigation-config.ts`, `lib/public-routes.ts`, footer links, homepage links, schema paths, and tests.
3. Run `npm run routes:inventory`, `npm run validate:route-seo`, and `npm run audit:internal-links`.

## Monograph Image Policy

Monograph profiles should display a representative image in the hero and schema. Use this priority:

1. Explicit workbook/runtime image fields: `image`, `imageUrl`, `og`, or `thumbnail`.
2. Curated local images in `public/images/guides` for high-value profiles.
3. Category fallback images in `public/images/monographs`.

Avoid remote images unless licensing and hotlinking are explicitly acceptable. Prefer local assets for static export reliability.
