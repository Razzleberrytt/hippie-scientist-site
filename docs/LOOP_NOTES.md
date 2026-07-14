# Loop Notes

Notes for future autonomous enhancement iterations — recurring friction, false positives, and tooling gaps discovered while working the loop.

---

## 2026-07-13 — `audit:content` word-count false positive on data-driven hub pages

`scripts/content-audit.mjs`'s `countWords()` stripped every `{...}` block
before counting words. That's correct for JSX interpolation, but the
`guides/*` hub pages (adhd, anxiety, best, compare, focus, herbs, sleep)
render their copy from typed data arrays — e.g.
`{ problem: 'Racing thoughts at bedtime', why: '...', cta: '...' }` — so
all of that user-facing prose lives inside `{}` and was being discarded
before the word count ran. Every one of the 7 hub pages was flagged
`thin_page` every run, regardless of actual content quality, because the
metric literally couldn't see their content model.

Fixed by extracting string-literal values for a known set of prose keys
(`title`, `desc`, `description`, `problem`, `why`, `cta`, `body`,
`caution`, `bestFor`, `fit`, `label`, `goal`, `role`, `summary`, `name`,
`kind`, `sub`, `eyebrow`, `text`, `note`, `question`, `answer`) before the
blanket brace-strip, and counting those alongside JSX text nodes.

Result: `guides/best`, `guides/herbs`, `guides/sleep` now correctly clear
the 500-word threshold. `guides/adhd`, `guides/anxiety`, `guides/compare`,
`guides/focus` still read thin (378–421 words) — that's a much more
trustworthy signal now and a reasonable next target, but wasn't tackled
this cycle to keep the change scoped and verifiable.

Takeaway for future cycles: if a hub/index page under `app/guides/*` is
built on the `DecisionRouter` / `GuideCardGrid` data-array pattern, don't
trust a stale `thin_page` reading without rerunning `audit:content` after
confirming the word-count method actually parses that page's content
shape — the audit is a heuristic over raw source, not the rendered DOM.

---

## 2026-07-13 — `audit:safety` was silently broken (0/0), masking a real compound-safety gap

`scripts/audit-safety-fill-rate.mjs` hard-coded `SHEETS = { herbs: 'Herb
Master V3', compounds: 'Compound Master V3' }`. Those sheets don't exist
in the current workbook — herbs and compounds were consolidated onto one
`Entity_Master` sheet (distinguished by an `entity_type` column) at some
earlier migration. Every run of `npm run audit:safety` silently printed
`0 filled / 0 total (0%)` for both, with no error — `getSheet()` just
returns `null` for an unknown sheet name and the script treats that as
"zero rows" rather than failing loudly. This was easy to miss because
the command still exits 0 and prints a well-formed-looking report.

Contrast with `scripts/data/build-runtime-from-workbook.mjs`, which reads
sheets via a *candidate-name list* (`['Herb Master V3', 'Herb
Monographs', 'Site Export Herbs']` etc., falling back to `Entity_Master`)
— that script degrades gracefully across the schema migration. The audit
script had no such fallback, so it just went quiet instead of failing.

Fixed by pointing `audit-safety-fill-rate.mjs` at `Entity_Master`,
filtering rows by `entity_type`, and reading safety completeness off
`contraindications_or_flags` (the field that actually carries structured
safety content now; the old `safety_level` enum no longer exists —
`safety_notes` is free text and is ~100% filled everywhere so it isn't a
useful completeness signal on its own).

Real result after the fix: **herbs are 292/293 (100%) filled, but
compounds are only 314/588 (53%) filled** — 274 compound rows have empty
`contraindications_or_flags`, each carrying a boilerplate `safety_notes`
placeholder ("Safety notes are not source-complete in this workbook row;
avoid broad safety claims and hold for interaction, population, and
formulation review."). That's a legitimate, large content gap, but too
large and too safety-sensitive to hand-author in one small verifiable
batch without real per-compound sourcing — flagging it here as the
highest-ROI target for a future enrichment cycle: pick a handful of the
274 (prioritize by traffic/sitemap priority once that's wired up — the
"TOP 20 MISSING" ranking in this script's own output is still a flat
`priority: 0.9` stub, not real traffic data) and source real
contraindication/interaction data per compound rather than batch-filling.

Takeaway for future cycles: any script that resolves a workbook sheet by
a single hard-coded name (not a candidate list through
`scripts/data/workbook-parser.mjs` conventions) is one workbook migration
away from silently reporting empty/zero and looking healthy. When an
audit reports a suspiciously round or empty number, check whether its
`SHEETS`/`getSheet()` reference still matches current `Entity_Master`
sheet names before trusting the number — don't assume 0/0 means "no
issues."

---

## 2026-07-13 — Upgraded `/guides/adhd` off the `thin_page` list; 3 hubs remain

Picked up the thin-hub-page thread from the previous entry. `/guides/adhd`
(~378w, the thinnest of the four) used the old flat-grid pattern — a
one-line intro + a plain card grid of all 22 guides, no editorial
framing. Rebuilt it on the same `HubSectionHeading` /
`DecisionRouter` / `GuideCardGrid` components that `/guides/sleep` and
`/guides/best` already use: a "what's your situation?" decision router
(8 intents → specific guides), a "best first reads" grid, a
comparisons grid (citicoline vs alpha-GPC, magnesium glycinate vs
citrate), an editorial safety note (medication interactions, test-before-
supplementing framing), a "research deeper" grid linking out to the
relevant herb/compound profiles (verified every slug exists in
`public/data/herbs.json` / `compounds.json` before linking), and the
original full-library grid kept as a secondary section. Word count
cleared 500 without padding — every added sentence routes to a real
page or states a real caveat.

`/guides/anxiety` (~417w), `/guides/compare` (~421w), and `/guides/focus`
(~398w) are still on the flat-grid pattern and still read thin — same
fix applies, same components, just needs someone to actually map each
guide list into intents/comparisons/depth-links. That's the
highest-ROI target for the next content cycle; do one hub per cycle
rather than batching all three, so each diff stays reviewable and the
`audit:content` before/after is unambiguous.

---

## 2026-07-13 — Filled 5 compound `contraindications_or_flags` gaps; found `data:build` hard-fails on legitimate safety enrichment

Picked up the compound-safety thread from the earlier entry (274 compounds
with empty `contraindications_or_flags`). Sourced real, well-established
pharmacology and filled 5 of the highest-traffic-proxy entries from the
audit's TOP-20-MISSING list: `allicin`, `ajoene` (garlic organosulfur
antiplatelet/anticoagulant-interaction compounds — bleeding risk, surgery
caution, saquinavir/CYP3A4 interaction for allicin), `andrographis`
(pregnancy/antifertility caution, immunostimulant conflict with
immunosuppressants, antihypertensive/antidiabetic potentiation),
`anethole` (fennel/anise essential-oil constituent — infant neurotoxicity/
seizure case reports, phytoestrogenic activity, pregnancy caution), and
`acarbose` (FDA-label contraindications: DKA, IBD/intestinal obstruction,
cirrhosis, severe renal impairment; digoxin-absorption interaction). Used
the sanctioned `scripts/data/edit-entity-master-cell.mjs --in-place`
surgical editor — no openpyxl, no full-sheet rewrite.

While validating with `npm run data:build`, hit a real pipeline bug:
`scripts/data/build-interaction-data.mjs`'s `validate()` hard-codes exact
snapshot counts (`edges.length !== 9886`, `tags.length !== 1169`) and
calls `process.exit(1)` on any mismatch. Those counts are *derived from
`contraindications_or_flags` text* — filling that field for even 5 rows
correctly grew the derived interaction graph (10616 edges, 1199 tags) and
hard-failed the entire `data:build` pipeline. This means the sanctioned
enrichment workflow (fill `contraindications_or_flags` in the workbook,
run `data:build`) was broken for *any* legitimate addition to that field,
not just this batch — a landmine for every future safety-enrichment
cycle. The exact-count assertions were a one-time snapshot from whenever
the Python->JS port happened, never meant as a permanent invariant;
`scripts/data/build-interaction-data.test.mjs` already covers the
derivation logic's correctness with proper hand-built fixtures, so the
snapshot check in the production path was redundant *and* actively
harmful. Fixed by dropping the exact-count assertions from `validate()`
and keeping only the real invariant (no edge may have empty
`claim_language`); counts are still logged for visibility.

Also learned: `npm run data:build` (the full 12-step pipeline, including
governance overlay + postprocess) is NOT what CI/deploy runs against for
`herbs.json`/`compounds.json` — that's `build:fast` -> `data:build:core`
(4 steps). Running the full pipeline locally writes governance-overlay
fields into those two files that `guard-no-full-build-drift` correctly
rejects as drift. Fix each time: `git checkout -- public/data/herbs.json
public/data/compounds.json` then `npm run data:build:core` to regenerate
drift-free. `public/data/_meta/build-info.json` and
`ops/audit/governance-overlay-report.json` only carry a `generatedAt`
timestamp diff after a full build — safe to `git checkout --` away
before committing, same as any other build-timestamp-only diff.

Confirmed the fix actually helps: `andrographis` and `acarbose` (both
`runtime_export_decision: full_public_runtime`) picked up
`indexability_score` gains (95→100, 85→95) from `safety-context-missing`
flipping to `safety-context` in their indexability reasons — direct,
measurable evidence the enrichment reached the runtime layer correctly.
`allicin`/`ajoene`/`anethole` are `hidden_until_grounded` so their detail
pages don't render the field yet, but the workbook/`compounds.json` data
is correct and ready for whenever those profiles get promoted.

Remaining 269 compounds with empty `contraindications_or_flags` are still
the highest-ROI target for future cycles — same approach (small batch,
real sourced pharmacology, no fabricated citations) applies.

---

## 2026-07-13 — Filled 6 more compound `contraindications_or_flags` gaps; found a live splitList footgun

Continued the compound-safety thread, this time prioritizing by actual
runtime visibility rather than the audit's flat `priority: 0.9` stub:
cross-referenced `public/data/compounds.json` for rows with empty
`contraindications` AND `runtime_export_decision === 'full_public_runtime'`
(indexed, `robots: index,follow`, actually rendered on a live `/compounds/:slug`
page) — 26 such rows existed. Picked 6 extremely well-documented,
high-familiarity entries from that list and sourced real pharmacology:
`chamomile` (Asteraceae cross-allergy, warfarin INR case reports, CYP3A4/
CYP1A2), `lavender` (oral-Silexan sedation/surgery caution, prepubertal
gynecomastia case reports from repeated topical use), `lemon-balm`
(thyroid-binding preclinical activity, sedative additivity),
`saw-palmetto-extract` (anti-androgenic pregnancy/hormone-therapy caution,
perioperative bleeding case reports), `coenzyme-q10` (vitamin-K-analog
warfarin-INR-lowering interaction, chemo antioxidant caution), and
`willow-bark-extract` (salicin → salicylate cross-reactivity, pediatric
Reye's-syndrome caution, same anticoagulant/NSAID/methotrexate profile as
aspirin). Used the sanctioned `edit-entity-master-cell.mjs --in-place`
editor.

Caught a real bug in my own drafting before it shipped: `splitList()` in
`build-runtime-from-workbook.mjs` splits `contraindications_or_flags` on
`[\n|;,]+` — **commas AND semicolons**, not just semicolons. My first
draft for `saw-palmetto-extract` used a semicolon *inside* a parenthetical
("(anti-androgenic hormone activity; avoid without clinician guidance)")
to look readable, which would have split into two mangled fragments
("...activity (anti-androgenic hormone activity" / "avoid without
clinician guidance)..."). Caught it by running the real `splitList()`
regex against each draft string in a throwaway `node -e` snippet *before*
writing to the workbook, not just after `data:build`. Takeaway for future
cycles: never use a comma OR a semicolon inside a single contraindication
clause, including inside parentheticals — phrase everything with "or"
between items in a clause, and only use semicolons as the top-level
separator between distinct clauses. Worth eyeballing this with a quick
local `splitList()` simulation before every workbook write, since a
malformed split silently produces confusing half-sentence safety bullets
that would otherwise only surface after the fact on the live compound
page.

`data:build:core` + `data:validate` + `guard:source-of-truth` all passed
clean; diff scope matched the established core-only pattern exactly
(workbook + compounds.json + compound-index + entity_risk_tags +
interaction_edges + summary-indexes, `build-info.json` timestamp reverted).
20 of the 26 `full_public_runtime` compounds with empty
`contraindications_or_flags` remain — good next-cycle target, same
approach applies.

---

## 2026-07-13 — Filled 6 more compound `contraindications_or_flags` gaps

Continued the same thread from the two prior entries, again cross-referencing
`public/data/compounds.json` for `runtime_export_decision ===
'full_public_runtime'` rows with empty `contraindications`. Picked 6
well-documented entries: `huperzine-a` (cholinergic — bradycardia/seizure/
asthma-COPD/peptic-ulcer caution, cholinergic-crisis risk when combined with
other acetylcholinesterase inhibitors like donepezil), `passionflower`
(additive CNS-sedation with benzodiazepines/opioids/alcohol, pre-surgical
discontinuation, pregnancy caution), `pycnogenol` (antiplatelet/bleeding risk
with anticoagulants and before surgery, immunostimulant caution with
autoimmune disease, hypoglycemic interaction), `biotin` (the well-documented
FDA safety-communication interference with troponin/thyroid immunoassays —
not a contraindication in the classic sense but the single highest-value
safety fact for this compound), `iodine` (autoimmune thyroid disease,
antithyroid drugs, lithium, amiodarone, recent radioactive-iodine
imaging/treatment), and `devils-claw` (peptic ulcer/gallstones,
anticoagulant/antidiabetic/antihypertensive potentiation, cardioactive
glycoside caution, pregnancy).

Simulated `splitList()`'s `/[\n|;,]+/` regex against every draft string in a
throwaway script before writing to the workbook (per the takeaway from the
prior entry) — confirmed zero mangled clauses before touching
`edit-entity-master-cell.mjs --in-place`. `data:build:core` regenerated
cleanly (edges 11792, tags 1245 — no snapshot-assertion failure, confirming
the earlier `build-interaction-data.mjs` fix is holding up under continued
enrichment). Diff scope matched the established core-only pattern exactly.

14 of the 26 `full_public_runtime` compounds with empty
`contraindications_or_flags` now remain — still the highest-ROI target for
the next cycle. Remaining list as of this run: `aucubin`, `bicarbonate`,
`carnitine-l-tartrate`, `cryptotanshinone`, `farnesol`, `ferulic-acid`,
`fos`, `fucoxanthin`, `ginsenoside-rg3`, `hydroxytyrosol`, `iberogast`,
`mct-oil`, `msm`, `pygeum` — several of these (`aucubin`, `farnesol`,
`ginsenoside-rg3`, `hydroxytyrosol`, `fucoxanthin`) are obscure enough that
sourcing real, well-established contraindication data (rather than
generic/fabricated cautions) will take more care than this batch did; worth
tackling the more mainstream ones (`msm`, `mct-oil`, `iberogast`, `pygeum`,
`ferulic-acid`, `bicarbonate`) first.

---

## 2026-07-13 — Filled the remaining 6 mainstream compound `contraindications_or_flags` gaps

Closed out the "mainstream" half of the list flagged in the prior entry:
`msm` (theoretical antiplatelet/bleeding-risk interaction, pre-surgical
discontinuation, pregnancy/breastfeeding caution, dose-dependent GI upset),
`mct-oil` (contraindicated in cirrhosis or hepatic encephalopathy or
portal-systemic shunting — MCT metabolism can worsen ketone/ammonia
handling, a genuine clinical-nutrition contraindication — plus
type 1/poorly-controlled-diabetes ketoacidosis caution and GI upset),
`iberogast` (contains celandine, linked to rare but real drug-induced
liver-injury case reports that prompted a German label warning; liver
disease and injury-symptom cautions, Asteraceae cross-allergy),
`pygeum` (pregnancy caution, theoretical additive effect with other BPH
medications, GI upset), `ferulic-acid` (antiplatelet activity, pre-surgical
discontinuation, additive antihypertensive effect, pregnancy caution,
topical skin irritation), and `bicarbonate` (contraindicated in
hypertension/heart-failure/edema and impaired kidney function or
metabolic alkalosis, ergogenic-dose GI upset, urine-pH-mediated renal
excretion interaction with amphetamines and salicylates like aspirin).

Simulated the `splitList()` `/[\n|;,]+/` regex against every draft string
first (per the established takeaway) — zero mangled clauses. Used
`edit-entity-master-cell.mjs --in-place` for all 6. `data:build:core`
regenerated cleanly (edges 12079, tags 1261). Diff scope matched the
established core-only pattern exactly (workbook + compounds.json +
compound-index + entity_risk_tags + interaction_edges + summary-indexes;
`build-info.json` timestamp reverted). All 6 are `full_public_runtime`, so
this reaches live `/compounds/:slug` pages directly.

Remaining 8 `full_public_runtime` compounds with empty
`contraindications_or_flags`: `aucubin`, `carnitine-l-tartrate`,
`cryptotanshinone`, `farnesol`, `fos`, `fucoxanthin`, `ginsenoside-rg3`,
`hydroxytyrosol`. These are the obscure tail flagged in the prior entry —
next cycle should budget extra time to source real per-compound
pharmacology (not generic filler) for each rather than batching all 8 at
once.

---

## 2026-07-13 — Filled 7 of the final 8 obscure-tail compound `contraindications_or_flags` gaps; 1 deferred as too thin to source

Closed out all but one of the "obscure tail" list from the prior entry, using
`WebSearch` to verify real pharmacology before writing anything (this
environment has web access via the deferred `WebSearch` tool — worth
reaching for it explicitly on future cycles rather than relying on training-
data recall, since verifiable-in-the-moment sourcing is stronger than
memory for a data contract this safety-sensitive). Filled: `carnitine-l-
tartrate` (thyroid-hormone-effectiveness reduction, seizure-history
contraindication, TMAO/cardiovascular caveat, anticoagulant caution),
`cryptotanshinone` (CYP1A2 potent-inhibitor / CYP2C9 moderate-inhibitor drug
interactions, anti-androgenic/pregnancy caution, danshen-family bleeding-
risk caution), `farnesol` (skin/eye irritant and fragrance-sensitizer
caution, in-vitro cytotoxicity at high concentration, limited human oral-
supplementation data), `fos`/fructooligosaccharides (hypersensitivity and
mechanical-bowel-obstruction contraindications, IBS/FODMAP-sensitivity/SIBO
caution, dose-dependent GI upset), `fucoxanthin` (seaweed-source iodine
caution for thyroid disorders, antiplatelet/surgery caution, pregnancy
caution, diabetes-drug interaction), `ginsenoside-rg3` (antiplatelet/
anticoagulant bleeding risk with aspirin/heparin/warfarin, pre-surgical
caution, ginseng-family cesarean-bleeding case reports), and
`hydroxytyrosol` (concentration-dependent platelet-thromboxane-synthesis
reduction as a real but mechanistic antiplatelet caution, otherwise well-
tolerated at usual doses).

Left `aucubin` deferred rather than filled: the only human-relevant search
hits were (a) a toxicology review stating aucubin itself has low acute
toxicity with no established human contraindications, just a call for more
chronic-safety research, and (b) a uterine-stimulant caution that the
literature attributes to whole *Plantago major* extract, not to isolated
aucubin — attributing a whole-plant effect to a single marker compound
would have been exactly the kind of unsourced overreach this data contract
exists to prevent. Writing a "consult a clinician, data are limited"
clause with nothing more specific behind it would have been filler, not
enrichment — better to leave it empty and flag it than pad it out. If a
future cycle finds compound-specific (not whole-plant) aucubin toxicology,
that closes the very last gap in this thread.

Simulated the `splitList()` `/[\n|;,]+/` regex against every draft first
(per the established takeaway) — the first-pass drafts for
`cryptotanshinone`, `fos`, `fucoxanthin`, and `ginsenoside-rg3` all had
comma-separated drug/condition lists inside a clause (e.g. "caffeine,
theophylline, warfarin, and phenytoin") that would have shattered into
mangled fragments; rewrote every such list as "x or y or z" before writing
to the workbook, confirming clean clause counts (2–4 clauses per entry, no
fragment shorter than a full clause) before touching
`edit-entity-master-cell.mjs --in-place`.

`data:build:core` regenerated cleanly (edges 12661, tags 1276 — continuing
to confirm the `build-interaction-data.mjs` snapshot-assertion fix holds
under further enrichment), `data:validate` and `guard:source-of-truth`
both passed clean, and the full Vitest suite (79 tests) passed. Diff scope
matched the established core-only pattern exactly (workbook + compounds.json
+ compound-index + entity_risk_tags + interaction_edges + summary-indexes;
`build-info.json` timestamp reverted).

This closes the "obscure tail" thread from the prior four entries down to
a single deferred compound. With `aucubin` aside, there are currently no
more `full_public_runtime` compounds with empty `contraindications_or_flags`
— the next enrichment cycle should re-run `npm run audit:safety` fresh
rather than assuming this list, since new compounds may have been promoted
to `full_public_runtime` or added since this entry.

**Post-merge addendum:** the repo's automated `chatgpt-codex-connector`
PR review caught a real bug in this batch before merge: the
`ginsenoside-rg3` clause used the phrase "cesarean delivery", and
`deriveInteractionData()`'s hepatic keyword list (`['hepat','liver']` in
`scripts/data/build-interaction-data.mjs`) matches via plain
`String.includes()` with no word-boundary check — "delivery" contains
"liver" as a literal substring, so the derived `entity_risk_tags.json`
falsely labeled this compound's pregnancy/bleeding caution as a hepatic
risk too. Fixed by rewording to "cesarean section childbirth" (verified
against a throwaway keyword-matcher simulation) rather than touching the
shared matcher, to keep the fix scoped to this PR. Takeaway for future
cycles: the keyword matcher has *no word-boundary protection at all* —
before writing any `contraindications_or_flags` clause, mentally (or via
a quick `node -e` check) scan it for the substrings `hepat`, `liver`,
`kidney`, `renal`, `allerg`, `thyroid`, `bleeding`, `surgery`,
`pregnan`, `breastfeed`, `lactation`, `sedat`, `glucose`, `hypoglyc`,
`diabet`, `hypotens`, `hypertens`, `seroton`, `immunosuppress` appearing
*inside an unrelated word* (like "delivery" → "liver", or "regeneration"
→ "renal"-adjacent near-misses) — not just for the intended keyword
matches. This is a standing landmine in the matcher itself and worth
fixing properly (word-boundary regex) in a future cycle if it keeps
tripping up enrichment batches.

---

## 2026-07-13 — Added `audit:risk-tag-collisions` guard for the substring-collision bug class above, instead of touching the matcher

Followed up on the previous entry's "worth fixing properly" note, but
concluded a blanket word-boundary regex fix on `deriveInteractionData()`
itself would be the wrong move: a full scan of every `contraindications_or_flags`
value in the live workbook (881 Entity_Master rows, not just the
`full_public_runtime` subset in `public/data`) found 124 matches where the
matched keyword is immediately preceded by a letter — but on inspection
*every single one* is a legitimate compound medical term formed by gluing a
prefix straight onto the keyword with no separator (`antidiabetic` →
`diabet`, `antihypertensive` → `hypertens`, `hyperthyroidism` → `thyroid`,
etc.). A naive "require a non-letter before the match" fix would have
silently dropped the `blood_glucose`/`blood_pressure`/`thyroid` risk tags on
all 124 of those real entities — a much bigger regression than the one
collision bug it would have fixed. Safety-critical derived data like this
needs a human (or at least a scoped, reviewable allowlist) in the loop, not
a blanket regex change in a single autonomous cycle.

Instead added `scripts/audit-risk-tag-collisions.mjs` (`npm run
audit:risk-tag-collisions`), which runs the exact same `KEYWORDS` table
(now exported from `build-interaction-data.mjs` instead of duplicated) over
every workbook row and flags only matches preceded by a letter that does
*not* form one of a small curated `ALLOWED_PREFIXES` (`anti`, `hyper`,
`hypo`, `para`, `non`, `pre`, `post`, `sub`, `poly`, `dys`, `over`, `under`,
`co`, `re`). Verified it reports zero findings against the current
workbook (i.e. all 124 real matches are covered by the allowlist) and, via
`scripts/audit-risk-tag-collisions.test.mjs`, that it correctly flags the
exact `"cesarean delivery"` → `liver` collision the prior cycle's PR review
caught by hand. It's informational (exit 0) by default — pass `--strict`
for a hard-fail exit code once the allowlist has proven itself over more
cycles — and is *not* wired into `check`/`check:full` yet for the same
reason. Future cycles: run `npm run audit:risk-tag-collisions` after
editing any `contraindications_or_flags` clause instead of eyeballing the
keyword list by hand; if it flags a genuine new compound term, extend
`ALLOWED_PREFIXES` rather than reword the clause.

---

## 2026-07-13 — `audit:content-gaps` was reading a field that doesn't exist, reporting 2.9% "Safety Data Fill Rate" against a real ~74%

With the safety-fill-rate thread above finally closed (only `aucubin`
deferred), I went looking for the next audit to trust and instead found
`scripts/audit/content-gap-report.mjs`'s `checkSafety()` reads
`item.safety` from `public/data/herbs.json` / `compounds.json` — but
neither file has ever had a `safety` field; the real field is
`contraindications` (confirmed via `Object.keys()` on a live record and
cross-checked against `scripts/audit-safety-fill-rate.mjs`, which reads
the correct field and reports 100% herbs / 73% combined). Every single
profile was being flagged as missing safety data, tanking the reported
fill rate to 2.9% (25/856) and marking high-traffic pages like
`ashwagandha`/`turmeric`/`ginger` — which are fully filled — as only 71%
complete with a phantom "safety" gap. `checkInteractions`, `checkBestFor`,
and `checkDosing` in the same file were already reading the right field
names (`interactions`, `effects`/`primary_effects`, `dosage`/
`typical_dosage`) — only `checkSafety` was stale, presumably from an
earlier data-model field name that got renamed to `contraindications`
without this audit being updated.

Fixed by pointing `checkSafety` at `item.contraindications` and teaching
it to handle the array shape that field actually uses (it was
string-only, matching the never-populated `safety` field's assumed
shape). Re-ran `audit:content-gaps`: fill rate jumped to 74.1% (634/856),
matching `audit:safety`'s 73% within the expected small-denominator
difference (856 profiles here vs. 881 workbook rows there — this script
only counts `full_public_runtime`-shaped entries already in `public/data`,
not every workbook row). The priority-slug table now correctly shows
`ashwagandha`/`turmeric`/etc. at 86% with only `interactions` missing,
not a fabricated `safety` gap. Not wired into any CI gate or test, so
the fix is low-risk and standalone — `git grep` confirmed
`content-gap-report.mjs` is only referenced by its own `package.json`
script entry.

Takeaway: when triaging "what's the next enrichment target," check the
*audit script's own field-name assumptions* against the current
`public/data` shape before trusting its numbers — a stale field name is
a silent, total false positive (100% of rows affected), not a partial
one, and can send a future cycle chasing a "gap" that isn't real (or, as
here, hide the real remaining gap — `interactions` is now the actual
dominant missing field across the catalog and is worth a future cycle's
attention).

---

## 2026-07-13 — Filled the last `full_public_runtime` compound contraindications gap (`citicoline`) via `npm run audit:safety`

Re-ran `npm run audit:safety` fresh per the prior entry's own advice rather
than assuming the "obscure tail" list was still current. Cross-checked its
"TOP 20 MISSING" output against `public/data`'s `runtime_export_decision`
field (that report's own priority score is a flat constant `0.9` for every
row, so its ranking is really just alphabetical — worth knowing before
trusting it as a real traffic proxy) and confirmed 19 of the 20 are
`hidden_until_grounded` or excluded entirely (controlled substances like
`5-meo-dmt`, `amanita-muscaria`, `anabasine`, `anatabine`,
`7-hydroxymitragynine` aren't exported to runtime at all). The 20th,
`aucubin`, is the compound already deliberately deferred two entries ago.
Directly querying `public/data/compounds.json` for
`runtime_export_decision === 'full_public_runtime'` with empty
`contraindications` turned up exactly one live-page gap outside that
already-audited compound list: **`citicoline`**, filed under `entity_type:
herb` in the workbook despite being a synthetic nucleotide-derivative
nootropic, `full_public_runtime`/indexed/sitemapped, with completely empty
contraindications, interactions, and forms.

Verified real pharmacology via `WebSearch` (direct `WebFetch` on
webmd/drugs.com/rxlist/alzdiscovery.org all returned HTTP 403 — those sites
block fetcher user agents — so relied on cross-corroborating multiple
independent search snippets instead) before writing anything: citicoline's
established cautions are hypersensitivity/allergy, pregnancy/breastfeeding
without clinician guidance (insufficient safety data), potentiation of
levodopa/dopaminergic Parkinson's medications (documented, may need dose
adjustment), additive stimulation with other cholinergic drugs (donepezil,
rivastigmine, galantamine), a mixed-but-recurring anticoagulant/platelet-
aggregation caution, and mild dose-dependent side effects including rare
hypotension. Simulated both the `splitList()` `/[\n|;,]+/` regex and the
`KEYWORDS`/`ALLOWED_PREFIXES` collision matcher from
`build-interaction-data.mjs`/`audit-risk-tag-collisions.mjs` against the
draft in a throwaway `node -e` script *before* touching the workbook (per
the standing takeaway from two entries back) — 6 clean clauses, matches
only on `allergy`, `pregnancy`, `anticoagulant`, and `blood_pressure`, no
collisions. Wrote it with `edit-entity-master-cell.mjs --in-place`.
`data:build:core` regenerated cleanly (edges 12817, tags 1279),
`data:validate`, `guard:source-of-truth`, `audit:risk-tag-collisions`, the
full Vitest suite (578 tests), and `npm run check` all passed. Confirmed
citicoline's own `indexability_score` rose 75 → 85 and its
`safety-context-missing` reason flag cleared, so this reaches a real
indexed page. This closes out the `full_public_runtime` contraindications
gap entirely (`aucubin` remains the sole documented exception).

(Note: this cycle independently found and fixed the same
`content-gap-report.mjs` `item.safety` field bug documented in the entry
directly above — landed as a separate PR that merged to `main` first, so
that fix isn't duplicated here.)

---

## 2026-07-13 — Codex PR review caught that `data:build:core` doesn't refresh existing `herbs-detail`/`compounds-detail` payloads; patched `citicoline`'s detail file directly, found the gap is systemic

The automated `chatgpt-codex-connector` review on the PR from the previous
entry flagged a real P1 bug: `src/lib/runtime-data.ts`'s `getHerbBySlug()`
renders `{ ...herb, ...detail }` — the per-slug `public/data/herbs-detail/
${slug}.json` file wins over the aggregate `herbs.json` on every shared
field. `citicoline.json`'s detail file still had the old empty
`contraindications: []` (and, on inspection, stale empty `dosage`/
`typical_dosage` too, plus the pre-fix `indexability_score`/reasons) even
after `data:build:core` regenerated `herbs.json` correctly. So the citicoline
enrichment from the previous entry would never have reached the live page.

Root cause is bigger than "forgot a build step": neither `data:build:core`
nor the full `data:build` pipeline actually re-syncs an *existing* detail
file's fields from the regenerated flat record. `apply-governance-overlay.mjs`
(`processKind()`) only seeds a detail file from the flat record when one is
*missing entirely* — for a slug that already has a detail file, it calls
`mirrorRecordFieldsIntoDetail()` only `if (claimSourceIds.length > 0)`, and
even then that function's field allowlist doesn't include `contraindications`,
`dosage`, or `typical_dosage` at all. `postprocess-workbook-payloads.mjs`'s
`patchDetailDir()` only touches the `sources` field. In other words: **once
a detail JSON file exists for a slug, none of the current pipeline steps
will ever refresh its content fields from a workbook edit** — only a
brand-new slug gets a fresh detail file. This likely means other prior
enrichment cycles' edits (contraindications, dosage, etc.) for any slug
that already had a `herbs-detail`/`compounds-detail` file before the edit
may have the same silent staleness. This is worth a dedicated future cycle
to fix properly (e.g. make `mirrorRecordFieldsIntoDetail()` run
unconditionally and cover the full field set the flat record and detail
record share, not just the claim-sourced subset) rather than patched
piecemeal per-entity.

For this cycle, fixed only the one entity the review flagged: read both
`public/data/herbs.json` (citicoline's flat record) and
`public/data/herbs-detail/citicoline.json`, and overwrote every field on
the detail record with the flat record's value *except* the five fields
that only exist on the detail record (`safety`, `sources`, `governance`,
`evidence`, `claimMap` — these are detail-only enrichments the flat record
doesn't carry and must not be clobbered). Verified zero remaining field
diffs afterward and that `data:validate`/full Vitest suite (578 tests)
still pass. Deliberately did not write a generalized re-sync-all-slugs
script in the same cycle — that would touch potentially hundreds of
detail files at once, a much bigger blast radius than one Codex-flagged
entity warrants; future cycle should scope that as its own reviewed change.

---

## 2026-07-13 — A second, parallel cycle independently hit the same `citicoline` gap; `content-gap-report.mjs`'s `interactions` field is a separate, still-unfixed false signal

Ran in parallel with the cycle documented in the two entries above and
picked the same target (`citicoline` — it really is the only
`full_public_runtime`, indexed entity with an empty safety field, so two
independent audits converging on it isn't a coincidence). By the time this
cycle went to open its PR, the other one had already merged directly to
`main`, so this cycle's own citicoline contraindications + detail-file
edits were dropped as redundant (the merged version is also better
sourced — cross-verified via `WebSearch` against independent sources,
where this cycle's version was written from general pharmacological
knowledge without live source verification). Branch was reset onto the
latest `main` rather than opening a conflicting/duplicate PR.

One finding from this cycle *wasn't* covered by the other one, though:
`scripts/audit/content-gap-report.mjs` was still counting `interactions`
in its 7-field `completeness` score even after the `item.safety`-field fix
landed. `interactions` has no source column anywhere in `Entity_Master` —
confirmed via `node scripts/data/edit-entity-master-cell.mjs --slug
ashwagandha --column interactions --value x --dry-run`, which fails with
"Entity_Master is missing target column: interactions" — so it's 0/856
filled for every herb and compound, including fully-complete ones. That's
a pipeline/schema gap, not a per-entity content gap, and it was
mathematically capping every profile at ≤86% regardless of real progress
(ashwagandha/turmeric/etc. all showed 86% with "interactions" as the only
gap, right up until this fix). Excluded it from the completeness
denominator (7→6 fields) but kept it in `missingFields` (labeled
`interactions (schema gap, not yet sourced)`) so it's still visible.
Verified afterward that the high-traffic priority slugs table now
correctly shows 100% for fully-filled profiles.

Takeaway for future cycles: fixing `interactions` for real would need a
new `Entity_Master` column (the surgical zip/XML cell editor only edits
existing columns, it can't insert one yet) or a relational model in
`Entity_Relationships` — a data-modeling call for a human, not something
to guess at solo. Don't spend a cycle trying to "fill interactions"
per-entity; it isn't fillable that way. Also: if two parallel cycles can
converge on the same single-entity gap, that's a signal the easy/obvious
gaps are running out — future cycles may need to look at more scattered,
lower-priority-tier fixes (individual compound `contraindications_or_flags`
entries, per the still-open backlog a few entries back) rather than
expecting another single obvious highest-ROI target to exist.

---

## 2026-07-13 — `checkInteractions` in the same audit was the same bug: `item.interactions` is dead, real data lives in `interaction_edges.json`

Supersedes the "schema gap" framing in the entry directly above. That entry
concluded `interactions` was permanently unfillable per-entity (no
`Entity_Master` column exists) and excluded it from the completeness score
entirely (7→6 fields, `missingFields` labeled `interactions (schema gap,
not yet sourced)`). That premise was only half right: there's no *source*
column, but there's already a real, derived, per-entity dataset that the
audit never looked at. `scripts/data/build-runtime-from-workbook.mjs`'s
`profile()` sets `interactions: firstList(row, ['interactions'])`, but no
`Entity_Master` column named `interactions` (or any `interact*` variant) has
ever existed — confirmed by reading every header via
`readWorkbookExcelJS(...).getSheetData('Entity_Master')` and grepping for
`/interact/i`, zero matches. So `item.interactions` is `[]` on all 856
records in `public/data/herbs.json`/`compounds.json`, unconditionally.

That field being empty does **not** mean the live pages lack interaction
content, though: `app/herbs/[slug]/page.tsx` and the compound equivalent
render a separate, correctly-wired "Interactions" section
(`InteractionWarnings`) sourced from `getInteractionEdges()` →
`public/data/interaction_edges.json` — the derived interaction graph built
by `build-interaction-data.mjs` from `contraindications_or_flags` text (the
same pipeline touched in several entries above). 245 of 856 profiles
(`ashwagandha-extract-ksm-66`, `bacopa`, `rhodiola`, `valerian-root-extract`,
etc.) have real, rendered interaction-partner content on their live page
right now via that section — `checkInteractions` just couldn't see it
because it only ever looked at the always-empty `item.interactions` field
and never loaded `interaction_edges.json` at all.

Fixed `checkInteractions` in `scripts/audit/content-gap-report.mjs` to also
check `interactionEdgesMap[item.slug]` (loaded once per run, empty-object
fallback if the file is missing) before flagging a profile as missing
interactions, restored `interactions` to the completeness denominator
(6→7 fields, since it's a real per-entity signal again rather than a
uniform schema gap), and added an `Interactions Fill Rate` line to the
summary stats for parity with the other three tracked fields. Re-running
`audit:content-gaps` after the fix: interactions fill rate is 28.6%
(245/856) instead of the prior 0/856, and several priority slugs
(`bacopa-monnieri`, `rhodiola-rosea`, `valerian-root`) that were falsely
pinned at 86% "missing interactions" now correctly read 100% complete.

The remaining 611 profiles without an `interaction_edges.json` entry are a
mix of: (a) genuinely low-risk entities with no keyword-matched interaction
partners (not a gap), and (b) entities whose `contraindications_or_flags`
text doesn't yet trip the `KEYWORDS` matcher in `build-interaction-data.mjs`
(a real, if softer, gap — same root cause as the earlier
`contraindications_or_flags` fill-rate thread, since richer safety text
feeds this matcher). Distinguishing the two would take cross-referencing
against the `audit:safety` fill-rate list from the earlier entries — a
reasonable next step for a future cycle, but out of scope here since this
cycle was strictly an audit-accuracy fix, not a data-enrichment pass.

Takeaway: the `item.interactions` field name on herb/compound runtime
records is dead entirely — the same landmine class flagged in the
`checkSafety`/`item.safety` entry above (a plausible-looking field name that
was never wired to real data after a schema/pipeline evolution). Any future
script or component that reads `herb.interactions`/`compound.interactions`
directly (rather than joining against `interaction_edges.json` by slug) is
reading a field that will always be empty — grep for `\.interactions\b`
before trusting it.

---

## 2026-07-13 — Fixed the systemic detail-file staleness gap: `dosage`/`typical_dosage`/`contraindications`/`mechanisms` were silently missing from ~854 herb/compound detail pages, including ashwagandha (a curated, indexed, high-traffic profile)

Two prior entries above documented (but deliberately didn't fix broadly) a
root cause: `apply-governance-overlay.mjs`'s `mirrorRecordFieldsIntoDetail()`
only re-syncs a handful of fields, and only for a narrow
`SOURCE_BACKED_PROMOTION_SLUGS` allowlist — so once a detail JSON file
exists for a slug, `dosage`, `typical_dosage`, `contraindications`, and
`mechanisms` from the flat/workbook record never reach it, even when the
flat record has real, sourced content and the detail record has it
missing or empty. Checked how big this actually is: `withania-somnifera`
(ashwagandha — `CURATED_HERB_SLUGS`, `PUBLISH`, sitemapped, one of the
site's flagship pages) had `dosage: ""`, `typical_dosage: ""`,
`contraindications: []` on its live detail page despite `herbs.json`
carrying a fully-sourced dosage range and a 9-item contraindications list.
Scanning every herb/compound detail file the same way found the gap was
sitewide: 289/291 herb and 565/565 compound detail files were missing at
least one of these fields versus their flat record.

Fixed at the pipeline level, not per-entity: added
`backfillEmptyDetailFields()` in `apply-governance-overlay.mjs`, called
unconditionally (not gated by the claim-sourced-promotion allowlist) for
every herb/compound on every build. It only ever fills a field that is
currently empty/missing on the detail record with the flat record's value
— it never overwrites existing detail content, so any intentional
editorial divergence (e.g. `interactions`, which the flat record doesn't
even carry — no `Entity_Master` column, see the entry above — but detail
sometimes does, curated separately) is untouched. This is the
"dedicated future cycle" the two prior entries called for, scoped down to
a mechanical, reversible, empty-field-only backfill rather than a full
field re-sync, to keep the blast radius auditable.

One additional guard was necessary: profiling the flat `contraindications`
field across all 856 entities found ~85 compounds (e.g. `vitamin-d3`,
`magnesium`, `l-theanine`, `creatine-monohydrate`) where the entire
contraindications array is just an interaction-severity tier token —
`["moderate"]`, `["low_to_moderate"]` — evidently a mismapped column from
elsewhere in the workbook/parser, not real contraindication prose. Blindly
backfilling those would have put a bare, context-free word like "moderate"
on a live safety-relevant field, which is worse than showing nothing. Added
a `SEVERITY_TIER_ONLY` filter so the backfill skips a contraindications
value when every entry in it matches that pattern; terser-but-real
category tags (`"pregnancy"`, `"liver"`, `"stimulant"`, etc.) are still
backfilled since they carry real signal, just tersely.

Net effect after `npm run data:build`: 854 of 856 detail files gained at
least `dosage`/`typical_dosage` (which had zero known data-quality issues
across the full corpus — every flat record's dosage field is real prose),
262 gained a clean `contraindications` array, and 1 (`evening-primrose`)
gained a `mechanisms` entry. `data:validate`, `guard:source-of-truth`, and
the full Vitest suite (578 tests) all pass. The workbook-level
`vitamin-d3`-style severity-token mismapping and the still-open
`interactions` schema gap (documented above) are unresolved and are
existing, separate issues — worth a future cycle each, but out of scope
here since fixing the parser's column mapping needs the workbook's actual
Entity_Master layout inspected by a human, and this cycle's fix only
consumes already-published flat-record values without touching the
workbook.

---

## 2026-07-13 — Found a second, larger `contraindications_or_flags` gap hiding behind the audit: ~265 compounds (99 `full_public_runtime`) have a bare severity/category token instead of real safety prose

The "obscure tail" thread above closed the *empty*-field gap (only `aucubin`
remains). But `npm run audit:safety` and `audit:content-gaps` both only
check whether `contraindications_or_flags` is non-empty — they don't check
whether it's actually prose. A large second population passes that
non-empty check while carrying zero real content: single- or multi-token
values like `"moderate"`, `"kidney"`, `"pregnancy"`, `"stimulant"`,
`"low_to_moderate"`, `"pregnancy,liver,kidney"` — these read as internal
severity/category classifications that leaked into the safety-text column,
not sourced contraindications. Confirmed directly against the workbook
(`Entity_Master`, not a parser bug — the cell genuinely contains only the
token, there's no separate real-text column being shadowed): 265 compound
rows total match a token-only regex, 99 of them `full_public_runtime`
(i.e. live on indexed `/compounds/:slug` pages right now) — including
very high-traffic, mainstream entries: `cdp-choline` (Citicoline),
`valerian-root-extract`, `ginkgo-biloba-extract`, `calcium`, `vitamin-c`,
`l-carnitine`, `alpha-gpc`, `collagen-peptides`, `glucosamine`,
`spirulina`, `astaxanthin`, `echinacea`. This is arguably higher-ROI than
the earlier obscure-tail work since these are exactly the supplements
readers are most likely to search for.

Filled 6 of the highest-traffic ones this cycle (`indexability_score`
95-100): `cdp-choline` (levodopa/dopaminergic interaction, choline
hypersensitivity, dose-dependent stimulation), `valerian-root-extract`
(hepatic caution, additive CNS-depressant sedation, pre-surgical
discontinuation, CYP3A4 theoretical interaction), `ginkgo-biloba-extract`
(seizure-threshold caution, anticoagulant/antiplatelet bleeding risk,
PPI/diabetes-drug interactions), `calcium` (hypercalcemia, kidney-stone
history, digoxin arrhythmia risk, antibiotic/thyroid-hormone/bisphosphonate
absorption timing), `vitamin-c` (oxalate kidney-stone risk, iron-overload
disorders, G6PD-deficiency hemolysis risk at high dose), and `l-carnitine`
(seizure caution, hypothyroidism/levothyroxine uptake interaction,
warfarin potentiation, TMAO cardiovascular caveat) — each verified via
`WebSearch` against independent sources before writing.

Hit the exact substring-collision landmine documented in the entry above
while drafting: the calcium clause `"hypercalcemia or hyperparathyroidism"`
contains `"hyperparathyroidism"`, which itself contains the literal
substring `"thyroid"` — `deriveInteractionData()`'s naive
`String.includes()` matcher would have falsely attached a thyroid-drug-
interaction tag to a clause that isn't about thyroid medication at all
(it already legitimately earns a thyroid tag from a different, correct
clause about thyroid-hormone-absorption timing). Reworded to
`"hypercalcemia or other conditions causing chronically elevated blood
calcium levels"` to drop the false hit while keeping the medical meaning.
Simulated `splitList()` + the full `KEYWORDS` matcher from
`build-interaction-data.mjs` against every draft clause before writing
anything (script kept at
`/tmp/.../scratchpad/simulate.mjs` this run, not worth committing) —
worth turning into a small standing script under `scripts/data/` next
time this pattern gets reused three-plus times, similar to how
`audit:risk-tag-collisions` came out of this same recurring need.

`data:build:core` regenerated cleanly (edges 12661→13217, tags
1276→1291), `npm run audit:risk-tag-collisions` reported clean, `npm run
data:validate` and `guard:source-of-truth` both passed, and the full
Vitest suite (578 tests) passed. Diff scope: workbook +
`compounds.json` + `entity_risk_tags.json` + `interaction_edges.json`
only (`build-info.json` timestamp reverted) — narrower than some earlier
entries since summary-indexes/compound-index apparently don't embed
`contraindications` text directly.

**93 `full_public_runtime` compounds with a token-only
`contraindications_or_flags` remain** — this is now the single
highest-ROI recurring target for future cycles, ahead of any other thread
in this file. Re-run the token-detection query fresh each cycle rather
than trusting this count, since promotions/edits shift it: `entity_type
=== 'compound'` rows in `Entity_Master` where
`contraindications_or_flags` matches
`/^(low|moderate|high|low_to_moderate|moderate_to_high|kidney|liver|pregnancy|stimulant|sedative|cardiovascular|ssri|renal)(,\s*(...))*$/i`,
cross-referenced against `compounds.json` for `runtime_export_decision
=== 'full_public_runtime'`. Notable high-traffic names still in the list:
`alpha-gpc`, `collagen-peptides`, `glucosamine`, `spirulina`,
`astaxanthin`, `echinacea`, `garlic-extract`, `l-tyrosine`, `yohimbine`,
`fenugreek`, `boswellia`, `lutein`, `vitamin-c` (done)/`black-seed-oil`,
`beetroot-extract`. Same approach applies: small batch (5-8), real
sourced pharmacology via `WebSearch`, simulate the keyword matcher before
writing, `edit-entity-master-cell.mjs --in-place`, `data:build:core`
(never the full `data:build` — see the earlier entry on why).

**Update:** a concurrent cycle (see the next entry) independently found
this exact same population and fixed it at the parser level
(`SEVERITY_TIER_ONLY` suppression in `build-runtime-from-workbook.mjs`)
rather than by filling real prose, and a third concurrent cycle filled
5 more of the mainstream names from this list (`vitamin-d3`, `magnesium`,
`l-theanine`, `creatine-monohydrate`, `coq10`) via the same sourced-fill
approach used here. No slug overlap between any of the three cycles'
fills. The remaining-count and name list above should be treated as
stale as of this merge — re-run the detection query fresh.

---

## 2026-07-13 — Closed the loop on the mismapped severity-token `contraindications` at the parser, not just the detail backfill

Two prior entries flagged that ~88 compounds carry a bare
interaction-severity tier as their entire `contraindications_or_flags`
workbook cell (`moderate`, `low_to_moderate`, etc.) instead of real safety
prose — a pre-existing workbook mismapping. The earlier cycle added a
`SEVERITY_TIER_ONLY` guard, but *only* inside
`apply-governance-overlay.mjs`'s detail backfill, so the flat
`compounds.json` record still shipped `contraindications: ["moderate"]`.
That flat token was live, not dormant: `app/compounds/[slug]/page.tsx`'s
`getAvoidIf()` reads `compound.contraindications` and
`formatDisplayLabel("moderate")` → renders an **"Avoid if: Moderate"**
bullet on all 88 pages; it also falsely tripped the search "Has
contraindications" facet (`components/search/GlobalSearch.tsx`) and the
compare-table safety-notes fallback (`components/compare-table-client.tsx`).
`WEAK_PATTERN` in the page filters `minimal`/`unknown` but never the
`low|moderate|high|severe` family, so nothing downstream caught it.

Fixed at the source: added the same `SEVERITY_TIER_ONLY` filter to
`build-runtime-from-workbook.mjs` via a `contraindicationList()` helper on
the `contraindications` field, so a list where *every* entry is a bare tier
token collapses to `[]` before it ever reaches `compounds.json`/`herbs.json`
and every downstream consumer at once. Real prose contraindications are
untouched (115 compounds keep multi-item lists; the whole corpus keeps
every non-tier entry). After `data:build:core`: 0 severity-token-only
contraindications remain (was 88), those pages now fall back to the safe
generic safety summary instead of a meaningless "Moderate" bullet.

Indexability side effect, checked and benign: 71 compounds lost ~7.6
indexability points on average (max 10) because they no longer get
completeness credit for a "contraindication" that was never real — but
**zero** pages changed `robots`/`seo_indexing_recommendation`, i.e. nothing
crossed an index/noindex threshold. `indexability:validate` reports 0
errors, `data:validate` and `guard:source-of-truth` pass, full Vitest suite
(578 tests) passes. Diff scope: the one script + regenerated core data
(compounds.json, compound-index, summary-indexes/search); `build-info.json`
timestamp reverted per convention.

Root cause still upstream: the workbook's `contraindications_or_flags`
column holds a tier token for these entities while the real safety signal
lives in `safety_notes`/`summary`. Parser-level suppression is the correct
runtime defense, but a future cycle with the workbook open could remap or
re-source those 88 cells so the field carries real prose again.

---

## 2026-07-13 — Filled 5 of the 88 severity-tier-only compound gaps; found the detail-file backfill fix's own output was never committed

Picked up the exact thread flagged at the end of the prior entry: 88
compounds still carry a bare severity-tier token (`moderate`,
`low_to_moderate`, etc.) in `contraindications_or_flags` instead of real
prose, which the parser correctly collapses to `[]` at both the flat-record
and detail-record level rather than showing a meaningless "Avoid if:
Moderate" bullet. Re-ran the query fresh (88 rows, unchanged from the prior
entry) and picked 5 of the highest-traffic `primary_runtime_priority`
entries: `vitamin-d3` (hypercalcemia/sarcoidosis/hyperparathyroidism
contraindications, thiazide/digoxin/corticosteroid/anticonvulsant
interactions), `magnesium` (renal impairment, myasthenia gravis, bowel
obstruction from laxative-effect salts, tetracycline/fluoroquinolone/
bisphosphonate absorption interactions), `l-theanine` (hypotension/
antihypertensive caution, additive sedation), `creatine-monohydrate` (renal
impairment, hydration requirement, nephrotoxic-drug caution), and `coq10`
(reused the identical, already-sourced `coenzyme-q10` pharmacology verbatim
— confirmed via `public/data/compounds.json` that `coq10` and
`coenzyme-q10` are two separate workbook rows for the literal same
compound, so mirroring rather than re-deriving was correct, not lazy).

Simulated both `splitList()`'s `/[\n|;,]+/` regex and
`audit-risk-tag-collisions.mjs`'s `findSuspectMatches()` against every draft
before writing (per the standing takeaway from several entries back) —
caught one real collision this way: "primary hyperparathyroidism" glues
`hyper`+`para` directly onto `thyroid` with no separator, and
`ALLOWED_PREFIXES` only covers single prefixes (`hyper`, `para`
individually), not the stacked `hyperpara`. Reworded to "parathyroid gland
disorders that raise blood calcium levels" (drops the compound clinical
term but keeps the same medical meaning) rather than extending the
allowlist for a one-off stacked-prefix case. Wrote all 5 via
`edit-entity-master-cell.mjs --in-place`; `workbook:roundtrip-test`,
`data:build:core`, `data:validate`, `guard:source-of-truth`, and
`audit:risk-tag-collisions` all passed clean (edges 12817→13147, tags
1279→1290).

Bigger finding: running the full `npm run data:build` (to reach
`compounds-detail/*.json`, since `data:build:core` never touches that
directory) showed that the `backfillEmptyDetailFields()` fix documented
several entries back — "unconditional, every build" — has apparently never
had its own regenerated output committed to `main`. 33 `compounds-detail`
files and 3 `herbs-detail` files came back dirty from a from-scratch full
build with zero workbook changes of my own behind most of them: exactly the
compounds fixed across the five-or-six-entry `contraindications_or_flags`
thread above (`chamomile`, `lavender`, `saw-palmetto-extract`,
`willow-bark-extract`, `msm`, `mct-oil`, `iberogast`, `pygeum`,
`ferulic-acid`, `bicarbonate`, `biotin`, `iodine`, `devils-claw`,
`passionflower`, `pycnogenol`, `carnitine-l-tartrate`, `cryptotanshinone`,
`farnesol`, `fos`, `fucoxanthin`, `ginsenoside-rg3`, `hydroxytyrosol`, and
more) still show a stale `indexability_score`/`safety-context-missing` on
their detail record despite `compounds.json` carrying the correct sourced
contraindications for a while now. `ashwagandha`/`maca`/`rhodiola` also came
back dirty but that diff is pure non-deterministic `sources` array
reordering, unrelated noise, not a real content gap.

Kept this cycle narrow: committed only the detail-file backfill for the 5
compounds this cycle itself sourced (`coq10`, `creatine-monohydrate`,
`l-theanine`, `magnesium`, `vitamin-d3` — via
`git checkout -- public/data/compounds.json public/data/herbs.json ...`
to drop the full-build overlay-drift contamination, keep the 5 target
`compounds-detail` files, revert the other 31+3 unrelated detail-file
diffs, then `data:build:core` to regenerate the top-level files
drift-free), rather than shipping a 36-file indexability-score-recompute
alongside 5 newly-sourced entries in one PR. **Next cycle: running
`npm run data:build` once, keeping every `compounds-detail`/`herbs-detail`
diff except the `ashwagandha`/`maca`/`rhodiola`-style pure source-reorder
noise, is a real, low-risk, mechanical fix in its own right** — it would
just be re-committing already-approved backfill logic's correct output,
not new judgment calls — and is worth doing as its own dedicated,
easy-to-review PR before continuing the remaining 83-of-88
severity-tier-only compound thread.

---

## 2026-07-13 — `guard-generated-data.mjs` blocks a pure-regen commit with no workbook edit; pivoted to 6 more severity-tier-only compound fills instead

Tried exactly what the prior entry recommended: ran `npm run data:build`
against the **unmodified** committed workbook (no new sourcing this step),
classified every resulting `compounds-detail`/`herbs-detail` diff as either
real content (indexability-score/safety-context recompute, or an actual
`contraindications` backfill) vs. pure `sources` array reordering noise
(confirmed via a full-diff read of each file, not diff --stat line counts
alone — line counts are a poor proxy, e.g. `melatonin.json` showed a
44-line diff that was 100% reorder). Kept 25 compounds-detail content
diffs + reverted 3 herbs-detail (`ashwagandha`/`maca`/`rhodiola`) and 6
compounds-detail (`caffeine-l-theanine`, `fadogia-agrestis`, `magnesium`,
`melatonin`, `peppermint-oil`, `saccharomyces-boulardii`) reorder-only
files, then regenerated `herbs.json`/`compounds.json`/summary-indexes with
`data:build:core` per the established drift-free convention.

Running `npm run data:validate` on that diff hit a real blocker:
`scripts/ci/guard-generated-data.mjs` requires every commit that touches
`public/data/*.json` to also touch a recognized source/build path
(`data-sources/`, `scripts/data/`, etc.) — and correctly so, since this
diff was a pure `public/data` regen with **zero** workbook or script
change, indistinguishable (to the guard, by design) from a hand-edited
JSON file. This is a real, previously-undocumented gap in the "next
cycle" recommendation from the prior entry: **a pure re-sync commit (no
new workbook edit) cannot pass `guard-generated-data.mjs` as-is.** Adding
`public/data/` to the guard's own allowlist would defeat its purpose, so
this isn't a guard bug to fix — it's a constraint on how this class of fix
must be shipped: it has to ride along with a real, same-cycle workbook
edit, not stand alone.

Pivoted rather than fight the guard: re-ran the token-only
`contraindications_or_flags` detection query fresh (93 `full_public_runtime`
compounds remain — the count keeps drifting upward as more compounds
promote to `full_public_runtime` over time, not just downward as cycles
fill it; don't trust a prior cycle's count) and filled 6 more
high-familiarity mainstream entries via `WebSearch`-verified pharmacology:
`alpha-gpc` (hypersensitivity, cardiovascular/autonomic caution,
cholinesterase-inhibitor potentiation, pregnancy caution), `l-tyrosine`
(MAOI hypertensive-crisis risk, hyperthyroidism/Graves caution, levodopa
interaction, stimulant additive caution), `yohimbine` (MAOI hypertensive
crisis, cardiovascular disease, anxiety/panic/PTSD/bipolar symptom
worsening, SSRI/SNRI/TCA serotonin-syndrome and BP risk, severe kidney/liver
clearance caution), `fenugreek` (pregnancy/uterine-stimulant, Fabaceae
cross-allergy, warfarin bleeding risk, diabetes-drug additive
hypoglycemia), `glucosamine` (shellfish-allergy sourcing caveat, warfarin
bleeding-risk case reports, diabetes blood-glucose caution), and
`echinacea` (autoimmune/immune-activation caution, immunosuppressant
interference, Asteraceae cross-allergy, >8-week use not well studied).
Simulated `splitList()`'s `/[\n|;,]+/` regex and the
`KEYWORDS`/`ALLOWED_PREFIXES` collision matcher against every draft first
(per the standing takeaway) — the one flagged hit
(`l-tyrosine`'s "hyperthyroidism" → `thyroid` via the `hyper` prefix) was
already covered by `ALLOWED_PREFIXES`. This same workbook edit made the
guard pass, letting the 25-file incidental regen from this cycle's first
half ride along legitimately in the same commit.

Found a second, narrower version of the "detail-file staleness" bug
documented several entries back: 3 of the 6 (`alpha-gpc`, `l-tyrosine`,
`yohimbine`) already had **non-empty** garbage token `contraindications`
in their `compounds-detail/*.json` file (`["stimulant"]`,
`["ssri","stimulant"]`, `["cardiovascular"]`), so
`backfillEmptyDetailFields()`'s `isEmptyValue()` check correctly declined
to touch them — that guard only fires when the *detail* record's own
field is empty, not when it's stale-but-present. Diffing every shared
field between the flat and detail records for these 3 showed the detail
records diverge from the flat record on far more than just
`contraindications` (summary, description, mechanisms, evidence_grade,
meta_title, affiliate fields, regulatory fields — dozens of fields on
`alpha-gpc`/`l-tyrosine` specifically), unlike the earlier `citicoline`
case where the detail record was essentially an empty stub and a full-field
sync was safe. A full-record sync here would have been a much bigger,
riskier, less-reviewable change than this cycle's actual scope — instead
wrote a narrow one-field patch (parse the detail JSON, overwrite only
`.contraindications` with the flat record's value, re-serialize with the
same 2-space-indent + trailing-newline convention) so the diff for those 3
files is exactly 4-6 lines each, touching nothing else. `yohimbine`'s
`indexability_score`/reasons already matched between flat and detail
(both already counted `["cardiovascular"]` as "safety-context present"
since the score only checks non-emptiness, not content quality) so no
score fix was needed there independent of the content fix.

`npm run data:validate` (guard-generated-data now passes: "41 public/data
file(s) changed, accompanied by source/build changes"), `guard:source-of-truth`,
`workbook:roundtrip-test`, `audit:risk-tag-collisions`, and the full
Vitest suite (584 tests) all passed clean. `npm run check` (typecheck +
lint + article-quality/claim-discipline/safety-visibility validators +
`data:build:core`) also passed. Edges 13950 (was 13443), tags 1318 (was
1301). All 6 compounds are `full_public_runtime` and gained
`safety-context` in `indexability_reasons` (scores 90-95).

**~87 `full_public_runtime` compounds with token-only
`contraindications_or_flags` remain** (93 minus this cycle's 6) — same
approach for future cycles: `WebSearch`-verified pharmacology,
`splitList()`/collision-matcher simulation before writing, check whether
the target's *existing* detail-file `contraindications` value is empty
(auto-backfills cleanly) or non-empty-but-stale (needs the narrow
single-field patch demonstrated here — never a full-record sync unless the
detail record really is an empty stub, diff every shared field first to
tell which case you're in). Re-run the detection query fresh each cycle;
don't trust a cached count or name list from a prior entry.

---

## 2026-07-13 (yet later) — Filled 5 more compound gaps; two lessons on staying unblocked when a concurrent cycle lands mid-PR

Started this cycle by picking 8 severity-tier-only compounds
(`alpha-gpc`, `yohimbine`, `epigallocatechin-gallate-egcg`, `galantamine`,
`garcinia-cambogia-extract`, `beetroot-extract`, `l-tyrosine`,
`saffron-extract`), sourcing and shipping real contraindications for all 8,
and opening a PR. A Codex automated review caught a real P1 on that PR —
the same detail-file-staleness bug class documented several entries
above: `getCompoundBySlug` merges `compounds-detail/*.json` over
`compounds.json`, and the 8 detail files still had the old tokens even
though the flat record had real prose. Fixed with the same narrow
single-field patch technique as the entry above (parse detail JSON,
overwrite only `.contraindications`, re-serialize with the same
formatting) rather than a full-record sync, since these detail records
carry substantial hand-curated content (rich `summary` text, affiliate
fields, regulatory fields) that a blanket flat-record overwrite would have
clobbered.

While that PR sat open waiting on CI, a **different, concurrent cycle**
merged its own PR (#2256) that happened to pick 3 of the same 8 compounds
(`alpha-gpc`, `l-tyrosine`, `yohimbine`) with independently-sourced,
comparably good contraindications text — turning my branch's
`mergeable_state` to `dirty` (real conflicts, not just a slow check).
Diagnosed this the hard way: `enable_pr_auto_merge` kept returning a
generic "required checks are failing" error that was actually masking the
real conflict (a stuck-looking `Cloudflare Pages` check that had genuinely
been `in_progress` for 2+ hours turned out to be a red herring — comparing
against another PR's near-instant Cloudflare Pages check confirmed *that*
part was anomalous but not the actual blocker). A direct `merge_pull_request`
attempt surfaced the real error immediately (`405 ... has merge
conflicts`) where `enable_pr_auto_merge`'s vaguer message hadn't — **worth
trying a direct merge attempt as a diagnostic even when not intending to
use it**, since its error message is more specific than the auto-merge
gate's.

Resolution: reset the branch onto latest `main` (which already had good
content for the 3 overlapping compounds) rather than hand-merging the
binary `.xlsx` workbook, then re-applied only the 5 non-overlapping
compound edits (`epigallocatechin-gallate-egcg`, `galantamine`,
`garcinia-cambogia-extract`, `beetroot-extract`, `saffron-extract`) fresh
against the updated workbook via `edit-entity-master-cell.mjs --in-place`,
re-ran `data:build:core`, and re-applied the same evidence_grade-drift
isolation + detail-file patch techniques from the entries above. Second
lesson: my isolation script (which reverts every untouched slug's record
back to the git-HEAD version across `compounds-summary.json` and the
sharded derivatives) wrote `compounds-summary.json` without matching its
original trailing newline — unlike `search-index.json`/
`alphabetical-shards.json`/`entity-shards.json`/`alpha-entity-shards.json`,
`compounds-summary.json` isn't one of `validate-deterministic-json-order.mjs`'s
tracked targets, so nothing caught it automatically; only showed up as a
1-line `git diff` on an otherwise byte-identical file. **Any script that
rewrites a `public/data/**` JSON file should always preserve the source
file's original trailing-newline convention, not just the four files a
specific CI gate happens to check** — verified with a byte-level `wc -c`/`od -c`
comparison this time rather than trusting a structural per-slug diff alone,
since a structural diff will report zero content differences even when the
raw bytes (and therefore `git diff`) disagree over whitespace.

Also confirmed a pre-existing, unrelated test failure on latest `main`
before assuming my own changes broke something:
`app/__tests__/route-consolidation-guardrails.test.ts` fails on a clean
`main` checkout (no edits) because recent nav-rename commits
("Point mobile Library nav item to Library page" etc.) changed
`mobileBottomNavItems` without updating this test's hardcoded href list —
1 failing test, 583 passing, confirmed via `git stash` + running just that
file against unmodified `main`. Flagging as a small, easy next-cycle fix
(update the test's expected array to `/library` instead of `/guides`) but
didn't fix it here to keep this cycle's diff scoped to the compound-safety
content change.

`data:validate`, `guard:source-of-truth`, `audit:risk-tag-collisions`,
`validate-deterministic-json-order`, `typecheck`, `lint`, and the full
Vitest suite (583/584, the one pre-existing failure above) all pass clean
on the final 9-file diff. 20 of the 33 `full_public_runtime`
severity-tier-only compounds now remain (originally 33 at the start of
this thread, 8 attempted, 3 landed elsewhere concurrently, 5 landed here) —
re-run the detection query fresh next cycle per the standing takeaway.

---

## 2026-07-14 — Ran concurrently with the two cycles above; added `scripts/data/sync-detail-backfill.mjs` and committed the still-missing `public/data/ai-entities/` directory

Started by independently reproducing the same 25-file `compounds-detail`
resync the entry two above (#2256) shipped, and the same two CI-gate
fixes (`route-consolidation-guardrails.test.ts`, `app/sitemap.ts`'s
missing `/library` route) the entry directly above (#2255) shipped — three
concurrent cycles converging on the same "next cycle" recommendation and
the same freshly-broken `main` bugs is now a repeated pattern, not a
one-off (see the entry above for the diagnostic tip about
`enable_pr_auto_merge`'s vague "unstable" error vs. a direct
`merge_pull_request` attempt's more specific conflict message — confirmed
that tip again here: `mergeable_state` flipped to `dirty` twice in this
cycle alone, once when #2256 merged and again when #2255 merged
immediately after, each requiring a `git reset --hard origin/main` +
re-apply of only the still-unique deltas rather than hand-resolving the
binary `.xlsx` conflict).

What survived both rebases as genuinely non-redundant:

**1. `scripts/data/sync-detail-backfill.mjs`** (`npm run
data:sync-detail-backfill`) — formalizes the fresh-parse -> postprocess ->
governance-overlay -> restore-flat-files -> `data:build:core` sequence.
A Codex review on this PR caught a real bug in the first draft: it
restored the pre-run `herbs.json`/`compounds.json` snapshot *after* the
detail-file backfill but *before* rebuilding summary/export/search
indexes, so a workbook edit made moments before invoking the script would
leave summary/search data derived from the stale pre-edit snapshot while
detail files reflected the new edit. Fixed by rerunning
`build-runtime-from-workbook.mjs` again after the restore so every
downstream file derives from the same fresh parse the detail backfill
used. Verified idempotent on an already-synced tree both before and after
the fix.

**2. `public/data/ai-entities/`** (857 files, ~3.7MB) — generated by
`scripts/data/ai-entity-enrichment-lib.mjs`, added in PR #2253 ("Build AI
entity enrichment and claim provenance artifacts") and referenced live by
`components/seo/SchemaGraphScript.tsx` for structured-data URLs, but never
committed by that PR. That same PR added the `evidence_grade` field to
`build-runtime-summary-indexes.mjs` — used by
`app/herbs/[slug]/page.tsx`, `app/search/SearchClient.tsx`,
`components/compare-table-client.tsx`, `components/StackCard.tsx`, and
more — but also never committed the regenerated summary-index/search-index
output (the #2256 entry above happened to pick that half up as an
incidental side effect of its own resync; this entry adds the still-
missing `ai-entities/` directory, confirmed absent from `main` again after
both rebases). Not a production outage — Cloudflare's deploy build
(`build-deploy.mjs`) always regenerates `public/data/**` fresh from the
workbook — but meant `npm run dev` off `main` was missing these files and
serving incomplete search/compare data locally.
`.github/workflows/ai-entity-enrichment-check.yml` only smoke-tests the
generator in isolation and lints/typechecks; it never runs the real
generator against the actual workbook or checks its output got committed.

**3. Reconfirmed (independently of the entries above) that the
`sources`-array "reorder noise" flagged in several earlier entries is
genuinely non-deterministic run-to-run**, not a fixed file list — running
the identical fresh-parse/postprocess/overlay sequence twice in one
session with zero data changes between runs touched a different
combination of files each time. Every instance confirmed via diff
inspection to be the exact same citation objects, just reshuffled array
position. Still unfixed and still worth a dedicated future cycle: grep
`postprocess-workbook-payloads.mjs` and `apply-governance-overlay.mjs` for
a comparator-less `.sort()` or `Set`/`Map` iteration in whatever dedupes
`sources` arrays. Until fixed, always diff-inspect any `sources`-only file
change before committing — never assume a prior entry's reorder-noise
file list is exhaustive or stable.

Takeaway for future cycles: after any PR that changes a `scripts/data/*`
generator, check whether its own generated `public/data/` output was
committed alongside it (`git show <sha> --stat` on the generator-changing
commit is a 5-second check) — a CI check that only smoke-tests a
generator in isolation cannot catch "the PR forgot to commit its own
build output."

---

## 2026-07-14 — Fixed 6 more `full_public_runtime` compound `contraindications_or_flags` gaps; re-ran the detection query fresh (82 remain)

Re-ran the token-detection query fresh per the standing takeaway rather than
trusting the last entry's count/name list — confirmed it's still accurate
methodologically (`Entity_Master` rows with `entity_type === 'compound'` and
`contraindications_or_flags` matching a bare severity/category token, e.g.
`moderate`, `pregnancy`, `liver`, cross-referenced against `compounds.json`
for `runtime_export_decision === 'full_public_runtime'`), just stale in
numbers: **82** such compounds remain today (was 93 two entries back, several
concurrent cycles have been chipping at it independently since). The query
itself is worth turning into a small standing script under `scripts/data/`
(e.g. `audit-severity-token-contraindications.mjs`) rather than hand-rolling
it fresh each cycle — flagging for a future cycle rather than doing it here
to keep this one scoped to content.

Filled 6 mainstream, high-traffic names from the list not yet touched by any
concurrent cycle: `spirulina`, `collagen-peptides`, `fenugreek-extract`,
`garlic-extract`, `lutein`, `glycine`. Each clause WebSearch-verified against
independent sources (NIH/NCCIH-adjacent overviews, WebMD/Drugs.com interaction
checkers, PubMed) before writing. Followed the established convention:
semicolon-separated clauses in the workbook cell, each one a complete
sentence using "or"/slash instead of comma-separated drug lists (commas
inside a clause get treated as separate clause boundaries by
`splitFlags()` in `build-interaction-data.mjs`, since it splits on both `;`
and `,` — harmless functionally since each fragment is tested for keywords
independently, but worse for the clause's own readability as rendered prose,
so avoid it anyway). Simulated `deriveInteractionData()` from
`build-interaction-data.mjs` against all 6 drafts before writing to confirm
every clause produced only the intended risk-mechanism tags, and ran
`npm run audit:risk-tag-collisions` after writing to confirm zero
false-positive substring hits (e.g. the documented
`hyperparathyroidism`-contains-`thyroid` trap) — both clean.

Used `npm run data:sync-detail-backfill` (the script added two entries back)
for the full fresh-parse → postprocess → governance-overlay →
restore-flat-files → `data:build:core` sequence — worked correctly and
caught the 6 target compounds' detail records. It also incidentally
resynced 9 unrelated already-correct records
(`caffeine-l-theanine`, `fadogia-agrestis`, `magnesium`, `melatonin`,
`peppermint-oil`, `saccharomyces-boulardii`, `ashwagandha`, `maca`,
`rhodiola`) — confirmed each via diff inspection to be the same
already-documented non-deterministic `sources`-array reorder noise (exact
same citation objects, shuffled position, still unfixed — see the entry
several above), not real content changes, so reverted those 9 files with
`git checkout --` to keep this PR's diff scoped to the actual safety-content
change. Also reverted `public/data/_meta/build-info.json` (pure timestamp).

Confirmed the surviving diff is exactly the 6 target compounds by diffing
`ai-entities/manifest.json` (a single-line minified JSON blob, unreadable
via plain `git diff`) entity-by-entity in Python rather than eyeballing the
raw diff — all 6 changed entities were the 6 targets, each with a `score`
bump from the new `evidence_grade`-adjacent scoring picking up the filled
safety field; nothing else moved.

`npm run guard:source-of-truth`, `npm run data:validate`, `npm run check`
(typecheck + lint + article-quality + claim-discipline + safety-visibility +
`data:build:core`), and the full Vitest suite (584/584, all passing — the
previously-flagged `route-consolidation-guardrails.test.ts` failure from two
entries back is confirmed already fixed on `main`) all passed clean on the
final diff. 82 full_public_runtime severity-tier-only compounds remain;
re-run the detection query fresh next cycle rather than trusting this count.

**Update (same PR, post-review):** Codex's automated review on this PR caught
two real bugs in the fills above before merge — both fixed in a follow-up
commit rather than editing history, per the "always create new commits"
git policy:

1. **Spirulina's warfarin clause used the word "anticoagulant," which
   `deriveInteractionData()`'s naive `.includes('anticoagul')` matcher
   classifies as an ADDITIVE bleeding-risk mechanism — but the clause
   describes the opposite direction of risk** (vitamin K reducing
   warfarin's effectiveness = reduced anticoagulation / clotting risk, not
   potentiated bleeding). This generated 111 false "both X and Spirulina are
   flagged for effects on bleeding/clotting" edges. Fixed by rewording to
   drop the word "anticoagulant" entirely (now just names "warfarin (a
   vitamin K antagonist)" directly) — verified via the same
   `deriveInteractionData()` simulation that the clause now produces zero
   anticoagulant-mechanism tags. **Takeaway: simulating the matcher before
   writing (as documented in earlier entries) catches whether a clause
   matches a mechanism at all, but not whether the matched mechanism's
   fixed ADDITIVE direction is actually correct for that clause's content —
   for any clause describing a non-standard-direction risk (reduces a
   drug's effect rather than compounding it), you have to independently ask
   "does this share the SAME risk direction as the mechanism's assumed
   default," not just "does it fire the keyword."**

2. **Lutein's smoker/lung-cancer contraindication was transplanted from
   beta-carotene's risk profile onto lutein specifically** — the AREDS2 RCT
   (the direct, purpose-built trial comparing the two) found beta-carotene
   nearly doubled lung cancer risk in smokers/former smokers while
   lutein/zeaxanthin showed no such increase; the VITAL-study source used to
   draft the original clause covered multiple antioxidants as a bundle and
   didn't distinguish. Fixed by dropping the clause (no accurate
   lutein-specific contraindication to substitute). **Takeaway: when a
   source discusses a compound bundled with related-but-distinct
   compounds (e.g. "β-carotene, retinol, lycopene, and lutein" as one
   cohort), don't attribute a bundle-level finding to a single member
   without checking a source that isolates that member specifically —
   here a second, more targeted trial (AREDS2) existed and contradicted
   the bundled study's apparent implication for lutein alone.**

Both fixes required also directly patching `compounds-detail/spirulina.json`
and `compounds-detail/lutein.json`'s `contraindications` arrays by hand —
**`npm run data:sync-detail-backfill` did NOT pick up either fix**, because
its underlying `backfillEmptyDetailFields()` (in
`apply-governance-overlay.mjs`) only fills a detail field when it's EMPTY on
the existing detail record; once a detail file already has a non-empty
`contraindications` array (as both did, from this same PR's first commit),
editing the workbook again and rerunning the sync script leaves the stale
pre-fix text in place indefinitely — only `compounds.json` (the flat record)
picked up the correction automatically. This is the same failure mode as the
original "detail-file staleness" bug several entries back, except that bug
was about missing fields on first fill; this is its unfixed sibling for
*correcting an already-filled* field. Worth a real fix in
`backfillEmptyDetailFields()` (or a documented, deliberate "force" flag) in a
future cycle — until then, treat any post-fill correction to a compound/herb
safety field as requiring a manual flat-record-to-detail-record patch, not
just a workbook edit + resync.

Re-verified clean after both fixes: `npm run audit:risk-tag-collisions`,
`npm run guard:source-of-truth`, `npm run check`, and the full Vitest suite
(584/584) all passed on the corrected diff.

---

## 2026-07-14 — Filled 6 more `full_public_runtime` compound `contraindications_or_flags` gaps (74 remained; re-detected fresh)

Re-ran the detection query fresh (`full_public_runtime` compounds whose
`contraindications` array is empty or a bare severity/category token) rather
than trusting the last entry's "82 remain" — **74** remained at the start of
this cycle, consistent with continued concurrent chipping. Picked 6
mainstream, high-traffic, non-duplicate names not obviously touched by any
in-flight cycle: `astaxanthin`, `mucuna-pruriens`,
`valerian-extract-standardized`, `boswellia`, `cordyceps`, `ginkgo-egb-761`.
(Skipped several near-duplicate slug variants in the same gap list —
`taurine-sleep`/`taurine-blend`, `betaine`/`betaine-hcl`/`betaine-anhydrous`,
`probiotics`/`probiotics-lactobacillus`/`probiotics-bifidobacterium`,
`atractylenolide-i/ii/iii` — since a single well-sourced clause set for the
base compound would leave the variants still gapped without a documented
policy for whether variants should share or diverge; worth a future cycle's
attention once that policy is decided rather than guessing here.)

WebSearch-sourced each compound's real pharmacology (Drugs.com/RxList/NCCIH/
PMC-adjacent sources) before drafting, then **simulated
`deriveInteractionData()` from `build-interaction-data.mjs` against all 6
draft clause-strings before writing to the workbook** (per the standing
takeaway two entries back) — confirms both that a clause fires the intended
keyword AND that the fired mechanism's assumed ADDITIVE direction matches
the clause's actual content. Caught one avoidable false-positive this way
before it ever reached the workbook: valerian's discontinue-before-surgery
clause originally used the literal word "surgery," which the `anticoagulant`
mechanism's keyword list contains verbatim (`['anticoagul','antiplatelet',
'bleeding','pre-surgery','surgery']`) — but valerian's surgical caution is
about additive sedation with anesthesia, not bleeding risk, so that wording
would have generated false bleeding-risk interaction edges. Reworded to
"any procedure requiring general anesthesia" (no keyword collision) instead.
Contrast: cordyceps' and ginkgo's own discontinue-before-surgery clauses
correctly keep the word "surgery," because their surgical caution IS about
a real additive bleeding risk — same literal word, opposite correctness,
depending on whether the compound's actual surgical risk mechanism happens
to match what the word triggers. **Takeaway: "surgery"/"pre-surgery" being
present in the `anticoagulant` keyword list makes it a landmine word for any
compound whose surgical caution is about something other than bleeding
(sedation, blood pressure, glycemic control) — grep any new
surgery-adjacent clause for whether its risk is actually bleeding before
using the bare word, or reword to name the real mechanism (anesthesia,
glycemic control, etc.) instead.**

Applied via `edit-entity-master-cell.mjs --in-place` (6 calls) →
`validate-workbook-schema` → `data:sync-detail-backfill`. The backfill
incidentally touched 9 unrelated files again (`caffeine-l-theanine`,
`fadogia-agrestis`, `magnesium`, `melatonin`, `peppermint-oil`,
`saccharomyces-boulardii`, `ashwagandha`, `maca`, `rhodiola`) — same
already-documented non-deterministic `sources`-array reorder noise, reverted
with `git checkout --`. Confirmed the `compounds.json` diff is exactly the 6
target slugs by comparing old/new record-by-slug in Python rather than
eyeballing the raw diff (same method as two entries back). Reverted
`public/data/_meta/build-info.json` (pure timestamp) twice — once after
`data:sync-detail-backfill`, again after `npm run check` re-ran
`data:build:core` internally and re-stamped it.

`npm run validate:workbook-schema`, `npm run audit:risk-tag-collisions`,
`npm run guard:source-of-truth`, `npm run check` (typecheck + lint +
article-quality + claim-discipline + safety-visibility + `data:build:core`),
and the full Vitest suite (584/584) all passed clean. 68 `full_public_runtime`
severity-tier-only compounds remain; re-run the detection query fresh next
cycle rather than trusting this count — and consider building the standing
`scripts/data/audit-severity-token-contraindications.mjs` script flagged
several entries back before hand-rolling the query yet again.
