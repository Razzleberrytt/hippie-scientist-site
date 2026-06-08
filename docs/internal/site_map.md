# The Hippie Scientist — Site Map and Project Overview

Last updated: 2026-05-25

Use this file as startup context for ChatGPT, Cursor, Copilot, Codex, or any other coding assistant before making changes to the project.

## 1. Project identity

The Hippie Scientist is an evidence-driven herb and compound decision-support site. It should behave more like a structured research/decision engine than a generic blog or supplement store.

Primary goals:

- Help users quickly compare herbs, compounds, goals, mechanisms, and safety considerations.
- Present conservative, citation-aware educational summaries.
- Preserve the workbook as the source of truth.
- Avoid medical claims, hype, vendor-driven claims, or unsupported dosage claims.
- Keep generated runtime data deterministic and auditable.

## 2. Tech stack

Runtime/application stack:

- Next.js App Router
- React 18
- TypeScript
- Tailwind CSS
- Node.js ESM project (`"type": "module"`)
- Static-export-compatible validation is present

Important package/scripts evidence:

- `package.json` uses `next`, `react`, `react-dom`, TypeScript, Tailwind, ESLint, and Node-based build scripts.
- Node engine target is `>=20 <23`.
- Main production build script is `npm run build`.
- Main UI/dev script is `npm run dev`.

## 3. Major source directories

Core app routes:

- `app/` — primary Next.js App Router route tree.
- `src/app/` — additional App Router route content exists here too; check both `app/` and `src/app/` before assuming a route is missing.

Core UI and logic:

- `src/components/` — reusable UI components.
- `src/lib/` — runtime helpers, data access, route helpers, and domain logic.
- `styles/` and global CSS files — global visual system and Tailwind styling.

Data/build tooling:

- `scripts/data/` — workbook-to-runtime-data build pipeline.
- `scripts/ci/` — CI validation gates.
- `scripts/workbook-source.mjs` — canonical workbook path resolver and workbook source guardrails.
- `public/data/` — generated runtime JSON payloads consumed by the site.
- `data-sources/` — canonical workbook/input source location.

Content:

- `content/` or blog-related files may feed blog/static content through `scripts/build-blog.mjs`.

Security/audit docs:

- `security/audit-allowlist.json` — temporary audit allowlist rules.
- `docs/security/xlsx-audit.md` — xlsx dependency exposure assessment.

## 4. Current route map

Primary static/index-style routes to check:

- `/`
- `/herbs`
- `/compounds`
- `/goals`
- `/compare`
- `/stacks`
- `/start`
- `/learn`
- `/blog`
- `/ecosystems`
- `/topics`

Dynamic routes observed in the repo:

- `/herbs/[slug]` from `app/herbs/[slug]/page.tsx`
- `/compounds/[slug]` from `app/compounds/[slug]/page.tsx`
- `/goals/[goal]` from `app/goals/[goal]/page.tsx`
- `/compare/[slug]` from `app/compare/[slug]/page.tsx`
- `/stacks/[slug]` from `app/stacks/[slug]/page.tsx`
- `/start/[slug]` from `app/start/[slug]/page.tsx`
- `/learn/[slug]` from `app/learn/[slug]/page.tsx`
- `/blog/[slug]` from `app/blog/[slug]/page.tsx`
- `/ecosystems/[slug]` from `app/ecosystems/[slug]/page.tsx`
- `/topics/[slug]` from `src/app/topics/[slug]/page.tsx`

When auditing routes, do not only inspect `app/`; also inspect `src/app/`.

## 5. Data source of truth

The canonical source of truth is the workbook under `data-sources/`, especially:

- `data-sources/herb_monograph_master.xlsx`

The runtime site should not treat `public/data/*.json` as canonical. Those files are generated artifacts.

Important rule:

- Do not manually edit generated `public/data` JSON as the long-term source of truth.
- Fix workbook/source pipeline issues upstream, then regenerate.
- Generated data can be inspected for debugging, but should not become the editorial source.

## 6. Data flow

Current high-level data flow:

1. Canonical workbook lives in `data-sources/herb_monograph_master.xlsx`.
2. `scripts/workbook-source.mjs` resolves and validates the workbook path.
3. `npm run data:build` runs the workbook build pipeline.
4. `scripts/data/build-runtime-from-workbook.mjs` builds primary runtime JSON into `public/data`.
5. Post-processing and related-map scripts enrich generated runtime payloads.
6. Route manifest, sitemap manifest, export batches, summary indexes, and semantic snapshots are generated.
7. Next.js route components read from generated runtime data/helpers.
8. `next build` produces the production site.
9. `npm run verify:build` runs deployment/readiness validations.

Main data build command from `package.json`:

```bash
npm run data:build
```

Main full build command:

```bash
npm run build
```

## 7. Build and validation commands

Common commands:

```bash
npm run check:node
npm run audit:high
npm run lint
npm run typecheck
npm run check:data
npm run validate:xlsx-boundary
npm run verify:build
npm run build
```

Full production build:

```bash
npm run build
```

Fast UI sanity check:

```bash
npm run check:fast
```

Data pipeline check:

```bash
npm run check:data
```

Security/high audit gate:

```bash
npm run audit:high
```

## 8. Security and dependency notes

`xlsx` currently exists as a dev/build tooling dependency for local workbook parsing.

Current boundary expectations:

- `xlsx` must remain limited to trusted local Node scripts.
- Do not use `xlsx` in browser components.
- Do not parse user uploads with `xlsx`.
- Do not parse request bodies with `xlsx`.
- Do not parse remote URLs with `xlsx`.
- Use `scripts/ci/validate-xlsx-boundary.mjs` to enforce the import boundary.
- `scripts/workbook-source.mjs` rejects remote workbook URLs and requires local `.xlsx` files.

Temporary audit rule:

- `security/audit-allowlist.json` currently allowlists the high-severity `xlsx` audit finding as an interim build-tooling-only exception.
- The rule expires on 2026-07-24.
- Preferred long-term fix: migrate workbook parsing behind `scripts/data/workbook-parser.mjs` to a maintained parser such as `exceljs`, preserving output parity.

## 9. Agent and patch workflow

Agent-generated data should be treated as supplemental review material, not automatic truth.

Expected pattern:

1. Agent discovers or proposes structured patches.
2. Patches are written separately for review.
3. Human/editorial validation happens before merge.
4. Approved patches are merged through controlled scripts.
5. Workbook/runtime source rules must remain intact.

Do not let agents directly mutate canonical workbook data or generated runtime JSON without an explicit reviewed merge path.

## 10. UX and product direction

The site should remain:

- Scientific but human.
- Calm, premium, and readable.
- Decision-first rather than article-first.
- Fast to scan.
- Conservative about claims.
- Transparent about evidence strength and uncertainty.

Preferred UI behavior:

- Summary first, details second.
- Use expandable details for deeper research.
- Keep cards readable and avoid walls of text.
- Use evidence and safety badges consistently.
- Preserve mobile usability.

## 11. Rules for future coding assistants

Before editing, assistants should:

1. Read this file.
2. Inspect the exact target route/component/script.
3. Check whether the touched file is source, generated output, or validation tooling.
4. Avoid large rewrites unless the task explicitly requires them.
5. Keep workbook source-of-truth rules intact.
6. Run or request the smallest relevant validation command.
7. Report exactly which files changed and why.

Do not:

- Invent data.
- Add unsupported medical claims.
- Add vendor claims as evidence.
- Bypass source-of-truth checks.
- Disable validation gates just to pass CI.
- Move `xlsx` into runtime or user-input paths.
- Treat `public/data` as the canonical editorial source.

## 12. Known architectural watchpoints

- There may be route files in both `app/` and `src/app/`; check for duplication or shadowing before route changes.
- Build scripts are ESM and may fail if file headers/shebangs are corrupted.
- `package-lock.json` must stay synchronized with `package.json`.
- Static export compatibility matters; validate route/data changes before deployment.
- Generated data must remain deterministic.
- The workbook parser migration should be handled as a dedicated parity-preserving task.

## 13. Best first prompt for a new AI session

Paste this at the start of future coding sessions:

```text
Read `site_map.md` first. Then inspect the relevant files before changing anything. This is a Next.js App Router project for The Hippie Scientist. The workbook in `data-sources/herb_monograph_master.xlsx` is the source of truth. Generated `public/data` files are not canonical. Preserve static export compatibility, source-of-truth validation, conservative evidence rules, and the xlsx build-tooling-only boundary. Make the smallest safe patch, then tell me the exact files changed and which validation command to run.
```
