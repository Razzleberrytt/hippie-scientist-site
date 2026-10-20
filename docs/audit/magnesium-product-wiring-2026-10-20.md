# Magnesium sleep product wiring and live audit

Status: owner-directed repair under #6670. The owner's subsequent direct chat
instruction, "Finish and merge", authorizes this magnesium repair's merge after
validation and supersedes the earlier unmerged-only delivery instruction.
Scope is the magnesium catalog, existing sleep product modules and their canonical
record lookup;
the B12 comparison and other audit findings are not implemented in this PR.

Fixed starting main: `44408617cc772270f3fec0d91b3f5091159a1dd1`.

## Authorization and source of truth

[Owner decision, October 19](https://github.com/Razzleberrytt/hippie-scientist-site/issues/6670#issuecomment-6276133757):
wire Pure Encapsulations B07P5K7DQP and Doctor's Best B000BD0RT0; keep Thorne
search-only; retain disclosure; deliver an unmerged PR for human review.
The decision describes earlier verification as AI-assisted, not human-approved.
This PR does not relabel it as independent scientific or human approval.
The later merge instruction authorizes the code change; it does not retroactively
turn the earlier AI-assisted product checks into independent human verification.

Product-identity sources checked October 20:

- [Amazon B07P5K7DQP](https://www.amazon.com/dp/B07P5K7DQP): Pure Encapsulations
  Magnesium (Glycinate), 90 capsules; ingredients text states 120 mg elemental
  magnesium per capsule. This is label context, not a sleep regimen.
- [Amazon B000BD0RT0](https://www.amazon.com/dp/B000BD0RT0): Doctor's Best High
  Absorption Magnesium Lysinate Glycinate, 240 tablets, 100 mg per tablet.
- [Manufacturer magnesium product](https://www.pureencapsulationspro.com/magnesium-glycinate.html)
  confirms the product family. No copied price, rating, review count, sales rank,
  stock guarantee, third-party testing claim or brand efficacy ranking is added.

## Reproduced wiring gap

Cache-busted HTTP reads on October 20 found:

- `/guides/sleep/best-magnesium-for-sleep/`: 200, three catalog cards; Doctor's Best
  already had its direct link, Pure Encapsulations still used a search URL and
  provisional-ASIN copy. Thus the report of zero products applies to the other
  magnesium guide, not this route's current response.
- `/guides/sleep/magnesium-types-for-sleep/`: 200, zero Amazon links, verification
  pending text. The source hardcodes `products={[]}`.

Reuse the central catalog and existing RecommendationSection. Add the approved
Pure ASIN and tracking field, retain Doctor's Best and central affiliate tags,
label Thorne search-only, and remove obsolete blanket withholding copy. Keep
safety before shopping, existing citations, scientific conclusions, runtime
monetization restrictions, and visible affiliate disclosures.

## Validation

- Before repair: focused new/updated regressions had 3 failures and 5 passes,
  reproducing the missing direct ASIN and hardcoded empty product module.
- After repair: 5 focused Vitest files, 24 tests pass, including actual server
  rendering of both existing product modules, direct href/ASIN tracking,
  disclosure-before-link ordering, Thorne search fallback and safety guards.
  Command: `npx vitest run app/__tests__/magnesium-sleep-products.test.tsx app/__tests__/magnesium-forms-sleep-buying-guide.test.ts app/guides/sleep/magnesium-types-for-sleep/page.test.ts app/__tests__/magnesium-forms-sleep-current-evidence.test.ts lib/__tests__/affiliate-gate-separation.test.ts`.
- `npm run check:fast`: pass, including typecheck, lint, content/data/citation,
  safety and theme-contrast validators. This command regenerated build artifacts;
  those artifacts are not part of the scoped PR.
- Initial production build passed 36 steps in 1020.83 seconds and output audits
  passed, but actual browser verification found zero cards. The compact runtime
  list drops classified citations after tier normalization, so the maturity guard
  classified magnesium as mechanism-only. The full existing canonical record
  returned 12 sources and passed the unchanged guard. RecommendationSection now
  loads that full record, retaining the list fallback when the full record is
  hidden/unavailable. No clinical source, evidence grade or policy flag is changed.
- The new reduced-summary/full-record regression failed before the lookup fix.
  Final focused suite: 9 files, 40 tests pass (the five-file command above plus
  `lib/__tests__/revenue-products.test.ts`, `lib/__tests__/revenue-product-governance.test.ts`,
  `lib/__tests__/affiliate-maturity-governance.test.ts`, and
  `lib/__tests__/research-maturity-live.test.ts`). Explicit full-record monetary
  denial and hidden-record/null-loader cases retain zero Amazon links.
- Independent review: no blocking implementation defects; five independently
  selected product/governance/evidence test files passed, 22 tests. This is a
  different selected suite from the 24-test command above.
- Final production rebuild and responsive/theme browser verification: pending.

## Other live-audit findings: verified, not fixed by this PR

- No open Vitamin B12 comparison PR was found. The explicit B12 instruction is
  [comment 6280536899](https://github.com/Razzleberrytt/hippie-scientist-site/issues/6670#issuecomment-6280536899).
  Psyllium is complete per the owner; do not recreate it. B12 remains the next
  buyer-comparison page, with its own unmerged PR and human-review gate.
- `/guides/ashwagandha-kinds-compared/` returns 404. No source route or matching
  redirect was found on this fixed base. Do not guess a redirect destination.
- Actual sleep guide `/guides/sleep/best-natural-sleep-aids-that-work/` is 200 and
  links to `/compounds/melatonin/`, which is 200 with `noindex, follow`.
  A user-facing noindex evidence page can remain navigable; any changed handoff
  must preserve useful evidence and avoid changing publication eligibility just
  to satisfy an internal-link preference. The requested link review is separate.
- Live `/data/compounds-detail/plant-sterols.json` still reports Grade A and two
  recorded studies. PR #6937 head `afeddf61300e458b8eaf0af32376299871f63542`
  withholds the detail grade, but its `compound-index.json` still reports A / Strong
  evidence. Parent independently fetched both exact-head artifacts to confirm the
  independent review finding. Index synchronization and regression coverage are
  required before claiming all public artifacts fixed. Human review before merge
  remains required by that PR; no merge or publication is authorized by this audit.
  Latest CI subsequently passed; a `hold-merge` label was applied to preserve the
  confirmed index mismatch as a release blocker rather than merging on CI alone.

No conversion lift, live revenue, merged/deployed magnesium fix, full scientific
review, or B12 delivery is established by this record.
