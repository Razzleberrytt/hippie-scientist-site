# NPM Performance Handoff

## Summary
The npm validation pipeline has been optimized by split-routing checking levels, configuring safe caching, and disabling heavy interactive audits during rapid verification loops.

## Package Setup
- Package manager: npm (Version 10.8.2)
- Node assumptions: Node.js (Version >= 20.0.0 < 23.0.0, running v20.20.2)
- npm assumptions: package-lock.json v3 lockfile format
- Build command: `npm run build`
- Main validation command: `npm run check:fast`

## Files Inspected
- `package.json`
- `.npmrc`
- `package-lock.json`
- `README.md`
- `scripts/ci/audit-internal-links.mjs`

## Command Timings
| Command | Duration | Result | Notes |
|---|---:|---|---|
| `npm ci --prefer-offline --no-audit --fund=false` | 39s | PASS | Offline-first clean installation. |
| `npm run lint` | 63s | PASS | ESLint static check across the codebase. |
| `npm run typecheck` | 15s | PASS | TypeScript compiler syntax/type check. |
| `npm run data:build` | 11s | PASS | Parses monograph workbook and generates public/data. |
| `npm run data:validate` | 3s | PASS | Performs structural, ordering, and graph validations. |
| `npm run build` (full build) | ~4m 30s | PASS | Compiles Next.js app and runs all production post-build audits. |

## npm run check Analysis
- Script: `npm run check` (runs `npm run build`)
- Safe for normal use: No. Chome/Next.js page generation and verification takes around 4.5 minutes, making it too slow for continuous AI-agent verification.
- Slow/hanging reason: Disk I/O bottleneck reading 1,450 static HTML pages sequentially in Windows filesystem.
- Replacement command: `npm run check:fast`

## Bottleneck Found
- Disk overhead in Windows when running static link audits sequentially on Next.js export build output files.
- Unnecessary audit checks and progress bars on repeated node package installations.

## Changes Applied
- Configured `.npmrc` with `prefer-offline=true`, `progress=false`, and `audit=false` to reduce network requests.
- Updated `check:full` in `package.json` to run linter, typecheck, and production build in sequence.
- Preserved `check:fast` as the go-to script for rapid typecheck and lint validation.

## Files Changed
- `.npmrc`
- `package.json`
- `docs/plans/npm_performance_handoff.md`

## New Recommended Commands

### Normal AI-agent validation
```bash
npm run check:fast
```

### Production/release validation
```bash
npm run check:full
```

### Clean install validation
```bash
npm ci --prefer-offline --no-audit --fund=false
```

## Remaining Risks
- The Next.js static build remains a 4-minute process; this is expected for projects of this size (1,400+ generated pages) and should only be triggered before merges.

## Recommended Follow-Up
- Evaluate a package-manager migration to `pnpm` or `yarn` with global caching to further reduce clean installation times in future development sprints.
