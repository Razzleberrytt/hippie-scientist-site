# Zip Patch Merge Report — Part 1

Date: 2026-03-25
Archive: `hippie-scientist-patch-part-1-code.zip`

## Scope and merge approach

- Unzipped the patch into a temporary directory and compared file-by-file against the current repo.
- Applied a **targeted merge** only where the patch file content differed from the current tracked file.
- Did **not** remove files that were absent from the archive.

## What was added

- `docs/zip-part-1-report.md` (this report).

## What was replaced

- `.gitignore` updated with additional local artifact/archive ignore entries.
- `src/main.tsx` updated from `HashRouter` to `BrowserRouter` per incoming patch.
- Replaced 58 blog source files under `content/blog/` with incoming patch versions (mostly metadata/content corrections for dated notes posts from `2025-08-16` through `2025-10-14`, plus updates to `2026-03-17`, `2026-03-19`, `2026-03-20`).

## What was skipped

- No deletions were applied from absence in zip (per part-1 safety requirement).
- Build outputs generated during validation were intentionally not staged/kept (for example `public/blog*`, `public/blogdata*`, `public/data/*`, `public/feed.xml`, `public/rss.xml`, and `src/generated/site-counts.json`).
- `dist/` was not committed.

## Conflicts / risky areas

- No direct git merge conflicts occurred.
- **Potential deployment risk to verify in part 2**: `src/main.tsx` now uses `BrowserRouter` instead of `HashRouter`. On static GitHub Pages setups, this can break hard-refresh/deep-link routes unless fallback routing is configured.

## Workflow/path checks

- Checked active workflows for stale path patterns:
  - `src/content/blog`
  - `src/data/blog`
  - `src/data/herbs`
- No stale references found in active workflows.

## Validation results

- `npm run build` ✅ (passes; non-blocking warnings about Browserslist age/chunk size)
- `npm run lint` ✅ (passes; non-blocking ESLint deprecation warning for legacy config mode)
- `npm test` ✅ (`No tests specified` in project script)
