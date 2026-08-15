# Production content lint

Run this after a production build before merging changes that can affect public pages:

```bash
node scripts/ci/production-content-lint.mjs
```

The command is the consolidated production-content quality contract for agents and maintainers. It deliberately reuses existing repository validators instead of duplicating their rules.

It covers:

- unique/missing page titles and excessively duplicated meta descriptions through the existing metadata audit;
- exact duplicate, missing, and multiple H1s on indexable built pages;
- canonical correctness and build-level SEO/indexability metadata;
- internal links and redirect integrity;
- sitemap validity and completeness;
- robots/index directives;
- structured-data validity;
- baseline accessibility tests.

Outputs:

- `public/data/reports/production-content-lint.json` — machine-readable results;
- `public/data/reports/production-content-lint.md` — human-readable quality summary;
- GitHub Actions job summary when `GITHUB_STEP_SUMMARY` is available.

The command requires built HTML in `out/`. If it is missing, the lint fails instead of silently auditing an incomplete representation.

Do not weaken a dedicated validator to make this aggregate gate pass. Fix the underlying content, template, route, data contract, or validator input. If a rule truly needs to change, change the canonical validator first so every caller remains consistent.
