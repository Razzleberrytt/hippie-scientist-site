# Audit Summary — SEO Fixes Iteration 31

Source baseline: `hippie-scientist-site-main 31.zip`  
Patched output: `hippie-scientist-site-main-31-seo-audited.zip`

## What changed

This iteration preserved the previous sitemap/canonical repairs and fixed the remaining high-signal internal-link canonical problem found in the new baseline.

### SEO fixes applied

- Normalized internal links that pointed to slashless URLs where the destination route canonicalizes with a trailing slash.
- Updated guide/app route links, article/content links, page-spec source data, curated expansion links, schema helper links, and related CTA links so internal links now match canonical destination URLs.
- Added/kept route metadata hardening for herb alias/detail pages where duplicate or weak descriptions were being surfaced in route-level audits.
- Kept the structured-data audit adjustment aligned with canonical trailing-slash guide routes.

## Final audit results

```text
npm run -s typecheck                         PASS
npm run -s lint:nocache                      PASS
npm run -s build                             PASS
npm run -s validate:static-export            PASS
npm run -s validate:security-headers         PASS
npm run -s validate:canonical-host           PASS
npm run -s validate:route-seo                PASS
npm run -s seo:audit-sitemap                 PASS
npm run -s audit:structured-data             PASS
npm run -s audit:seo-routes                  PASS
npm run -s validate:deploy-readiness         PASS
npm run -s audit:internal-links              PASS
```

### Sitemap/indexability

```text
totalUrls:            575
liveIndexable:        575
404_IN_SITEMAP:       0
NOINDEX_IN_SITEMAP:   0
CANONICAL_MISMATCH:   0
DUPLICATE_URL:        0
MISSING_CANONICAL:    0
```

### Route SEO audit

```text
routes:          1140
avgScore:        90
severe:          0
blockingSevere:  0
moderate:        0
```

### Structured data audit

```text
routes:               1097
malformed:            0
representative fails: 0
duplicate herb descs: 0
```

### Internal-link audit

```text
routes:                     1139
nonCanonicalInternalLinks:  0
orphanRoutes:               56
weaklyConnected:            0
```

The remaining orphan routes are non-blocking and are not present in the sitemap indexability set. They are mostly static blog pages, compound aliases, `/500`, and the ADHD lead magnet landing page. They can be handled later by either intentionally linking them from hub pages or explicitly excluding/de-indexing routes that are not meant to be crawled.

## Build notes

The full production build completed successfully and exported the site.

```text
Next.js static generation: 1,132 pages
Exported HTML files found by Pagefind: 1,140
Pagefind indexed pages: 1,070
```

## Recommended deploy steps

1. Replace the current repo with `hippie-scientist-site-main-31-seo-audited.zip` using the anti-timeout Codex prompt.
2. Run validations in separate turns or locally:
   - `npm run -s typecheck`
   - `npm run -s lint:nocache`
   - `npm run -s build`
   - `npm run -s seo:audit-sitemap`
   - `npm run -s audit:structured-data`
   - `npm run -s audit:seo-routes`
   - `npm run -s validate:deploy-readiness`
   - `npm run -s audit:internal-links`
3. Deploy.
4. Submit the current sitemap in Google Search Console.
