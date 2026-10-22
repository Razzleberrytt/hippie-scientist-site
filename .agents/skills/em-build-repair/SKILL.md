---
name: em-build-repair
version: 1.0.0
description: Work on exactly one admitted EvidenceMotion code repair or feature in Lane 1, with failure reproduction, targeted validation, and a single reviewable PR.
owner: The Hippie Scientist
---
# EvidenceMotion — Lane 1: Build & Repair
Read `../ths-operating-system/SKILL.md` first. This is **engineering**, not daily video production.

## Intake
- Read current sprint and existing PRs/issues; select only one highest-priority admitted/unblocked task. Do not invent new tickets from an old 1,590-card snapshot.
- Record baseline `main` SHA, affected paths, existing failing command/fixture and expected output. Verify the failure locally or mark unverified.
- If the same task already has a branch/PR, **reuse it**. Don't spawn another because a review/check/deployment is slow.

## Execution
1. Constrain change to one observable failure or independently verifiable capability; do not edit the merge controller or unrelated CI to force progress.
2. Locate real EvidenceMotion entrypoints, test scripts, voice vault references and output contract before using a command. Don't guess undocumented flags.
3. Reproduce before modifying, repair minimally, add regression for original defect, verify deterministic behavior and failure/rollback path.
4. Apply science/provenance, static-site compatibility, secrets, mobile readability and output-artifact rules appropriate to edited path.
5. Run changed-scope tests, lint/typecheck, then required repository production build / applicable hosted checks. If no checkout/build capacity, record `NOT RUN` and why; never substitute conversational approval.
6. Hand the same PR to Lane 2 with exact SHA, changed files, failing reproduction now passing, test receipts, known residuals, review discussions, and independent safety flags.

## Fail-safe
- If blocked twice on the same underlying condition, STOP unproductive reruns, classify cause (`code`, `tool`, `permissions`, `CI capacity`, `human review`, `upstream`) and supply one minimal unblock action.
- No recursive branches, automated merge storms, duplicate full builds, blind retry loops or progress percentage manipulation.
- User-facing progress for the 1,590-card program is `verified completed / 1,590`; unfinished individual card percentage only with verified measurable milestones, never fabricated linear increments.

## Completion
Lane 1 finishes only when a scoped patch + evidence packet is ready for independent integration. **Only Lane 2 and the protected controller can establish actual merge/release proof.**