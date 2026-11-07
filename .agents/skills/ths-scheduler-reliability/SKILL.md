---
name: ths-scheduler-reliability
version: 1.0.0
description: Diagnose, stabilize and report recurring THS automations with idempotency, access checks, failure repair and truthful execution receipts.
owner: The Hippie Scientist
---
# THS Scheduler Reliability
Use on scheduled enrichment, reporting, research or audit tasks, but **do not create or change automation schedules without the user's authorization**. Existing task ownership is authoritative.

## Per-run guard
1. Read schedule title/prompt, last outcome, source ticket, permissions, current GitHub/remote availability and relevant quota. Distinguish a scheduled message from a remotely executing worker.
2. Establish one small bounded iteration, checkpoint and idempotency key (task + period + target version) before any write.
3. Probe prerequisites. If critical remote execution/CI/auth/runtime is unavailable, mark `FAIL`, identify which prerequisite failed and attempt only a safe bounded recovery. Do not claim that an automation has merged code unless GitHub proves it.
4. Use exactly the same protected merge controller, official repo gates and PR workflow for admitted source edits; never allow simultaneous schedulers to race merge/shared files.
5. Bound attempts. One recoverable retry after underlying cause repaired; stop repeated failed retries, save state and escalate minimal unblock. No invisible stale resumes or accumulating duplicate PRs.
6. Report `SUCCESS` when actual checked operation succeeded. Otherwise `FAIL`, with what was attempted, exact error class, what's preserved, and next executable step. `No change` can be a successful read-only check if clearly stated, but not equivalent to completed enrichment.

## Checklist / receipt
`run_id, time window, objective, prerequisites, unique target, attempts, changed artifacts, test receipts, PR/head, controller result, merged main, deploy SHA, outcome, next action`.
For 1,590-card EvidenceMotion work, report verified total only; never substitute 0/5 or invent count advances.

## Fail-closed action
- **Trigger:** The scheduled run lacks a valid lease, authoritative inputs, provider access, validation results or successful controller receipt, or a retry remains failing.
- **Action:** STOP mutation and label the run FAIL/BLOCKED; preserve idempotent state and a bounded repair receipt, and do not claim enrichment, merge or deployment succeeded.
