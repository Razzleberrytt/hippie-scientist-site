# Workflow Cleanup Plan

Date: 2026-03-27

## Audit scope

- Source-of-truth branch: `main`
- Active content/data paths:
  - `content/blog`
  - `public/blogdata`
  - `public/data`

## Source of truth (detected from repo)

- Framework/build stack: React + TypeScript + Vite
- Build command: `npm run build`
- Output directory: `dist/`
- Router mode: `BrowserRouter`
- SPA fallback: `public/_redirects` and `netlify.toml` rewrite `/* -> /index.html`
- Canonical deployment: Netlify static deploy (GitHub Actions builds/validates and optionally triggers Netlify deploy hook)

## Active workflow inventory

1. `deploy.yml` (deploy/CI build + redirects verification + optional Netlify deploy hook)
2. `daily-blog.yml` (daily content generation + optional Netlify deploy hook)
3. `data-audit.yml` (optional audit workflow)
4. `weekly-og-images.yml` (weekly OG image/manifest refresh; keeps expensive OG rendering out of `npm run build`)

No active workflow references stale paths:

- `src/content/blog`
- `src/data/blog`
- `src/data/herbs`

## Wrong assumptions found and corrected

1. **GitHub Pages deploy assumptions in helper scripts**
   - Removed `deploy.sh` (used `npx gh-pages -d dist`).
   - Removed `scripts/verifyGhPages.js` (required checking out `gh-pages` branch).

2. **Conflicting deployment narratives in docs**
   - Updated `README.md` deployment section to identify Netlify as canonical.
   - Updated `docs/security-headers.md` intro to remove implication of a current `vercel.json` contract.

3. **Outdated forms backend documentation**
   - Rewrote `docs/resend-setup.md` around current `VITE_FORM_ENDPOINT` flow.
   - Marked `api/subscribe.ts` as legacy/optional instead of canonical runtime behavior.

## Reconciliation decisions

- Keep exactly one authoritative deploy target in repo docs/process: **Netlify**.
- Keep Netlify deploy hook usage in workflows as secondary trigger for fresh deploys after successful CI/daily generation.
- Keep `api/subscribe.ts` as legacy sample only; do not treat it as active deployment requirement.

## Validation run for this correction pass

- `npm install --package-lock-only`
- `npm run lint`
- `npm run build`
- `npm run verify:redirects`

## Phase A1 findings (2026-03-28)

- `gh-pages` is redundant with this repository's Netlify deployment contract.
- `.github/workflows/deploy.yml` should remain CI + optional Netlify deploy-hook trigger only; no branch publishing.
- `public/_redirects` should contain only SPA fallback rule: `/* /index.html 200`.
- Root-level cache rules for `/*.js` and `/*.css` were removed from `public/_headers` to reduce stale shell risk while retaining immutable `/assets/*` caching.

## Phase B2 follow-up (2026-03-28)

- `scripts/convert-herbs.mjs` expects one of several herb CSV inputs, including legacy local paths under `src/data/herbs/*`.
- In GitHub-hosted CI these CSVs are normally absent (they are local/manual and ignored by `.gitignore`), so unconditional `npm run data:refresh` in `data-audit.yml` fails.
- Updated `data-audit.yml` to detect CSV presence and run `data:refresh` only when inputs exist.
- Added a strict manual override for workflow_dispatch (`require_refresh=true`) that fails fast if CSVs are missing, preserving strict behavior when refresh is explicitly required.
