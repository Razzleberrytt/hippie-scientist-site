# Automated enrichment adjudication

## Purpose

`needs_review` is an execution state for the AI enrichment system, not a request for the repository owner to judge biomedical evidence.

The automated reviewer is responsible for resolving source admission, semantic compatibility, and scientific/editorial disposition far enough to reach a governed terminal outcome. The owner must not be asked to decide whether a paper matches an herb/compound, formulation, population, endpoint, or conclusion.

## Required evidence checks

For every adjudication task, independently inspect enough authoritative evidence to resolve these dimensions when applicable:

1. **Bibliographic identity** — PMID, DOI, title, authors/journal/year, canonical URL and publication identity converge.
2. **Entity/intervention identity** — the paper actually studies the herb, compound, preparation, drug, nutrient, organism, or combination claimed.
3. **Preparation / formulation / species / route** — monotherapy vs combination, extract/species/form, delivery route, and formulation boundaries are preserved.
4. **Population** — human/animal/in-vitro class and the studied population match the proposed proposition boundary.
5. **Endpoint** — the measured outcome supports the exact claim type; surrogate, biomarker, symptom, diagnosis, and performance endpoints are not interchangeable.
6. **Conclusion / direction** — positive, null, negative, mixed, subgroup-only, or uncertain findings are preserved exactly enough to prevent cherry-picking.
7. **Study design / source class / reliability** — classification follows repository source-class governance rather than title wording or optimistic inference.
8. **Publication integrity** — retraction, expression of concern, correction, withdrawal, supersession, and identity anomalies are checked when relevant.
9. **Claim boundary / overclaim risk** — no mechanism→clinical, preclinical→human, adjacent-population, combination→monotherapy, or studied-dose→consumer-dose inheritance.

## Evidence receipt required for auto-approval

A new AI adjudication cannot become promotion-eligible from five bare `matched` flags. The semantic attestation must include an evidence receipt:

- top-level `reviewer: "enrichment-adjudicator"`;
- valid ISO `reviewedAt`;
- `confidence: "high"` or numeric confidence `>= 0.85`;
- all five axes: `entity`, `preparation`, `population`, `endpoint`, `conclusion`;
- every axis contains a substantive `reason` (minimum 12 characters);
- every `matched` axis contains at least one `evidenceRefs[]` entry pointing to the source/receipt used to make the decision;
- `not_applicable` axes still require a substantive reason explaining why that dimension does not gate the proposition.

Example shape:

```json
{
  "reviewer": "enrichment-adjudicator",
  "reviewedAt": "2026-09-03T20:00:00.000Z",
  "confidence": "high",
  "entity": {
    "status": "matched",
    "reason": "The intervention is the exact canonical compound studied in the source.",
    "evidenceRefs": ["src_example"]
  },
  "preparation": {
    "status": "matched",
    "reason": "The staged statement preserves the extract/formulation boundary.",
    "evidenceRefs": ["src_example"]
  },
  "population": {
    "status": "matched",
    "reason": "The staged population matches the human participants in the study.",
    "evidenceRefs": ["src_example"]
  },
  "endpoint": {
    "status": "matched",
    "reason": "The source directly measured the endpoint described by the finding.",
    "evidenceRefs": ["src_example"]
  },
  "conclusion": {
    "status": "matched",
    "reason": "The staged direction preserves positive, null, mixed, and uncertainty details.",
    "evidenceRefs": ["src_example"]
  }
}
```

Existing findings that already passed the prior governed `approved_for_rollup` path are not forced to acquire retroactive AI receipts merely to remain valid. The stricter receipt requirement applies when automation substitutes for a pending scientific/editorial review.

## Decision policy

The reviewer may resolve an item to:

- automated approval only when the source is active/current, source evidence class is compatible, every proposition-critical semantic dimension is verified, and the evidence receipt above is complete;
- `rejected` / `not_promoted` when the source is real but does not support the proposed proposition;
- `quarantined` when source identity or semantic identity is mismatched or contaminated;
- an explicit unresolved hold only when the evidence remains genuinely ambiguous after the second-pass rule below.

Every decision must preserve evidence basis, dimension-level statuses, confidence, limitations, and reason codes. `unknown` must never be silently converted to `matched`.

## Second-pass rule

If the first pass cannot resolve a proposition-critical dimension:

1. re-check canonical bibliographic metadata and the primary paper/abstract;
2. inspect one independent authoritative source when useful (systematic review, regulatory source, registry, or publisher metadata);
3. search specifically for the unresolved identity/endpoint/formulation question rather than broadly repeating discovery;
4. if still unresolved, quarantine/hold that finding and continue unrelated research.

Do not ask Willie to decide the science. An unresolved scientific question is a system uncertainty, not an owner approval task.

## Independence and bot identity

Existing governed automated reviewer identities such as `source-review-bot` may be used where the current source-governance path already supports them. Semantic auto-approval uses the explicit `enrichment-adjudicator` receipt above. Automated adjudication must reuse existing source-registry, semantic-attestation, enrichment-governor, normalized-data, and release contracts rather than inventing a second factual authority.

## Throughput rule

A pending adjudication blocks **promotion of that finding**, not research liveness for the entire shard or workpack. The scheduler may continue non-conflicting research while the finding remains in the automated adjudication queue.

A hard mismatch/quarantine stops reuse of that contaminated source/proposition but likewise must not freeze unrelated shard work.

## Safety invariant

Automation increases review capacity; it does not weaken evidence standards. No user-facing efficacy, safety, dosing, interaction, pregnancy, pediatric, disease-treatment, grade, recommendation, monetization, or publication decision may bypass existing governed checks merely because the reviewer is automated.
