---
id: interactions.v3
task: interactions
schemaRef: schemas/interactions.schema.json
objective: Produce interaction tags and herb-drug interaction records with severity/evidence grading.
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
  - interactionTags and all nested tags must use only the controlled vocabulary enum values.
  - "Each interaction severity must be one of: mild, moderate, severe, contraindicated."
  - "Each interaction evidence must be one of: theoretical, anecdotal, case_report, clinical."
  - "Maximum interactions per payload: 8."
failureMode: If evidence is sparse, prefer theoretical/anecdotal with explicit notes; never invent verification status.
---

You are completing **interactions** for herb-drug safety review.

Return structured interactionTags plus interaction entries with schema-compliant severity, evidence, mechanism, and notes.
