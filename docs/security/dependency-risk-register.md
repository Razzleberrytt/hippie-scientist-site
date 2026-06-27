# Dependency Risk Register

## Scope

Audit baseline captured on 2026-05-19 from `npm-audit.before-step6.json` after `npm ci`.

## Findings

| package | severity | direct/transitive | dependency path | usage in this repo | exploitability assessment | remediation taken | remaining risk | follow-up |
|---|---|---|---|---|---|---|---|---|
| xlsx | high | direct | `hippie-scientist-site -> xlsx` | Workbook parsing in Node scripts for local repository workbook processing and data generation only (no user upload route). | Advisory class (prototype pollution/ReDoS) is materially constrained here because inputs are trusted local workbook files from `data-sources` and guarded by workbook-source validation. No request/runtime parser path is present in app routes. | Added stricter workbook-source controls (local path policy, extension/type/non-empty checks, canonical-source rejection) and documented threat model/operational controls. | High severity remains in `npm audit` because no patched xlsx release is currently available. Risk accepted with compensating controls until migration/replacement is completed. | Follow-up placeholder: https://github.com/OWNER/REPO/issues/TODO-xlsx-migration (review by 2026-08-15, expires 2026-08-31). |
| ws (via wrangler/miniflare) | moderate | transitive | `hippie-scientist-site -> wrangler -> miniflare -> ws` | Cloudflare tooling path (dev/deploy tooling), not shipped in browser bundle. | Moderate information disclosure issue in vulnerable range; reachable only through tooling dependency graph, not application runtime bundle. | Added lockfile-safe override to `ws@8.20.1`, removing the vulnerable `<=8.20.0` range from dependency graph. | None known in current audit run. | Monitor wrangler/miniflare upstream for native dependency uplift to remove override later. |
