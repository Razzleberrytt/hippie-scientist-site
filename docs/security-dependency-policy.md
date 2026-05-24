# Security dependency policy
- CI/deploy must use `npm ci` only.
- Deploy workflows must not run `npm install`.
- `package-lock.json` must be committed with dependency changes.
- All imported external packages must be declared directly.
- Audit allowlist entries require expiry/review dates and issue tracking URLs.
- New direct dependencies require PR justification.
- Prefer `npm ci --ignore-scripts` for audit-only CI jobs; full builds keep scripts enabled.

- Build-time workbook parsers (for example `xlsx`) must stay in `devDependencies` and remain blocked from runtime/browser imports via `npm run validate:xlsx-boundary`.
