# Release Process

## Source of truth scripts

Use these scripts as the canonical release pipeline:

- **Data refresh**: `npm run data:refresh`
- **Build**: `npm run build`
- **Prerender**: `npm run prerender:static` (also executed during `npm run build` via `postbuild`)
- **Sitemap/robots**: `npm run sitemap` (also executed during `npm run build` via `postbuild`)
- **Verification**:
  - `npm run verify:build` (bundles prerender + publishing + redirects checks)
  - `npm run verify:redirects` (also run in deploy workflow)

## Recommended release checklist

- [ ] Run `npm ci`
- [ ] Run `npm run build`
- [ ] Run `npm run verify:build`
- [ ] Confirm expected diffs in content/data outputs (if running data/blog generation)
- [ ] Merge to `main` (GitHub Actions deploy workflow builds + optional Netlify hook)

## Deployment workflow reality

- Canonical host: **Netlify**
- CI workflow: `.github/workflows/deploy.yml`
- Daily content workflow: `.github/workflows/daily-blog.yml`
- Optional audit workflow: `.github/workflows/data-audit.yml`

## Legacy (archived)

The previous checklist in this file referenced unrelated game/store release tasks and is archived as obsolete for this repository.

For detailed script ownership and generated-artifact policy, see `docs/build-and-verification.md`.
