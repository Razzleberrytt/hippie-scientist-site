# Citation Integrity Roadmap

## Objective

Build a citation system that improves:

- scientific trust
- editorial consistency
- runtime validation
- contradiction awareness
- long-term maintainability

## Current state

The platform currently relies primarily on:

- workbook-driven content
- manual citation handling
- editorial interpretation

## Long-term goal

Move toward:

- normalized citation structures
- citation-aware runtime validation
- contradiction tracking
- freshness monitoring
- evidence confidence weighting

## Citation hierarchy

Preferred order:

1. Meta-analyses
2. Human randomized controlled trials
3. Other human evidence
4. Observational evidence
5. Animal evidence
6. In vitro evidence
7. Traditional/anecdotal evidence

## Runtime citation requirements

Research-heavy content should eventually support:

```txt
citation_id
pmid
doi
study_type
publication_year
confidence_weight
limitations_summary
```

## Future validation goals

Validation should eventually detect:

- malformed PMIDs
- malformed DOIs
- duplicate citations
- unsupported certainty language
- evidence-tier mismatch
- stale high-risk content

## Contradiction handling

The system should support:

- conflicting findings
- mixed evidence
- weak replication
- low sample-size concerns
- extract-standardization concerns

## Freshness policy

Some topics require more frequent review:

High-risk/high-change topics:

- longevity compounds
- hormonal compounds
- aggressive biohacking trends
- rapidly changing regulatory topics

More stable topics:

- foundational minerals
- broad nutrition education
- low-volatility safety guidance

## Important principle

The goal is not to simulate certainty.

The goal is:

- transparent interpretation
- structured uncertainty
- evidence-aware communication
- trust accumulation over time
