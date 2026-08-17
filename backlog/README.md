# Backlog

This directory is the repository-facing execution system for The Hippie Scientist's 1,000-ticket improvement backlog.

## Files

- `master_backlog.csv` — **writable source of truth** for agents and Git history.
- `master_backlog.xlsx` — human-friendly dashboard/reference snapshot with Dashboard, Agent Queue, Definitions, and Execution Protocol tabs.
- `../BACKLOG_IMPLEMENTATION_PLAYBOOK.md` — execution contract for any agent working a THS ticket.

## Agent workflow

1. Read `../BACKLOG_IMPLEMENTATION_PLAYBOOK.md`.
2. Select the highest-priority unblocked/Ready ticket whose dependencies are satisfied.
3. Inspect the existing implementation before changing anything.
4. Implement only the scoped ticket.
5. Run the relevant automated checks and QA.
6. Commit/PR with the `THS-####` ticket ID.
7. After successful merge/deploy where applicable, update that ticket's row in `master_backlog.csv`:
   - `Status`
   - `Owner`
   - `PR / Commit`
   - `Proof / Notes`
8. Rebase/sync before selecting the next ticket.

## Source-of-truth rule

`master_backlog.csv` is authoritative for live ticket status in Git.

The XLSX file is intentionally a dashboard/reference snapshot. It should be regenerated from the CSV during periodic backlog maintenance rather than edited after every ticket. This avoids opaque binary diffs and merge conflicts.

## Done means done

Do not mark a ticket `Done` merely because code was written. Applicable acceptance criteria, tests, QA, merge/deploy, and proof must be complete.

## Concurrency

Multiple agents may work in parallel only on tickets that do not share a foundational dependency or the same files/system surface. Before beginning a ticket, sync with the target branch and check the backlog row again to avoid duplicate work.
