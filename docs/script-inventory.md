# Script Inventory (Current MVP)

| Script | Purpose | Notes |
| --- | --- | --- |
| `npm run check` | Canonical pre-merge check | Alias of `npm run build` |
| `npm run build` | Canonical production build | Includes workbook data build + Next static export + verify |
| `npm run verify:build` | Deploy verification gate | Verifies routes, redirects, CSS, deploy readiness, and generated data |
| `npm run data:build` | Generate runtime JSON from workbook | Writes `public/data/**` |
| `npm run data:validate` | Validate generated workbook output | Fails on schema/content issues |
| `npm run data:audit` | Source-of-truth audit checks | Enforces workbook-only flow |
| `npm run guard:source-of-truth` | Guardrail for workbook-only pipeline | Blocks non-workbook production data paths |

## Artifact policy

- Deploy output: `out/**` (do not commit)
- Generated runtime data: `public/data/**` and `public/blogdata/**` (generated artifacts, not hand-edited)
