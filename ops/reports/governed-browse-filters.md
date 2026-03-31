# Governed browse/search filters report

- Generated at: 2026-03-31T15:32:09.362Z
- Deterministic model version: governed-browse-filters-v1
- Surfaces updated: /herbs, /compounds

## Governed signals used
- researchEnrichmentSummary.evidenceLabel
- researchEnrichmentSummary.hasHumanEvidence
- researchEnrichmentSummary.safetyCautionsPresent
- researchEnrichmentSummary.conflictingEvidence
- researchEnrichmentSummary.enrichedAndReviewed
- researchEnrichmentSummary.lastReviewedAt
- researchEnrichmentSummary.mechanismOrConstituentCoveragePresent

## Candidate signals excluded and why
- enrichment submissions reviewStatus (blocked/rejected/revision_requested/partial): Not used for positive ranking/filter signals; guarded by publishable-governed summary gate only.
- source count / source registry volume: Volume does not equal quality and can overstate weak evidence.
- unsupported claim-level confidence indexes: Browse/search remains lightweight and uses only summary-safe governed fields.

## Coverage and eligibility
- Herbs eligible for governed controls: 2/677
- Compounds eligible for governed controls: 0/389

## Added controls
- Filters: reviewed_recently, human_clinical_or_limited, mechanism_or_constituent_coverage
- Sorts: governed_evidence, review_freshness, safety_first

## Verification
- approvedGovernedOnlyInfluence: PASS
- blockedRejectedRevisionRequestedCannotInfluenceControls: PASS
- browseSearchRemainsLightweight: PASS
- deterministicConservativeWhenSparse: PASS

## Representative before/after examples
- Herbs query "sleep": before=corydalis yanhusuo | erythrina mulungu | griffonia simplicifolia (7) -> after=none (0)
- Compounds query "anti": before=2,4,5-trimethoxybenzaldehyde | aconine | aconitine (144) -> after=none (0)
