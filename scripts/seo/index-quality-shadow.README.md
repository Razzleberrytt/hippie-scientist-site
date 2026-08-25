# Index quality shadow gate

Observation-only SEO quality diagnostics for currently published herb and compound profiles.

- Does not change robots, sitemap inclusion, or publication status.
- Treats multiple independent low-value signals as an enrichment-priority hypothesis, not a demotion decision.
- `FAIL_SHADOW` requires several severe weaknesses and low differentiated-strength coverage.
- `WATCH` is deliberately non-blocking.
- Use search-engine outcomes over time to validate or reject the shadow hypothesis before activating any publication gate.

Run:

```bash
node scripts/seo/index-quality-shadow.mjs
```

Outputs:

- `ops/reports/index-quality-shadow.json`
- `ops/reports/index-quality-shadow.md`
