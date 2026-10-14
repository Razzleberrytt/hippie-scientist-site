# Unified Approval & Evidence Router (UAER): research-only contract v0.1

**Status:** RESEARCH / contract, not an installed or live approval bypass. **Issue:** [#6775](https://github.com/Razzleberrytt/hippie-scientist-site/issues/6775). **Owner instruction (October 13, 2026):** approvals should be automatic and reliable by default across every THS system. Do not keep asking the owner to approve an unchanged scope. Authority/Content #6766 and D #6685 remain the active admitted work; this cross-cutting implementation is **NOT** admitted here.

## 1. Why this must reuse, not replace

The existing [canonical publication classifier](../../scripts/ci/canonical-publication-approval.mjs) automatically clears **inert** `docs/research`, `ops/research-intake`, and `ops/editorial-runtime/publication-pilots` content. It intentionally holds public `content/articles`, `public/data`, etc. for real exact-head repository-owner GitHub approval. Its [policy](../governance/canonical-automatic-publication-approval.md) explicitly distinguishes GitHub owner authorization from independent scientific review. The only software merge writer is the [autonomous merge controller](../../scripts/ci/autonomous-merge-controller.mjs); it rechecks status/approvals after CI and immediately before merge. Other authorities include [source adjudication](../enrichment/automated-adjudication.md), the evidence registry, media provenance/phone/craft tests and publishing provider receipts.

These are already working in different domains. Create **one reusable decision language and evidence envelope**, consumed read-only by existing controllers at first. Do **not** create another all-powerful bot, merge path, review account, citation dataset, billing authority, scheduling queue, or permission boundary.

## 2. One action → one explainable decision

```text
Existing agent/tool/system proposes an action
                |
   normalize action + exact identities + intent
                |
     trusted evidence and source authority
                |
   risk policy + all required domain gates
                |
  AUTO_APPROVE / AUTO_APPROVE_WITH_PROOF
  REVIEW_REQUIRED / REPAIR_REQUIRED
             BLOCKED / COMPLETE
                |
 existing designated executor; terminal recheck
                |
        exact outcome receipt
```

A decision is deterministic and side-effect-free. It is **not itself** an authorization to merge, publish, pay, delete, change policies or mutate the workbook. Existing executing systems retain the credentials and enforce their own required gates.

### Proposal input (versioned contract)

```json
{
  "schemaVersion": 1,
  "actionId": "stable dedupe key derived from verified input, not free text",
  "actionType": "source-intake | article-publish | article-correction | video-master | social-post | code-merge | deploy | schedule | data-migration | payment | ...",
  "targetSurface": ["canonical owned path/provider/asset identity"],
  "workstream": { "issue": 6766, "lane": "A", "admittedAtBase": "<SHA>" },
  "actionFingerprint": "sha256:... (actual bytes or canonical manifest)",
  "claimAndRiskDelta": { "clinical": "unchanged|changed|unknown", "security": "unchanged|changed|unknown", "publicImpact": true },
  "intent": { "source": "authenticated receipt", "scope": ["allowed operations"], "validUntil": "ISO timestamp", "revoked": false },
  "proofs": [{ "type": "CI | scientific-review | owner-github-approval | craft-phone-review | source-fingerprint | external-action-receipt", "ref": "trusted source ID", "subjectHash": "sha256:..." }],
  "policyVersion": "uaer-v0.1",
  "dependencyIdentities": ["exact source revisions, active issue/PR, current base"],
  "requestedExecutor": "already authorized controller"
}
```

Never treat user-controlled JSON, branch files, PR descriptions, LLM-generated test output or a guessed identity as authenticated evidence. Receipt consumers must fetch external proof by stable identifier and validate the associated SHA, source revision and authenticated actor.

### Output

```json
{
  "decision": "REVIEW_REQUIRED",
  "actionId": "stable action identity",
  "subjectFingerprint": "sha256:...",
  "policyVersion": "uaer-v0.1",
  "riskTier": "high",
  "proofRefsUsed": ["actually verified provenance IDs"],
  "missingProof": ["scientific-review"],
  "reasons": ["specific rule and affected claim/section"],
  "nextStep": "single narrow reviewer request, not an open-ended approval loop",
  "safeRetry": false,
  "allowedExecutor": null,
  "complete": false
}
```

Outputs MUST have explicit reason codes and must be stored as an **append-only audit trail** in an existing, owner-approved ledger when an adapter is implemented. The audit trail is not a second source-of-truth for scientific effects.

## 3. Policy precedence (fail-closed)

1. **Hard stop:** forged, unauthorized, revoked, stale, mis-scoped or unavailable proof; malformed changed-file inventory; incompatible owner/workstream; unverified source status; payment or destructive side effect lacking authenticated authority. `BLOCKED`.
2. **Existing risk controls:** any new clinical efficacy, medical safety, interaction, dosage or regulated claim requires actual independently qualified/scoped source review; high-risk owner exact-head GitHub publication approval still required until a separately reviewed policy makes a narrower scope-bound preauthorization possible. `REVIEW_REQUIRED`.
3. **Failed check:** source drift, failed CI, SEO/content lint, video asset integrity, a11y or provider auth: `REPAIR_REQUIRED` only for known-repairable conditions with a bounded attempt count. Otherwise `BLOCKED`.
4. **Pending check:** not complete and not approvable. Use `REVIEW_REQUIRED` with `pending_check` reason until the implementation adds a distinct wait state; do not imply failure or success.
5. **Safe automated approval:** low-risk, reversible, unmodified source/claim authority, all domain mandatory checks and existing permissions verified; `AUTO_APPROVE`. Public changes already approved for the same **exact** protected claims, target and release scope can be `AUTO_APPROVE_WITH_PROOF` only under a future fully authenticated policy.
6. **Post-execution:** `COMPLETE` only on actual merged SHA/Cloudflare receipt/external published-video or post ID with user-facing verification as needed. An opened PR and an encoding job are not completion.

For every decision, explicitly state `scientific_review_status`, `owner_authorization_status`, `technical_checks_status`, `production_outcome_status` rather than a single ambiguous “approved” flag.

## 4. One shared vocabulary, different domain checks

| Domain | Typical auto action | Never infer automatically |
| --- | --- | --- |
| Research and PubMed enrichment | Store a unique, exact-source, nonpublic PMID discovery with original receipt | That paper supports efficacy or is an independent trial |
| Semantic intelligence | Build a source-bound review-only contradiction/opportunity report | Permission to mutate approved claim or public page |
| Editorial | Reuse already reviewed exact source identities in inert draft; lint references/links | New dosing/safety/efficacy statement is medically cleared |
| Video | Validate fixed asset hashes, caption bounds, deterministic CPU render | Good narration, real phone feel, V craft review or owner release |
| GitHub/CI | Merge truly inert research/doc change after required exact-head checks and controller | Public/clinical/security code granted blanket bypass |
| Social | Queue nonpublic approved draft, dedupe and audit media hash | Post live to an account with a new/changed claim without allowed consent |
| Commercial | Verify existing affiliate disclosure and product URL data | Spend money, promise product quality, change commission claims |
| Privacy/auth | Run tests, record current consent state, show unsigned preview | Modify data access, secrets, security policies without authority |
| Schedulers | Retry bounded read-only task or report real failure | Unbounded writes, duplicate publishes or cross-lane work |

## 5. Scope reuse without asking the owner again

- Persist the **work scope** (such as “review and publish these five articles under existing gates”) independently from the **exact artifact revision** and from **scientific certification**.
- Do not re-request **the same owner work-intent** if the scope, responsible issue, source fingerprints and policy have not changed.
- Re-run only checks affected by a material change; do not reuse an outdated production or safety receipt.
- Trustworthy preauthorization across source revisions would require an authenticated verified owner action on a bounded policy document; never self-issue a GitHub user approval token. A broad user chat approval is not the exact-head GitHub publication token under current policy.
- Independent scientific, legal, media craft and quality reviews cannot be manufactured by multiple self-consistent automated reviewers; remain `REVIEW_REQUIRED` when evidence is not credible.

## 6. Terminal recheck, retries and observability

- One unique action `(actionType, target, normalized scope, exact source fingerprints)`; dedupe across hourly reruns. One real owner lane and authorized executor.
- Check current workstream admission, release head, canonical source status, science/approval revocation, actual bytes and provider state **immediately before execution**, not only at planning.
- Attempt automated repair only on small deterministic problems, within a documented retry budget, preserve the original failure and diff receipt. Defer/escalate after budget exhaustion.
- The existing sole merge controller is still sole writer; the router never calls `merge_pull_request`, provider `publish`, payment, delete, or secret-modifying actions.
- Record whether the final outcome is `complete`, `failed`, `blocked`, or `unknown`; do not infer Cloudflare receipt or indexed traffic from a green GitHub PR.
- Enforce least privilege and auditable, redacted logs (no API tokens or personal health information in manifests).

## 7. Regression matrix (negative cases are first-class)

| Fixture | Expected |
| --- | --- |
| Inert staged Markdown + valid same-head CI | AUTO_APPROVE (as staging only) |
| New article includes unverified medication-interaction claim | REVIEW_REQUIRED / BLOCKED, never public |
| New article uses verified PMID but no assessed effect extraction | REVIEW_REQUIRED |
| Owner says “approve and continue” for unchanged scope | Reuse OWNER_INTENT, not falsely GITHUB_APPROVED |
| Owner GitHub approved exact head; new commit changes article | REVIEW_REQUIRED for new head |
| AI-authored comment imitates owner on GitHub | BLOCKED |
| Valid approved research copy but withdrawn/superseded PMID | BLOCKED |
| Same PMID entered by 5 enrichment schedules | One source identity / one review ticket |
| Five video drafts with valid WAV hash but no phone ear check | REVIEW_REQUIRED |
| Source-altered MP4 with copied previous approval | BLOCKED |
| Render fails audio alignment | REPAIR_REQUIRED; no publication |
| Same social post retried after provider receipt success | COMPLETE without second post |
| Provider times out before authoritative receipt | BLOCKED/unknown; never duplicate send |
| Changed OAuth scope/production secret | REVIEW_REQUIRED with authenticated owner |
| Automated test artifact tries to grant its own scope | BLOCKED |
| Cloudflare run successful for old main SHA | Not COMPLETE on current head |
| PR controller has required CI failure | REPAIR_REQUIRED/BLOCKED despite prior approval |
| GitHub main branch bypasses controller | Not considered reliably enforced until real branch protection/rulesets negative test |
| Source-revision changed, semantic claim unchanged | Revalidate source currency and trust; no blind claim reuse |
| Independent reviewer unavailable | REVIEW_REQUIRED; never invented reviewer or approval |

## 8. Smallest safe implementation route

1. **Separate control admission required:** reconcile active D/A/R lane and record exact-base priority/owner, preserving #6766 and any newly admitted semantic work. A cross-system change cannot silently take another active lane or claim incident overflow.
2. Implement a **pure decision/receipt module** alongside `scripts/ci/canonical-publication-approval.mjs`, reading an explicit risk classification from its existing trusted output, not creating new review credentials.
3. First consumer: existing autonomous merge **monitor** only (read-only explanation). Tests assert **all old publication hard holds remain**; do not wire terminal decision to merge until the same negative suite is green.
4. Second consumer: one low-risk source/enrichment or media **staging** queue with stable dedupe and bounded retry. Do not unlock live publication, medical claims, videos or accounts in this phase.
5. Reuse exact production controller after validated gates and add further adapters one at a time, each with separate contract + negative tests.
6. Measure real repeated-prompt reduction, check reuse, CI duration, failed merges, owner touch count and false-approval incidents. Baseline/ROI **Unknown** until observed.

**Admission of this contract document alone does not modify operational permissions, approve #6774, unfreeze EvidenceMotion or certify independent safety review.**