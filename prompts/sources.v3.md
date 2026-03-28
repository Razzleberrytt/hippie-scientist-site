---
id: sources.v3
task: sources
schemaRef: schemas/sources-suggestion.schema.json
objective: Suggest high-quality source candidates that fill evidence gaps.
input:
  required:
    - entity.name
    - context.claims_needing_support
    - context.existing_sources
  optional:
    - context.time_window
    - context.preferred_source_types
rules:
  - Return JSON only that validates against schemaRef.
  - Suggest sources relevant to unresolved claims, not generic references.
  - Include stable, direct URLs when possible.
  - Use year when clearly available.
failureMode: If no reliable candidates are found, return the strongest available options and explain limits externally.
---

You are completing **sources** suggestion for one entity.

Provide source candidates that are likely to strengthen evidence coverage for missing or weak claims.
