# Claim-drift patch-parser repair

Ticket: AUDIT-CLAIM-001 / #6940. Status: locally validated; awaiting maintainer review.

Fixed base: `2f7b54f93d3f972a60e8b3b989a52491fb4f19df`.
Scope: `scripts/content/audit-claim-drift.mjs` and its existing regression test.
The checkout already contained extensive content/generated changes and two
64 MiB maxBuffer changes in the audit script. Those edits are preserved.

## Defect and acceptance

Git prefixes added content with `+`. The parser skipped content beginning `++`
because its patch line begins `+++`. This lost line offsets and let a following
critical claim pass with `critical=1`, `blockingCritical=0`, exit status 0.
Content beginning `++ b/fake.mdx` could also replace the parsed file identity.

Only accept file headers before a hunk; reset file/hunk state at each Git file
boundary. Within hunks, count every added line, including lines beginning `+++`.
Preserve the historical-debt policy and existing rules/thresholds.

## Fresh validation

- `node --test scripts/content/__tests__/audit-claim-drift.test.mjs`: before repair,
  original regression passed and the new bypass regression failed (expected 1,
  actual 0). After repair, 2/2 tests pass. The new regression exercises both
  plus-prefix forms and a subsequent changed file using real committed Git diffs
  in isolated temporary repos.
- `node --check scripts/content/audit-claim-drift.mjs`: pass.
- `node scripts/ci/validate-doc-links.mjs`: pass, 341 Markdown files.
- Scoped `git diff --check`: pass.
- Independent read-only reviewer inspected the final diff, workflow caller and
  strengthened regression, and independently ran the tests: 2/2 pass, no findings.
- `npx eslint scripts/content/audit-claim-drift.mjs scripts/content/__tests__/audit-claim-drift.test.mjs`: pass.
- `npm run build`: PASS, all 37 build steps completed in 998.85 seconds.
  Next.js compilation, type checking and all 1,690 static-generation tasks passed;
  production-visible language, structured-data regression, responsive-image and
  sitemap checks passed. Pagefind indexed 1,576 pages. These are different artifact
  populations, not interchangeable publication counts. Build log:
  `C:\Users\Will\AppData\Local\Temp\ths-bug-audit-build.log`.
  Build-generated outputs are present in this already dirty checkout; they are
  not part of the parser repair or separately approved content.

## Boundaries

No scientific review, new content approval, hosted CI, merge, deployment, live
publication or global backlog reconciliation is established. No user-facing
layout changed; responsive/theme verification is not applicable to this parser.
Live GitHub reads found #6021 / PR #6195 and RC-NPS-001 / PR #6217 merged;
their stale local status was not used to restart completed implementation.

## Current-main merge handoff

The repair is restaged alone on main base `e26fd6b66` for the owner's explicit
merge request. The production-build evidence above belongs to the original dirty
checkout, not this new PR head. Exact-head hosted checks are required before merge.
No content or generated outputs are included in this repair PR.