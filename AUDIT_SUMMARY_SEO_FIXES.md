# SEO and Deep Audit Summary

Generated: 2026-07-01 America/Chicago

## Main finding fixed

The build-generated sitemap listed URLs that were not self-canonical. Before the patch, `npm run -s seo:audit-sitemap` reported:

- 454 sitemap URLs
- 411 live indexable URLs
- 43 canonical mismatches

That meant sitemap URLs such as `/guides/.../` and `/evidence/evidence-report/` were asking crawlers to index pages whose rendered canonical tag pointed elsewhere, including several non-existent canonical targets.

## Source fixes applied

- Corrected self-canonical metadata for 43 sitemap-listed routes.
- Split `/app/evidence/evidence-report/page.tsx` into a server metadata page plus a client component so it no longer inherits the homepage canonical.
- Added canonical override support to:
  - `components/articles/FocusAdhdArticlePage.tsx`
  - `components/articles/GoalClusterArticlePage.tsx`
  - `app/seo-entry-pages.tsx`
- Updated mounted guide routes to pass their actual canonical path when they reuse shared article/SEO components.
- Corrected `/learn/entheogens/` metadata and schema URL from `/psychoactive/entheogens/` to `/learn/entheogens/`.
- Hardened `/pages/500.tsx` with title, description, noindex/follow robots, canonical, OG/Twitter tags, and JSON-LD.
- Added noindex metadata, canonical, social tags, and JSON-LD to `public/lead-magnets/adhd-supplement-starter-checklist.html`.
- Added Article and BreadcrumbList JSON-LD to `public/blog/2026-03-18-research-digest-passionflower/index.html`.
- Made the SEO/structured-data audit regexes compatible with Next-rendered attributes such as `data-next-head`.

## Final validation results

All of these passed after the fixes:

```bash
npm run -s typecheck
npm run -s lint:nocache
npm run -s validate:route-seo
npm run -s audit:metadata
npm run -s validate:static-export
npm run -s validate:security-headers
npm run -s validate:canonical-host
npm run -s build
npm run -s validate:sitemap:built
npm run -s validate:sitemap-completeness
npm run -s seo:audit-sitemap
npm run -s audit:structured-data
npm run -s audit:seo-routes
npm run -s audit:sitemap-affiliate
npm run -s validate:build-seo-metadata
npm run -s validate:deploy-readiness
npm run -s report:performance
npm run -s audit:internal-links
```

Final key audit outputs:

- Sitemap indexability: `454/454` live indexable, `0` canonical mismatches, `0` noindex URLs in sitemap.
- SEO route audit: average score `90`, severe `0`, moderate `0`, blocking severe `0`.
- Structured data audit: malformed `0`, representative failures `0`.
- Affiliate sitemap audit: passed.
- Deploy readiness: passed.

## Remaining non-blocking diagnostics

These were reported as non-blocking diagnostics and were not required to pass the deploy gates:

- Internal links: `56` potentially orphaned crawlable routes and `219` non-canonical internal hrefs, mostly trailing-slash or legacy-link cleanup.
- Structured data: duplicate herb meta-description groups: `3`.
- Structured data: diagnostic schema gaps on non-representative pages remain expected under the current audit script.
