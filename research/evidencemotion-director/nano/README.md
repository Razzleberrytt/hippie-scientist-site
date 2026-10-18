# EvidenceMotion — nano instructions for engineering agents

**Planning supplement only.** This directory decomposes the existing **1,590 atomic cards** (in five canonical lanes) into **4,770 explicit nano instruction steps**, three per card. The source-of-truth remains [the 46-item completion tracker](../COMPLETION-CHECKLIST.md), [243-task register](../GRANULAR-46-EXECUTION-REGISTER.md), [1,590-card index](../ATOMIC-EXECUTION-INDEX.md), `AGENTS.md`, the current admitted sprint, and exact source/CI/film evidence. This directory is neither a second source of completion truth nor a change to release/publishing authority.

## Find your lane

| Owner | Scope | Original atomic cards | Nano instructions | Exact generated file |
| --- | --- | ---: | ---: | --- |
| Lane 1 | Operating, scientific-source and provenance | 245 | 735 | [01 — Operating and science](01-operating-science.md) |
| Lane 2 | Original voice, pronunciation, word and caption timing | 289 | 867 | [02 — Narration and timing](02-narration-timing.md) |
| Lane 3 | Reusable visual craft, source-locked choreography | 332 | 996 | [03 — Direction and craft](03-direction-craft.md) |
| Lane 4 | Actual decoded video, mobile/UI QA and safety | 373 | 1,119 | [04 — Trust and mobile](04-trust-mobile.md) |
| Lane 5 | Input packaging, acceptance, operating and rollback | 351 | 1,053 | [05 — Canonical promotion](05-canonical-promotion.md) |
| **Total** | **46 milestones, 243 subtasks** | **1,590** | **4,770** | |

**Lane 6** remains auxiliary cross-lane artifact handoff; **Lane 7–11** remain research/support roles rather than canonical engineering owner lanes. Lane 8's regression intelligence handoff example is [here](LANE8-REGRESSION-HANDOFF-20261017.md). Neither creates additional atomic IDs or authorized implementation slots.

## How to execute one nano task

1. **Read authority first.** Start with `AGENTS.md`, `docs/CURRENT_SPRINT.md`, existing owning issue/PR and the one exact original atomic card. First check if its evidence was already earned; do not repeat old work because the nano checkbox appears empty.
2. **Work on one real unit.** Replace the generic template unit with a genuinely enumerated ID such as `@claim-017`, `@word-042`, `@frame-009`, or `@run-<actual-id>`. Do not invent extra instances or treat a single sample as the full-unit inventory. One atomic template can have multiple real instances, each with different hashes.
3. **Take the three nano steps in order.** Each `EM-034.04.T` card has `.01` locate/preflight, `.02` one bounded action/measurement, and `.03` receipt/handoff. A per-step result cannot independently certify the atomic card. The original atomic contract is printed immediately above each trio.
4. **Never assume an implementation path.** The source atomic card usually defines outcome and *unit*, not exact current code filenames. Locate owning code, media and current refs first, check Git history, and record a precise code/asset path in the execution receipt. If missing or ambiguous, mark HOLD; do not substitute a nearby latest movie, synthetic-only fixture or invented file path.
5. **Use measurable proof.** Save original immutable source/output hashes, bounded command and tool versions, baseline result, expected oracle, actual observed result, run URL, PR head/base SHA, reviewer scope, and failures. Physical decoded A/V, primary studies, independent expert/handset evidence and release authorization remain independently required where stated.
6. **Reconcile, don't auto-credit.** Nano checkboxes are instructions, not scored progress. A nano `.03` handoff means a reviewable note exists; card `.R` and eventual atomic/parent credit require the canonical independently governed proof process. Do not represent 4,770 as work completed, nor add it to 1,590.
7. **Run the right gates.** On code changes: targeted positive and adversarial tests, current-head CI, applicable whole-repo build/security/quality gates, resolved reviews, current-main ancestry, and the sole serialized protected merge controller. A blocked workflow changes needs authorized clean restage; never bot-force-update such a branch.
8. **Preserve safety limits.** No unauthorized science changes, fabricated qualified review, simulated actual-phone PASS, copied/mislabeled WAV, unapproved source substitution, automatic upload, version bump or `mayPublish=true`. Today's individual video creation stays OUTSIDE the five engine development lanes.

## Agent handoff receipt (fill actual values, never placeholders as evidence)

```json
{
  "schema": "em-nano-execution-receipt-1",
  "nanoId": "EM-034.04.T.02",
  "atomicId": "EM-034.04.T",
  "instanceId": null,
  "ownerLane": 4,
  "admittedTicket": null,
  "owningPr": null,
  "headSha": null,
  "baseSha": null,
  "sourcePathOrUrl": null,
  "sourceSha256": null,
  "artifactSha256": null,
  "predeclaredOracle": null,
  "command": null,
  "environment": null,
  "expectedOutcome": null,
  "observedOutcome": null,
  "testRunUrl": null,
  "status": "PLANNED",
  "reviewScope": "machine-only-unverified",
  "blocker": "Missing exact real-unit/source evidence until independently resolved",
  "mayPublish": false,
  "atomicCreditAwarded": false,
  "canonicalMilestoneCreditAwarded": false
}
```

**Permitted execution statuses:** `PLANNED` (not attempted), `READY` (actual input and permission known), `BLOCKED` (missing dependency), `FAILED` (reproduced failure), `EXECUTED_UNVERIFIED` (artifact created without required proof), `MEASURED_PASS` (bounded test established), `HANDOFF` (owner has received evidence). None is equivalent to accepted canonical completion. A validated historical source receipt can be linked without rerunning an identical expensive operation, but must be labeled historical/exact-scope.

## Suggested agent request

> Under the currently admitted EvidenceMotion owning ticket, pick ONE unblocked nano ID and real instance. Read its original atomic contract, exact source and prior receipts. Do its `.01 → .02 → .03` sequence, producing one source/hash-bound evidence receipt. If existing evidence satisfies the same exact unit/oracle, link it instead of repeating work. If prerequisites are unavailable, record BLOCKED and named dependency. Run actual targeted tests; preserve separate full CI, scientific, craft, phone, publishing and serial-merge gates. Do not start a new PR/WIP lane or claim completed nano/atomic counts without approved reconciliation.

## Integrity

Run `node research/evidencemotion-director/nano/validate-nano-register.mjs` from repository root. The validator checks the full original atomic source against nano IDs, original group titles, exact copied atomic contract wording, stage order, and frozen denominators. It deliberately accepts both `[ ]` and `[x]` on nano instruction steps; a checked planning note remains non-scoring and never grants atomic acceptance. Any original card additions/removals or in-place renumbering must cause a FAIL until the nano layer is deliberately revised. Validation of the *registry structure* does not prove tests/implementation passed.

**Keep this generated instruction layer stable** as code owners carry out work in their existing admitted issues. A reviewer can cite nano IDs in a PR comment or an existing ledger; do not churn thousands of checklist boxes or create 4,770 separate GitHub issues.
