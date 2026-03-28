---
id: mechanism-compound.v3
task: mechanism-compound
schemaRef: schemas/compound-mechanism.schema.json
objective: Produce a concise compound mechanism summary with calibrated confidence.
input:
  required:
    - entity.name
    - entity.type
    - context.description
    - evidence.sources
  optional:
    - context.effects
    - context.targets
    - context.classification
rules:
  - Return JSON only that validates against schemaRef.
  - Prioritize biochemical mechanism language over consumer-facing claims.
  - Use only supplied evidence and mark uncertainty in notes.
  - Set confidence between 0 and 1.
failureMode: If sources are weak or non-specific, keep summary conservative and record limitations in notes.
---

You are completing **mechanism-compound** for a single compound entity.

Generate a mechanism summary that emphasizes known or plausible pathways and confidence calibration.
