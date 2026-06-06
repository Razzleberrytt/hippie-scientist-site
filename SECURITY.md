# Security Policy

## Supported Versions

This project follows semantic versioning for the site. Security fixes are applied to the latest main branch and deployed via Cloudflare Pages.

## Reporting a Vulnerability

- Report security issues privately via email to the maintainers (see contact in README or site).
- Do not open public issues for vulnerabilities.
- We aim to respond within 48 hours for critical reports.

## Secrets and Environment Variables

- Never commit secrets, API keys, or credentials.
- Use `.env.local` (gitignored) for local development.
- For Cloudflare Pages deployments:
  - Set `OPENAI_API_KEY` (if used) and other keys only in the Cloudflare dashboard under Environment Variables (Production/Preview).
  - Prefer least-privilege keys; rotate regularly (recommended every 90 days or on team changes).
  - Do not use long-lived personal keys in CI.
- OpenAI API key policy:
  - Used **only** for build-time/agent tooling (e.g., `scripts/ai-*.mjs`, `agent/` orchestration).
  - **Never** imported or bundled into client-side code (`app/`, `components/`, or any runtime page bundles).
  - Guarded by `scripts/ci/validate-direct-dependencies.mjs` (fails build if openai imported from client paths).
  - If key required, pass only via env in node scripts; do not embed.
- Other secrets: Google Analytics ID is public-safe (`NEXT_PUBLIC_GA4_ID`); avoid exposing private analytics keys.

## Third-Party Dependencies

- We regularly run `npm audit` and address high/critical issues.
- **Production audit is clean** (`npm audit --omit=dev` reports 0 vulnerabilities).
- SheetJS/xlsx (exceljs in dev) is used **only** in build-time data pipeline scripts (`scripts/data/build-runtime-from-workbook.mjs` and related) for parsing the source-of-truth `data-sources/herb_monograph_master.xlsx`.
  - **Rationale for allowlist**: xlsx CVE reports (historical prototype pollution, etc.) are relevant for untrusted input. Our input is a controlled internal workbook (never user-supplied). The package is dev-only, not shipped to production bundles or runtime.
  - See `docs/security/xlsx-audit.md` and `docs/security/workbook-parsing-threat-model.md` for details.
  - If a critical CVE affects our exact usage, we will pin, patch, or migrate (e.g., to a safer parser) before next data build.
- **Known dev-only advisory: `exceljs` → `uuid` (GHSA-w5hq-g745-h8pq, moderate)**
  - Affected package: `uuid < 11.1.1` — missing buffer bounds check in `v3/v5/v6` when a `buf` argument is provided.
  - `exceljs@4.4.0` (devDependency) pulls in a vulnerable `uuid` version transitively.
  - **Impact**: none in production. The `uuid` vulnerability only triggers when user-supplied `buf` arguments are passed to `v3/v5/v6()`. Our workbook pipeline never calls `uuid` directly and never accepts untrusted public input.
  - **Workbook ingestion safety**: only the controlled internal workbook (`data-sources/herb_monograph_master.xlsx`) is ever parsed. No arbitrary public uploads.
  - **Remediation**: will resolve when `exceljs` upgrades to `uuid >= 11.1.1`. Track: https://github.com/advisories/GHSA-w5hq-g745-h8pq. Force-upgrading `uuid` via npm overrides is not recommended as it can break exceljs internal behavior.
  - **Verification**: run `npm audit --omit=dev` — zero production vulnerabilities.
- Validate boundaries with `npm run validate:xlsx-boundary` and `npm run validate:direct-dependencies`.

## Security Headers

Headers are served statically via `public/_headers` (compatible with Cloudflare Pages).

Current headers (see file for exact):
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Resource-Policy: same-origin`
- Content-Security-Policy: tuned for the site (allows 'unsafe-inline' only for required Next/JSON-LD and Tailwind runtime; see comments in _headers and `docs/security-headers.md`).

### Live / Deployment Verification

After deploying to Cloudflare Pages (or any host):
1. Visit the live URL.
2. Use https://securityheaders.com/?q=<your-url>&followRedirects=on
3. Verify grade A or better; check that all target headers above appear.
4. Also test manually with `curl -I https://thehippiescientist.net` (or equivalent) for header presence.
5. Re-run `npm run validate-security-headers` locally against the committed `public/_headers` (it checks for presence of key values).
6. If CSP needs tweak post-deploy, update `public/_headers` and redeploy; avoid breaking inline scripts for JSON-LD or styles.

See `docs/security-headers.md` for full rationale and CSP exceptions.

## Content Security and Safe Rendering

- JSON-LD is rendered via `dangerouslySetInnerHTML` only for controlled schema (WebSite, Organization, Article, etc.).
- No user-supplied content is executed.
- Affiliate links use `rel="nofollow sponsored noopener noreferrer"`.

## Data Handling

- The source of truth (`data-sources/herb_monograph_master.xlsx`) is never executed as code.
- Generated `public/data/*.json` are static artifacts only.
- See `docs/generated-data-policy.md` and `docs/security/workbook-parsing-threat-model.md`.

Changes to security policy or headers should be reviewed and tested with the above validators + live headers check before merge.

## Repository History Hygiene Note

Internal planning documents (e.g. PLAN.md, AUDIT_REPORT_*.md, issues.csv, GROK_BUILD_*, GEMINI.md, PRIORITY_ACTION_PLAN.md and similar) were moved from repo root to `docs/internal/` (or `scripts/` for operational tools like cleanup.js and deploy scripts) as part of 2026-06 hygiene remediation. These files may contain historical operational details. If any ever contained secrets, tokens, or sensitive paths, perform separate repository history cleanup using tools like `git filter-repo` or BFG Repo-Cleaner **outside this change**. This commit/move does not rewrite history. After filter, force-push only if team coordination allows and all branches/PRs accounted for. The .gitignore now also covers generated audit/validation reports and *.tsbuildinfo to prevent future exposure.
