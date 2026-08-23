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
