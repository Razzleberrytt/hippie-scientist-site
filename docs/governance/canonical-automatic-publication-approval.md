# Canonical automatic approval policy (v1) — 2026-10-12

**Owner request:** Establish one reusable automatic approval system rather than manually approving every routine research change. This extends the pre-existing **single trusted autonomous merge controller** and its read-only monitor. It does **not** create a new clinical reviewer, a second merge mechanism or a new publishing authority.

## Tiered decision

| Changed-file class | Deterministic disposition | What it does **not** authorize |
| --- | --- | --- |
| Only `docs/research/**`, `ops/research-intake/**`, and/or `ops/editorial-runtime/publication-pilots/**` | `AUTO_STAGING` after normal required exact-head workflow checks | Public release, canonical evidence admission, medical claim approval, source review, indexability change |
| `content/articles/**`, `content/blog/**`, `content/learn/**`, **all** `public/data/**`, specified public app evidence routes, canonical master workbook | `HUMAN_PUBLICATION` / **held** until exact-head owner approval; all existing CI and scientific/release controls still apply | Auto-publish merely from a PubMed ID, favorable AI verdict, passed CI or PR body |
| Other code, ops, documentation, security or workflow changes | `EXISTING_GATES`: pre-existing risk/merge requirements unchanged | Clinical publication authority |
| Missing/invalid changed-file inventory, missing trusted repository owner, forked PR, stale head, malformed evidence | `HOLD`, never silently approve | Any merge |

**Important:** The word “automatic” refers to allowing inert research-staging diffs through existing validation without a separate human editorial approval. It does **not** mean an AI can self-certify clinical correctness. Source-level AI scientific adjudication (see `docs/enrichment/automated-adjudication.md`) remains distinct from **user-facing medical publication**.

## Exact-version owner approval receipt

For PRs touching a public publication surface, the trusted **base repository owner** must review the exact content and leave **either** a GitHub approved review tied to the latest PR commit **or** a top-level PR comment from that owner's verified GitHub account whose **first line** is exactly:

```text
THS-PUBLICATION-APPROVED PR=#123 HEAD=<full-40-character-PR-head-SHA>
```

The comment template is **not** an auto-generated approval token. Owner action must be intentional. The system fetches real GitHub user identity and the newest head SHA; it does not accept a user-written PR description, AI-generated JSON, green tests alone, “approve all”, comment from a different account, or an approval for an earlier commit. To revoke the exact-head approval, the owner can leave a later first-line comment:

```text
THS-PUBLICATION-REVOKED PR=#123 HEAD=<same-full-head-SHA>
```

A later GitHub change-request review at that head also revokes an earlier approval. A subsequent content change **changes HEAD** and requires new approval. Reviews or issue-comment evidence unavailable due to API error, pagination, or missing provenance are not presumed successful. The actual source of approvals is GitHub's server-reported PR comments/reviews, not untrusted PR files.

The receipt is **owner editorial approval** only. It cannot assert that the owner is a physician, that an independent scientific reviewer signed off, that the workbook/source registry is clean, or that a medical claim is correct. Those questions have separate gates and should remain held until their real evidence exists.

## Trusted-controller implementation

- `scripts/ci/canonical-publication-approval.mjs` is the **single risk-classification and approval-decision implementation**, with tests in its adjacent `.test.mjs`.
- `scripts/ci/autonomous-merge-monitor.mjs` obtains actual trusted GitHub approval evidence and uses the same function before emitting exact-head readiness.
- `scripts/ci/autonomous-merge-controller.mjs` re-evaluates approval both during initial readiness and during **terminal revalidation just before merge**, together with original base freshness and CI checks. The merge controller remains the only automated writer.
- The existing controller's draft/hold-label/review-conversation blocks remain intact. **Draft research publication PRs are not automatically merged**. Nonpublic research-only changes can move normally when the draft is deliberately made ready and other required checks pass.
- **No workflow names renamed, no security or scientific validations skipped, no historic source promotions, no forced merge or published page change.**

## Operating priorities

1. Finish source identity/semantic review for the highest-priority DE10–DE13 candidate.
2. Prepare review-only copy in `ops/editorial-runtime/publication-pilots/`; routine staging can auto-clear.
3. For public safety, medical or conflicting evidence, receive the explicit human owner approval bound to the **final PR SHA**. Independently resolve source-integrity/clinical-review requirements separately.
4. Apply the approved diff through a separate normal high-risk PR. Preserve the existing authoritative source and runtime generation; **never copy staging files directly into public runtime without governance**.
5. Merge only via the same exact-head controller after mandatory workflows and final owner approval recheck; verify production and indexing independently.
6. Human editorial approval does **not** end open research source-admission defect [#6600](https://github.com/Razzleberrytt/hippie-scientist-site/issues/6600); prevention of the prior safety approval timing defect is tracked in [#6672](https://github.com/Razzleberrytt/hippie-scientist-site/issues/6672).

## Enforcement limitations / future hardening

The repository's [main branch protection plan](../ci/main-branch-protection.md) previously recorded provider-side branch protection as **not enforced**. The trusted controller gate protects **only merges made through the controller**. A direct administrator merge, settings bypass or direct push may evade that software check while GitHub repository rules remain unenforced. Never claim platform-wide mandatory enforcement until the actual GitHub settings/rulesets and a negative-canary test confirm it.

To make the policy *truly mandatory*, enable protected-branch pull requests and required workflows/checks, prohibit agent bypass, establish an appropriate approval requirement, and test a deliberately unapproved public-content PR against actual merge permissions. This is an **authorized repo-settings operation**, not accomplished by this PR.

**Acceptance:** deterministic tiered decisions; no fake auto-review; stale/revoked/untrusted exact-head approvals rejected; both monitor and terminal merge use one canonical classifier; original CI gates preserved; tests/CI pass; controller-only prevention proven once merged; real branch protection remains a separate verified setting.
