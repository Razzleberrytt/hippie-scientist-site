# SPEC-003 v3 Pipeline Audit (G1)

Date: 2026-03-29

## Scope and source mapping
`docs/codex-handbook-v3.md` is not present in this repository. For this audit, SPEC-003 milestone expectations were mapped to the implemented queue milestones and v3 pipeline assets:

- **M1**: B1-B3 (pipeline skeleton, wiring, deterministic planning/dry-run/apply guards)
- **M2**: C1-C3 (mechanism schemas, validators, dry-run + apply path)
- **M3**: D1 (canonical compound graph + bidirectional link integrity)
- **M4**: E1-E2 (dosage + interactions lanes with Lane B/C protections)
- **M5**: F1 (sources suggestions + claim backlog safety)
- **M6**: F2 + G1 (evals, coverage, release gating, readiness audit)

## Gap list

### Missing required
1. **Run-scoped eval selection bug**: `run-evals` selected latest validation rows globally per patch, then filtered by run id, which could hide valid rows for a requested run and undercount evaluated patches. This is now fixed.

### Partially implemented
1. **Provider adapters are scaffolded but not integrated** (`providers/openai-responses.ts`, `providers/anthropic-structured.ts` return TODO placeholder payloads).
2. **Evals quality signals are currently low** in checked-in data context (e.g., severe interaction precision and dosage precision reported at 0%), though the eval/gate machinery itself executes successfully.

### Nice-to-have / deferred
1. Expand golden set breadth and tighten acceptance thresholds once more reviewed patches are available.
2. Improve baseline tracking for coverage/evals trend analysis across named runs.

## Required gaps closed in this task
- Fixed run-scoped eval row selection so `--run-id` reporting reflects latest validations *within that run*.

## Readiness summary
- **Completed milestones**: M1, M2, M3, M4, M5, M6 framework checks are implemented and executable.
- **Partially complete milestones**: M6 quality outcomes remain mixed due to data/review backlog, not missing gate mechanics.
- **Blocked milestones**: None at framework level.
- **Current readiness**: **ready only for supervised/manual use** (not controlled production autonomy) until evaluation quality metrics and review completion improve.

## Top 5 recommended tasks after G1
1. Complete provider runtime integration behind existing adapter interfaces (without bypassing patch/review gates).
2. Increase approved eval-aligned patch coverage for dosage and severe interactions.
3. Add run-keyed baseline artifacts for `run-evals` and `report-coverage` to support deterministic regression tracking.
4. Reduce bidirectional link mismatch backlog by reviewing/applying generated `link_integrity` patches in controlled batches.
5. Raise Lane B/C review throughput and monitor `claim_backlog` burn-down against release criteria.
