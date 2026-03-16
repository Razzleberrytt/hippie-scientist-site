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
