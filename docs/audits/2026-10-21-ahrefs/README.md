# Ahrefs October 20 baseline: operational intake

Operation: `AHREFS-INTAKE-001`. Access-only reconciliation: no application,
content, generated publication data, workflow, dependency or approval-policy
changes. This is an intake handoff, not a completed repair or full-site audit.

**BLOCKED — SPECIFIC REASON:** The existing P0 publication-security repair
[PR #6938](https://github.com/Razzleberrytt/hippie-scientist-site/pull/6938)
requires qualified independent human security review. Its `hold-merge` must
remain. Other scientific/safety repairs already have held owners. The original
Ahrefs URL/property/source-link export is unavailable in the inspected repository;
aggregate counts cannot identify individual actionable errors.

## Evidence and ownership

- [Defect register](defect-register.json): owner baseline, 16 finding groups,
  explicit statuses, existing owners, inputs, proposed verification and next actions.
  Category records are parents awaiting URL/error decomposition, not 16 unique
  confirmed bugs. All original metrics are retained; post-repair Ahrefs values
  are `null` (unavailable).
- [Production sample](production-sample.json): 12 GET responses, including eight
  existing HTML routes, robots, sitemap, deployment receipt and one synthetic 404.
  Initial JSON-LD is parsed without client JavaScript. Headers, hashes and timing
  limitations are recorded. Full HTML is not retained.
- [Open PR inventory](open-prs.json): existing owners and holds; do not fork their
  scopes. PR bodies can contain superseded heads; use the recorded live head.
- [Main ruleset](main-ruleset.json): active `Protect main`, no bypass actors,
  required pull requests and resolved review threads. Legacy branch-protection
  HTTP 404 does not negate ruleset enforcement. Controller checks remain separate.
- [Security PR checks](security-pr-checks.json): checks for
  `b27ed31282b3b9a1cc5075726700849bed42795c`; green checks do not supply the
  missing qualified human review or current-base merge eligibility.
- [Deployment run](deployment-run.json): successful run `39526616983`. The sampled
  public receipt matches main `e70738463541cce66156ac7eac9f7d725e3f29e6`.
  This is pre-repair deployment evidence, not deployment of this intake.
- [Lane 2 review](lane2-review.json): independent register review, six direct
  approval-boundary canaries and the full-suite dependency limitation.
- [Existing production SEO monitor](production-monitor.json):
  `node scripts/monitor/production-seo-health.mjs --sample=5` passed with five
  sampled sitemap URLs, zero errors and zero warnings. This includes existing
  host normalization, synthetic missing-route, canonical and slash checks; it
  does not certify every sitemap member or reported Ahrefs link.

Validation for this access-only change: JSON parsing, register required fields,
unique IDs and allowed priorities/statuses passed; six supplemental exact-main
approval canaries passed independently in each lane. `node
scripts/ci/validate-doc-links.mjs` passed across 398 Markdown files and `git diff
--check` passed. The existing approval test file imports Vitest; the attempted
native Node invocation failed before assertions because dependencies are absent.
No full-suite result is claimed. A production build is explicitly excluded for
this access-only ticket in the sprint/backlog because repository behavior is
unchanged. It remains mandatory for any later implementation repair.

## Findings established by this sample

Melatonin and rhodiola return 200, have self canonicals, emit Article schema in
initial HTML, use `noindex, follow`, and are absent from the sampled main sitemap.
Their holds must remain until publication eligibility is independently proven.
This sample establishes output consistency; it does not adjudicate every source,
grade, date or scientific claim. A melatonin source link points to consensus.app;
exact source identity, visible labeling and relevance still require review under
existing [#6935](https://github.com/Razzleberrytt/hippie-scientist-site/issues/6935).

`/guides/stress/`, `/guides/anxiety/` and `/guides/sleep/` emit ItemLists with
sequential positions in this sample. Sampled Article nodes have headlines; sampled
JSON-LD blocks parse. No sampled Product node exists. These observations cannot
close the reported 298 Article, 160 Product or five ItemList findings without their
actual URLs/property errors. Optional rich-result recommendations must be separated
from invalid schema and misleading content.

The sitemap response contains 1,094 `loc` elements. This current XML population is
not equivalent to 1,625 historical successful HTML pages, 2,240 internal URLs or
144,152 link references. The 13,608 noindex link references are occurrences and
may include intentional holds. No difference is presented as measured improvement.

Sampled decoded HTML spans 850,519–1,233,793 bytes, including the controlled 404.
This warrants later investigation; compression, isolated TTFB, hydration, asset
waterfalls and repeatability were not measured. Request-to-headers timing includes
connection/TLS/redirect overhead. No performance improvement is claimed.

## Next action and lifecycle gates

1. Reuse #6938 for the known P0 provenance gap. Receive qualified independent human
   security review of its final head; retain revocations, holds and all existing
   validation. Sole serialized controller owns base refresh, eligibility and merge.
2. Keep #6937/#6934, #6669/#6600 and source-integrity #6935 explicitly blocked under
   their existing owners. Resolve authentic scientific/source evidence and their
   separate checks; do not copy draft approvals into public runtime.
3. Locate/export the original Ahrefs issue rows, including error/property text,
   affected URL, referring URL/destination pairs, duplicate pairs and crawler
   settings. Split category parents into stable root-cause records after reproduction.
4. Only after P0s are fixed, safely blocked or excluded, admit one independent
   reproduced repair within the current WIP policy. Repair shared builders, run
   focused negative regressions and the production build, then independent review.
5. Merge only through the serialized protected controller after all required
   approvals/checks. Verify merge ancestry on main, exact production receipt and
   intended live HTML/headers/data before marking that repair Verified.

No source repair, merged repair, production change, fresh Ahrefs crawl, full-site
scientific audit, theme/device acceptance or controlled performance result is
claimed by this intake. Existing build/internal-link/schema/indexation guards
already exist; the operation adds no duplicate orchestration or validation system.

## Bounded reconciliation playbook draft — review only

Repeated observed failure pattern: local planning prose and older PR-body heads
are mistaken for current authority. The local checkout named #5456 open although
GitHub reports closed, and its deployment handoff prose described direct push
while executable configuration uses successful CI `workflow_run` or dispatch.

Candidate intervention: freeze exact live main, actual PR head/labels/checks and
deployment receipt before selecting work; compare source configuration with prose;
record unresolved gaps rather than retrying old plans. No prompt, hook, memory,
model, permission or publication setting was changed.

Holdout checks for review: a branch-protection 404 with an active ruleset must not
be called unprotected; a synthetic 404 without a source link must not become one
of Ahrefs' broken-link findings; a noindex profile absent from sitemap must not
be made indexable merely to improve a crawler score. This intake preserves those
boundaries. No controlled baseline/candidate trial or unseen evaluation was run;
the playbook is a draft pending explicit review, not a measured control-plane
improvement or change to the model. Rollback is removal of this access-only intake
documentation; existing runtime and release controls are unaffected.
