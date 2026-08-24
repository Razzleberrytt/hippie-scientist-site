# Mechanism normalization gap

`build-runtime-from-workbook.mjs` maps each entity's raw mechanism terms onto the
canonical taxonomy (53 sheet-defined mechanisms plus 8 declared in code) and writes `public/data/mechanism-normalization-report.json`.

**Current state: 856 records — 799 fully mapped, 30 partially, 27 unmapped.**
82 distinct terms fail to map, across 89 occurrences.

> Was 623 / 181 / 52 with 353 unmapped occurrences before the taxonomy additions
> in §2. Eight mechanisms the source data uses but the sheet never defined are
> now declared in code, which resolved 264 of those occurrences.

This document says which of those are fixable and how, because the three causes
need completely different work and lumping them together makes the number look
like one problem.

---

## 1. Fixed here — terms that resolve to exactly one existing mechanism

Added to `MECHANISM_SYNONYM_OVERLAY`:

| term | mapped to |
|------|-----------|
| `immune_modulation` | `immune-modulation` |
| `Autophagy` | `autophagy-modulation` |
| `Nitric Oxide Pathway Modulation` | `nitric-oxide-modulation` |
| `calcium signaling`, `intestinal smooth-muscle calcium-channel blockade` | `calcium-channel-modulation` |
| `5-HT1A activity` | `serotonin-modulation` |
| `endogenous CB1 agonism`, `weak CB1/CB2 interaction`, `proposed cannabinoid-like effects`, `FAAH degradation` | `endocannabinoid-modulation` |

Effect: unmapped records 55 → 52, distinct unmapped terms 121 → 113.

Deliberately **not** mapped, because each could belong to more than one
mechanism and guessing would put a wrong mechanism on a profile:

- `catecholaminergic` — spans `dopamine-modulation`, `adrenergic-modulation`, and `comt-modulation`
- `PI3K/Akt modulation`, `Activates protein synthesis via PI3K/Akt pathway` — upstream of `mtor-modulation`, not the same thing
- `TRPM8 receptor activation` — the taxonomy has `trpv1-modulation`; TRPM8 is a different channel
- `inhibitory neurotransmission` — most likely GABA, but that is inference

## 2. Added — eight mechanisms the sheet never defined

The synonym overlay cannot fix these: it is keyed by `canonical_mechanism_id`, so
it can only alias a mechanism that already exists. Each term below had no entry
in the 53.

The taxonomy is read from `Taxonomy_Rules` rows tagged
`source_table = Canonical_Mechanisms`, and the surgical cell editor cannot
append a row to that sheet — it edits existing cells in `Entity_Master` only.
Rather than leave these permanently unmapped, they are declared in
`MECHANISM_TAXONOMY_ADDITIONS` and concatenated onto the sheet-derived list,
exactly as `MECHANISM_SYNONYM_OVERLAY` already extends it in code.

**A workbook row wins.** Anything later defined in the sheet with the same id is
kept and the code entry is dropped, so migrating these into `Taxonomy_Rules`
needs no code change beyond deleting the entry.

| id | category | class | covers |
|----|----------|-------|--------|
| `neurotransmitter-modulation` | core | Physiological effect | the generic term — see §3 |
| `hepatic-detoxification` | hepatic | Metabolic modulation | `liver_detoxification`, `hepatobiliary support` |
| `sirtuin-activation` | longevity | Signaling pathway modulation | `SIRT1`, `SIRT1 Signaling` |
| `digestive-support` | gut | Physiological effect | `digestive support`, `aromatic support`, `carminative effects` |
| `angiogenesis-modulation` | vascular | Growth factor modulation | `Angiogenesis` and its VEGFR2/wound-healing phrasings |
| `incretin-signaling` | metabolic | Receptor interaction | GLP-1/GIP agonism, glucose-dependent insulin secretion |
| `gh-igf1-axis-modulation` | hormonal | Hormonal modulation | GH axis, IGF-1, GHRH, ghrelin receptor |
| `mucosal-barrier-support` | gut | Physiological effect | mucilage, demulcent, mucosal coating |

## 3. `Neurotransmitter Modulation` is a design question

At 198 occurrences it is by far the largest single term, and it is **not** a
missing row.

The taxonomy already carries 18 *specific* neurotransmitter mechanisms —
acetylcholine, adenosine, adrenergic, dopamine, GABA, glutamate, histamine,
serotonin, opioid, orexin, endocannabinoid, and so on. It deliberately has no
generic parent. The source data says "Neurotransmitter Modulation" where the
taxonomy wants "GABA modulation" or "Serotonin modulation".

Two options, genuinely different:

1. **Add a generic `neurotransmitter-modulation` entry** — category `core`,
   class `Physiological effect`. Consistent with how `hormonal-signaling-context`
   and `metabolic-regulation` already work as generic core entries. Maps 198
   occurrences immediately, at the cost of a less specific taxonomy.
2. **Make the source specific** — replace the generic term on each of the ~198
   entities with the neurotransmitter actually involved. Better data, far more
   work, and editorial rather than mechanical.

**Decision: option 1, taken.** It loses nothing that option 2 would later
recover. `raw_mechanisms` keeps the original term on every entity, so narrowing
an entity to "GABA modulation" afterwards is an improvement rather than a
correction, and the generic entry simply stops matching once a specific one
does. Leaving 198 occurrences unmapped in the meantime is strictly worse than a
correct-but-general mapping: unmapped terms contribute nothing to
`canonical_mechanisms`, so those profiles currently carry no mechanism data at
all.

Option 2 remains the better end state. It is editorial work, entity by entity,
and it is not blocked by anything here.

## 4. Not a taxonomy problem at all — source-data defects

This is now essentially all of what is left: roughly 60 of the 82 remaining
distinct terms are not mechanism names. They are sentence fragments produced by
`splitList` breaking prose on commas (it splits on `\n | ; ,`, which is correct
for the delimited cells and wrong for the prose ones):

```
"Provides caffeine        and amylases        and visceral sensitivity.
buffering intracellular pH.                   Buffers lactic acid and delays fatigue.
Systematic reviews show no consistent benefit for eczema
```

and metadata that should never have been in a mechanism field:

```
Added as site-safe referenced entity during workbook readiness pass   (3)
limited                                                               (3)
mechanism unclear
glycyrrhizin removed
no unified or validated pathway.
```

Adding synonyms for these would be wrong — they should be cleaned out of the
source cells, which is editorial work on `mechanism_summary` in the workbook.
They are why the remaining distinct-term count (82) still looks high against
only 89 occurrences: almost every one appears exactly once, because each is a
unique fragment of a unique sentence rather than a term anyone is using.

## 5. Summary

| cause | occurrences | status |
|-------|-------------|--------|
| generic where the taxonomy is specific | 198 | **resolved** — generic core entry added, §3 |
| needed a taxonomy entry the sheet lacked | ~66 | **resolved** — 7 entries added, §2 |
| resolvable to an existing mechanism | ~14 | **resolved** — synonyms, §1 |
| prose fragments and junk in the source | ~70 | open — clean the source cells, §4 |
| genuinely ambiguous | ~10 | left alone — guessing would be worse, §1 |

Net: 856 records went from 623 fully mapped to **799**, and unmapped occurrences
from 353 to **89**. What remains is almost entirely §4 — text that was never a
mechanism name and should be cleaned out of the source cells rather than mapped.

## 6. Running the test suite

Run `npm run test` **once at a time**. Two concurrent full-suite runs contend on
the workbook and the built output, and `sitemap-canonical-visibility` and
`workbook-reader-parity` fail under that contention.

This was mistaken for suite flakiness twice during this work, and recorded as
such in two pull requests before the cause was found: a background run and a
foreground run overlapping. Run alone, the suite is green at 499 files / 2,425
tests. The tests are fine.

## 7. A note on how the code-defined entries stay honest

Two guards, both learned from getting it wrong here:

- `MECHANISM_SYNONYM_OVERLAY` is a plain object literal, so a second entry for
  an id silently replaces the first. That happened: adding endocannabinoid
  phrasings in one pass dropped the existing `endocannabinoid` and
  `endocannabinoid system` aliases, and four occurrences regressed to unmapped
  without any test noticing. The two entries are now merged.
- `scripts/data/build-runtime-from-workbook.mjs` was in the ESLint ignore list,
  which is why `no-dupe-keys` never ran on it. It had exactly **one** lint error
  in the whole file; that is now fixed and the file is linted, so the same
  mistake fails the build.
