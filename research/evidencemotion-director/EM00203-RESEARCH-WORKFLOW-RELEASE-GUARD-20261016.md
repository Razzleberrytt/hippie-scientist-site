# EM-002.03 — Research workflow release privilege regression, machine-only receipt

**2026-10-16.** This is a source-scoped research guard on two existing GitHub Actions workflows. It prevents several concrete silent permission/trigger/posting-command regressions when a label or source version changes. It does **not** establish the absence of every possible unsafe shell command, evaluate third-party code, authorize a merge/deployment, grant scientific/clinical or aesthetic review, or inspect actual iPhone playback. **No publishing permission is conferred.**

## Actual scope and source receipts

- Existing Lane 1 [draft PR #6840](https://github.com/Razzleberrytt/hippie-scientist-site/pull/6840), branch `research/em-lane1-current-main-science-20261016`; protected serial controller retains all merge authority. The research workflow guard is [`research_workflow_release_guard.py`](research_workflow_release_guard.py) with Git blob `738cd6d2b2fdf7607a9e686fc2fd59b54bc114bb` on code-validation source head `f7e2f31e42b446e6ebe29eecd5a4ef06e29ca28d`. The [negative-control tests](test_research_workflow_release_guard.py) and [mandatory proof CI workflow](../../.github/workflows/evidencemotion-atomic-proof-ledger.yml) run with source changes.
- Pinning applies ONLY to `.github/workflows/evidencemotion-actual-asr-research.yml` and `.github/workflows/evidencemotion-atomic-proof-ledger.yml`. It permits read-only GitHub Actions tokens, `pull_request` and optional `workflow_dispatch` research execution, while rejecting added `push`, `schedule`, `pull_request_target`, write/extra token scopes, per-job permissions, job-level environments, secrets, explicit deployment actions and common direct release/posting commands. Unsupported YAML declaration changes fail closed for review.
- **Actual hosted execution:** [GitHub run #38960009718 / job #117172391780](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/38960009718/job/117172391780), exact code-validation head `f7e2f31e42b446e6ebe29eecd5a4ef06e29ca28d`, **SUCCESS**. Retrieved real complete hosted runner logs, verified **7/7 EM-002.03 tests PASS** (both real workflow declarations and six synthetic mutation families), plus existing proof ledger **15/15**, CPU guard **8/8**, phone-handoff code **10/10**. The source guard printed both actual workflow reports `PASS_DECLARED_READ_ONLY_RESEARCH_WORKFLOWS_ONLY` with `releaseAuthorized=false` and `mayPublish=false`.
- Later commit `a4e87e2786bcced21e28252fbd8cfd978e3be568` adds one focused benign name/version-label regression, checking no publish authority when a research workflow label changes. **Do not call this new test hosted-PASS until an exact-head run confirms it**; the seven previously executed tests are the basis for the initial machine proof.
- **Boundary:** This is declarative/static-command defense-in-depth, not proof that arbitrary Python/shell scripts or all future version edits are incapable of posting. It does not bypass trusted-PR review, mandatory source/science checks, the separate protected merge controller, human handoffs, spending controls, or platform permissions. It does not claim a genuine scientific/media result.

## Seven distinct machine-research-only atomic card receipts

| Atomic card | Verifiable scoped evidence |
|---|---|
| `EM-002.03.U` | **VERIFIED_MACHINE_RESEARCH** — one actual research-only workflow policy restriction, naming both exact source workflows |
| `EM-002.03.S` | **VERIFIED_MACHINE_RESEARCH** — source-blob, exact hosted code-validation head, original named workflow paths and GitHub job logs pinned above |
| `EM-002.03.O` | **VERIFIED_MACHINE_RESEARCH** — explicit fail-closed criterion: safe read-only PR research declarations PASS, added privileged triggers/scopes/actions/secret calls HOLD |
| `EM-002.03.X` | **VERIFIED_MACHINE_RESEARCH** — guard and negative-control tests committed to existing draft PR, executed in hosted first-party atomic proof gate |
| `EM-002.03.T` | **VERIFIED_MACHINE_RESEARCH** — actual hosted 7/7 validation suite PASSED on the above exact tested source, with both real workflow declarations inspected |
| `EM-002.03.N` | **VERIFIED_MACHINE_RESEARCH** — actual hosted adversarial test suite rejected push/schedule/target, write-token, job environment, secret/deploy command and malformed YAML mutations |
| `EM-002.03.R` | **VERIFIED_MACHINE_RESEARCH** — this audit-grade scoped source/CI/negative-control receipt with explicit science/media/phone/merge/publish HOLD |

All seven are **only individually machine-audited research cards**, not parent EM-002 or any quality milestone. The existing 707 inherited provisional cards remain unverified individually; `EM-001.03.T` (real iPhone play) and `EM-007.07` (qualified independent science review) remain HOLD. `mayPublish=false`.
