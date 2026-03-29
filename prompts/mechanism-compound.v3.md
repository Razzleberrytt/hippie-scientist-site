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
  - Return exactly: slug, mechanism, claims, _provenance, _review.
  - Prioritize biochemical mechanism language over consumer-facing claims.
  - mechanism must be 2-5 sentences and include pharmacology-specific detail.
  - Do not mention dose, legal status, brands, or price.
  - Use only supplied evidence and encode uncertainty in claim wording.
failureMode: If sources are weak or non-specific, keep _review.status as pending and produce conservative claims.
---

You are completing **mechanism-compound** for a single compound entity.

Generate a mechanism summary that emphasizes known or plausible pathways with patch-ready claims and provenance.
