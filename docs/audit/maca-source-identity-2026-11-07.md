# Maca source identity repair — existing PR #6952

## Confirmed identity and boundary

- PubMed https://pubmed.ncbi.nlm.nih.gov/18072817/ identifies *Spotlight on rasagiline in Parkinson disease*, CNS Drugs 2008;22(1):83–86, DOI 10.2165/00023210-200822010-00007. It is a reprint of PMID 17683172 and does not test maca.
- Workbook-derived `study-row-151` attaches that PMID to maca and labels the row `randomized_clinical_trials`, with energy/libido as its title. Its second URL, PMID 23674952, concerns a pilot in early postmenopausal women; it is not automatically substituted as support for these broadly worded outcomes.
- The original workbook and historic intake remain intact for audit. The existing negative source-assignment list is shared with workbook import so this specific maca row is withheld before runtime normalization. No source is reassigned, positive claim approved, medical recommendation added, or independent human review fabricated. Provenance is AI editorial source-identity verification under owner authorization.

## Implementation

The existing final quarantine also removes the bad detail source and dependent claims, and refreshes source/claim metadata. Its stale-claim backstop works even after the detail source is already gone. Other maca references remain. The current detail contains three legitimate review records; do not restore the old draft's one-source snapshot over those newer additions. Generated citation downloads are rebuilt from the cleaned records, not hand-authored replacements.

## Validation

Four focused suites: 14 tests passed, including two-run stale-claim resurrection, legitimate-reference retention, PMID/URL/DOI identity and old containment controls. Actual workbook regeneration produced no maca claim referencing PMID 18072817. Fresh CSV/BibTeX/RIS/JSON downloads contain no such PMID. Scope is existing PR #6952; all 17 open PR inventories were checked for source-path overlap and no competing owner was found. Full fast/security, typecheck, production export, hosted CI, scientific/source review and deployment proof remain pending until their actual results are recorded.

## Limits

This completes only the known maca source edge under #6645, not its missing 75 row-level Batch 8 findings. Existing curator claims, scientific grades, safety wording and publication policy are not positively upgraded. No business outcome or independent clinical certification is claimed.
