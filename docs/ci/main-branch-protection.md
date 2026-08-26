# Main Branch Protection Contract

**Status:** Required repository-governance setup for `main`
**Tracking issue:** #4014
**Last verified:** 2026-08-26

## Current state

GitHub currently reports branch protection disabled for `main`. Repository quality gates therefore remain advisory at the branch boundary until an authorized repository administrator enables a branch protection rule or ruleset.

## Required merge boundary

Normal agent/user workflows should not be able to write directly to `main`. Changes should arrive through pull requests, and force pushes plus branch deletion should be blocked.

The protection/ruleset should require the universally applicable release gates that are expected to exist on every merge candidate. At minimum, keep these canonical checks required while their workflow names remain current:

- `CI`
- `Build Check`
- `Site Health Check`
- `Atomic upgrade gate`
- `Production Content Lint`
- `Build quality regression`

Additional scoped checks remain mandatory when triggered by the affected change class and must never be bypassed merely because they are not universal branch-protection contexts. Current examples include:

- `Production Content Invariants`
- `Lighthouse CI`
- `Fast UI Check`
- `Schema and Media Governance`
- `Technical SEO Monitor`
- `Crawl Governance`
- `Experience backlog contract`
- `Enrichment Governor`

If GitHub/ruleset behavior supports required workflows rather than static check names, prefer required workflows for scoped gates so conditional execution does not deadlock unrelated PRs.

## Required repository settings

Configure the `main` branch rule/ruleset so that:

1. Pull requests are required before merge.
2. Required status checks/workflows must pass before merge.
3. Branches are required to be current with `main` where practical; exact-head validation remains mandatory after any refresh.
4. Force pushes are blocked.
5. Branch deletion is blocked.
6. Routine agent workflows cannot bypass the rule.
7. Emergency administrator bypass is explicit, exceptional, and auditable.

## Verification procedure

After configuration, verify all of the following without weakening any gate:

1. GitHub reports protection/ruleset enforcement enabled for `main`.
2. A deliberately failing test PR cannot merge through the normal path.
3. A direct non-administrator push to `main` is rejected.
4. A green PR with required checks can merge normally.
5. The required-check/workflow configuration is re-verified after any workflow rename, split, or retirement.

## Change-management rule

Workflow renames can silently break static required-check configuration. Any PR that renames, replaces, or retires a required workflow must treat branch-protection reconciliation as part of the rollout and leave issue #4014 open until GitHub enforcement itself is verified.

## Boundaries

This document does not weaken or replace repository tests, scientific/safety/provenance gates, publication governance, accessibility/performance requirements, deploy verification, or the Integration merge contract. It only records the intended branch-level enforcement boundary. Actual enforcement requires authorized GitHub repository settings and remains unverified until GitHub reports it enabled.
