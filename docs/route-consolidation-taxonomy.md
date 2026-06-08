# Route Consolidation Taxonomy

Last updated: 2026-05-30

This project is consolidating around a smaller public route model:

```text
goal-led decision platform -> evidence-backed profiles -> comparisons -> safety/product-quality next steps
```

## Canonical route families

- `/`
- `/goals` and `/goals/:slug`
- `/herbs` and `/herbs/:slug`
- `/compounds` and `/compounds/:slug`
- `/compare` and `/compare/:slug`
- `/guides` and curated `/guides/:slug`
- `/learn` and future canonical `/learn/:slug`
- `/search` as a noindex utility
- `/safety-checker` as a trust utility
- `/stacks` and `/stacks/:slug` for now

## Redirected route families

The following families should not receive new pages:

- root commercial pages such as `/best-supplements-for-*`
- root one-offs such as `/best-herbs-for-anxiety`, `/best-nootropics-for-focus`, and `/herbs-for-sleep`
- `/top/*`
- `/best-for/*`
- duplicate comparison URLs when a canonical `/compare/:slug` exists

Redirects live in `public/_redirects` for Cloudflare Pages static export.

## Noindex route families

These pages may remain available for users and internal exploration, but should not compete with canonical decision pages:

- `/education/*` until migrated into `/learn/*`
- `/protocols/*`
- `/pathways/*`
- `/explore/*`
- `/topics/*`
- `/ecosystems/*`
- `/supernodes/*`
- `/compare/dynamic`
- `/compare/sourcing`
- `/dosing`
- `/stacks/builder`
- `/blog/categories`
- `/blog/tags`

Noindex is implemented with route metadata or route-family layouts.

## Sitemap policy

`app/sitemap.ts` should include only canonical indexable surfaces:

- homepage, goal hub, entity libraries, comparison hub, guide hub, learn hub, safety checker, buy guide, stacks, approved clusters, approved collections, entity profiles, canonical guides, canonical comparisons, and blog posts.

It should exclude merged, noindex, experimental, and utility-only route families.

## Guardrail

Before adding any new route family, decide whether it is:

1. A canonical decision route.
2. A depth-layer profile route.
3. A support article under `/learn`.
4. A curated commercial guide under `/guides`.
5. A noindex utility.

If it does not fit one of those buckets, do not add the route.
