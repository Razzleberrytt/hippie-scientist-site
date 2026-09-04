# Main Branch Protection Contract

**Status:** Required repository-governance setup for `main`
**Tracking issue:** #4014
**Last verified:** 2026-09-04

## Current state

GitHub currently reports branch protection disabled for `main`. Repository quality gates therefore remain advisory at the branch boundary until an authorized repository administrator enables a branch protection rule or ruleset.

The canonical in-repository mutation path is `.github/workflows/enforce-main-protection.yml`. It is intentionally owner-dispatched and requires the repository secret `REPO_ADMIN_TOKEN`; the ordinary `GITHUB_TOKEN` remains read-only and cannot alter repository governance. The admin token should be a fine-grained token scoped only to this repository with **Administration: write** permission (or an equivalently scoped classic token). Do not place the token in workflow inputs, logs, committed files, or issue/PR text.

After provisioning that secret, dispatch **Enforce Main Protection** with confirmation exactly `PROTECT MAIN`, or use the exact owner-only issue command `/protect-main PROTECT MAIN`. The workflow applies this contract and then re-reads GitHub's live branch/protection endpoints; failure to authenticate, mutate, or verify fails closed.

## Required merge boundary

Normal agent/user workflows should not be able to write directly to `main`. Changes should arrive through pull requests, and force pushes plus branch deletion should be blocked.

GitHub branch protection requires **status-check context names**, not GitHub Actions workflow display titles. For Actions, the durable context is the emitted job/check name. The protection enforcer therefore requires the following universally emitted check contexts and pins them to the GitHub Actions app (`app_id: 15368`):

- `Validation, tests, and data` — CI validation, lint/typecheck, Vitest/a11y/native `node:test`, canonical-data and security gates.
- `Production build, output, and SEO` — CI production build/export/SEO lane.
- `Site Health Check` — uniquely named Site Health job/check.
- `Atomic issue and measurement contract` — Atomic PR contract.
- `Full release suite for generator changes` — Atomic release-sensitive suite; GitHub treats an intentionally skipped required check as acceptable.
- `production-content-lint` — Production Content Lint job/check; governed skips remain explicit checks rather than missing contexts.
- `Compare generated quality with base` — Build Quality regression job/check.

Do **not** substitute workflow titles such as `CI`, `Atomic upgrade gate`, or `Build quality regression` into static branch-protection contexts unless the repository actually emits checks with those exact names. A required context that never appears can deadlock every merge.

Additional scoped checks remain mandatory when triggered by the affected change class and must never be bypassed merely because they are not static universal branch-protection contexts. Current examples include:

- `Build Check` — path-filtered; do not make it a static universal required context unless the workflow is changed to run for every PR with a safe no-op path.
- `Production Content Invariants`
- `Lighthouse CI`
- `Fast UI Check`
- `Schema and Media Governance`
- `Technical SEO Monitor`
- `Crawl Governance`
- `Experience backlog contract`
- `Enrichment Governor`

The autonomous merge controller remains stricter than the static branch boundary: for high-risk changes it must continue to re-fetch the exact current head/base and fail closed on any relevant triggered pending, failed, stale, or ambiguous check.

## Required repository settings

Configure the `main` branch rule/ruleset so that:

1. Pull requests are required before merge.
2. The emitted universal GitHub Actions check contexts above must pass (or be intentionally `skipped`/`neutral` where GitHub permits that conclusion) before merge.
3. Required checks come from the GitHub Actions app, preventing an unrelated status provider from satisfying the same text context.
4. Branches are required to be current with `main`; exact-head validation remains mandatory after any refresh.
5. Force pushes are blocked.
6. Branch deletion is blocked.
7. Administrators are subject to the rule so routine owner-capable automation cannot bypass it.
8. Emergency governance changes remain explicit, exceptional, and auditable.

The current autonomous publishing model does not require a human approval count; pull-request existence plus the required checks/controller authorization remain the automated merge boundary. This must not be changed into a silent bypass of review or quality gates.

## Verification procedure

After configuration, verify all of the following without weakening any gate:

1. GitHub reports protection/ruleset enforcement enabled for `main`.
2. The live protection response contains every required check under `.required_status_checks.checks` with the expected context and GitHub Actions app ID.
3. A deliberately failing test PR cannot merge through the normal path.
4. A direct push to `main`, including an administrator/owner-capable routine automation path, is rejected while `enforce_admins` is enabled.
5. A green exact-current PR with required checks can merge normally through the autonomous merge controller.
6. A docs-only or otherwise scoped PR can merge without waiting forever on a missing path-filtered context.
7. The required-check configuration is re-verified after any workflow/job rename, split, path-filter change, or retirement.

The hourly `Main Protection Audit` remains the independent continuous verifier after enforcement. It must not be treated as a substitute for GitHub's own branch-level control.

## Change-management rule

Workflow **or job/check** renames can silently break static required-check configuration. Any PR that renames, replaces, retires, or materially changes the trigger/skip behavior of a required check must treat branch-protection reconciliation as part of the rollout and leave issue #4014 open until GitHub enforcement itself is verified.

## Boundaries

This document does not weaken or replace repository tests, scientific/safety/provenance gates, publication governance, accessibility/performance requirements, deploy verification, or the Integration merge contract. It only records the intended branch-level enforcement boundary. Actual enforcement requires authorized GitHub repository settings and remains unverified until GitHub reports it enabled.
