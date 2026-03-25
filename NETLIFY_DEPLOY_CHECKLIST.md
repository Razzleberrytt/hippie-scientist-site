# Netlify Deploy Checklist

## Deployment mode verification

- ✅ **Source-project deployment** is configured (build command + publish directory in `netlify.toml`), rather than uploading a prebuilt static folder manually.
- Netlify should build from repository source on each deploy.

## Build settings

- **Build command (recommended in Netlify UI):** `npm run build`
- **Build command (as currently codified in `netlify.toml`):** `npm ci && npm run build && npm run verify:redirects`
- **Publish directory:** `dist`

## Files expected in `dist`

After a successful build, verify these exist:

- `dist/index.html`
- `dist/assets/*`
- `dist/_redirects`
- `dist/robots.txt` _(if used)_
- `dist/sitemap.xml` _(if used)_
- `dist/feed.xml` _(if used)_

Additional commonly present files in this project:

- `dist/404.html`
- `dist/manifest.json`
- `dist/_headers`

## Post-deploy routes to test

Check these URLs after deployment:

- `/` (homepage loads)
- `/herbs` (or another known app route) to confirm SPA redirect behavior
- `/blog` (blog index)
- `/blog/<known-post-slug>` (direct deep link)
- `/sitemap.xml`
- `/robots.txt`
- `/feed.xml`
- `/nonexistent-page-123` (should render SPA/404 behavior as intended)

## One-command verification before deploy

```bash
npm run build && test -f dist/_redirects && test -f dist/index.html
```
