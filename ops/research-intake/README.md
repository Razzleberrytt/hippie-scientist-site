# THS rolling research intake

Each independent lane submits **1–25 genuinely new source-verified records** in one JSON manifest matching `schemas/research-lane-intake.schema.json`. Target is 25; fewer is valid when authoritative candidates are insufficient.

Lane ownership:
1. sleep, anxiety, stress, mood
2. cognition, focus, metabolic health
3. botanicals, pharmacology, mechanisms, interactions, safety/toxicology
4. withdrawal, dependence, NPS, harm reduction
5. contradictions, replication, emerging research

Use a short-lived branch named `research/intake/<lane>/<unique-run>` and write one manifest under `ops/research-intake/`. Pushing it invokes the globally serialized reservation controller. Never write the coordination registry directly.

The controller deduplicates against merged research, open research PRs and all existing reservations by PMID, normalized DOI and normalized title. Exact superseded duplicates already present on main may reconcile; divergent identity collisions fail closed.

Every 500 accepted reservations are frozen into the canonical five-part research receipt format on a new draft PR. Intake immediately rolls to the next active batch while the frozen PR undergoes independent semantic/scientific review. Source verification is not clinical admission.

A frozen batch cannot merge until its independent review receipt validates all 500 records, safety/interactions/limitations/uncertainty/overclaim controls pass, predecessor continuity is satisfied, and the exact-head repository workflows are green. The existing autonomous merge controller remains the sole merge executor.
