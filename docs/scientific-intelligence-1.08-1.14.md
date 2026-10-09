# Scientific Intelligence Suite · 1.08–1.14 (research-only)

Canonical interface: /research/intelligence/ → select verified PMID → Twelve connected research capabilities.
Implementation is deterministic and static-export compatible. It consumes the existing 1.05 pinned study index, eight-instrument 1.06 relay, and review-only 1.07 downstream fabric. It does not introduce a second corpus, runtime database, API credit requirement, or new clinical authority.

## Functional integration by version

| Version | Engine | Code | Current output |
| --- | --- | --- | --- |
| 1.08 | Claim DNA | scientific-intelligence-foundations.ts | Publication-bound intervention, population, comparator and outcome descriptors, witnesses and explicit unknowns |
| 1.08 | Trial Lineage Detective | scientific-intelligence-foundations.ts | Exact PMID/DOI citation aliases, conflict quarantine; trial/cohort independence remains unknown without enrollment identifiers |
| 1.09 | Evidence Comparability Engine | scientific-intelligence-foundations.ts | Pairwise indexed intervention, population, comparator and outcome differences; prevents unreviewed pooling |
| 1.09 | Research Integrity Radar | scientific-intelligence-foundations.ts | Missing metadata, identity conflicts and corrections-status-unverified review flags |
| 1.10 | Hypothesis Forge | scientific-intelligence-discovery.ts | Bounded falsifiable question candidates from exact source vocabulary, never claims of efficacy |
| 1.10 | Counterfactual Evidence Laboratory | scientific-intelligence-discovery.ts | Source-removal sensitivity of the bibliography graph, explicitly not a clinical effect recalculation |
| 1.11 | Autonomous Research Missions | scientific-intelligence-discovery.ts | Local deterministic checks, prioritized research questions and explicit external review steps, no fake background agents |
| 1.12 | Citation Constellations | scientific-intelligence-discovery.ts | Exact reviewed citation crossrefs separated from lexical neighboring PMIDs |
| 1.12 | Mechanism-to-Human Evidence Bridge | scientific-intelligence-discovery.ts | Review-required cross-domain boundary, no mechanism or human efficacy asserted from bibliographic snippets |
| 1.13 | Living Evidence Review Compiler | scientific-intelligence-review.ts | Reproducible revision key and source-linked review draft with unresolved evidence questions |
| 1.13 | Scientific Adversarial Review Arena | scientific-intelligence-review.ts | Three independent deterministic methods, provenance, and safety veto reviews |
| 1.14 | Scientific Intelligence Calibration Lab | scientific-intelligence-review.ts | 13 executable case invariants, 500 pinned PMID corpus checks, public no-autopublish boundary |

All 12 are orchestrated by scientific-intelligence-suite.ts and inspected on the same selected PMID in ResearchIntelligenceClient.tsx. The existing reviewed citation/directional claims remain independently governed; no source co-mention is promoted into a clinical claim. Receipts display missingness and constraints.

## Explicit unimplemented upstream dependencies

- Live publisher/Crossmark/PubMed correction and retraction checks are **not** present; no claim of live integrity surveillance.
- ClinicalTrials.gov and other registry-level trial lineage, cohort matching and trial independence are **not** present; citation ID equality is only publication identity.
- Full-text extraction of doses, formulations, effect sizes and clinical conclusions is **not** present; unavailable fields remain null and cannot support evidence synthesis.
- External autonomous retrieval, peer agents, longitudinal review scheduling and calibrated empirical scientific truth tests are **not** present. Mission execution here is limited to reproducible local source checks; adversarial checks are distinct deterministic audit rules.
- A passing calibration guarantees consistency of internal source, release and interpretation contracts, **not** validity of medical conclusions.

Those integrations require independently authorized source feeds and review governance. Until then they fail closed rather than fabricate outputs.

## CI and release requirements

1. Run npx tsx scripts/ci/validate-research-intelligence-studio.ts. It exercises all twelve capabilities on fixture cases with forged/unknown source IDs, then calibrates all 500 exact verified intake PMIDs.
2. Run npm run typecheck, npm run lint, npm run check:fast and npm run build.
3. Check all required pull-request CI checks against the exact current head and base, including publication/SEO/source/claims drift, UI and build checks.
4. Merge in dependency order: 1.05 → 1.06/1.07 → 1.08–1.14. Verify main CI and production receipt before claiming deployment.
5. Test at least one exact PMID case visually on desktop and mobile; inspect twelve expandable receipts and active calibration status.

## Engineering contracts

- Never infer a finding, evidence grade, risk/safety status or causality from source vocabulary, neighboring papers or the title/abstract.
- Any cross-publication join must identify exact source, independently reviewed citation identity or explicitly labeled lexical navigation; no fuzzy evidence-authority joins.
- Source-signature mismatches, unknown PMIDs, and fabricated citation IDs reject case execution.
- No uncontrolled paid dependencies, runtime network joins, clinical promotion, auto-publishing, or mutation of verified source data.
