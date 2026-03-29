# AGENTS.md

## Repository expectations

This repository uses a queue-driven Codex workflow. Codex should not guess the next task.
Always read `ops/codex-queue.yaml` first and execute only the step named by `current`.

## Required working style

- Plan first for any step that changes more than one file or touches workflows, build scripts, data scripts, or enrichment pipeline code.
- Make the smallest correct diff.
- Reuse existing project patterns and helpers.
- Do not change unrelated files.
- Do not merge pull requests. Codex may prepare, update, and validate a PR, but a human decides whether to merge.
- If blocked, stop and write a concise blocker report instead of improvising a workaround.
- Never silently weaken validation to make a command pass.

## Queue protocol

- Read `ops/codex-queue.yaml`.
- Execute only the step whose id matches the top-level `current` value.
- Do not skip ahead.
- If the step succeeds, set that step's `status` to `done`, move `current` to the next queued step, and set that next step's `status` to `ready`.
- If the step is blocked, set its `status` to `blocked`, add a short `blocker` note, and do not advance the queue.
- Leave completed history in the queue file. Do not delete old steps.

## Risk rules

- Lane A work may be prepared and validated automatically, but apply steps must still respect approval state and existing guards.
- Lane B work requires human review before merge.
- Lane C work must never be auto-applied or auto-merged.
- Any task that touches safety-critical data, source verification, or interaction severity must stop for human review unless the queue step explicitly says otherwise.

## Repository map

- `public/data/` — published herb and compound JSON plus derived JSON outputs.
- `scripts/enrichment/` — v3 enrichment planner, batch runner, validators, apply flow, coverage, evals.
- `prompts/` — prompt task packs.
- `schemas/` — JSON schemas and vocab files.
- `providers/` — provider adapter layer.
- `ops/` — queue file, manifests, rollback manifests, reports, SQLite metadata.
- `.github/workflows/` — CI, Codex automation, data audit, deploy flows.
- `content/blog/` — blog MDX sources.
- `scripts/` — site and data scripts outside the enrichment pipeline.

## Commands Codex may need

Use only the narrowest commands relevant to the current step.

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

## Definition of done for a queue step

A queue step is done only if all of the following are true:

- the requested code/doc/config changes were made,
- the narrowest relevant verification commands were run,
- changed-file scope stayed tight,
- queue state was updated correctly,
- a human-readable summary was written in the PR body or Codex output,
- any blockers or deferred risks were stated explicitly.

## Required end-of-task output

At the end of every Codex run, include:

1. changed-file list
2. key diffs
3. commands run
4. verification results
5. risks or follow-ups
6. queue update made (`current`, completed step, next step)

## Pull request behavior

When Codex runs from GitHub Actions:

- create or update one PR for the current queue step,
- use a branch named `codex/<step-id>`,
- keep the PR narrowly scoped to one queue step,
- do not include unrelated cleanup,
- include the verification summary in the PR body.

## Review guidelines

When reviewing a Codex PR for this repository, prioritize:

- workflow safety,
- data integrity,
- patch-first behavior,
- queue correctness,
- rollback safety,
- CI realism,
- no silent weakening of validators,
- no accidental mutation of `public/data/*.json` during dry runs.

Treat the following as high severity:

- any change that lets Lane C data auto-apply,
- any change that removes schema/domain validation,
- any change that runs local-only refresh steps in CI without required inputs,
- any change that mutates source JSON during a dry run,
- any queue bug that can skip steps or advance on failure.
