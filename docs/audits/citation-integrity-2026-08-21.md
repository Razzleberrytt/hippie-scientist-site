# Citation Integrity Review — 2026-08-21

**Scope:** every citation attached to a herb or compound profile in `public/data`.
**Rule applied throughout:** no citation was reassigned to a different profile. A
citation was kept, withdrawn, or listed for human review. Nothing was inferred
from title similarity.

## Counts

| | Count |
|---|---|
| Profiles inspected | 856 |
| Citations inspected (before) | 1,066 |
| Citations inspected (after) | 1,047 |
| Deterministic defects found | 19 |
| Withdrawn — unverifiable (no PMID/DOI/URL) | 18 |
| Withdrawn — confirmed mis-attributed | 1 |
| Verified correct on inspection | 5 |
| Review candidates remaining (heuristic) | 435 |
| Citations reused across >1 profile | 72 |
| Malformed identifiers | 0 |
| Duplicate identifiers within one profile | 0 |

## What was actually wrong

### Citation titles were never bibliographic

`sourceFromEvidence` in `scripts/data/canonical/workbook-map.mjs` set a
citation's `title` from `supported_claim_language || notes`. Neither field is a
study title:

- `notes` is an internal editorial column, so 23 citations were published with
  an internal governance ruling as their title — rendered to readers as the name
  of a study by `ShowMeTheStudies`, `ReferencedStudies` and `References`.
- `supported_claim_language` is the claim wording, so a citation restated the
  claim instead of naming the paper supporting it.

Fixed at source: the title is now empty when the row carries no real title, and
the editorial note moves to `legacy`, which is internal.

### 157 real titles were being overwritten every build

`apply-pubmed-metadata.ts` writes genuine bibliographic titles from a committed
NCBI cache, but it was not part of `data:build`, and the payloads it writes are
regenerated from the workbook. Each rebuild replaced 182 real study titles with
the workbook's placeholder — 157 of them reading "PubMed PMID *n*. Minimal
citation row added from existing workbook PMID; title/year/journal still require
PubMed metadata" — while leaving `metadataSource: 'pubmed'` in place, so the
provenance flag asserted PubMed had supplied a value that was in fact a note
about PubMed *not* having supplied it.

This mattered beyond tidiness: **the placeholders were hiding mis-attribution.**
The one confirmed wrong citation below is invisible while the title reads
"PubMed PMID 27403209" and obvious the moment the real title appears.

## Withdrawn — confirmed mis-attributed

| Profile | PMID | Actual title | Classification | Action |
|---|---|---|---|---|
| curcumin | 27403209 | Impact of the 'Artful Moments' Intervention on Persons with Dementia and Their Care Partners: a Pilot Study | `CLEARLY_MISATTRIBUTED` | Withdrawn |

Verified against PubMed: a qualitative pilot of an art-gallery engagement
programme run by the Art Gallery of Hamilton for people in the middle-to-late
stages of dementia. It involves no curcumin, no turmeric and no supplement of
any kind (*Can Geriatr J* 2016, [doi:10.5770/cgj.19.220](https://doi.org/10.5770/cgj.19.220)).

Withdrawn rather than replaced. No substitute citation was invented for the
claim it was attached to.

## Withdrawn — unverifiable identifiers

18 citations carried no PMID, no DOI and no URL, so no reader could check them.
Several had a pipeline status note where the study title belongs — "Requires
manual source normalization to PMID, DOI, PMC, or a stable URL". Publishing
these as evidence overstates the evidence base.

Affected profiles: `acemannan`, `acetyl-11-keto-beta-boswellic-acid`, `aescin`,
`allicin`, `cistanche`, `digestive-enzymes`, `fadogia-agrestis`, `fos`,
`huperzine-a`, `hydroxytyrosol`, `krill-oil`, `lavender`, `lutein`, `maca`,
`marshmallow-root`, `peppermint-oil`, `raspberry-ketones`, `slippery-elm`.

The full records, including their research notes, are preserved in
`ops/reports/quarantined-citations.json` for a human to resolve. Two of them
carry real content that deserves a real source — `peppermint-oil` ("Meta-analysis
of RCTs found benefit for global IBS symptoms") and `fos` ("Microbiota
modulation; GI tolerance matters"). **These need manual sourcing.**

## Verified correct — kept

These were the strongest heuristic suspects. Each was checked against PubMed and
each turned out to be a correct citation. They are recorded here because they
demonstrate why automated correction on title similarity would have been
destructive: **three of the four strongest candidates were right.**

| Profile | PMID | Why it is correct |
|---|---|---|
| agarikon | 35002589 | An old-growth-forest ecology review, but its abstract and keywords explicitly cover *Fomitopsis officinalis* — agarikon — as a medicinal fungus ([doi:10.1007/s10311-021-01372-y](https://doi.org/10.1007/s10311-021-01372-y)) |
| angelica-archangelica | 31605258 | A general epilepsy review whose abstract lists *Angelica archangelica* among the herbs reviewed for antiepileptic activity ([doi:10.1007/s11011-019-00494-1](https://doi.org/10.1007/s11011-019-00494-1)) |
| acerola | 31627309 | A collagen-supplement RCT whose study formula contains acerola fruit extract ([doi:10.3390/nu11102494](https://doi.org/10.3390/nu11102494)). Worth a reviewer's note that it is a multi-ingredient product, but it is not mis-attributed |
| caraway | 17427617 | A peppermint-oil review that covers the peppermint-plus-caraway-oil combination for non-ulcer dyspepsia (PMID 17427617) |
| Various | 10675182 | "Herb-drug interactions" is cited on nine profiles. A herb-drug-interaction review legitimately belongs on every herb it covers; reuse is not a defect |

Article metadata retrieved from PubMed.

## Remaining manual review

**435 heuristic review candidates** are listed in
`ops/reports/citation-review-candidates.json`. Each is a citation whose title
names neither the profile subject nor any of its listed constituents. The signal
is weak: sampling showed most are legitimate — topical reviews, studies of a
constituent the profile does not list, and papers about a related species.

Two specific cases could not be resolved automatically because NCBI returns no
article metadata for them (they are LiverTox Bookshelf records, not journal
articles), and both look genuinely suspicious:

| Profile | PMID | Title | Classification |
|---|---|---|---|
| calendula | 30000869 | Echinacea | `INSUFFICIENT_METADATA` — a Calendula profile citing an Echinacea monograph |
| caraway | 30000936 | Black Seed | `INSUFFICIENT_METADATA` — a Caraway profile citing a Black Seed monograph |

**These two need a human to open the record and decide.** They were left in
place rather than removed, because "the title names a different herb" is
suggestive but not proof, and LiverTox chapters do sometimes discuss related
botanicals.

## How this is now enforced

`scripts/ci/validate-citation-integrity.mjs` separates two classes and treats
them differently on purpose:

- **Deterministic failures** fail the build: malformed PMID or DOI, a citation
  with no identifier at all, the same identifier twice on one profile, and a
  `metadataSource: 'pubmed'` flag on a placeholder title.
- **Heuristic review candidates** never fail the build. They are written to a
  report for a human, because the signal produces mostly false positives and
  acting on it automatically would delete correct science.

The validator also refuses to pass on a corpus below 400 profiles / 700
citations, so it cannot report "no defects" because it inspected nothing.

`scripts/data/quarantine-unverifiable-citations.mjs` withdraws the two classes
above. Its mis-attribution list is explicit and hand-verified — an entry means
someone read the paper — and it fails if a listed entry matches nothing, so a
citation known to be wrong cannot silently return.
