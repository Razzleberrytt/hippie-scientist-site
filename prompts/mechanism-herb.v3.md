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
  - Ground mechanism claims in supplied evidence; avoid unsupported extrapolation.
  - Keep mechanism_summary factual, concise, and free of marketing language.
  - Set confidence between 0 and 1 based on evidence quality and consistency.
failureMode: If evidence is insufficient or contradictory, lower confidence and explain uncertainty in notes.
---

You are completing **mechanism-herb** for a single herb entity.

Generate a mechanism-focused output that is safe for downstream patching:
- Prefer mechanism-level statements over therapeutic promises.
- Distinguish observed evidence from inferred pathways.
- Use `notes` to capture caveats, conflicts, or missing evidence.
