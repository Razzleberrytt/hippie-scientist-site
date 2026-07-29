# Citation Growth Architecture

## Purpose

Turn The Hippie Scientist from a collection of strong pages into an interconnected, citation-ready scientific knowledge system. The goal is durable growth in cited pages and citations by making claims easier to discover, verify, extract, and connect without weakening scientific nuance.

## Principles

1. **Answer first, evidence immediately behind it.** Pages should state the defensible answer early, then show mechanism, limitations, and sources.
2. **One canonical concept per reusable page.** Repeated explanations such as vasoconstriction, rhabdomyolysis, delirium, and 5-HT2A agonism should eventually resolve to dedicated hub pages.
3. **Claims must carry uncertainty.** High, moderate, and limited confidence labels describe evidence strength, not certainty of individual outcomes.
4. **Internal links should represent scientific relationships.** Links should connect molecule → receptor → physiological process → clinical consequence → case study.
5. **Primary literature remains the trust anchor.** PMID, DOI, year, authors, and source URLs should be retained whenever available.
6. **No extraction bait.** Citation-ready summaries must remain accurate when quoted out of context.

## Content Primitives

### Scientific Takeaways

A reusable MDX component containing three to six atomic claims. Each claim may include:

- confidence level,
- a short qualifying context,
- language that remains defensible when extracted independently.

Do not use this block for promotional conclusions or unsupported recommendations.

### Definition Pages

Definition pages should answer one canonical question, such as:

- What is rhabdomyolysis?
- What is receptor agonism?
- Why can vasoconstriction cause ischemia?
- What distinguishes delirium from a psychedelic state?

Each definition page should include a concise definition, mechanism, why it matters, common misconceptions, related molecules and cases, evidence limitations, and sources.

### Cornerstone Hubs

Cornerstone hubs organize clusters rather than duplicating every child page. Initial candidates:

- Psychedelic toxicology
- Hallucinogen emergencies
- Serotonin and 5-HT receptors
- Dopamine and movement
- NMDA receptors and dissociation
- Drug-induced hyperthermia

### Failure Chains

Failure Chains remain forensic case studies. Each should link outward to the canonical pages for the molecule, receptor or pathway, physiological complications, and related cases.

## Article Metadata Contract

Future article metadata should support:

- `relatedSlugs`: intentionally curated article relationships,
- `keyTakeaways`: short atomic claims,
- `citationQuestions`: user questions the page directly answers,
- `canonicalConcepts`: normalized concepts for graph generation,
- `lastReviewed`: a genuine review date only,
- `evidenceGrade`: concise evidence-level language.

Metadata must never imply a review or credential that did not occur.

## Internal-Linking Rules

1. Prefer a specific canonical concept page over a generic category page.
2. Add links where the relationship is meaningful in the sentence; avoid keyword stuffing.
3. A mature article should generally connect to:
   - two to five canonical concepts,
   - one or more molecule or receptor pages,
   - two or more related articles or cases.
4. Hub pages should link down to every major child page; child pages should link back to their hub.
5. Broken, redirected, and orphaned links remain CI failures or audit findings.

## Structured Data

Article pages should continue emitting Article and MedicalWebPage data only when supported. Planned additions:

- FAQPage only when the FAQ is visibly rendered,
- DefinedTerm for canonical definitions,
- ItemList for visible takeaways where useful,
- explicit citation entries using source URLs and identifiers,
- BreadcrumbList through existing breadcrumb infrastructure.

Structured data must describe visible content and may not manufacture hidden claims.

## Measurement

Track monthly:

- total citations,
- cited pages,
- citations per cited page,
- number of new pages first cited,
- citation concentration among the top ten pages,
- orphan-page count,
- average intentional internal links per cornerstone article,
- percentage of articles with primary references,
- percentage of articles with visible takeaways and uncertainty language.

A healthy system increases cited pages without allowing one page to dominate all citations.

## Rollout

### Phase 1 — Extraction primitives

- Scientific Takeaways component
- authoring template
- metadata contract
- citation-readiness audit

### Phase 2 — Canonical concepts

- launch the first ten definition pages
- connect existing Failure Chains to those concepts
- create the psychedelic toxicology cornerstone hub

### Phase 3 — Knowledge graph

- normalize concepts in frontmatter or generated data
- generate related-content edges
- add orphan and link-density auditing
- expose browsable concept relationships

### Phase 4 — Continuous optimization

- review Bing citation exports monthly
- identify pages with impressions but no citations
- improve answer-first summaries and source coverage
- expand clusters based on real citation demand rather than raw publishing volume

## Acceptance Criteria for Phase 1

- MDX authors can add a visible, accessible Scientific Takeaways block without imports.
- The component supports optional confidence and context per claim.
- A copyable authoring template exists.
- The architecture clearly separates current implementation from later graph and hub work.
- Existing content continues to compile without adopting the new fields immediately.
