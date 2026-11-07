# Newsletter signup simplification — #6987

Status: review candidate; not merged or deployed.
Base: `aad3c4ed9b79bd6ce0cded7680ad834f3cb22098`.
Verified: November 6, 2026 (US Eastern).

## Problem and scope

The newsletter landing page rendered a generic safety-checklist signup before
the research-interest selector and its separate form. A sleep-interest arrival
could therefore subscribe through the generic form without choosing the intended
research preference.

This candidate removes the generic page form, retains General research alongside
Sleep, Stress, Anxiety and Focus, and links directly to the selector from the
introduction. The selector declares page ownership using the existing
`data-email-capture-owner` contract, so removing the generic form does not allow
the global contextual signup to reappear. The ownership wrapper also remains
present after successful subscription.

The existing interest selection, provider endpoint, request payload, honeypot,
privacy copy and backend segmentation are unchanged. No external subscription
was sent, and provider delivery, tags and conversion impact remain unverified.

## Validation

- Five focused Vitest suites: 36 tests passed, including one form on the landing
  page, default choice, sleep-query preselection, all five topic request payloads,
  shared ownership and backend segmentation regressions.
- Changed-source ESLint and `git diff --check`: passed.
- `npm run typecheck`: passed.
- Existing pre-PR fast/security preflight: passed, including high-severity audit.
- Local full production build: incomplete. Compilation and integrated type validation
  passed, then static generation reached 1,593/1,775 pages before the workspace
  connection was lost. No full-build PASS or deployment is claimed.
- Generated newsletter HTML: exactly one form, one email field, one page-owned
  signup marker, the research-interest jump link, and the correct canonical URL.
- Documentation link audit: 405 Markdown files passed.
- Responsive light/dark browser inspection: blocked. The browser could not reach
  the local preview (connection refused); required before release.

The first production-build attempt encountered the environment's `tsx` Unix-socket
restriction (`listen EPERM`). Local, untracked dependency launchers were adapted
to invoke the same scripts through `node --import tsx`; no tracked build script,
source check, threshold or release gate was changed. Regenerated data and media
are excluded from this candidate. Generated tracked files and the local dependency
launchers were restored after the interruption; only the five scoped files remain
changed locally. The final export marker still reports `success: false`.

The existing hosted visual sweep now includes the default newsletter route and
its `?interest=sleep` arrival at 390, 768 and 1280 pixels in both themes, with
mobile screenshots retained. This extends the existing sweep rather than adding
a second browser system; hosted results are pending.

## Admission and release boundary

All 18 open PRs were enumerated with independent changed-file counts; their file
lists were complete. The existing admission evaluator found no scoped issue/path
overlap or active non-held implementation PR for these five paths.

That preflight does not grant sprint admission. The authoritative sprint still
reserves Revenue/Conversion for #6810; #6934 also reserves the central control
documents. This candidate remains held/review-only, adds no active workstream,
and does not modify those reserved documents. Reconcile the existing R priority
and current sprint admission before activation, then run all required exact-head
checks and release through the existing protected serialized controller. No new
mandatory human-positive approval requirement is introduced.
