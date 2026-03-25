# Workflow Cleanup Plan

## Audit scope

- Branch: `chore/workflow-cleanup`
- Source of truth branch: `main`
- Current content/data paths validated for automation:
  - `content/blog`
  - `public/blogdata`
  - `public/data`

## Findings

### Stale workflows

Removed:

1. `.github/workflows/ci.yml`
   - Targets a Roblox/Aftman/Wally/Rojo pipeline unrelated to this site deploy flow.
2. `.github/workflows/ai-blog-daily.yml`
   - Uses outdated paths (`src/content/blog/**`, `src/data/blog/posts.json`) and duplicates daily post generation.
3. `.github/workflows/daily-ai-posts.yml`
   - Duplicates daily post generation already covered by the primary daily blog workflow.
4. `.github/workflows/nightly-data-refresh.yml`
   - Uses outdated path `src/data/herbs/herbs.normalized.json` and duplicates data/blog automation.
5. `.github/workflows/image-budget.yml`
   - Useful in isolation, but outside the required minimal workflow set.

### Outdated path references found

Known stale path patterns were present in existing workflows:

- `src/content/blog`
- `src/data/blog`
- `src/data/herbs`

These references were removed by deleting stale workflows.

### Duplicate automation

- Daily content generation existed in **three** workflows (`daily-blog.yml`, `daily-ai-posts.yml`, `ai-blog-daily.yml`).
- Data refresh/reporting existed in both `data-audit.yml` and `nightly-data-refresh.yml`.

## Minimum workflow set proposed

To keep maintenance low while preserving core automation:

1. **Deploy workflow** (`deploy.yml`) ✅
2. **One daily blog/content workflow** (`daily-blog.yml`) ✅
3. **Optional audit workflow** (`data-audit.yml`) ✅

## Workflow updates applied

### Added: `.github/workflows/deploy.yml`

- Builds the site on push to `main` and manual dispatch.
- Runs `npm run build` and `npm run verify:redirects`.
- Deploys `dist/` to `gh-pages` as output-only via `peaceiris/actions-gh-pages`.

### Updated: `.github/workflows/daily-blog.yml`

- Keeps one daily generator workflow.
- Generates daily post (`npm run blog:daily`) and syncs outputs (`npm run sync:blog`).
- Commits only relevant generated paths:
  - `content/blog`
  - `public/blog`
  - `public/blogdata`
  - `public/sitemap.xml`

### Kept as optional audit: `.github/workflows/data-audit.yml`

- Continues data refresh/report checks on PR/push to `main`.

## Resulting workflow inventory

- `.github/workflows/deploy.yml`
- `.github/workflows/daily-blog.yml`
- `.github/workflows/data-audit.yml`

## Notes

- `main` remains source of truth.
- `gh-pages` is treated as deployment output only.
- No unrelated app code was modified.

## Deploy failure diagnosis and fix (current branch)

### Confirmed root cause

- `npm run build` failed in Vite/Rollup with unresolved imports for `@/...` (for example `@/components/SiteLayout` from `src/App.tsx`).
- TypeScript path mapping existed in `tsconfig.json` (`@/*` → `src/*`), but Vite had no matching runtime alias in `vite.config.ts`.
- Result: editor/type-check could resolve aliases, but bundling in CI/deploy could not.

### Exact files changed

1. `vite.config.ts`
   - Added `node:path` import.
   - Added `resolve.alias` mapping:
     - `"@"` → `path.resolve(__dirname, "src")`

2. `docs/workflow-cleanup-plan.md`
   - Added this diagnosis/fix/verification section.

### What was verified

- Minimal workflow inventory still intact (no new workflows added):
  - `.github/workflows/deploy.yml`
  - `.github/workflows/daily-blog.yml`
  - `.github/workflows/data-audit.yml`
- No workflow currently references stale paths:
  - `src/content/blog`
  - `src/data/blog`
  - `src/data/herbs`
- Deploy workflow action versions are current enough for compatibility:
  - `actions/checkout@v4`
  - `actions/setup-node@v4`
  - `peaceiris/actions-gh-pages@v4`
- Local validation sequence completed after the alias fix:
  - `npm ci`
  - `npm run lint`
  - `npm test`
  - `npm run build`
- Deploy parity check also passed locally:
  - `npm run verify:redirects`

### Remaining risks / follow-up

- Environment warning only: local runner is Node `v22`, while `package.json` engine is `>=20 <21`; workflows already pin Node 20, so deploy path is aligned.
- Non-blocking build warnings remain (large chunk size and Browserslist data age), but they do not prevent deployment.

## Runtime blank-screen diagnosis and fix (GitHub Pages)

### Root cause

- App routing in `src/main.tsx` used `BrowserRouter`.
- On GitHub Pages, direct navigation/reloads on client routes (for example `/blog`, `/herbs`) are not backed by server-side route handling.
- Result: runtime navigation could resolve to an unexpected document path and produce a blank-page symptom in production.

### Minimal fix applied

1. `src/main.tsx`
   - Switched `BrowserRouter` → `HashRouter` for static hosting compatibility on GitHub Pages.
   - No route structure changes were made in `src/App.tsx`.

2. Verified `vite.config.ts`
   - `base: '/'` is already explicit and correct for custom-domain root deployment.

3. Fetch/path check
   - Runtime data fetches in app code continue to resolve under site root (`/data`, `/blogdata`) and remain valid with hash-based routing (hash fragment is client-only and not sent in HTTP requests).

### Verification completed

- `npm ci`
- `npm run lint`
- `npm test`
- `npm run build`
- Confirmed `dist/index.html` emits root-relative built asset URLs and correct script/css references.

## 2026-03-21 update: daily enrichment hook

- Updated `.github/workflows/daily-blog.yml` to run `npm run data:enrich` before blog sync.
- Commit scope in the workflow now includes:
  - `public/data/herbs.json`
  - `public/data/compounds.json`
- Re-checked stale path patterns (`src/content/blog`, `src/data/blog`, `src/data/herbs`) in active workflows: none present.
- Active workflow inventory remains minimal and compliant:
  1. `deploy.yml`
  2. `daily-blog.yml`
  3. `data-audit.yml` (optional)

## 2026-03-22 update: monthly data sync addition

- Added `.github/workflows/update-data.yml` to satisfy monthly dataset refresh requirements.
- This is intentionally outside the earlier minimal set and is scoped strictly to `public/data/*` maintenance.
- Path audit for active workflows confirms no stale references to:
  - `src/content/blog`
  - `src/data/blog`
  - `src/data/herbs`
- Active workflow inventory is now:
  1. `deploy.yml`
  2. `daily-blog.yml`
  3. `data-audit.yml` (optional)
  4. `update-data.yml` (monthly data sync)

## 2026-03-22 update: monthly workflow refinement

- Refined `.github/workflows/update-data.yml` to run the full monthly refresh chain:
  1. `npm run data:enrich` (CSV enrichment)
  2. `node scripts/sync-updated-datasets.mjs` (sync latest dataset files)
  3. `npm run data:missing` (write `public/data/missing-fields-report.json`)
- Commit scope now includes the generated missing-fields report and count snapshot:
  - `public/data/herbs.json`
  - `public/data/compounds.json`
  - `public/data/missing-fields-report.json`
  - `src/data/site-counts.json`
- Rechecked active workflows for stale paths (`src/content/blog`, `src/data/blog`, `src/data/herbs`): none found.

## 2026-03-22 update: workflow set restored to minimal

- Removed `.github/workflows/update-data.yml` to align with the project rule to keep a minimal workflow inventory.
- Confirmed active workflows are now only:
  1. `deploy.yml`
  2. `daily-blog.yml`
  3. `data-audit.yml` (optional)
- Re-verified active workflows for stale path references (`src/content/blog`, `src/data/blog`, `src/data/herbs`): none found.
- Daily workflow still runs on Node 20 and uses the daily generation script via `npm run blog:daily`.

## 2026-03-22 update: final touches + action health check

- Re-validated `.github/workflows/daily-blog.yml` against operational requirements:
  - Node pinned to `20`
  - install step uses `npm ci`
  - generation executes `node scripts/generate-daily-post.mjs`
  - commit author configured with `git config user.name` and `git config user.email`
  - push credentials wired through `ACTIONS_DEPLOY_KEY` via checkout SSH key
  - workflow permissions retain `contents: write`
- Re-checked active workflows for stale references:
  - `src/content/blog` → none
  - `src/data/blog` → none
  - `src/data/herbs` → none

## 2026-03-25 update: blog trust cleanup safeguards

- Audited low-quality "Notes" style posts in `content/blog` for title/summary/body herb consistency.
- Marked 24 mismatched posts as `draft: true` so they are excluded from the build and public blog index.
- Added a publish-time guard in `scripts/build-blog.mjs` that skips targeted "Notes" posts when title, summary, and body herb references do not align.
- Added a generation-time guard in `scripts/generate-daily-post.mjs`:
  - Uses one herb consistently across title + summary.
  - Keeps generated posts as `draft: true` by default pending editorial review.
  - Throws if generated post fails consistency checks.
