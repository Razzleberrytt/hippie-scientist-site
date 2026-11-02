# Homepage discovery and retained visual repair — 2026-11-01

Owner: #6983; implementation vehicle: existing PR #6723. No new implementation lane or PR.

## Observed problem

The current production homepage was inspected in the browser on November 1.
Its generic hero rule constrains the long H1 to 14 characters of width, producing
five lines on a desktop and a large unused right column. Topic discovery requires
an additional Explore hop; research counts and explanations precede any topic links.
The “Find an ingredient” card only opens herbs even though compounds are a separate database.

## Change and acceptance

- One short H1, route-scoped typography and a responsive two-column introduction.
- Reading room links to three existing published relationship reviews.
- Six distinct topic links before research statistics; Stress and Anxiety remain separate.
- Ingredient card opens shared search; direct herb/compound browse links remain.
- Preserve the existing metrics, research-only qualifications, newsletter, privacy and stable URLs.
- Retain the original six-file visual repair: footer prompt obstruction, complete safety sentence, article chapter counter, guide spacing and expanded visual sweep scope.

## Validation and release status

- Live complete 13-PR inventory obtained through GitHub connector. Existing admission
  function `assessAdmission(inventory, { existing: 6723 })` returned **REUSE**.
  CLI wrapper uses unavailable `gh`; no new PR is created and the same inventory
  was checked through the unmodified policy function.
- Final focused UI run: **28/28 passed across seven suites**, including the retained
  evidence-lens regressions.
- New rendered homepage discovery/search regressions: **2/2 passed**.
  The first run exposed the test harness’s intentional slash normalization;
  assertions now check the normalized href while the form retains `/search/`.
- `npm run typecheck`: **passed**.
- Focused ESLint and `git diff --check`: **passed** before documentation update.
- `.agents/skills/pre-pr-fast-check.mjs`: **passed**, including shared security
  regressions and the high/critical dependency audit.
- First `npm run build` attempt stopped at the tsx CLI’s Unix-socket listener:
  `listen EPERM /tmp/tsx-0/149.pipe`. This is an execution-environment limitation,
  not a demonstrated application failure. Retry runs the same unmodified build
  script, using a temporary external npx wrapper that invokes tsx through Node’s
  import loader instead of its IPC CLI. No repository build or gate is changed.
- Local diagnostic build retry: **all 37 production steps passed in 839.76 seconds**.
  Final-source hosted output validation remains required as described below.
- Browser could inspect production, but cannot reach this executor’s localhost:
  `ERR_CONNECTION_REFUSED`. Updated responsive/light/dark screenshot proof is
  **not yet available**. Source CSS is responsive and uses the established theme
  variables; that is not visual acceptance.
- Existing PR is ready for review with `hold-merge` preserved until final validations and review pass. No direct
  merge, deployment receipt, scientific approval or business uplift is claimed.

## Hosted repair follow-up

The first hosted structural contract still asserted the retired headline and herb-only
lookup href. Its expected copy and destination now match the new experience while
preserving all search, task-count, Explore, focus and uncertainty requirements;
`node scripts/ci/validate-experience-backlog.mjs` passes **19/19 invariants**.
The first hosted project-control attempt used the PR's stale October base snapshot
`ecc249f5...` and misinterpreted later existing admissions as new. Refreshing the PR's
base to the same `main` branch corrected its metadata to `aefa7594...`; comparison
then verified **zero behind** and only the intended 13 paths before the validator
follow-up. No admission/merge/security policy was weakened.

Local build compilation preceded the final relocation of first-visit task cards
above the reading section. Its eventual result is diagnostic; hosted final-head
production output is the decisive exact-source release check. A local successful
compile alone is not claimed as final-source export proof.

## Full-suite stale presentation assertions

At final-source head `d98d1e6...`, hosted Vitest completed **4,462 passing tests**
with two failures, both source-string presentation assertions in
`app/__tests__/front-door-architecture.test.ts` and
`app/__tests__/mobile-premium-ux.test.ts`. They required the replaced headline,
old intro wrapper and herb-only ingredient destination. Updated only those
expected strings, retaining the navigation, search, safety, metrics, privacy,
focus and theme contracts. Focused rerun includes both complete affected suites
and the new rendered homepage suite; no application source changed in this follow-up.
Release HOLD remains until the final exact-head checks complete.

## Owner follow-up: organize the homepage hierarchy

After #6723 was verified live as `b39033a631d6f0dbf3c776b9d1685ad768d47532`
(deploy #41365172581), the owner requested a more logical, organized homepage.
Reopened existing #6983; this is the same bounded homepage owner, not new scientific work.

The hierarchy is now search/task controls → everyday wellbeing (four specific
health questions) → research collections (two broader subjects) → featured
attachment/relationship reading → evidence/methodology → newsletter. The
featured articles no longer occupy the introduction. All six topic destinations,
three article links, primary architecture, evidence qualifications and privacy
controls are preserved. No new URLs, global navigation or scientific claims.

PR admission: the initial indexed search returned 12 open PRs and the local
policy check returned READY, but that search was stale. Trusted hosted admission
correctly blocked the new PR after its full REST inventory found five additional,
unadmitted automatic dependency-update proposals (#6978–#6982), plus an older
research draft. Added review holds to the dependency candidates to preserve them
for dependency maintenance without changing their source or accepting upgrades.
The docs-only planning PR #6974 also remains held in accordance with its explicit
“No automatic merge/production activation requested” intent. Re-ran only the
failed hosted admission job; exact-head `pre-pr-admission` passed (run #41369741647,
latest attempt; check #125038156615). No release policy or scientific hold changed.

Validation before PR: seven targeted UI suites **33/33 passed**; all **19**
structural acceptance invariants passed; scoped ESLint and diff checks passed.
Added a rendered regression for group sizes, distinct destinations, the absence
of featured article links in the introduction, and task/topic/article/trust order.
The full local production pipeline stopped at a generated-data black-cohosh
summary/detail indexing disagreement (one divergence, baseline zero). It was
not waived, the baseline was not changed, and no data repair is bundled with
this UI ticket. A separate app-export check using the retained main data is
running; hosted full-pipeline proof remains mandatory.
The environment still blocks the tsx CLI IPC socket;
the same unmodified build runs through the previously verified temporary external
Node import-loader wrappers. These wrappers are not repository changes.
Current release state: source review and exact-head hosted build/theme/SEO/safety
checks pending; no follow-up merge or live organization change claimed yet.
