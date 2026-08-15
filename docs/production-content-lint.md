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

## Build-to-build regression snapshot

The Production Content Lint workflow also snapshots the built site with:

```bash
node scripts/ci/build-production-quality-snapshot.mjs
```

The snapshot records the actual built route inventory, title, first H1, canonical URL, indexability state, unique internal links, evidence-grade distribution, and structured source counts. Successful `main` runs publish the snapshot as a 90-day workflow artifact named `production-quality-baseline`.

Pull requests download the latest successful `main` baseline and compare it with:

```bash
node scripts/ci/compare-production-quality-snapshot.mjs
```

The comparison always reports title changes, indexability changes, lost internal links, evidence-grade distribution changes, page-count drift, and structured citation/source decreases. Small editorial changes remain informational. Material/systemic changes require an explanation rather than failing merely because they are large.

For an intentional major change, add a substantive entry to the pull request body:

```text
Quality change explanation: Consolidated obsolete alias routes into canonical profiles; the page-count drop is intentional and redirects were validated.
```

The workflow fails a pull request when a material regression/change crosses the configured thresholds and no explanation of at least 20 characters is supplied. This makes large automated changes auditable without treating every legitimate refactor as an error.

The first successful `main` run after this feature lands bootstraps the baseline artifact. Until that baseline exists, comparison exits successfully with an explicit bootstrap message rather than pretending a comparison occurred.

Do not weaken a dedicated validator to make this aggregate gate pass. Fix the underlying content, template, route, data contract, or validator input. If a rule truly needs to change, change the canonical validator first so every caller remains consistent.
