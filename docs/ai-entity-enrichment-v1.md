# AI Entity Enrichment v1

## Goal

Make canonical herb and compound profiles easier for AI search and answer systems to resolve, retrieve, and verify without creating duplicate HTML pages or inventing authority signals.

## Build outputs

The core runtime summary build now generates:

- `public/data/ai-entities/manifest.json`
- `public/data/ai-entities/herb/{slug}.json`
- `public/data/ai-entities/compound/{slug}.json`
- `ops/reports/ai-entity-completeness.json`
- `ops/reports/ai-entity-completeness.md`

Each sharded file is standalone JSON-LD. The canonical HTML profile remains the preferred citation target.

## Data included when available

### Identity

- Canonical THS entity ID and slug
- Canonical profile URL
- Common names, aliases, synonyms, abbreviations, and scientific name
- Category or compound class
- PubChem CID
- CAS number
- Wikidata ID
- ChEBI ID
- ChEMBL ID
- DrugBank ID
- InChIKey
- Molecular formula
- Canonical SMILES
- Verified external `sameAs` URLs derived from identifiers

### Evidence claims

Publishable governed enrichment is converted into atomic claim nodes for:

- Supported uses
- Unsupported or unclear uses
- Mechanisms
- Constituents
- Interactions
- Contraindications
- Adverse effects
- Dosage context
- Population-specific context
- Evidence conflicts
- Research gaps

Claim nodes preserve evidence class, evidence grade, population, strength notes, source IDs, and primary PMIDs when present.

### Citations

Sources are normalized from governed `sourceRefs`, profile `sources`, profile `references`, PMIDs, and claim-level primary PMIDs. The output preserves available DOI, PMID, URL, publication year, study type, evidence class, extraction confidence, reviewer, and sample size.

### Relationships

Governed related entities and existing related-herb/related-compound fields become typed internal relationships with canonical profile URLs and relationship notes.

### Safety and freshness

Artifacts include available safety summaries, safety level, interactions, contraindications, adverse effects, reviewer, last-reviewed date, editorial status, conflict state, and uncertainty notes.

## Profile discovery

`components/seo/SchemaGraphScript.tsx` detects canonical herb and compound entity nodes. It then:

1. Adds a `Dataset` node to the profile JSON-LD graph.
2. Connects the canonical entity to that dataset through `subjectOf`.
3. Emits an alternate `application/ld+json` link to the matching sharded artifact.

No duplicate HTML profile or canonical URL is created.

## Completeness score

Each profile receives a 100-point readiness score:

| Area | Weight |
| --- | ---: |
| Entity identity | 20 |
| Evidence and atomic claims | 25 |
| Citations and claim-source links | 20 |
| Typed relationships | 15 |
| Safety | 10 |
| Review freshness | 10 |

The report sorts profiles from weakest to strongest and lists missing fields. Use it to select enrichment waves instead of editing records randomly.

## Commands

The existing command now includes entity scoring when built runtime data is present:

```bash
npm run audit:ai-citations
```

Run the entity audit directly:

```bash
node scripts/ci/audit-ai-entity-completeness.mjs
```

Enable a future CI quality gate explicitly:

```bash
node scripts/ci/audit-ai-entity-completeness.mjs --fail-average-below=60
```

The first release is advisory. It does not fail CI unless a threshold is provided.

## Editorial and citation policy

- Canonical HTML pages are the user-facing citation targets.
- JSON-LD artifacts support entity resolution and claim verification.
- Only governed enrichment marked reviewed, approved, or published is serialized as atomic claims.
- The generator does not invent aliases, identifiers, citations, review dates, study details, or relationships.
- Fake ratings, review schema, hidden keyword text, and unsupported medical authority claims remain prohibited.
