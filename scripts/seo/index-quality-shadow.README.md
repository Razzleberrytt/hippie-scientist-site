# Index quality shadow gate

Observation-only SEO quality diagnostics for herb and compound profiles that actually ship as published.

- Does not change robots, sitemap inclusion, or publication status.
- Scores only the post-build published cohort from `reports/profile-publication-truth.json`.
- Treats multiple independent low-value signals as an enrichment-priority hypothesis, not a demotion decision.
- `FAIL_SHADOW` requires several severe weaknesses and low differentiated-strength coverage.
- `WATCH` is deliberately non-blocking.
- Use search-engine outcomes over time to validate or reject the shadow hypothesis before activating any publication gate.

Run after the production build and publication-truth audit:

```bash
npm run build
npm run audit:profile-publication
node scripts/seo/index-quality-shadow.mjs
```

The shadow command fails closed if the post-build publication-truth artifact is missing, so provisional pre-build flags cannot contaminate the cohort.

Outputs:

- `ops/reports/index-quality-shadow.json`
- `ops/reports/index-quality-shadow.md`
