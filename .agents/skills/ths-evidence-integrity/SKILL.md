---
name: ths-evidence-integrity
version: 1.0.0
description: Validate papers, PMIDs, mechanisms, claim directness, retractions/corrections and safe publication decisions for THS scientific content.
owner: The Hippie Scientist
---
# THS Evidence Integrity
Start by reading repo `AGENTS.md`, evidence-first decision-page standard, current source registry, claim policies and canonical data provenance. Research-only output never authorizes publishing.

## Claim evidence path
1. Define exact claim and outcome (human clinical, biomarker, mechanism, preclinical, observational, safety). Do not combine unrelated outcomes.
2. Resolve source ID/PMID/DOI to correct title, population, intervention/extract, comparator, sample, duration, outcome, results and conflicts. Distinguish duplicate reviews vs independent human trials. Inspect adverse/negative/null/subgroup evidence.
3. Check retractions, expressions of concern, corrigenda, and citation-context direction. Use authoritative source/record and optional installed research tools (Scite, Consensus, etc.) only as corroboration; no invented PubMed identity.
4. Classify `DIRECT_HUMAN`, `INDIRECT_HUMAN`, `OBSERVATIONAL`, `PRECLINICAL`, `MECHANISTIC`, `IN_VITRO`, `UNVERIFIED` with supporting IDs and precise eligible language; downgrade confidence where missing or disputed.
5. Maintain source→claim→paragraph/page/visual linkage, canonical identity + freshness/date, review signature and conflicting evidence; quarantine wrong PMID, misleading Grade A labels, false “0 human trials” metadata, phantom treatment conclusions and unsupported drug-interaction numbers.
6. Publish/promote only with existing human-science approval, workbook/source-of-truth compatibility, editorial quality and exact built-output check. A source verification tool result ≠ approval to publish.

## Safety and consumer claims
- Distinguish association from causation and mechanism from clinical outcomes. Avoid universal doses from a study dose; preserve population exclusions, adverse events and uncertainty.
- Check latest authoritative guidance, e.g., for child digital media refer to January 20, 2026 AAP `Digital Ecosystems, Children, and Adolescents` and its actual qualifiers, rather than relying on superseded policy.
- Correct citations publicly when needed; ensure broken or mislabelled source links aren't represented as PubMed links.

## Receipt
`claim_id | source_id | checked_on | design/population | result | evidence tier | contradictions | allowed wording | prohibited inference | reviewer | publish state`.
**Fail-closed rule:** if a source cannot be verified or is conflicting, quarantine the affected claim and block promotion until explicit source and reviewer evidence resolves it.