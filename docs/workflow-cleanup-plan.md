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
