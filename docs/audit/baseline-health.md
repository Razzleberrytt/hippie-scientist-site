# Baseline Health Audit

Branch: `audit/baseline-health`  
Date (UTC): 2026-05-19

| command | pass/fail | failure excerpt | likely owner area |
|---|---|---|---|
| `node --version` | pass | none | deploy |
| `npm --version` | pass | none | deploy |
| `npm ci` | pass | none (warnings observed: `EBADENGINE` for Node `v24.15.0` vs required `>=20 <=22`; 4 vulnerabilities reported) | deps |
| `npm run lint` | pass | none | lint |
| `npm run typecheck` | pass | none | TypeScript |
| `npm run data:build` | pass | none | data pipeline |
| `npm run data:validate` | pass | none | data pipeline |
| `npm run guard:source-of-truth` | pass | none | data pipeline |
| `npm run build` | pass | none (warnings observed: Next.js ESLint plugin not detected; deploy-readiness warns `sitemap.xml` missing but allowed in MVP) | static export |
| `npm run verify:build` | pass | none (warning observed: deploy-readiness warns `sitemap.xml` missing but allowed in MVP) | static export |
| `npm audit --json > npm-audit.after.json` | fail | Exit code `1` from `npm audit` (JSON written to `npm-audit.after.json`; vulnerabilities present) | deps |

## Notes

- Repeated npm warning on multiple commands: `npm warn Unknown env config "http-proxy". This will stop working in the next major version of npm.`
- No product code was modified for this audit.
