# Validation — Build, Prerender, and Crawlability

This project validates clean URLs and crawler-visible HTML from the **built output** (`dist/`), not from ad hoc hand-authored static pages.

## Build pipeline checks

Run:

```bash
npm run build
```

What this covers:

- `prebuild`: data sync/quality + RSS generation.
- `vite build`: app bundle creation.
- `postbuild`:
  - `scripts/prerender-static.mjs` (writes route HTML files into `dist/`)
  - `scripts/generate-sitemap.mjs dist` (writes `dist/sitemap.xml` + `dist/robots.txt`)
  - `scripts/ensure-dist-redirects.mjs`
  - `scripts/verify-prerender.mjs` (route-manifest parity + sample content/meta checks)

## Route/content validation

After `npm run build`:

- Confirm `dist/blog/index.html` exists and contains prerendered list content.
- Confirm at least one `dist/blog/<slug>/index.html` exists and has body copy + canonical/title metadata.
- Confirm herb/compound detail pages exist under `dist/herbs/*/index.html` and `dist/compounds/*/index.html`.
- Confirm `dist/route-manifest-report.json` exists and reports no sitemap/prerender mismatches.

## SEO/crawl artifacts

After `npm run build`:

- `dist/sitemap.xml` includes approved public routes.
- `dist/robots.txt` includes `Sitemap:` entries for `/sitemap.xml`, `/rss.xml`, and `/feed.xml`.
- Root `index.html` includes alternate feed link metadata (from app head output).

## Runtime checks on deployed site

On Netlify production/staging deploy:

- Direct-load core routes (`/blog`, `/about`, `/privacy-policy`, `/contact`, `/herb-index`) return HTTP 200.
- Deep links (for example `/blog/<slug>`) resolve without 404 due to SPA rewrite + prerendered route files.
- Form submissions without `VITE_FORM_ENDPOINT` show configured error state (no optimistic success).
