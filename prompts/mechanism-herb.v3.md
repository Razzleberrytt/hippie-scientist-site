---
id: mechanism-herb.v3
task: mechanism-herb
schemaRef: schemas/herb-mechanism.schema.json
objective: Produce a concise herb mechanism summary with calibrated confidence.
input:
  required:
    - entity.name
    - entity.type
    - context.description
    - evidence.sources
  optional:
    - context.effects
    - context.preparation
    - context.interactions
rules:
  - Return JSON only that validates against schemaRef.
  - Return exactly: slug, mechanism, claims, _provenance, _review.
  - Ground mechanism claims in supplied evidence; avoid unsupported extrapolation.
  - Keep mechanism factual, concise, and free of marketing language.
  - mechanism must be 2-4 sentences and include pharmacology-specific detail.
  - Do not mention dose, legal status, brands, or price.
failureMode: If evidence is insufficient or contradictory, keep _review.status as pending and encode uncertainty conservatively in mechanism claims.
---

You are completing **mechanism-herb** for a single herb entity.

Generate a mechanism-focused output that is safe for downstream patching:
- Prefer mechanism-level statements over therapeutic promises.
- Distinguish observed evidence from inferred pathways in the wording of each claim.
- Every claim must include a clm_ id and src_ references.
