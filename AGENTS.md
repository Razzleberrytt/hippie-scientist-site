# AGENTS.md

## Repository expectations

This repository no longer uses a required queue-driven Codex backlog.
Use Codex manually for the task requested by the user/reviewer.

## Required working style

- Read relevant files before editing.
- Plan first for changes that touch more than one file, workflows, build scripts, data scripts, or enrichment pipeline code.
- Make the smallest correct diff.
- Reuse existing project patterns and helpers.
- Do not change unrelated files.
- Do not merge pull requests. Codex may prepare, update, and validate a PR, but a human decides whether to merge.
- If blocked, stop and provide a concise blocker report instead of improvising a workaround.
- Never silently weaken validation to make a command pass.

## Safety and review rules

- Preserve lane safety expectations.
- Lane B work requires human review before merge.
- Lane C work must never be auto-applied or auto-merged.
- Any task touching safety-critical data, source verification, or interaction severity should stop for human review unless explicit human instructions say otherwise.
- Do not remove schema/domain validation or patch/apply safeguards.

## Repository map

- `public/data/` — published herb and compound JSON plus derived JSON outputs.
- `scripts/enrichment/` — enrichment planner, batch runner, validators, apply flow, coverage, evals.
- `prompts/` — prompt task packs.
- `schemas/` — JSON schemas and vocab files.
- `providers/` — provider adapter layer.
- `ops/` — manifests, rollback manifests, reports, SQLite metadata.
- `.github/workflows/` — CI, Codex automation, data audit, deploy flows.
- `content/blog/` — blog MDX sources.
- `scripts/` — site and data scripts outside the enrichment pipeline.

## Commands Codex may need

Use only the narrowest commands relevant to the requested task.

### Core app / CI
- `npm ci`
- `npm run build`
- `npm run prebuild`
- `npm run verify:redirects`

### Blog / SEO
- `npm run sync:blog`
- `node scripts/generate-sitemap.mjs public`
- `node scripts/generate-rss.mjs`

### Data audit
- `npm run prebuild:validate`
- `npm run audit:data`
- `npm run data:report`

### Local-only operator refresh
- `npm run data:refresh`

Important:
- `npm run data:refresh` depends on operator-local herb CSV inputs and should not be treated as a required CI command unless those CSV files are present.
- In CI, prefer validation of checked-in derived JSON when local CSV inputs are absent.

### Enrichment pipeline
- `node scripts/enrichment/plan-run.mjs ...`
- `node scripts/enrichment/run-batch.mjs ...`
- `node scripts/enrichment/validate-schema.mjs ...`
- `node scripts/enrichment/validate-domain.mjs ...`
- `node scripts/enrichment/apply-patches.mjs ...`
- `node scripts/enrichment/report-coverage.mjs ...`
- `node scripts/enrichment/run-evals.mjs ...`

## Required end-of-task output

At the end of every Codex run, include:

1. changed-file list
2. key diffs
3. commands run
4. verification results
5. risks or follow-ups
