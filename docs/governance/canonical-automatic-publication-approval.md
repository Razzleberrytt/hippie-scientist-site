# Automated publication admission policy (v2) — 2026-10-23

**Owner decision:** Required human publication approvals are disabled. The prior approval gate could never accept an approval from any available channel, so fully tested PRs accumulated without a viable path to merge.

## One serialized release process

One change is completed, validated, and merged through the existing **protected autonomous merge controller** before advancing the next admitted workstream. The controller retains its existing exact-head/branch-base identity checks, full required CI/check gating, dependency security audit, scientific/data/content quality checks, no-conflict rule, workflow authorization, final last-moment revalidation, explicit hold labels, and deployment handoff.

The publication classifier is **not a separate approval authority** and cannot waive any of these checks. Passing its classification only means the controller may continue validating.

| Change | Disposition |
| --- | --- |
| Public guides, articles, education, canonical evidence data, workbook, mixed public/content diffs | `AUTOMATED_PUBLICATION`: eligible for normal required automated scientific, integrity, security, test and build validation **without human positive approval** |
| Inert research/editorial staging only | `AUTO_STAGING`: normal CI required, not a license to publish research-only content |
| Security, infrastructure, workflows, scripts, other code | `EXISTING_GATES`: normal risk tier and required checks |
| Missing/invalid changed-file inventory | `HOLD`: fail closed |

## Deliberately removed blocking paths

- No mandatory manual sign-off for PRs changing `app/guides/**`, `content/articles/**`, or `public/data/**`.
- Do not ask the owner for an approval token, signed GPG tag, comment, review, or special manual action in order to merge.
- No approval grants or vetos from API-fetched editable comments, owner-attributed reviews or signed tags. Those endpoints are no longer queried by the publication gate.
- No second/special merge mechanism. **Never direct-merge a PR** as a workaround.

## Remaining non-negotiable, machine-verifiable safeguards

A PR with failing or incomplete required checks, untrusted source/evidence, unresolved scientific/safety violations, stale head or base, draft state, merge conflict, or explicit `hold-merge` / `do-not-merge` / `manual-merge` label remains blocked. A successful CI step does not establish a complete science review or production deployment.

For risk-tiered scientific-content publishing, require the repository's actual, existing objective validators; do not replace a failed check with a prompt, reviewer claim, fabricated proof or an allowlist exception. Record the exact failure and repair **the same PR**, instead of spawning a new one.

The owner's ability to impose an explicit hold is unchanged; it is optional and is not a universal human-approval prerequisite. Existing protected branch rules enforced by GitHub are not silently modified by this code change.

## Acceptance and rollout

- Tests must prove public content reaches normal automated workflow gating without a human receipt, while malformed inputs, held/draft PRs, stale bases, forks and moved heads still fail closed.
- A separate security or editorial PR may merge only when its **own exact head** is green and the single protected controller authorizes it.
- Existing #6956 is the first test case: update there rather than create additional PRs, then verify merge SHA and deployment independently.
