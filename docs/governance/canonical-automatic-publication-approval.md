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

For PRs touching a public publication surface, an **authenticated, tamper-resistant, exact-version approval** is still required. The former owner comment token was:

```text
THS-PUBLICATION-APPROVED PR=#123 HEAD=<full-40-character-PR-head-SHA>
```

**Positive PR comment tokens are currently disabled and remain untrusted.** The monitor/controller must report the safe hold and must **not** instruct the owner to submit a token that the policy will reject. A positive REST `APPROVED` review **does not grant publication**: GitHub's available review response cannot authenticate nondelegable, direct human origin, even when `performed_via_github_app` is explicitly `null`. There is **currently no usable positive approval route**, and public release remains held until an immutable human-origin mechanism is independently verified. Delegated GitHub apps can post as the owner; separately, collaborators can edit an older owner comment while GitHub attributes it to that owner. Even a timestamp equality check cannot detect an edit within the same second. The canonical classifier therefore **rejects every comment attempting to grant publication**, including ordinary GitHub-website comments, until an immutable human-origin creation event and protected receipt store are implemented, reviewed and regression-tested. Negative revocation comments still conservatively veto prior approvals. This is a safety availability restriction, **not a solved human-approval automation system**; high-risk publication stays held if the only available positive receipt is editable. A future authenticated grant must be externally verifiable and bound to a final exact head, scoped intent, original reviewer and revocation semantics.

A later GitHub change-request review at that head also revokes an earlier approval. A subsequent content change **changes HEAD** and requires new approval. GitHub's REST pull-request review entries do not reliably expose app-origin provenance; therefore **all** positive REST `APPROVED` review entries are insufficient to grant publication, including when `performed_via_github_app` is explicitly `null` or absent. Negative `CHANGES_REQUESTED` / `DISMISSED` review states still revoke. **Where event timestamps tie at second resolution, any matching negative event wins.** GitHub review IDs and issue-comment IDs are unrelated sequences, not a trustworthy relative timeline. Reviews or issue-comment evidence unavailable due to API error, pagination, or missing provenance are not presumed successful. The actual source of approvals is GitHub's server-reported PR comments/reviews, not untrusted PR files.

The receipt is **owner editorial approval** only. It cannot assert that the owner is a physician, that an independent scientific reviewer signed off, that the workbook/source registry is clean, or that a medical claim is correct. Those questions have separate gates and should remain held until their real evidence exists.

### Approval-origin incident and rollback (October 13, 2026)

GitHub comment `6158687768` was observed as `Razzleberrytt` / `User` **and** `performed_via_github_app.slug="chatgpt-codex-connector"`, demonstrating that owner identity alone does not prove direct human consent. This comment was ordinary audit prose, **not** an approval token. Repair is tracked against [#6672](https://github.com/Razzleberrytt/hippie-scientist-site/issues/6672). Rollback of this stricter rule is unsafe until an alternative immutable, server-authenticated, human-origin proof mechanism is independently verified. GitHub PR review approvals also require explicit non-app provenance, which the available REST review response may not provide. The conservative fallback is to hold public merges rather than treating unverifiable approval as consent.

## Signed-tag proposal quarantined (security review, October 20, 2026)

**Status: FAIL CLOSED. No signed Git tag is an eligible publication-approval receipt.** A genuine signed tag can be replayed by recreating a tag ref to a retained authentic signed object. A GitHub App authorized by the repository owner can inherit a repository-administrator role bypass, so an admin-only tag-ruleset bypass cannot reliably stop this replay after a revocation. Furthermore the normal workflow `GITHUB_TOKEN` cannot inspect ruleset `bypass_actors` without privileged Administration-write access. These are unresolved trust-boundary facts, not cosmetic CI problems.

PR #6938 now **quarantines** the tag-based positive grant: `verifyOwnerSignedTag` may parse samples in security tests, but the canonical publication decision deliberately ignores any supplied `signedTagProof`. `loadPublicationApprovalEvidence` no longer calls the Git tag or privileged tag-ruleset APIs. Owner comments containing a positive token remain untrusted; negative exact-head revocation reviews/comments continue to veto any separately authenticated review evidence. A credential's claim to represent the owner, a GPG signature, or green CI **does not** itself authorize publication. The sole serialized merge controller and all scientific, safety, exact-head and base-freshness checks remain intact.

**Do not sign or push approval tags as a publication workflow.** The previously proposed one-time GPG signing procedure is withdrawn. No additional GitHub Administration credential should be provided merely to work around this limitation.

A future positive approval scheme must have an independently verified *human-origin, nondelegable* grant and an immutable revocation tombstone that a delegated owner app cannot modify or resurrect; the controller must be able to verify both with its available least-privileged credentials. Require negative replay, revoked-head, delegated-app, stale-base and permission canaries, independent security review, exact-head CI, and explicit owner setup before enabling that path. Until then public-content PRs such as #6934 and #6937 remain on publication HOLD; this patch does not establish a working positive approval route or independent biomedical review.

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
