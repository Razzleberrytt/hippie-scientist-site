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
- Five existing focused UI suites: **18/18 passed**.
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
- Build retry: **running / not yet verified**.
- Browser could inspect production, but cannot reach this executor’s localhost:
  `ERR_CONNECTION_REFUSED`. Updated responsive/light/dark screenshot proof is
  **not yet available**. Source CSS is responsive and uses the established theme
  variables; that is not visual acceptance.
- Existing PR remains draft/hold until final validations and review pass. No direct
  merge, deployment receipt, scientific approval or business uplift is claimed.
