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
