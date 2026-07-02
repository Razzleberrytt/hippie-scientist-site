# NPM Performance Handoff

## Summary
- The npm validation and installation pipeline has been split-routed to isolate the slow Next.js static build checks from everyday code verification. This ensures rapid feedback loops during development while retaining robust release checks.

## Current Script Diagnosis
- The main pipeline command `npm run check` originally pointed directly to `npm run build`, which compiled 1,440 static pages and sequentially ran heavy post-build audits (`audit:internal-links`, `audit:structured-data`). 
- Sequential file audits cause a massive disk I/O bottleneck on the Windows filesystem, taking up to 20 minutes to complete.
- Repeated dependency installations without caching or offline fallback defaults caused excessive network audit overhead and slowed down dev containers.

## Changes Applied
- Mapped the default `npm run check` command to the new `npm run check:fast` script.
- Added `build:fast` to `package.json` to compile the app without running workbook validations and expensive post-build verification audits.
- Added `check:fast` to run `typecheck`, `lint`, and `build:fast` (takes ~7 minutes total, with compilation taking 6 minutes of that, and lint + typecheck taking ~1.5 minutes).
- Updated `.github/workflows/check.yml` to call `npm run check:full` to ensure the Site Health Check CI workflow continues running the comprehensive release suite.
- Verified `.npmrc` settings (`prefer-offline=true`, `progress=false`, `audit=false`, `fund=false`) are correctly in place to speed up package installation.

## New Recommended Commands

### Normal Antigravity / AI-agent validation
```bash
npm run check:fast
```

### Production build validation
```bash
npm run build
```

### Full release validation
```bash
npm run check:full
```

### Clean install validation
```bash
npm ci --prefer-offline --no-audit --fund=false
```

## Commands Run

| Command | Result | Notes |
| ------- | ------ | ----- |
| `npm ci --prefer-offline --no-audit --fund=false` | PASS (44s) | Installs 615 packages using offline-first caching and skipping audit checks. |
| `npm run check:fast` | PASS (7m 4s) | Runs type safety check, linter, and fast Next.js build compilation. |
| `npm run build:app` | PASS (6m 2s) | Independent Next.js app compilation (without workbook data regeneration or static link audits). |

## npm run check Status

* Current behavior: Aliased to `npm run check:fast`.
* Should agents use it: Yes. It runs type checks, lint checks, and Next.js compilation, taking ~7 minutes.
* Replacement: `npm run check:fast`.

## Files Changed

* `package.json`
* `.github/workflows/check.yml`
* `docs/plans/npm_performance_handoff.md`

## Remaining Bottlenecks

* Compilation of 1,440 static pages in Next.js is bound to disk I/O under Windows and takes 6 minutes even without audits. For UI-only or non-Next.js script edits, developers can manually run `npm run lint && npm run typecheck` (~1.5 minutes) for even faster validation.

## Possible Future Dependency Cleanup

* None immediately required. A thorough review of dependencies in `package.json` confirms all packages (`framer-motion`, `lucide-react`, `sonner`, `react-countup`, etc.) are actively imported and used.

## Recommended Next Task

* Evaluate migrating the repository's package manager to `pnpm` or `yarn` with global caching to further reduce clean installation times in future development sprints.
