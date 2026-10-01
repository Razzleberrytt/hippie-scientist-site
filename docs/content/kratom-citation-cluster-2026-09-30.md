# Mitragynine-adjacent citation cluster — #6115

## Architecture and source decision

The successful citation owner is `/articles/mitragynine/`. Existing 7-OH and pseudoindoxyl reviews also live under `/articles/`. The four additions reuse `content/articles/*.mdx` → `content-collections.ts` → `app/articles/[slug]/page.tsx`, including normalized references, factual modification dates, citation summaries, shared MDX/responsive tables and related-content resolution.

No database schema, migration, index, tenant boundary, workbook publication decision or runtime compound export changes are needed. Hidden workbook profiles are not promoted. New duplicate `/compounds/` HTML owners would split the established reader intent. `lib/kratom-compound-article-schema.ts` adds typed ChemicalSubstance identity and authored mentions to the existing Article graph for this bounded cohort. It derives citation destinations from the canonical article routes and makes no external identifier, clinical approval or reviewer claim. References remain authored with each article, normalized and emitted by the existing reference pipeline.

## Research and directness ledger

Checked September 30, 2026. This is an agent source audit, not a credentialed human editorial-review event; the editorial reviewer registry is unchanged.

| Primary source | Supports | Boundary retained |
|---|---|---|
| Chakraborty et al., 2021; PMID 34783240; DOI 10.1021/acs.jmedchem.1c01111 | 3DM formation and mouse toxicity | Not a human toxicity threshold or clinical death attribution |
| Avula et al., 2026; PMID 41825819; DOI 10.1016/j.phytochem.2026.114871 | Analytical 7-OH stability and 3DM artifact under simulated gastric conditions | Not demonstrated human exposure or toxicity |
| Tanna et al., 2022; PMID 35335999; DOI 10.3390/pharmaceutics14030620 | Human alkaloid exposure after mixed kratom tea | Not isolated-alkaloid efficacy/safety |
| Kruegel et al., 2016; PMC5189718 | Older null opioid-agonist assays for speciociliatine/speciogynine | Preserve disagreement with later assays |
| Hemby et al., 2026; PMID 41924140; DOI 10.3389/fphar.2026.1763551 | Human-receptor laboratory functional pharmacology | Human receptors are not human clinical trials; assay/species differences remain |
| Kamble et al., 2022; PMID 35854066; DOI 10.1208/s12248-022-00736-8 | Speciociliatine laboratory metabolism/CYP3A4 | Does not quantify a clinical interaction |
| León et al., 2021; DOI 10.1021/acs.jmedchem.1c00726 | Speciogynine serotonin/metabolite experiments | Rat endpoints are not mood-treatment outcomes |
| Chakraborty et al., 2021; DOI 10.1021/acschemneuro.1c00149 | Mitraciliatine mixed receptor/animal findings | No respiratory-protection or isolated human therapeutic claim |
| Kamble et al., 2020; PMID 33344889; DOI 10.1021/acsptsci.0c00075 | 7-OH conversion to MP in human plasma in vitro | Not measured in-vivo human PK |
| DEA order 2026-17429, 91 FR 54948, official GovInfo PDF | MP/MGM-15/MGM-16 temporary Schedule I order effective August 26, 2026 | Does not settle the separate 7-OH threshold proceeding |
| DOJ announcement, August 25, updated September 1, 2026 | Incidental-trace MGPI enforcement policy | Not a legal exemption |

Official regulatory sources: [DEA order](https://www.govinfo.gov/content/pkg/FR-2026-08-26/pdf/2026-17429.pdf), [DOJ](https://www.justice.gov/opa/pr/justice-department-announces-emergency-scheduling-three-potent-opioid-compounds), [FDA kratom](https://www.fda.gov/news-events/public-health-focus/fda-and-kratom), [FDA 7-OH](https://www.fda.gov/news-events/public-health-focus/hiding-plain-sight-7-oh-products).

## Freshness metadata correction

The substance-use hub's structured-data review/modification date is aligned to **2026-09-30**, matching the date the four new cluster entries were added. This prevents the changed hub from emitting the older September 17 `dateModified` value.

## Acceptance and unverified boundaries

All seven article owners have reciprocal authored links; the substance-use hub introduces the four additions. Six target reviews distinguish human/preclinical evidence, receptors, PK, safety, dependence/withdrawal, interactions, dated regulation and gaps. References are visible through the shared reference section and machine-readable Article citations.

The 7-OH final threshold outcome remains unverified by sources located in this update. Existing selected state-law examples retain their August 22 scope rather than receiving an invented fresh legal audit. Isolated-compound human efficacy, long-term safety and clinical interaction magnitudes remain unestablished. No AI citation, traffic, conversion or revenue improvement is measured.

Validation results and exact-head hosted proof belong in the PR. Do not treat this source ledger or successful compilation as merge, deployment, mobile visual acceptance or business-impact evidence.
