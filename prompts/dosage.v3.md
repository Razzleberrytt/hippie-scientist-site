---
id: dosage.v3
task: dosage
schemaRef: schemas/dosage.schema.json
objective: Extract a structured dosage range from provided context.
input:
  required:
    - entity.name
    - context.route_candidates
    - evidence.dosage_mentions
  optional:
    - context.population
    - context.form
    - context.safety_notes
rules:
  - Return JSON only that validates against schemaRef.
  - Ensure range.low <= range.high and both are non-negative.
  - Keep route and unit explicit and normalized.
  - Put uncertainty, special populations, and qualifiers in notes.
failureMode: If dosage data is ambiguous or incomparable, return conservative values with explanatory notes.
---

You are completing **dosage** for one entity.

Transform dosage evidence into normalized range, unit, and route fields suitable for schema validation.
