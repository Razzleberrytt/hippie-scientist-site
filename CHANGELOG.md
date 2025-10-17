# Hippie Scientist Site — 2025-10-17

## Build & Assets

- Configured Vite to emit hashed entry, chunk, and asset filenames for long-term caching of built bundles.
- Added a responsive image helper and updated herb hero components to generate sanitized src/srcset pairs for previews.

## SEO & Social

- Herb detail pages now derive canonical slugs, Open Graph images, and share URLs from normalized metadata.
- Sitemap generation builds canonical URLs for core pages and blog posts with consistent changefreq metadata.

## A11y & Security

- Herb data fetchers bypass cached manifests and normalize entities to avoid stale or malformed records.
- Deployment rewrites enforce SPA fallbacks with strict security headers across assets and metadata.

## CI & QA

- Added a link checker that scans dist/ HTML for missing local asset references.
- Introduced an image budget audit that fails the build when raster assets exceed 250 KB unless allowlisted.

## How to verify

- `npm run build`
- `node tools/check-links.mjs`
- `node tools/check-images.mjs`
- `npm run lint`
