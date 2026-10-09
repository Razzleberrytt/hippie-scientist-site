# THS rolling research intake

Each independent lane submits **1–25 genuinely new source-verified records**. Two governed intake forms are supported:

1. **Full manifest** — matches `schemas/research-lane-intake.schema.json` and already contains source identity plus structured research fields.
2. **PMID seed envelope** — matches `schemas/research-lane-intake-seed.schema.json` and contains only lane identity plus 1–25 PMIDs. The reservation workflow hydrates exact PubMed title, abstract, DOI, journal/publication metadata and conservative fail-closed placeholders inside GitHub before normal validation and reservation.

The seed path is the preferred recovery path when an external chat/tool surface cannot safely persist a full biomedical manifest. It reduces write-surface fragility without weakening scientific gates. Seed hydration verifies **source identity only**; population, intervention, outcomes, safety interpretation, conclusions, interactions and semantic relationships remain explicitly pending independent scientific review.

Lane ownership:
1. sleep, anxiety, stress, mood
2. cognition, focus, metabolic health
3. botanicals, pharmacology, mechanisms, interactions, safety/toxicology
4. withdrawal, dependence, NPS, harm reduction
5. contradictions, replication, emerging research

Use a short-lived branch named `research/intake/<lane>/<unique-run>` and write one JSON intake file under `ops/research-intake/`. For ordinary external/manual pushes, the `Research lane intake` push workflow invokes the globally serialized reservation controller. **GitHub Actions pushes made with the default `GITHUB_TOKEN` do not start other push-triggered workflows.** Therefore the native hourly Lane 4 job pushes its unique seed branch, then invokes the **same existing controller exactly once** under the shared global concurrency group. If that reservation fails after the push, the committed seed remains eligible for the bounded scheduled replay path. Neither path writes the registry directly or bypasses global collision checks; they must never act as simultaneous authorities.

Minimal seed example:

```json
{
  "schema_version": 1,
  "seed_only": true,
  "lane": 4,
  "lane_focus": "withdrawal-dependence-nps",
  "research_only": true,
  "pmids": ["12345678"]
}
```

For seed envelopes, GitHub fetches PubMed XML directly using NCBI EFetch and fails closed if a PMID lacks a usable title or abstract. Hydration deliberately does not infer a positive/negative conclusion or clinical recommendation. It produces `SOURCE_VERIFIED` research-only records whose semantic fields remain pending independent review.

The controller deduplicates against merged research, open research PRs and all existing reservations by PMID, normalized DOI and normalized title. Exact superseded duplicates already present on main may reconcile; divergent identity collisions fail closed.

Every 500 accepted reservations are frozen into the canonical five-part research receipt format on a new draft PR. Intake immediately rolls to the next active batch while the frozen PR undergoes independent semantic/scientific review. Source verification is not clinical admission.

A frozen batch cannot merge until its independent review receipt validates all 500 records, safety/interactions/limitations/uncertainty/overclaim controls pass, predecessor continuity is satisfied, and the exact-head repository workflows are green. The existing autonomous merge controller remains the sole merge executor.
