# Repository Health Report (Pre-Rebuild Baseline)

Date: 2026-04-26 (UTC)

## Scope and constraints

This report was created as a non-destructive baseline before rebuild work:
- No source code edits.
- No file deletions.
- No `package.json` edits.
- No `data-sources` edits.
- Canonical source workbook treated as: `data-sources/herb_monograph_master.xlsx`.

## 1) Current framework / build tooling detected

### Frontend/runtime stack
- React 18 (`react`, `react-dom`).
- React Router (`react-router-dom`).
- TypeScript present (`typescript`, `tsconfig*.json`).

### Build tooling
- Vite is the active build tool (`vite`, `vite.config.ts`, `build:compile` script uses `vite build`).
- Vite React plugin is configured (`@vitejs/plugin-react`).
- Output directory configured as `dist` in Vite config.

### Styling/tooling
- Tailwind CSS (`tailwindcss`, `@tailwindcss/typography`, `tailwind.config.ts`, `postcss.config.js`).
- PostCSS + Autoprefixer.
- ESLint + TypeScript ESLint.
- Stylelint configured.
- Prettier configured.
- Husky + lint-staged present.
- Vitest config files are present (`vitest.config.ts`, `vitest.setup.ts`), but no dedicated `vitest` npm script is defined.

## 2) Package manager detected

- `package-lock.json` is present at repo root.
- No `yarn.lock` / `pnpm-lock.yaml` / `bun.lockb` found.
- Package manager in active use is **npm**.

## 3) Important folders (high-level)

### Application/source
- `src/` — main app source.
- `public/` — static assets and generated data targets used by runtime.
- `content/` — authored content (including blog content).
- `api/` — legacy/auxiliary serverless endpoint examples.

### Data + pipeline
- `data-sources/` — canonical workbook input location.
- `scripts/` — primary data/build/verification pipelines.
- `schemas/` — schema-related assets.
- `reports/` and `ops/reports/` — generated reports/ops outputs.

### Documentation + governance
- `docs/` — process/spec/workflow docs.
- `archive/` and `ops/archive/` — historical artifacts.

## 4) `data-sources` contents

Current contents:
- `data-sources/.gitkeep`
- `data-sources/herb_monograph_master.xlsx` (**canonical workbook input**)

No other workbook/source files are currently present in `data-sources`.

## 5) `public/data` and generated data folders

### `public/data` (current primary generated runtime target)
Detected structure:
- `public/data/herbs.json`
- `public/data/compounds.json`
- `public/data/herbs-summary.json`
- `public/data/compounds-summary.json`
- `public/data/herbs-detail/*.json` (**285 files**) 
- `public/data/compounds-detail/*.json` (**235 files**) 
- `public/data/_meta/build-info.json`
- Additional generated/support JSON artifacts also present (e.g., publication/indexability/quality/enrichment outputs).

### `public/data-next` (migration/cutover staging target)
Detected structure:
- `public/data-next/herbs.json`
- `public/data-next/compounds.json`
- `public/data-next/herbs-summary.json`
- `public/data-next/compounds-summary.json`
- `public/data-next/_meta/build-info.json`

Notably, `public/data-next` currently does **not** include `herbs-detail/` or `compounds-detail/` directories in this snapshot.

## 6) Existing npm scripts in `package.json`

- Total script count: **187**.
- Script surface includes:
  - App lifecycle: `dev`, `build`, `preview`, `prebuild`, `postbuild`.
  - Data lifecycle: `data:build`, `data:build:next`, `data:build:workbook`, `data:validate`, `data:validate:next`, `data:refresh`, etc.
  - Verification suite: many `verify:*` scripts (redirects, structured-data, enrichment, workbook-only-path, deploy-readiness, etc.).
  - Reporting suite: many `report:*` scripts (enrichment, source coverage, governed UX/quality flows).
  - Lint/type/test scripts: `lint`, `stylelint`, `typecheck`, `test`, `check`.

Because of script volume, use these as the practical anchors:
- `npm run build`
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run check`
- `npm run data:build`
- `npm run data:validate`
- `npm run verify:workbook-only-path`

## 7) Test / lint / build commands available

### Clearly available checks
- Lint: `npm run lint`
- Style lint: `npm run stylelint`
- Type check: `npm run typecheck`
- Generic test command: `npm run test` (currently exits success with placeholder message)
- Build: `npm run build`
- Combined gate: `npm run check` (lint + typecheck + build)

### Data/workbook-related verification checks
- `npm run data:validate`
- `npm run verify:workbook-import`
- `npm run verify:workbook-only-path`
- `npm run data:parity:report`
- `npm run data:coverage:next`

## 8) Suspicious / legacy folders (do not blindly trust for canonical rebuild input)

These locations appear legacy, archival, or rollback-oriented and should be treated carefully:
- `archive/legacy-data/` (explicitly called legacy archive in README)
- `dist-clean/` (build artifact/auxiliary output style folder)
- `src/components/_archive/` and `src/pages/_archive/` (archive naming indicates non-primary source)
- `ops/archive/` and potentially other `ops/*` snapshots/caches (`ops/cache`, `ops/research/archive`)
- `public/data` files named as legacy combined artifacts (e.g., `herbs_combined_updated.json`, `compounds_combined_updated.json`) coexist with current workbook pipeline outputs

Also note:
- `scripts/data/verify-workbook-only-path.mjs` explicitly forbids several legacy references in default production command paths (e.g., legacy sync pipeline and workbook export artifacts in default path).

## 9) Existing docs about workbook-only data

Primary workbook-only / canonical-source documentation detected:
- `README.md` (declares workbook source of truth and `public/data` generation path)
- `docs/workbook-only-data-contract.md` (route/data contract and canonical commands)
- `docs/SPEC-1-Hippie-Scientist-Rebuild.md` (spec-level workbook source-of-truth statements)
- `docs/workbook-import-audit.md` (import reliability/reconciliation details)
- `docs/workbook-reconciliation-run-2026-04-12.md` (reconciliation run evidence)
- `docs/workbook-identity-map-cleanup-2026-04-12.md` (identity cleanup context)

## 10) Notable consistency observations

- README states `public/data-next` should mirror the final layout during migration; current on-disk `public/data-next` is minimal (top-level summaries + build-info only), so pipeline stage completeness should be verified before cutover assumptions.
- `docs/build-and-verification.md` references scripts like `verify:prerender` and `verify:publishing`; these were not found in current `package.json` script keys, suggesting docs/script drift in that area.

## 11) Commands used for this report (read-only inspection)

- `rg --files -g 'AGENTS.md'`
- `find . -maxdepth 2 -type d \( -name node_modules -o -name .git \) -prune -o -maxdepth 2 -type d -print | sort`
- `find . -maxdepth 1 -type f | sort`
- `find . -maxdepth 1 -type f \( -name 'package-lock.json' -o -name 'yarn.lock' -o -name 'pnpm-lock.yaml' -o -name 'bun.lockb' \) -print`
- `cat package.json`
- `find data-sources -maxdepth 3 -print | sort`
- `find public -maxdepth 3 -print | sort`
- `find public/data -maxdepth 2 -type d | sort`
- `find public/data-next -maxdepth 2 -type d | sort`
- `find public/data/herbs-detail -maxdepth 1 -type f | wc -l`
- `find public/data/compounds-detail -maxdepth 1 -type f | wc -l`
- `find public/data-next -maxdepth 1 -type f | wc -l`
- `find public/data -maxdepth 1 -type f | wc -l`
- `node -e "const p=require('./package.json');console.log(Object.keys(p.scripts).length)"`
- `sed -n '1,220p' README.md`
- `sed -n '1,220p' vite.config.ts`
- `sed -n '1,260p' scripts/data/verify-workbook-only-path.mjs`
- `sed -n '1,220p' docs/workbook-only-data-contract.md`
- `sed -n '1,220p' docs/build-and-verification.md`
- `find docs -maxdepth 2 -type f | sort`
- `rg -n "workbook-only|workbook only|workbook" docs scripts README.md AGENTS.md package.json`

No npm scripts were executed for this baseline to avoid modifying generated artifacts during pre-rebuild inspection.
