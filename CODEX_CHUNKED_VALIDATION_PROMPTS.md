# Chunked Codex Validation Prompts — Iteration 31

Run these as separate Codex turns after the replacement prompt succeeds. Keeping them separate avoids Codex timeouts.

## Prompt 1 — Fast checks

```md
Run only these checks and stop:

```bash
npm run -s typecheck
npm run -s lint:nocache
npm run -s validate:static-export
npm run -s validate:security-headers
npm run -s validate:canonical-host
npm run -s validate:route-seo
```

Report pass/fail for each command. Do not modify files.
```

## Prompt 2 — Build

```md
Run only the production build and stop:

```bash
npm run -s build
```

Report whether it passed. Do not modify files.
```

## Prompt 3 — Post-build SEO audits

```md
Run only these post-build audits and stop:

```bash
npm run -s seo:audit-sitemap
npm run -s audit:structured-data
npm run -s audit:seo-routes
npm run -s validate:deploy-readiness
npm run -s audit:internal-links
```

Report the final summary lines. Do not modify files.
```
