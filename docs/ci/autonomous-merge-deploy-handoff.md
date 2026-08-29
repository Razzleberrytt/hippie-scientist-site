# Autonomous merge and deployment handoff

**Status:** Owner-directed Operations maintenance for issue #4348
**Authorized:** 2026-08-26
**Scope:** PR checks → serialized merge → direct-main deploy → exact production receipt

## Problem

Routine green repository work previously required repeated user/chat prompts to advance lifecycle transitions. CI could finish successfully while the PR remained open until another interactive turn; after merge, deployment completion and live production receipt also required another manual check. This was an orchestration defect, not a scientific/content review requirement.

## Decision

Keep the existing validation workflows and direct `push: main` Cloudflare deployment architecture. Add a privileged control layer that **coordinates** those existing gates but cannot weaken them.

### PR merge monitor

`.github/workflows/autonomous-merge-controller.yml` runs from `pull_request_target`, so its executable workflow definition comes from the trusted base branch. It explicitly checks out only the repository default branch and never checks out or executes PR code.

For same-repository, non-draft PRs the event-driven monitor performs one read-only readiness snapshot of the exact PR head. It requires the canonical universal workflows to be registered and successful:

- `CI`
- `Site Health Check`
- `Atomic upgrade gate`
- `Production Content Lint`
- `Build quality regression`

It also inspects every other check already triggered for that exact head and will not mark the PR merge-ready while any of those checks are pending or failing. Required workflow runs must identify the current base SHA, not merely the current head SHA.

Fork PRs, merge conflicts, moved heads, drafts, and explicit `hold-merge`, `do-not-merge`, or `manual-merge` labels fail closed or stop automatic ownership. The event-driven monitor is deliberately read-only: when a branch is behind `main`, or its workflow/check evidence targets a stale base, it defers rather than mutating the PR. Branch refresh, workflow recovery, and revalidation are owned by the globally serialized fallback/merge controller.

The event-driven monitor has a five-minute job ceiling and performs no retry, update-branch, workflow-dispatch, or merge mutation. Only the serialized write-capable controller may perform bounded recovery for clearly non-semantic workflow conclusions (`cancelled`, `timed_out`, `stale`, `startup_failure`). Generic `failure` remains excluded: scientific, safety, provenance, publication, content, security, accessibility, performance, and other semantic failures must remain failures until the underlying change is repaired.

A scheduled fallback sweep runs every 10 minutes. It re-evaluates open PRs using the same canonical readiness policy, refreshes at most one stale branch at a time, and requires the refreshed exact head to pass a new validation cycle before merge authority exists. This prevents one `main` movement from fan-out dispatching duplicate recovery suites across many long-lived per-PR monitors.

### Serialized merge commit

Readiness observation can occur per PR, but every mutation of `main` is globally serialized with the `autonomous-merge-commit` GitHub Actions concurrency group. This prevents two parallel swarm PRs from both observing the same base as green and racing each other into `main`.

Immediately before the serialized merge, the controller re-fetches the PR head and current base SHA. If either has moved since validation, it does not merge: the branch is refreshed when appropriate and a new exact-head cycle takes ownership. The scheduled fallback sweep uses the same global merge lock and performs at most one merge mutation per sweep.

### Merge → deploy handoff

`deploy.yml` remains triggered directly by `push` to `main`; it does not use a `workflow_run` handoff. Direct-main push is the primary deployment path.

GitHub intentionally suppresses most recursive workflow events caused by actions authenticated with the repository `GITHUB_TOKEN`. Because the autonomous controller may perform the merge with that token, the controller waits for GitHub to register a normal `Deploy to Cloudflare Pages` run for the latest `main` SHA. If and only if no deploy run exists for that SHA, it invokes the deploy workflow's existing `workflow_dispatch` entry point. This fallback does not alter the deploy workflow, bypass its validation, or accept provider state as proof.

### Production receipt

Before upload, the deployment writes `out/.well-known/deployment.json` containing the exact `DEPLOY_SHA`, repository, and workflow run ID. After Wrangler uploads the static export, the same deploy job polls the canonical production origin (`https://thehippiescientist.net`) with cache bypassing and requires that exact SHA to be observable from `/.well-known/deployment.json`.

A deployment therefore cannot report success merely because the provider upload command returned zero. The canonical public site must prove receipt of the exact merge commit. Verification is bounded and fails closed on timeout or mismatch.

## Security boundaries

- Privileged orchestration never executes untrusted PR code.
- Fork PRs never receive privileged automatic merge behavior.
- The event-driven PR monitor is read-only and cannot refresh branches, retry workflows, dispatch workflows, or merge.
- The serialized fallback/merge controller is the sole write-capable reconciliation authority.
- The controller cannot turn semantic workflow failures into success.
- The green head must be validated against the current base before the serialized merge mutation.
- Existing scientific, safety, evidence, provenance, source-of-truth, publication, SEO, accessibility, performance, security, and affiliate release gates are unchanged.
- Direct-main deployment validation remains intact; the dispatch path is only a missing-push-run fallback.
- Explicit merge-hold labels remain available as an emergency/operator stop.

## Proof / regression contract

- `scripts/ci/autonomous-merge-backpressure.test.mjs` locks the event-driven monitor to one read-only snapshot, a five-minute ceiling, and no branch-refresh/dispatch/write path.
- `tests/autonomous-merge-controller-contract.test.ts` locks trusted checkout, permissions, required workflow/base proof, fail-closed conditions, serialized mutation, bounded transient retry, fallback ownership, and the missing-push-run deploy dispatch.
- `tests/deployment-handoff-contract.test.ts` continues to lock direct-main deployment and requires the exact production receipt write/verify steps.
- `scripts/ci/deployment-receipt.mjs` requires exact commit equality; it does not accept approximate timestamps, branch names, or provider success as production proof.

## Operations / incident ownership

When an event-driven monitor reports stale-base or incomplete readiness, do **not** wait for that per-PR job to refresh or retry anything; it has no mutation authority and exits after its snapshot. Check the scheduled fallback/serialized controller, which owns stale-branch refresh, bounded transient recovery, exact-head redispatch, and final merge revalidation. If that owner is unavailable, manual update-branch/re-run/merge remains the emergency fallback only after the same exact-head governance requirements are satisfied.

## Rollback

Revert the single-shot monitor workflow/script, backpressure regressions, and this runbook together to avoid ownership drift. If reverting all the way to the historical long-poll design, restore its workflow permissions/tests in the same transaction; do not leave documentation claiming read-only ownership while code is write-capable, or vice versa. Existing manual PR merge and direct-main Cloudflare deploy behavior remains the emergency fallback; no scientific/content data source is changed by this control layer.
