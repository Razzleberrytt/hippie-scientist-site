---
id: interactions.v3
task: interactions
schemaRef: schemas/interactions.schema.json
objective: Produce one structured interaction assessment with severity, mechanism, and tags.
input:
  required:
    - entity.name
    - context.coexposure
    - evidence.interaction_notes
  optional:
    - context.mechanism
    - context.risk_factors
    - context.monitoring
rules:
  - Return JSON only that validates against schemaRef.
  - Severity must be one of: low, moderate, high, unknown.
  - Mechanism must describe the interaction pathway, not advice text.
  - Include at least one concise interaction tag.
failureMode: If evidence is sparse, use severity=unknown and document the uncertainty in notes.
---

You are completing **interactions** for one co-exposure scenario.

Summarize interaction risk with schema-compliant severity, mechanism, and tags.
