# Enrichment Dataset Verification — 2026-08-23

Five enrichment workbooks were supplied for integration. This records what they
contain, whether their citations survive checking, and what was integrated.

## The datasets

| Workbook | Sheets | Rows | Shape |
|---|---|---:|---|
| `KP_new_data_enrichment` | 5 | 220 | K–P profiles: new data values, entity fixes, new-only sources, coverage |
| `net_new_enrichment_20260823` | 3 | 87 | New evidence with PMID/DOI/title/study class, plus a target summary |
| `qv_new_enrichment_20260823` | 1 | 51 | Q–V entity identity: canonical name, scientific identity, class, constituents |
| `KP` / `wz_new_enrichment` | 1 | 62 | W–Z: field-level enrichment with source type and confidence |
| `enrichment_delta_20260823` | 1 | 100 | Study/ingredient join keys with new field/value pairs |

520 rows total, carrying **123 distinct PMIDs** and **92 distinct DOIs**.

## Citation verification

Every PMID was checked against NCBI E-utilities, and every row carrying a
claimed title was compared against the title NCBI returns for that PMID.

| Check | Result |
|---|---|
| PMIDs that resolve in PubMed | **123 / 123** |
| Rows with a real claimed title | 62 |
| Titles matching the actual paper | **62 / 62** |
| Title mismatches | **0** |
| Rows whose "title" is a `PubMed PMID n` placeholder | 62 |

**Zero fabricated identifiers and zero misattributions.** For comparison, the
same verification applied to the *existing* corpus found 6 misattributed
citations in 33 checked — an 18% rate. These datasets are materially cleaner
than what is already in the repository.

Source URLs are dominated by `pubmed.ncbi.nlm.nih.gov` (339), with
`powo.science.kew.org`, `ema.europa.eu`, `pubchem.ncbi.nlm.nih.gov`,
`nccih.nih.gov` and LiverTox making up most of the remainder. Notably, none of
the AI-tool citation links that appear elsewhere in the corpus (a
`consensus.app` URL carrying `utm_source=chatgpt`) appear here.

## What they actually cover

The rows reference **119 existing site profiles**. Only **5 are currently held**
by a governance decision, and only **4 of those have no claim at all**:
`kanna`, `muira-puama`, `nettle-root`, `yohimbe`.

So these datasets mostly *deepen already-published profiles* rather than unlock
the held backlog. That is worth stating plainly: they are not the 272-profile
unlock, and the backlog in #4159 is unchanged by them.

## Integrated

`data-sources/workbook-patches/enrichment-2026-08-23-grounded-summaries.json`,
validated read-only against the current workbook and left at `status: proposal`
for human review.

Both changes fix the same defect at its source. `nettle-root` and `muira-puama`
each carry an editorial instruction in their workbook `summary` cell — "It is
best framed distinctly from nettle leaf." and "It is best framed as a
traditional Amazonian botanical with modest modern evidence." The sanitizer
added earlier strips this class of text from generated output, but the workbook
is where it originates, and these two are held profiles whose summary is exactly
what needs grounding.

| Profile | Replaces | Grounded in |
|---|---|---|
| nettle-root | "It is best framed distinctly from nettle leaf." | PMID 16635963 / [doi:10.1080/j157v05n04_01](https://doi.org/10.1080/j157v05n04_01) — randomized, double-blind, placebo-controlled crossover trial, 558 completers, BPH symptom scores |
| muira-puama | "It is best framed as a traditional Amazonian botanical with modest modern evidence." | PMID 18821798 / [doi:10.1021/np8004002](https://doi.org/10.1021/np8004002) — clerodane diterpenoids with NGF-potentiating activity from *Ptychopetalum olacoides* |

The muira-puama replacement deliberately states that controlled human trials are
lacking. The old text implied "modest modern evidence", which overstates a
purely in-vitro phytochemistry result.

## Not integrated, and why

**`yohimbe` — 11 rows of genuinely valuable safety content** from NCCIH, LiverTox,
Kew POWO and PubChem: MAOI and tricyclic interaction warnings, arrhythmia and
seizure reports, poison-control data, and a 2015 analysis of 49 US products
showing most did not state yohimbine content. None of it is DOI-backed, and
`apply-workbook-patch.mjs` requires a valid DOI per source
(`DOI_PATTERN.test(doi)`). Authoritative regulatory and monograph sources
currently have no route through the patch mechanism. **That is a gap in the
tooling, not in the data** — this content should land, and the runner needs a
way to accept NCCIH/LiverTox/EMA-class sources.

**`kanna`** cites a 2025 critical review with no PMID or DOI in the row.

**The remaining 515 rows** target already-published profiles. They are
integrable, but each needs its target column resolved against `Entity_Master`
and its expected current value captured, which is a larger and separately
reviewable batch.

## Method

PMID existence and titles came from NCBI E-utilities `esummary` in bulk rather
than per-record lookups, and title comparison was done by token overlap in code.
The nettle-root DOI is absent from PubMed and was recovered from CrossRef by
bibliographic match — same title, journal and year — rather than constructed.


---

# Second batch — same day

Five further workbooks were supplied: `EJ_new_data_enrichment_CONTINUED`,
`qv_new_enrichment_pass3`, `net_new_enrichment_v2`, `net_new_enrichment_v2_2`
(a duplicate of v2) and `wz_new_enrichment_continued`. 595 rows, **138 distinct
PMIDs**, 121 DOIs.

| Check | Result |
|---|---|
| PMIDs that resolve in PubMed | **138 / 138** |
| Rows with a real claimed title | 188 |
| Titles matching the actual paper | **188 / 188** |
| Title mismatches | **0** |

Across both batches: **261 PMIDs verified, 250 titled rows checked, zero
misattributions.** Whatever process produced these files is attaching citations
correctly, which is not true of the material already in the corpus.

This batch references 121 profiles and reaches **5 held profiles with no claim**,
four of which carry a usable PMID.

## Integrated — 3 of 4

`enrichment-2026-08-23-pass2-grounded-summaries.json`, again validated read-only
and left at `status: proposal`.

| Profile | Replaces | Grounded in |
|---|---|---|
| evening-primrose | "…is tracked for mechanism-informed herb research in the workbook. Human-outcome claims should remain gated…" | PMID 36846678 / [doi:10.1016/j.heliyon.2023.e13414](https://doi.org/10.1016/j.heliyon.2023.e13414) — meta-analysis of evening primrose oil on cervical ripening and birth outcomes |
| guarana | "…is tracked for cognition,energy,inflammation with conservative evidence framing. Keep claims tied to…" | PMID 39536249 / [doi:10.1590/1806-9282.20240528](https://doi.org/10.1590/1806-9282.20240528) — meta-analysis of guarana for cancer-related fatigue |
| hawthorn | "Improves symptoms and exercise tolerance in mild heart failure." | PMID 40732315 / [doi:10.3390/ph18071027](https://doi.org/10.3390/ph18071027) — meta-analysis of RCTs, blood pressure in hypertension |

Two of these replace editorial instructions that were shipping as profile
summaries. The third is different: hawthorn's cell asserts a heart-failure
efficacy outcome with **no source attached at all**. The replacement leads with
what the meta-analysis actually supports (blood pressure) and demotes the
heart-failure claim to a separately evidenced traditional use rather than
deleting it or continuing to assert it unsourced.

The evening-primrose and guarana summaries both bound their evidence explicitly —
obstetric findings are not generalized to the skin and menopause uses the oil is
sold for, and guarana's cognition and energy claims are noted as inseparable from
its caffeine content in most trials.

## Rejected — goldenseal

`goldenseal` reaches the same bar on paper: held, no claim, and a resolvable
PMID (40149916). The paper is *"Interplay Between Traditional and Scientific
Knowledge: Phytoconstituents and Their Roles in Lung and Colorectal Cancer
Signaling Pathways"* ([doi:10.3390/biom15030380](https://doi.org/10.3390/biom15030380)).

It is a real paper and it plausibly touches berberine, but lung and colorectal
cancer signaling is not what goldenseal is used for, and grounding the profile
summary on it would assert a connection the paper does not make about this herb.
Left held.

Its current summary — "Internal cross-linking supports Goldenseal through
compounds such as berberine, hydrastine." — is a pipeline artefact and still
needs replacing, just not with this citation.

## Running totals

| | Batch 1 | Batch 2 | Total |
|---|---:|---:|---:|
| Rows | 520 | 595 | 1,115 |
| PMIDs resolved | 123/123 | 138/138 | **261/261** |
| Titles matched | 62/62 | 188/188 | **250/250** |
| Misattributions | 0 | 0 | **0** |
| Grounded summary proposals | 2 | 3 | **5** |
| Rejected on evidence grounds | 0 | 1 | 1 |
