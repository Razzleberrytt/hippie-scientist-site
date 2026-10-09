# THS-MASTER-P0 — Batched delivery, guarded release, and WIP retirement

**Authority:** `AGENTS.md`, `docs/CURRENT_SPRINT.md`, scientific publication review, the exact-head CI suite, protected merge controller, and Cloudflare production receipt. This is an implementation technique, **not a waiver**.

## Practical edit → checkpoint → release loop

1. Choose one **cohesive 15–25-item integration batch**, subject to the three normal workstreams and one active ticket per lane. These are related changes in one reviewable PR, not 25 disconnected security/data migrations. Data/clinical migrations should be isolated.
2. Maintain **one source branch** for the batch and reuse one architecture review. No PR per subfeature; avoid running a full production build between individual edits.
3. During editing, use `node scripts/dev/batch-preflight.mjs --base=origin/main --mode=edit --run` (or omit `--run` for a command plan). It runs changed-file ESLint, affected Vitest, and explicit changed test files as needed.
4. At a meaningful integration checkpoint, use `node scripts/dev/batch-preflight.mjs --base=origin/main --mode=checkpoint --run --receipt=tmp/batch-proof.json`. It adds typecheck, UI accessibility, and applicable scientific/security/governance source tests. Receipts identify head SHA, changed files, commands, outcomes, and source-only scope. Do not commit receipts containing local/private paths or personal data.
5. Once related tests and content contracts are stable, create **one** appropriately scoped PR and run the required exact-head full CI, output/SEO, security, scientific/clinical safeguards, artifact consumers, and visual checks. `--mode=release` deliberately **does not** replace those checks.
6. Repair failures using the failing test/validator as the starting point. Batch compatible fixes before the next push, because each head change invalidates exact-head checks. Do not reuse previous green checks against altered bytes.
7. Trusted controller merges only when required checks are green. Production deploy must verify actual main merge SHA; real field metrics and outcomes remain **Unknown** until measurements exist.

## Why this beats the repeated micro-PR loop

The existing repository already implements partial CI impact classes, caching, exact-head artifact receipts and reuse/fail-closed fallbacks. This workflow **reuses** them and makes editing/checkpoint testing cheap. Mixed dynamic profile/shared UI changes still take the exhaustive required release path, but run it **once for the entire batch**, not once per file. Do not misrepresent build time saved without measured run timings.

## Post-release slot hygiene

The workflow `.github/workflows/retire-completed-workstream.yml` runs after a **successful** `Deploy to Cloudflare Pages` workflow on main. Its fully standalone Node helper:

- independently reads the production workflow receipt, exact main SHA, unique merged PR, and closed issue;
- verifies the active D/R/A owner appears **exactly once and identically** in CURRENT_SPRINT and MASTER_BACKLOG;
- prevents duplicate retirement proposals, fails closed on ambiguous identities, unrelated PRs, incomplete deploys, advanced main or mismatched ownership;
- opens a **documentation-only PR** against main (never edits protected main directly);
- leaves the same project-control/Atomic/CI and sole merge-controller checks in place.

GitHub Actions permissions and organization policy may disallow PR creation or workflow dispatch: that is an **external blocker**, not authority to bypass branch protection. If the action reports blocked, use the same scoped manual control PR. This automation does not admit the next task automatically.

## Evidence, rollback and quality economics

- Rollback: revert the new workflow and helper scripts; no scientific datasets, public routes, credentials, payments or Cloudflare resources changed by this work.
- Distinguish `planned → source committed → tested → PR → green CI → merged → deployed → production verified → measured`.
- Track build/CI minutes **per merged P0 item**, duplicate builds per exact SHA, tests run during editing, stale workstream retirements, release failure rate and actual user-impact metrics. Baseline and ROI **Unknown** until a before/after sample exists.
- Safety, exact clinical source provenance, access control, billing safeguards and production smoke are never deferred beyond a release.

### GitHub-token automation and required checks

GitHub intentionally suppresses normal `pull_request` workflow events from a PR created by the repository's `GITHUB_TOKEN`. Consequently the retirement proposer explicitly dispatches the **existing** CI, Site Health, Atomic, Build Quality, and Project Control workflows against the generated PR head. The existing ten-minute trusted-controller sweep separately handles guarded merge eligibility. If any workflow dispatch fails or policy denies it, the generated PR remains blocked; no check is faked or skipped. The workflow's `actions: write` permission is restricted to these GitHub recovery dispatches, not direct source modification or bypassing branch protection.
