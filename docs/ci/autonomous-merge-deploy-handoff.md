# Autonomous merge and deployment handoff

**Status:** Owner-directed Operations maintenance for issue #4348
**Authorized:** 2026-08-26
**Scope:** PR checks → merge → direct-main deploy → exact production receipt

## Problem

Routine green repository work previously required repeated user/chat prompts to advance lifecycle transitions. CI could finish successfully while the PR remained open until another interactive turn; after merge, deployment completion and live production receipt also required another manual check. This was an orchestration defect, not a scientific/content review requirement.

## Decision

Keep the existing validation workflows and direct `push: main` Cloudflare deployment architecture. Add a privileged control layer that **coordinates** those existing gates but cannot weaken them.

### PR merge controller

`.github/workflows/autonomous-merge-controller.yml` runs from `pull_request_target`, so its executable workflow definition comes from the trusted base branch. It explicitly checks out only the repository default branch and never checks out or executes PR code.

For same-repository, non-draft PRs it follows the exact PR head until the canonical universal workflows are registered and successful:

- `CI`
- `Site Health Check`
- `Atomic upgrade gate`
- `Production Content Lint`
- `Build quality regression`

It also inspects every other check already triggered for that exact head and will not merge while any of those checks are pending or failing. The controller ignores only its own orchestration check.

Fork PRs, merge conflicts, moved heads, drafts, and explicit `hold-merge`, `do-not-merge`, or `manual-merge` labels fail closed or stop automatic ownership.

Only clearly non-semantic workflow conclusions (`cancelled`, `timed_out`, `stale`, `startup_failure`) are eligible for one bounded failed-job retry. Generic `failure` is deliberately excluded: scientific, safety, provenance, publication, content, security, accessibility, performance, and other semantic failures must remain failures until the underlying change is repaired.

The event-driven controller may remain active for up to 165 minutes. A scheduled fallback sweep runs every 10 minutes so a PR whose controller window expires, or whose event was missed, can still advance after its exact-head checks become green without user prompting.

### Production receipt

`deploy.yml` remains triggered directly by `push` to `main`; it does not use a `workflow_run` handoff.

Before upload, the deployment writes `out/.well-known/deployment.json` containing the exact `DEPLOY_SHA`, repository, and workflow run ID. After Wrangler uploads the static export, the same deploy job polls the canonical production origin (`https://thehippiescientist.net`) with cache bypassing and requires that exact SHA to be observable from `/.well-known/deployment.json`.

A deployment therefore cannot report success merely because the provider upload command returned zero. The canonical public site must prove receipt of the exact merge commit. Verification is bounded and fails closed on timeout or mismatch.

## Security boundaries

- Privileged orchestration never executes untrusted PR code.
- Fork PRs never receive privileged automatic merge behavior.
- The controller cannot turn semantic workflow failures into success.
- Existing scientific, safety, evidence, provenance, source-of-truth, publication, SEO, accessibility, performance, security, and affiliate release gates are unchanged.
- Direct-main deployment validation remains intact.
- Explicit merge-hold labels remain available as an emergency/operator stop.

## Proof / regression contract

- `tests/autonomous-merge-controller-contract.test.ts` locks trusted checkout, permissions, required workflow set, fail-closed conditions, bounded transient retry, and fallback ownership.
- `tests/deployment-handoff-contract.test.ts` continues to lock direct-main deployment and now requires the exact production receipt write/verify steps.
- `scripts/ci/deployment-receipt.mjs` requires exact commit equality; it does not accept approximate timestamps, branch names, or provider success as production proof.

## Rollback

Revert the controller workflow/script, deployment receipt script/steps, and regression tests. Existing manual PR merge and direct-main Cloudflare deploy behavior remains the fallback; no scientific/content data source is changed by this control layer.
