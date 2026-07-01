# Site Organization

Current as of July 2026.

## Navigation Policy

The header should stay simple:

- Herbs
- Compounds
- Guides
- Learn
- Tools

Desktop navigation exposes top-level destinations. Mobile navigation may show the full child hierarchy, but it should remain grouped under those five labels.

## Public Route Families

### Depth Layer

- `/herbs/:slug` - herb monograph profiles.
- `/compounds/:slug` - compound monograph profiles.

These are stable depth routes. They should receive the richest evidence, safety, mechanism, sourcing, related-link, and visual treatment.

### Discovery Layer

- `/guides` - guide index.
- `/guides/adhd/*` - ADHD supplement and nutrient decision guides.
- `/guides/sleep/*` - sleep aids, melatonin alternatives, and wind-down guides.
- `/guides/anxiety/*` - anxiety, stress, adaptogen, and cortisol guides.
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

Older route families such as top-level `/articles/*`, `/goals/*`, `/stacks/*`, top-level `/compare/*`, and top-level `/best-supplements-for-*` may still exist in redirects or static compatibility routes. They should not be used as primary navigation targets unless a route migration plan explicitly reactivates them.

When moving or deleting a route:

1. Add a redirect in `public/_redirects`.
2. Update `lib/navigation-config.ts`, `src/lib/public-routes.ts`, footer links, homepage links, schema paths, and tests.
3. Run `npm run routes:inventory`, `npm run validate:route-seo`, and `npm run audit:internal-links`.

## Monograph Image Policy

Monograph profiles should display a representative image in the hero and schema. Use this priority:

1. Explicit workbook/runtime image fields: `image`, `imageUrl`, `og`, or `thumbnail`.
2. Curated local images in `public/images/guides` for high-value profiles.
3. Category fallback images in `public/images/monographs`.

Avoid remote images unless licensing and hotlinking are explicitly acceptable. Prefer local assets for static export reliability.
