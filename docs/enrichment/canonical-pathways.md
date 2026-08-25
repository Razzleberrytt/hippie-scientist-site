# `canonical_pathways` — batches 1 and 2

Second field taken through the gap-driven enrichment pipeline, after `latin_name`
completed (79 imported, 28 resolved as no-ops). Gate G15 supersedes G14 and
widens the readiness scope to `canonical_pathways`; everything else about the
pipeline is unchanged.

**Status: staged, not applied.** Both patches are `approved` and dry-run clean
against the current workbook, but the workbook write is blocked in this
environment (see §5). Nothing in `data-sources/herb_monograph_master.xlsx` has
changed yet.

| | |
|---|---|
| gaps at baseline | **119** (63 herbs, 56 compounds) |
| researched here | 48 |
| filled | 36 |
| no-op, reason recorded | 12 |
| remaining | 71 |

| Batch | Jobs | Filled | No-op | Patch |
|-------|------|--------|-------|-------|
| 1 | 24 | 19 | 5 | `enrich-batch-2026-08-25-b35501d6d4.json` |
| 2 | 24 | 17 | 7 | `enrich-batch-2-2026-08-25-e0217adb71.json` |

Sources came from PubMed via the E-utilities MCP server. Every filled cell names
one PubMed-indexed article, with a DOI, whose abstract reports the pathway being
claimed. The research record — entity, labels, source, and the reasoning for each
— is `ops/enrichment/pathways-research.json`; the worker that turns it into
candidates is `ops/enrichment/pathways-work.mjs`.

---

## 1. The vocabulary decision

`canonical_pathways` looks like a free-text column and is not one.
`scripts/data/canonical/site-export.mjs` feeds it, together with
`mechanism_summary`, straight into `normalizeMechanisms()`. A label the taxonomy
cannot resolve contributes **nothing** to `canonical_mechanisms` — which is
exactly the failure #4189 spent a PR undoing for the 198 rows carrying a generic
mechanism term.

The 762 already-populated rows use 44 distinct labels in two competing styles: a
Title Case shorthand (`Nrf2`, `NF-kB`, `Oxidative Stress`, `Endothelial
Function`) and a legacy lowercase one (`inflammatory`, `neuroprotective`,
`gut_microbiome`). Both only resolve because `MECHANISM_SYNONYM_OVERLAY` happens
to list them.

This work writes **`canonical_label` values from
`public/data/canonical-mechanisms.json`** instead — the vocabulary the contract
names for this field. Every `canonical_label` is an alias of itself, so the
palette is guaranteed to map without depending on the overlay. `pathways-work.mjs`
rejects any label outside that set, so a typo cannot reach a patch.

Practically: this work writes `Nrf2 activation` where an older row says `Nrf2`.
Both normalise to the same canonical mechanism.

## 2. What the work found

**A source that supports the entity is not the same as a source that supports
the label.** Ginkgo's best mechanistic paper reports Nrf2-mediated HO-1
induction and states in its own abstract that the effect is *antioxidant-
independent* — PEG-SOD did not alter it. `Antioxidant` would have been the
obvious label and the paper rules it out. Same shape for peppermint: the
entity's `mechanism_summary` claims TRPM8 activation, and the human colonic
smooth-muscle study specifically excludes TRPM8 (and neural block, and
guanylyl-cyclase inhibition, and K⁺-channel block) in favour of L-type Ca²⁺
channel block. Labels follow the source, not the row.

**Direction matters.** Atractylodes polysaccharides *activate* NF-κB — that is
the mechanism of macrophage activation. `NF-kB inhibition`, the reflexive label
for anything with NF-κB in the abstract, would have inverted the biology.

**Twelve no-ops, in three kinds.** They are answers, not gaps:

- *Not a defined substance* (6): `electrolyte-mix`, `taurine-blend`,
  `probiotics`, `probiotic-strain-bifidobacterium`, `probiotic-strain-lactobacillus`,
  and by extension any blend. Attributing a mechanism to a variable or
  genus-level composition generalises across formulations the evidence does not
  match, which the pipeline's immutable invariants forbid. These entities need a
  composition or a strain before this field can be filled.
- *Vocabulary gap* (3): `beta-alanine` (carnosine-mediated intracellular pH
  buffering), `collagen-peptides` (procollagen synthesis in fibroblasts),
  `agarikon`/`ocotea-odorifera` (antimicrobial action, efflux-pump inhibition).
  The mechanism is well characterised; the taxonomy has no term for it. These
  are a shopping list for the mechanism vocabulary, not a research failure.
- *Nothing of an accepted class* (3): `maral-root`, `juniper` — the retrievable
  literature is phytochemistry or review-level.

**One no-op is a null finding worth keeping.** `milk-oats` was left empty on
purpose. The best human evidence for wild green oat extract is a 12-week
randomised, double-blind, placebo-controlled cross-over trial in 37 older adults
that found **no effect on any cognitive measure**
([10.3390/nu4050331](https://doi.org/10.3390/nu4050331)). A pathway label would
imply an activity that trial does not show. `oatstraw`, the same organism, is
still queued and should get the same treatment.

**Confidence is graded, and low means low.** `fennel` and `notoginseng` rest on
an isolated constituent in a tumour-cell model and on a three-herb formula
respectively; `shankhpushpi` is a trade name covering four botanicals whose
assayed activity differed sharply, with the weakest being the one the slug names.
All three are recorded at `confidence: "low"` with the reason in the patch
rationale rather than being dropped or quietly promoted.

## 3. Where the remaining 71 are

`npm run enrich:queue -- --field canonical_pathways` lists them. The pattern from
these two batches should hold: roughly 70–75% fillable, with blends, genus-level
placeholders and vocabulary gaps making up the rest. Entities already researched
here that share an organism with a queued one — `oatstraw` with `milk-oats`,
`cayenne` and `capsicum-frutescens` with `capsicum-annuum`, `dong-quai` with
`angelica-pubescens` — can reuse the same source, with
`shared_value_acknowledged` set, as `peppermint-oil` does with `peppermint`.

## 4. Batch mechanics

`enrich export` builds its patch from **every** candidate file on disk, not from
the current batch, so running two batches before exporting produces one
oversized patch and re-exports the first batch's changes. After exporting, move
that batch's candidates to `ops/enrichment/candidates/archive/<batch>/` —
`listCandidates()` is not recursive, so the archive is invisible to the next
export while staying in place as an audit trail. Seven stale `latin_name`
candidates from the August 24 batches, whose jobs are already `integrated`, are
archived the same way; they were failing every `validate` run as
`stale-candidate`.

## 5. Applying these patches

Both are `approved` and dry-run clean. To write them:

```bash
node scripts/data/apply-workbook-patch.mjs --patch data-sources/workbook-patches/enrich-batch-2026-08-25-b35501d6d4.json --apply --in-place
node scripts/data/apply-workbook-patch.mjs --patch data-sources/workbook-patches/enrich-batch-2-2026-08-25-e0217adb71.json --apply --in-place
```

Then set each patch's `status` to `applied`, run `npm run enrich:scan`, and
confirm the `canonical_pathways` gap count falls from 119 to 83. That last check
is the one that catches a patch which validated but did not land.

Do **not** commit `public/data` alongside the applied workbook; `data:build:core`
rewrites ~1,700 files that have nothing to do with this change.

## 6. The G15 readiness record

`ops/enrichment/readiness.json` is gitignored along with the rest of the
pipeline's runtime state, so the gate is recorded here for review:

- **Gate** G15, superseding G14. Approved by the repo owner, delegated to Claude
  Code (session `015F1Gnxhg7XJu7E6UBh3HcP`), 2026-08-25.
- **Scope** standing, batch-capped at 25, no pinned job ids. Allowed fields:
  `latin_name` (carried over, now complete) and `canonical_pathways`.
- **Source policy** every source needs a valid DOI. The authority-reference
  exemption added for `latin_name` in #4176 is scoped to `latin_name` and
  `keywords` and does **not** apply here; a pathway label is claim-bearing.
- **Waivers** G8 source reuse is waived for `canonical_pathways` — the brief
  surfaces each entity's existing sources as leads, but the registers are
  dominated by clinical-outcome sources and a pathway label needs a source that
  reports the pathway. Reuse is attempted per job and recorded in
  `provenance.sources_reused`. G9 (parallelism) and G10 (migration) stay waived.
- **Rollback** `git checkout -- data-sources/herb_monograph_master.xlsx && npm run data:build:core && npm run guard:source-of-truth`.

A new field, parallel workers, or a spreadsheet migration each need a fresh
record.
