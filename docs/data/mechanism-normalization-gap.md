# Mechanism normalization gap

`build-runtime-from-workbook.mjs` maps each entity's raw mechanism terms onto the
53-entry canonical taxonomy and writes `public/data/mechanism-normalization-report.json`.

**Current state: 856 records — 623 fully mapped, 181 partially, 52 unmapped.**
113 distinct terms fail to map, across 353 occurrences.

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

## 2. Needs new taxonomy entries — the bulk of the gap

**These cannot be fixed with the synonym overlay.** The overlay is keyed by
`canonical_mechanism_id`, so it can only add aliases to a mechanism that already
exists. Every term below has no corresponding entry in the 53.

| term(s) | occurrences | proposed entry |
|---------|-------------|----------------|
| `Neurotransmitter Modulation`, `Neurotransmitter Signaling` | **198** | see §3 — this one is a design question, not a missing row |
| `liver_detoxification`, `hepatobiliary support`, `mild choleretic/diuretic effects` | 13 | `hepatic-detoxification` — category `hepatic`, class `Metabolic modulation` |
| `SIRT1`, `SIRT1 Signaling` | 13 | `sirtuin-activation` — category `longevity`, class `Signaling pathway modulation` (sits naturally beside `autophagy-modulation`) |
| `digestive support`, `aromatic support`, `carminative effects`, `macronutrient breakdown via proteases`, `lipases` | 12 | `digestive-support` — category `gut`, class `Physiological effect` |
| `Angiogenesis`, `Angiogenesis Promotion (VEGFR2 Upregulation)`, `Angiogenesis Support`, `Wound-Healing Angiogenesis Support` | 5 | `angiogenesis-modulation` — category `vascular`, class `Growth factor modulation` |
| `Incretin signaling`, `GLP-1 Receptor Agonism`, `Dual GIP and GLP-1 Receptor Agonism`, `Glucose-Dependent Insulin Secretion`, `Glucagon Suppression` | 9 | `incretin-signaling` — category `metabolic`, class `Receptor interaction` |
| `Growth hormone axis`, `IGF-1 signaling`, `Downstream IGF-1 Elevation`, `GHRH Receptor Agonism`, `Selective Pulsatile GH Release`, `Ghrelin Receptor (GHS-R1a) Agonism` | 9 | `gh-igf1-axis-modulation` — category `hormonal`, class `Hormonal modulation` |
| `mucilage barrier formation`, `mucosal coating`, `mucosal protection`, `demulcent support`, `mucilage coating of GI mucosa` | 5 | `mucosal-barrier-support` — category `gut`, class `Physiological effect` |

**Blocked on tooling.** The taxonomy is read from the workbook sheet
`Canonical_Mechanisms` (falling back to `Taxonomy_Rules`), and
`scripts/data/edit-entity-master-cell.mjs` edits existing cells in
`Entity_Master` only — it cannot add a row to another sheet. Adding these eight
entries needs either a row-append path for the workbook or a manual edit.

## 3. `Neurotransmitter Modulation` is a design question

At 198 occurrences it is by far the largest single term, and it is **not** a
missing row.

The taxonomy already carries 18 *specific* neurotransmitter mechanisms —
acetylcholine, adenosine, adrenergic, dopamine, GABA, glutamate, histamine,
serotonin, opioid, orexin, endocannabinoid, and so on. It deliberately has no
generic parent. The source data says "Neurotransmitter Modulation" where the
taxonomy wants "GABA modulation" or "Serotonin modulation".

Two options, and they are genuinely different:

1. **Add a generic `neurotransmitter-modulation` entry** — category `core`,
   class `Physiological effect`. Consistent with how `hormonal-signaling-context`
   and `metabolic-regulation` already work as generic core entries. Maps 198
   occurrences immediately, at the cost of a less specific taxonomy.
2. **Make the source specific** — replace the generic term on each of the ~198
   entities with the neurotransmitter actually involved. Better data, far more
   work, and it is editorial rather than mechanical.

Option 1 is the pragmatic move and is reversible; option 2 is the correct one.
Either way it is a decision about what the taxonomy is *for*, so it should not be
made by a synonym mapping.

## 4. Not a taxonomy problem at all — source-data defects

Roughly 60 of the 113 distinct terms are not mechanism names. They are sentence
fragments produced by splitting prose on commas:

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
source cells. They inflate the unmapped count and make the gap look larger than
it is: about 60 of 113 distinct terms, but only around 70 of 353 occurrences.

## 5. Summary

| cause | distinct terms | occurrences | fix |
|-------|----------------|-------------|-----|
| resolvable to an existing mechanism | 8 | ~14 | **done here** |
| needs a new taxonomy entry | ~35 | ~66 | 8 proposed entries, blocked on a row-append path |
| generic where the taxonomy is specific | 2 | 198 | design decision, §3 |
| prose fragments and junk in the source | ~60 | ~70 | clean the source cells |
| genuinely ambiguous, left alone | ~8 | ~10 | none — guessing would be worse |

The headline "234 records degrade" is true but misleading: one design decision
covers 198 occurrences, and roughly a fifth of the remainder is source text that
was never a mechanism.
