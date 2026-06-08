# npm audit remediation: Wrangler v3 → v4

Date: 2026-05-19

## Scope
Upgrade active Cloudflare Pages deployment tooling from Wrangler v3 to Wrangler v4 while keeping deployment behavior intact.

## Before state
- Deploy workflow uses Wrangler directly via GitHub Actions:
  - `npx wrangler pages deploy "$STATIC_OUTPUT_DIR" --project-name "$CLOUDFLARE_PAGES_PROJECT"`
- Installed Wrangler version: `3.114.17`
- Dependency tree snapshot (`npm ls wrangler esbuild miniflare undici ws`):
  - `wrangler@3.114.17`
  - `esbuild@0.17.19` (under wrangler)
  - `miniflare@3.20250718.3`
  - `undici@5.29.0` (under miniflare)
  - `ws@8.18.0`
- Audit metadata before (`npm audit --json`):
  - total: 6 (`moderate: 4`, `high: 2`)
  - findings present for: `esbuild`, `miniflare`, `undici`, `ws`, `wrangler`

## Change applied
- Ran: `npm install -D wrangler@latest`
- Resulting Wrangler version: `4.93.0`
- Dependency tree snapshot after upgrade:
  - `wrangler@4.93.0`
  - `esbuild@0.27.3` (under wrangler)
  - `miniflare@4.20260518.0`
  - `undici@7.24.8` (under miniflare)
  - `ws@8.18.0`

## Wrangler v4 CLI compatibility check
- Verified command help via:
  - `npx wrangler pages deploy --help`
- Confirmed positional directory + `--project-name` option are valid in v4.
- Deploy workflow command did **not** require changes.

## Verification results
Commands executed:
- `npm run typecheck` → pass
- `npm run lint` → pass
- `npm run build` → pass

Audit comparison:
- Before: 6 vulnerabilities total
- After: 4 vulnerabilities total

Target findings status:
- `esbuild`: **cleared** from audit report after Wrangler v4 upgrade
- `undici`: **cleared** from audit report after Wrangler v4 upgrade
- `miniflare`: **still reported**
- `ws`: **still reported**
- `wrangler`: **still reported**

## Outcome
- Wrangler remains installed and active for Cloudflare Pages deploys.
- Wrangler is upgraded from v3 to latest v4 (`4.93.0`).
- Existing deploy workflow syntax remains valid under Wrangler v4.
- Security posture improved for the specific transitive findings in `esbuild` and `undici`; additional upstream remediation may still be required for `miniflare`, `ws`, and `wrangler` findings reported by npm audit.
