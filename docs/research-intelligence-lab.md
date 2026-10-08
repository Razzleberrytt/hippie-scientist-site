# Research Intelligence Lab — pilot architecture and scientific boundary

**Status:** Feature PR #6406 in review, stacked on #6402. Not evidence-graded or verified as live until CI/merge/deployment.  
**Owner:** Research / editorial provenance.  
**Dataset:** 500 exact-verified PubMed records, waves 7001–7500, from the SHA-pinned source-register manifest; cumulative 7,435 unique PMIDs remain separately counted.

## Reader job

Use the same research graph to investigate source identity, cross-topic discovery, uncertain wording, within-inventory coverage, and questions that merit editorial review. Present the interface as an experimental editorial observatory: a high-contrast botanical research atlas that remains keyboard navigable and works on mobile.

This is not a supplement recommendation or clinical decision tool. Research-only references do not automatically count as validated human evidence; generated output cannot enter public grades, dosage recommendations, safety classifications, or published medical claims.

## One semantic contract, eight projections

| Instrument | Actual computed output | Explicitly **not** inferred |
| --- | --- | --- |
| Study DNA | PMID, verified title, year, journal, controlled phrase mentions with title/abstract provenance, study-type cue | Full clinical trial extraction, arm assignment, direction of effect, effect size, risk of bias, sample-size correctness |
| Contradiction Radar | Queue for opposite words **in titles** with matching named substance and outcome (zero is valid) | Scientific contradiction or actual competing results |
| Knowledge Frontier | Within-batch maps of substance/outcome/population/method/safety co-mentions and empty cells | Absence from global literature or comparative strength of evidence |
| Evidence Time Machine | Publication-year grouping, including unknown years | Historical evidence-grade shifts, consensus changes, or publication dates invented from source age |
| Semantic Voyages | At most three source-witnessed concept co-mention steps, each with PMID provenance | Causal or validated mechanistic pathway |
| Safety Intelligence | Substance and safety vocabulary in the same paper's title/abstract | Proven interaction, toxicity or safety profile |
| Ask the Evidence | Deterministic, conjunctive named-concept matching and PubMed links | Generated individualized medical answers or judgments about efficacy |
| Semantic Content Reactor | Source-backed research-question briefs chosen by a human editor | Publication, automatic claims, SEO volume without review |

The semantic foundation uses controlled vocabulary aliases and protected boundary matching. Shared terms are **textual** proximity only. Known false friends such as oxidative versus psychological stress are tested and kept separate. Every result and prompt must identify the scope and preserve source IDs.

## Runtime/build topology

- \`lib/research-semantic-network.ts\`: existing read-only verified-source ontology with named typed concepts, title/abstract receipts, paper similarity, exact source identity crossrefs, bounded witness paths.
- \`lib/research-intelligence-suite.ts\`: pure read-only projections and deterministic enquiry logic.
- \`app/research/intelligence/dataset.json/route.ts\`: static Next.js output, generated from pinned PubMed files at export, not a dynamic Cloudflare function.
- \`app/research/intelligence/page.tsx\`: light noindex entry, canonical self path.
- \`IntelligenceLab.tsx\` and CSS module: eight tabbed instruments, interactive controlled filters, source links, editorial selection, reduced-motion support. Intentionally loads rich content only on activation.
- Existing \`/research/\`, \`/research/source-register/\`, \`/learn/citation-explorer/\` preserve their established roles and URL semantics.

## Data lineage and publication firewall

1. Parent research manifest and receipts are authoritative for which 500 PMIDs can be used. Reject duplicate IDs and source-count mismatches.
2. Semantic extractor preserves literal title/abstract matches and never invents attributes for older 6,935 PMID-only records.
3. Public evidence dataset may be consulted strictly as a read-only whitelist for profile/source identity; no source-only record is promoted to editorial evidence.
4. Scientific statements require separate explicit evidence-review approval and claim/source reconciliation, not text co-mention.
5. No external paid subscription, model or credit is necessary for the deterministic graph and UI. Human expert review is still necessary for clinical synthesis.

## Validation and observed pilot measurements

\`npx tsx scripts/ci/validate-research-intelligence-suite.ts\` validates synthetic false-positive cases, genuine 500-source coverage, witness IDs, strict admission, method-only traversal exclusion, controlled vocabulary, and no automatic claim approval. The dedicated Source Register Integration workflow also runs full typecheck. Standard Fast UI, build, performance, SEO, accessibility, deployment and exact-head validation remain separate release gates.

Measured by the dedicated source-audit run on 2026-10-08: **500** fingerprints, **44** controlled concepts active in the batch, **1,593** explainable paper edges, **748** cross-topic edges, **22** named-substance coverage rows, **25** substance/safety vocabulary co-mention rows, **19** represented publication years, **65** editorial research ideas, **zero** qualifying opposite-title-wording pairs and **zero** auto-approved claims. All edges are textual links, not proven scientific relationships. Actual user/business performance is **Unknown**.

## Before broad automation: gated research-quality stages

1. Add scalable deduplicated source ingestion without broad index promotion; version each corpus and inspect retrieval quality.
2. Extract study arms, outcome measurements, population eligibility, exact dose/route/duration, comparator, adverse-event reporting and study design with evidence text spans and a review state. Do not attach unsupported details to a study.
3. Add comparator/population/outcome commensurability before declaring a contradiction or consensus update.
4. Build explicit audited claim-to-study/source relationships; keep relationship types \`mentions\`, \`studied\`, \`supports\`, \`refutes\`, \`unknown\` distinct and independently reviewed.
5. Introduce an editorial approval queue, structured source conflict checks and independently reproducible scientific QA; measure false-positive, false-negative and review disagreement rates.
6. Only then consider advanced evidence synthesis, time-series consensus comparisons, safety decision layers or automatically drafted narrative publications.

The eight current instruments are complete as **bounded discovery interfaces** when their exact release gates pass. They do not fulfill the separately governed ambitions in the six subsequent scientific-extraction/review stages.
