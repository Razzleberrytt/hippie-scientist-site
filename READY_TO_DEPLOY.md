# READY TO DEPLOY

Status: **Ready with one prerequisite** — `dist/` does not currently exist in this working tree, so the next deploy attempt must run a production build first.

## Exact deploy command

```bash
npm ci && npm run build && netlify deploy --prod --dir=dist
```

## Netlify configuration (verified)

- **Expected Netlify build command:**
  - `npm ci && npm run build && npm run verify:redirects`
- **Publish directory:**
  - `dist`
- **BrowserRouter SPA fallback:**
  - Keep `public/_redirects` with:
    - `/* /index.html 200`

## Required fallback file

- Source-controlled fallback file required for SPA routing:
  - `public/_redirects`
- Expected built output artifact after `npm run build`:
  - `dist/_redirects`

## Exact routes to test after deploy

Run these in production after deploy to confirm SPA + route handling:

1. `/` (home load)
2. `/herbs` (top-level route)
3. `/compounds` (top-level route)
4. `/blog` (blog index)
5. `/blog/rhodiola-vs-ashwagandha` (deep route)
6. `/favorites` (SPA-only route; hard-refresh this URL to confirm redirect fallback)
7. `/collections/sleep` (parameterized SPA route; hard-refresh this URL)
8. `/this-route-should-404` (NotFound route rendering under SPA fallback)

## Verification notes used for this readiness check

- `netlify.toml` already points to Netlify build + `dist` publish and has an all-path redirect to `/index.html`.
- React app is wrapped in `BrowserRouter`.
- `public/_redirects` exists and contains the required fallback rule.
- `dist/` is currently absent locally, so build must run before deploy command.
