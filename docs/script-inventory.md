# Script Inventory (Build / Verification / Reporting)

| Script | Category | Primary inputs | Primary outputs | Artifact ownership |
|---|---|---|---|---|
| `data:generate` (`prebuild:data`) | Data generation | Local herb CSVs + conversion/enrichment scripts | Updated `public/data/herbs.json`, `public/data/compounds.json` | Commit resulting data JSON when intentionally refreshed |
| `autofill:data` | Data generation | `public/data/herbs.json` | Updated `public/data/herbs.json` | Commit |
| `data:validate` (`prebuild:validate` + `audit:data`) | Verification gate | Checked-in herb data JSON | Exit status + local audit csv | Do not commit local audit csv outputs |
| `prebuild` | Publication preparation | `public/data/*.json`, `public/blogdata/index.json` | Generated `src/generated/*.json`, publication/indexable manifests, feed files | Commit public/runtime artifacts |
| `build:compile` | Build compile | App source + prebuild outputs | `dist/**` bundle | Do not commit |
| `postbuild` | Prerender/publication verification | `dist/**`, publication manifests | prerendered route files, `dist/sitemap.xml`, `dist/robots.txt`, verification reports | Do not commit `dist/**` |
| `build` | Canonical pipeline | Runs `prebuild` + `build:compile` + `postbuild` | Full production-ready `dist/**` + checks | Do not commit `dist/**` |
| `verify:build` | Verification gate | `dist/**`, publication manifests | Pass/fail for prerender/publishing/redirect checks | N/A |
| `data:report` | Reporting | `public/data/herbs.json` | `scripts/out/coverage.json`, `coverage.md`, `missing_key_fields.csv` | Report-only; keep uncommitted |
| `report:entity-route-payloads` | Reporting | `src/lib/herb-data.ts`, `src/lib/compound-data.ts` | `ops/reports/entity-route-payloads.json` | Report-only; keep uncommitted |
| `report:ops` | Reporting bundle | Same as `data:report` and `report:entity-route-payloads` | Consolidated local reports | Report-only; keep uncommitted |

## Backward compatibility notes

- Existing scripts are preserved (`prebuild:data`, `prebuild:validate`, `audit:data`, `verify:*`, `data:refresh`, `data:refresh+build`, `data:checkup`).
- New grouped scripts are additive aliases/helpers intended to reduce discovery and onboarding friction.
