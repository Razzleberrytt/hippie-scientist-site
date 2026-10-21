# AH-P0-005: late merge-hold and PR-state changes

Owner-directed P0 follow-up in existing PR #6938. Status: In progress; no
merge, deployment, human security signoff or positive publication grant claimed.
Reproduction parent: `0e19370e6619c674fefc8071d5a464f4f4008fb4`.

## Root cause and reproduction

`mergeIfStillCurrent` fetched `finalPr` before awaiting final file-scope and
approval work. The later draft/hold check reused that snapshot. A release hold
added while the last file-list request was in flight was invisible to the
controller, and GitHub's merge expected-head condition does not enforce labels.

A runtime regression calls the actual terminal function with fully mocked HTTP
responses and otherwise successful high-risk workflow/check evidence. It changes
server PR state during the second file-list read and records merge PUTs. Before
the repair, all three hold-label cases and the draft case incorrectly merged;
the unchanged positive control merged as intended. Lane 2 independently
reproduced hold/draft transitions using an isolated function harness.

## Repair and verification

Fetch PR release state again after final file-scope/approval work; reject closed,
draft, held, moved-head and retargeted-base states. Keep the trusted branch-SHA
read and validated-base comparison after this new state read, immediately before
the merge request. Do not substitute potentially cached PR `base.sha` for the
existing independently queried branch SHA.

The existing controller test now drives the actual terminal path through mocked
HTTP for three hold labels, draft, closed, head movement, base retargeting, late
branch-base movement and an unchanged successful control. Every blocked case
must send zero merge PUTs; the unchanged case sends exactly one. The helper is
exported for this test seam; no second controller or release writer is added.

The final local four-suite run passed 97 tests, including the separate trusted
branch-base-movement case. Scoped ESLint, documentation links (399 files) and
diff whitespace checks passed. Final exact-commit hosted CI/build
must be recorded in PR #6938 before protected-controller eligibility. Local
dependency installation resolved the prior missing-Vitest environment limitation.
`npm run audit:high` passed under the existing scoped braces allowlist, which
expires 2026-10-24; #6212 remains unresolved and no exception was extended.

## Boundaries and completion criteria

This closes the reproduced stale-snapshot window during final scope/evidence
work. It does not make GitHub GETs and the merge PUT atomic: a label can still
change after the final PR snapshot, and the merge API pins only HEAD. Existing
serialization, last-base verification and publication restrictions remain
necessary. No absolute or permanent race-free guarantee is made.

Finish only after independent exact-head review, all applicable current-head and
current-base checks, production build, the existing review-hold disposition,
protected-controller merge, main verification and production receipt. Scientific
publication approvals and all other PR holds are independent. The actual patch
and validation commands/results are maintained in the same PR rather than a
replacement implementation PR.
