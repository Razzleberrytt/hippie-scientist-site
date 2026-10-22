---
name: ths-operating-system
description: Canonical routing and execution boundaries for all The Hippie Scientist, EvidenceMotion, and FirstCert workflows. Use at the start of any project operation, merge, scheduled repair, publication, or KPI audit.
version: 1.0.0
owner: The Hippie Scientist
---
# THS Operating System — source-of-truth and scope gate

## Before acting
1. Identify project: THS site, EvidenceMotion development, EM standalone production, or FirstCert. Do not migrate work between them implicitly.
2. Inspect current authoritative docs in repository order: `AGENTS.md`, `docs/DOCS_INDEX.md`, charter, `CURRENT_STATE`, `ROADMAP`, `CURRENT_SPRINT`, `MASTER_BACKLOG`, `DECISIONS`, `SCOREBOARD`, and `SWARM-UPDATES` where applicable.
3. Reconcile against live GitHub head/PR/checks/production receipt. Docs can be stale. Do not use old handoff text as an execution authorization. Existing current-sprint ticket wins over newly imagined work.
4. Read the actual implementation and appropriate tests before editing. Prefer repair/reuse over new parallel infrastructure. Do not relax evidence/privacy/accessibility/security/SEO/publication gates to increase throughput.

## Workstream control
- EvidenceMotion has exactly **two active development lanes**: (1) Build & Repair, (2) Verify & Ship. The historical five domains are **backlog categories**, not five simultaneously executing EM lanes.
- Maintain the repository-wide `AGENTS.md` maximum of three concurrent admitted workstreams (which applies across ALL projects sharing the repo), and one scoped ticket per workstream. A THS implementation ticket must be officially admitted; two EM lanes do not override repository constraints.
- Shared protected merge path must be **serialized**. Sequence is **Complete → Validate → Merge → Confirm on main → Continue**. When a PR is blocked, repair that SAME scoped PR, not an expanding stack. No direct branch-protection bypass.
- Daily EM videos and marketing production are explicitly outside development-lane/card counts; do not consume or increment the 1,590-card EM work ledger for them. Current reported numbers require proof from ledger, not recycled estimates.

## Common runtime branches
- THS repository is a Next.js static export on Cloudflare Pages. Do NOT introduce dynamic API routes, server actions, middleware, or nonstatic runtime into that deployment without a separately approved migration.
- Generated `public/data` can be overwritten by the authoritative workbook pipeline; verify source-of-truth and run appropriate data build before trusting persistent content corrections.
- Temporary sandbox/source draft ≠ repo commit; repo PR ≠ merged; merged ≠ deployed; deployed ≠ measured business result.
- When a tool isn't available, report the exact missing access and produce a reusable checkpoint. Never call a script run, test, deployment, audio QA, analytics event, independent review or merge SUCCESS without the actual receipt.

## Standard status output
`Project | Ticket | Lane | Current exact SHA | Tests run | PR/merge status | Deployment receipt | Blocker | Next scoped action`. Mark each line `Verified`, `Inferred`, or `Unknown` with date. For all scheduled runs: `SUCCESS` or `FAIL`, what was checked, specific attempt to repair, and next step; failed execution is never mislabeled success.

## Security
Do not disclose keys, private health information, email or customer personal data in public PRs. Do not modify FirstCert regulatory/curriculum work without consulting its own skill and gates.

## Fail-closed action
- **Trigger:** The current authoritative sprint, access, source, CI gate or protected merge status cannot be verified.
- **Action:** STOP the proposed mutation; report the exact missing authority as BLOCKED, keep existing changes untouched, and request an admitted scoped ticket or fresh evidence.
