# Release Process

## Source of truth scripts

Use these scripts as the canonical release pipeline:

- **Data refresh**: `npm run data:refresh`
- **Build**: `npm run build`
- **Prerender**: `npm run prerender:static` (also executed during `npm run build` via `postbuild`)
- **Sitemap/robots**: `npm run sitemap` (also executed during `npm run build` via `postbuild`)
- **Verification**:
  - `npm run verify:prerender` (included in `postbuild`)
  - `npm run verify:redirects` (run in deploy workflow)

## Recommended release checklist

- [ ] Run `npm ci`
- [ ] Run `npm run build`
- [ ] Run `npm run verify:redirects`
- [ ] Confirm expected diffs in content/data outputs (if running data/blog generation)
- [ ] Merge to `main` (GitHub Actions deploy workflow builds + optional Netlify hook)

## Deployment workflow reality

- Canonical host: **Netlify**
- CI workflow: `.github/workflows/deploy.yml`
- Daily content workflow: `.github/workflows/daily-blog.yml`
- Optional audit workflow: `.github/workflows/data-audit.yml`

## Legacy (archived)

The previous checklist in this file referenced unrelated game/store release tasks and is archived as obsolete for this repository.
