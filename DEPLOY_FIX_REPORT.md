# DEPLOY_FIX_REPORT

## Root cause

Production traffic is being served by **Vercel** (not GitHub Pages), while the previous fix path focused on `gh-pages` behavior.

The live deployment had two consistency issues:

1. **No SPA fallback rewrite in Vercel config** for BrowserRouter routes like `/about`, `/herbs`, and `/disclaimer`, causing direct-load 404s.
2. **Obsolete root-level static route folders** (`/about`, `/contact`, `/blog`, etc.) remained in source and could mask/distort deployment behavior on static hosts if root output is used.

## Routing choice and why

Kept **BrowserRouter** as the active strategy.

Why:

- Vercel supports reliable SPA fallback when explicitly configured.
- BrowserRouter keeps clean URLs and avoids hash-fragment routing UX.
- Added explicit Vercel filesystem-first + catch-all route fallback so non-file routes resolve to `/index.html`.

## Files changed

- `vercel.json`
  - Added explicit Vercel build settings (`buildCommand`, `outputDirectory`, `framework`).
  - Added filesystem-first routing and catch-all SPA fallback to `/index.html`.
- Removed obsolete static route files/directories that conflict with SPA deployment intent:
  - `about/`
  - `blog/`
  - `contact/`
  - `disclaimer/`
  - `privacy-policy/`
  - `herb-index/`

## Exact deployment expectations

After deploy:

- `/` serves the Vite app shell from `dist/index.html`.
- BrowserRouter routes (for example `/about`, `/herbs`, `/disclaimer`, `/contact`) are served via SPA fallback to `index.html` and render in-app pages.
- Existing built assets and static files in `dist` remain served normally due filesystem-first routing.
- Root-level legacy static HTML route folders no longer compete with SPA route behavior.
