---
name: em-verify-ship
version: 1.0.0
description: EvidenceMotion Lane 2 independent PR review, scientific/security/output validation, serialized merge-controller integration and exact deployment verification.
owner: The Hippie Scientist
---
# EvidenceMotion — Lane 2: Verify & Ship
Read `../ths-operating-system/SKILL.md` first. Verify only one current PR/head at a time; do not design a second implementation lane inside verification.

## Inspect independent reality
- Fetch the PR's current head SHA, base, changed files, review threads, mergeability, branch-protection required checks, and linked sprint ticket. Assume previously reported PASS can be stale after a commit.
- Inspect changed code/patch and tests, including negative cases, untrusted-input controls, evidence provenance, quarantine, voice/visual source authority, artifact identifiers, rollback and privacy boundaries as relevant.
- Never accept source claims of successful merge/deployment as proof without GitHub and production receipts.

## Required sequence
1. **Review:** record any bug with file, scenario, severity, reproducer, and blocking status. Return same PR to Lane 1 for repairs; no parallel duplicate PR.
2. **Validate exact HEAD:** run or inspect required CI + scope-specific tests and production build on exact new SHA, not earlier green head. No green-only theater: canceled, skipped, pending, or inaccessible required checks are not passed.
3. **Merge eligibility:** verify latest review discussion resolution and any manual-owner gates. Use **sole protected serialized merge controller** only. Never direct-merge around protection or apply ad hoc exemptions.
4. **Receipt:** inspect merged commit on `main`; then Cloudflare production deployment at that exact commit and observable affected behavior. A successful PR merge is not a deployed fix.
5. **Close:** update ticket and authoritative docs through approved repository workflow; only then admit next scoped update.

## When blocked
Report `BLOCKED` with the exact gate and one attempted safe repair/read-only verification. Do not rerun expensive builds repeatedly or create new PRs. Preserve full work provenance.

## Output
`PR + exact head | checks by name | human review | controller merge id | main SHA | deployed SHA/time | smoke evidence | remaining Unknowns`.