# Lane 8 → Engineering handoff: targeted clean-restage controller regression

**Evidence-bound research proposal; no code changes, merge, publishing, or new atomic credit.** Source: [EvidenceMotion coordination #6743, Lane 8 finding](https://github.com/Razzleberrytt/hippie-scientist-site/issues/6743#issuecomment-6244611584).

## Exact observed defect, not a new unverified conjecture

- [Controller run 39088523482](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/39088523482), job `117560068433`, `main=1ace674cf4ec88b9dee419d267355286d104393a`: manual target PR **#6878** at head `df3a3129a5e0dccca8273b91e4b5914a646542fb`.
- The corresponding runner log terminates with `[PR #6878] NEEDS_CLEAN_RESTAGE: workflow-changing PRs may not use bot-authored update-branch`; that is an **expected safe refusal to mutate** a stale workflow-changing branch, but the controller run itself exits red and repeated unchanged dispatches repeat the same non-progress outcome.
- The same blocker is reproduced on [run 39088347334](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/39088347334) and [run 39088296100](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/39088296100); #6873 has the same class on [run 39087684273](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/39087684273).
- Existing main code `scripts/ci/autonomous-merge-controller.mjs` blob `ec23c17b10f85502ab4e1818ad5aaad4f06d0a43`: `refreshPrAndDispatch()` deliberately throws `PrRefreshBlockedError`, `evaluateSweepCandidate()` classifies that expected error, but *targeted* `followOnePr()` lets it escape to top-level exit 1. The guard that bans bot refresh of workflow-changing PRs MUST NOT be removed.
- #6878's prior exact-head [full CI](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/39087554774) and [progress validator](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/39087554712) were green, but are **not current-main merge authorization**. The separate [#6883](https://github.com/Razzleberrytt/hippie-scientist-site/pull/6883) addresses the earlier missing `workflow_dispatch` capability; do not duplicate that repair.

## Nano action proposal (existing shared controller/Lane 5 infrastructure owner; Lane 8 advises only)

| Nano ID | Engineering instruction | Required evidence | Done only when |
| --- | --- | --- | --- |
| L8-REG-01.01 | Pin the exact runner log above, PR head/base pair, changed workflow filename, controller blob SHA and expected typed error. | Immutable URLs + source/head table. | Repro input unambiguous; otherwise HOLD. |
| L8-REG-01.02 | Read `scripts/ci/autonomous-merge-controller.mjs`, current controller orchestration tests and existing risk-rule implementation without altering them. | Scope/ownership map. | One existing owner and exact paths identified. |
| L8-REG-01.03 | Design a failing *targeted-event* fixture: workflow-changing PR stale to main, otherwise green old-head checks, `CONTROLLER_SINGLE_PASS=true`, injected GitHub transport. | Fixture specification and expected calls. | Fails before fix for targeted path, not just general sweep. |
| L8-REG-01.04 | Freeze oracle: known clean-restage refusal should yield a PR-local blocked/HOLD outcome (not healthy merge approval), **zero** update-branch/dispatch/merge/status-authorized calls. Distinguish system error from safe blocked PR. | Explicit assertions. | Test oracle independently reviewable. |
| L8-REG-01.05 | Under the admitted controller owner, implement the minimal targeted-path handling; preserve typed error, authenticated controller, branch protection, expected SHA, and no silent success. | Minimal source diff. | No changes to unrelated lanes; no exception suppression for unexpected failures. |
| L8-REG-01.06 | Add a two-wake same-PR same-head same-base regression. Check no additional mutation, misleading approval or repetitive failed Actions conclusion for the expected hold. | Two-run negative fixture/log. | Stable blocked outcome without false green. |
| L8-REG-01.07 | Add positive controls: stale ordinary PR still lawfully refreshes and revalidates; workflow-changing PR *already* containing main follows normal evaluation; new head/base triggers fresh evaluation. | Specific test output per case. | Existing workflows never lose needed checks. |
| L8-REG-01.08 | Add fail-closed cases: GitHub auth failure/403/5xx, invalid PR input, in-flight checks and zero-job `action_required`; no fabricated PASS/merge. | Adversarial test results. | Unknown/untrusted conditions remain red/HOLD. |
| L8-REG-01.09 | Execute the owning targeted controller test suite and applicable repo-wide typecheck/lint/security/build checks; capture actual commands, hashes and outputs. | Local exact-input logs. | No old-head results attributed to new code. |
| L8-REG-01.10 | Check PR #6878 and #6873 separately for authorized clean restage from the current main with no bot-authored poisoned workflow ancestry. Do not apply this blocker fix directly to their stale branches. | Restage owner report. | Both dependents have accurate current-head/base statuses. |
| L8-REG-01.11 | Run protected latest-head CI, check source diff, resolved reviews and serialized controller decision; retain publication/science/device/first-render HOLDs. | Run IDs and PR review/merge disposition. | Only controller authorizes any actual merge. |
| L8-REG-01.12 | Revisit the original repeated-failure URLs, add red→green proof or mark BLOCKED with actual remaining dependency, and link the shared evidence ledger without incrementing the canonical atomic denominator. | One final handoff receipt with `mayPublish=false`. | Observed defect genuinely closed or transparently still open. |

**Important:** These 12 `L8-REG` labels are **support handoff steps**, not new `EM-###.##.[USOXTNR]` atomic stages. They do not add to the 4,770 generated nano execution instructions or 1,590 canonical cards. Do not create a second implementation PR merely to use this table; work through the admitted owner/CI path. No manual ad hoc merges.

## Agent acceptance / stop contract

`PASS` requires a real targeted-path regression that fails before and passes after the bounded fix, exact-new-head CI, expected secure refusal on the stale workflow PR, and no unexpected failure misclassified as clean restage. If any authoritative permission, CI run, signed source or typed error evidence is missing, record `HOLD`; don't ask the owner to perform routine manual diagnosis.

`mayPublish=false`, excellent first render 0/1, consecutive varied first renders 0/5, and new canonical cards +0 from this proposal alone.
