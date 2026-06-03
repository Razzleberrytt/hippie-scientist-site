# Data Pipeline

This document describes how data flows from source-of-truth to published static artifacts for The Hippie Scientist (static export site).

## Core Principles (from AGENTS.md)
- **Source of truth**: `data-sources/herb_monograph_master.xlsx`
- **Generated artifacts** live in `public/data/` — treat strictly as *build outputs*, never hand-edit.
- Never modify `public/data/workbook-herbs.json`, `public/data/workbook-compounds.json` etc. directly.
- Run `npm run data:build` (or equivalent) after any workbook change, before `npm run build`.
- CI enforces via `validate:workbook-source` before any workbook-dependent commands.
- Preserve route contracts: `/herbs/:slug`, `/compounds/:slug`, `/goals/:slug`.

## High-Level Flow
1. **Workbook ingestion** (`scripts/data/build-runtime-from-workbook.mjs` etc.)
   - Parses the xlsx.
   - Produces normalized runtime JSON under `public/data/`.
   - Additional post-process, indexes, manifests, batches, etc.

2. **Blog content** (`scripts/build-blog.mjs`)
   - Processes MDX/MD under `content/blog/`.
   - Produces `data/blog/posts.json` and related.

3. **Semantic / relationship maps** (various `build-*-maps`, `build-semantic-snapshots`)
   - See "Semantic Snapshots" section below.

4. **Next.js static build** (`scripts/build-production.mjs` + `next build`)
   - Consumes the generated `public/data/` + other data.
   - Emits `out/` for Cloudflare Pages / static hosting.

5. **Verification layers**
   - Many `validate:*`, `verify:*`, `audit:*`, `guard:*` scripts.
   - Run in `npm run verify:build`, `npm run build:qa`, `npm run check:full`, etc.
   - `verify:build:parallel` runs most post-build checks concurrently.

Orchestration for the main serial pipeline is now in `scripts/orchestrate-build.mjs` (see "Build Orchestration" below). This makes the long `&&` chains in `package.json` unnecessary while preserving exact order and behavior.

## Build Orchestration
- `npm run build` (and `npm run build:pipeline`) now delegates to `node scripts/orchestrate-build.mjs`.
- The orchestrator:
  - Runs a fixed list of named steps (extracted from the prior monolithic `build` command).
  - Reports step name, description, timing (to 0.01s), and success/failure.
  - On failure: prints the exact failing step name + full command + exit code/signal + purpose, then exits 1 immediately (no error swallowing).
  - Uses `spawnSync` (cross-platform friendly).
- Individual steps remain directly runnable (e.g. `node scripts/data/build-runtime-from-workbook.mjs ...`).
- `npm run verify:build:parallel` (and `verify:pipeline`) remains for the parallel audit/verify layer.
- `build:deploy` and `build:qa` are specialized entrypoints (deploy is lean for CF; qa is comprehensive parallel checks). They have their own internal orchestration/timing.

The logical order of data production + validation steps is preserved exactly unless a bug was present.

See also `scripts/build-deploy.mjs` and `scripts/build-qa.mjs` (they predate the general orchestrator but follow similar patterns with caching/parallelism).

## Generated Data Protection (guard:generated-data)
`public/data/` must only be mutated by the build pipeline.

- Script: `scripts/ci/guard-generated-data.mjs`
- npm: `npm run guard:generated-data`
- Integrated into `data:validate` and the main build pipeline (via orchestrator).
- Behavior (conservative):
  - Computes changed files via `git diff ...HEAD` (supports GitHub PR base via `GITHUB_BASE_REF`, falls back to `origin/main` or `HEAD~1`).
  - If any `public/data/**/*.json` (or .gz) changed **and** no recognized source/build files changed in the same diff → fail hard.
  - Recognized sources include: `data-sources/`, `scripts/data/`, key build scripts (`build-blog.mjs`, `build-production.mjs`, `validate-workbook-source.mjs`, etc.), and the guard itself.
- This catches direct manual edits in PRs while allowing normal "I edited the xlsx + ran build + committed outputs" flows (because source files will also be in the diff).
- Does **not** replace `validate-workbook-source` or `verify-workbook-only-path` (those are still run).
- Limitations (documented in the script):
  - Depends on git history / fetch depth in CI.
  - If you change an *unlisted* build script that affects outputs, you may see a false positive (update the SOURCE_PATHS list in the guard).
  - Purely structural (does not diff content or run full rebuild for comparison).
- Run it locally before committing changes that touch generated data.

## Semantic Snapshots
Produced by: `scripts/data/build-semantic-snapshots.mjs --data-dir=public/data`

Outputs:
- `public/data/runtime-snapshots/profile-semantic-snapshots.json`

What it contains (high level):
- Aggregated "related", "comparison", "stack", and "ecosystem" maps turned into compact per-profile snapshots.
- Used for analysis, coverage reporting, governance checks, and debugging semantic relationships (e.g. "which profiles are connected via mechanisms/stacks?").
- Limited to a small number of entries/labels per snapshot for size.

Does it affect production rendering / static site?
- **No.** Searches of the client-side / `app/` / `components/` code show no imports of `runtime-snapshots` or `profile-semantic-snapshots` in runtime paths.
- The snapshots are consumed by:
  - `scripts/data/verify-generated-data.mjs` (ensures the build step produced expected artifacts).
  - Enrichment reporting / coverage tools (`scripts/enrichment/report-coverage.mjs` etc.).
  - Possibly manual inspection or future governance dashboards.
- They are committed alongside other `public/data/` artifacts because the site publishes the entire `public/` tree, but they are not loaded by pages for users.

How to regenerate:
- As part of full data pipeline: `npm run data:build` or `npm run build` (the step is included).
- Standalone: `node scripts/data/build-semantic-snapshots.mjs --data-dir=public/data`
- Requires the upstream runtime maps (`runtime-maps/*.json`) to have been built first (the script reads them).

How to validate:
- The step is part of `verify-generated-data`.
- Run `npm run data:verify` or the full `verify:build`.
- `npm run guard:generated-data` will also protect the snapshot file from direct edits.
- See `scripts/ci/report-semantic-scale-summary.mjs` and `semantic-governance-check.mjs` for related health signals.

## AI Enrichment & Review Gate (Manual by Design)
AI-assisted enrichment (via `agent/` agents, OpenAI calls, etc.) produces **patch** files under `agent/patches/<date>/...-*.json`.

These patches are **never** auto-applied or auto-promoted into `public/data/` or the committed runtime artifacts.

Key components:
- `scripts/enrichment/apply-patches.mjs` — applies only approved / non-rejected patches for specific lanes (esp. Lane A for mechanisms; Lane C has stricter rules). Dry-run supported. Mutates targets only for allowed patches. Writes manifests + rollback info to `ops/`.
- `scripts/enrichment/release-gate.mjs` — enforces multiple conditions before a "release" / promotion of enrichment work, **including explicit `review_decisions` rows with `decision='approved'` for Lane C patches**. Also schema, domain, coverage, pre/post build, etc.
- `scripts/merge-patches.mjs` — exports selected patches (for review) to `ops/agent-review/approved-patches.{json,csv}` (name is historical; output is for human review).
- `scripts/review-patches.mjs` — CLI to summarize recent patches, surface issues, rejections, confidence, etc.
- State is tracked in a sqlite DB under `ops/` (bootstrapped via migrations) with tables including `review_decisions` (patch_id, lane, decision, created_at, ...).
- Lanes: A (core, lighter gate), B, C (high-scrutiny; requires explicit approved row in review_decisions).
- Patches can be rejected at validation or review time; rejected patches are skipped.

Process (manual review required):
1. Run enrichment waves / agents (e.g. via `agent/run-agent.js`, `scripts/enrichment/run-*.mjs`).
2. Patches land in `agent/patches/`.
3. Human reviewer uses `npm run agent:review` (or `node scripts/review-patches.mjs`) + `node scripts/merge-patches.mjs --slug=...` to inspect/export.
4. Record decisions (approved/rejected/pending) — this populates `review_decisions` (tooling for recording decisions lives in the enrichment scripts / agent lib; exact UI may be ad-hoc sqlite or wrapper scripts).
5. Before any apply that could affect runtime data: run `npm run enrichment:release-gate` (or `node scripts/enrichment/release-gate.mjs`).
6. Only then `node scripts/enrichment/apply-patches.mjs` (or with `--dry-run` first). This is the only path that mutates public/data from patches.
7. Re-run data builds + full verify/guard steps.
8. Commit the (now legitimately generated) changes + the patch files + review artifacts as appropriate.

CI / pipeline enforcement:
- `guard:generated-data` + `verify-workbook-only-path` + `validate-workbook-source` make direct json tampering fail.
- The `apply-patches` script itself refuses to apply unapproved Lane C (and other rules).
- `release-gate` is the documented gate for promotion.
- We recommend (and can add to `check:full` / `build:qa` / `data:build` if desired) running the release-gate as part of enrichment-related CI.
- Added `enrichment:release-gate` npm script for convenience.
- In the orchestrated build, data steps run the generated-data guard.

**Never auto-promote AI content.** All AI-derived claims/mechanisms/etc. for health topics go through the lane + review_decision + gate process. Conservative language rules and no invented claims are enforced upstream in the agents and validation.

See also:
- `scripts/enrichment/` (plan-run, run-batch, evidence-acquisition-engine, etc.)
- `agent/patches/` (example patches; never commit un-reviewed ones that would affect prod)
- `ops/agent-review/` (review exports)
- AGENTS.md (no medical claims, conservative language)

## Other Notes
- `npm run data:build` is the common target after workbook edits.
- Always run full validation (`npm run verify:build`, `build:qa`) before considering a data change ready.
- Semantic governance and coverage reports help catch drift.
- For questions on a specific step, run the individual script with `--help` if available, or read its header comment.

This pipeline prioritizes debuggability (orchestrator + named steps + guards) while keeping strong safety rails around generated artifacts and AI contributions.
