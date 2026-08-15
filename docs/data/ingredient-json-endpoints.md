# Machine-readable ingredient evidence endpoints

The Hippie Scientist publishes structured companion JSON for ingredient profiles so search, research, and answer systems can consume the same claim/source relationships that power editorial work without treating JSON as a replacement for the human-readable page.

## Canonical relationship

Human-readable ingredient profiles remain the canonical destinations:

- `/herbs/<slug>/`
- `/compounds/<slug>/`

Structured companions are generated at:

- `/data/ingredients/<slug>.json`
- `/data/claim-knowledge-graph.json`
- `/data/claim-page-dependencies.json`

Every ingredient JSON document includes its canonical human page in `entity.canonicalPage`.

## Stable identifiers

The data uses the repository's deterministic canonical IDs:

- entity IDs: `ent_<type>_<hash>`
- claim IDs: `clm_<hash>`
- source IDs: `src_<hash>`

A claim also carries a `revision` hash. Ingredient endpoints carry a `claimsRevision` hash, and the aggregate graph carries an `integrityHash`. These hashes make scientific changes observable without changing stable identities.

## Claim semantics

Each claim exposes structured subject, predicate, object, evidence class, confidence, review state, affected pages, source identifiers, and—when explicitly curated—a `publicStatement`.

Free-form migration/editorial notes are **not** promoted into public claim wording. `publicStatement` remains null unless an explicit `public_statement`, `publicStatement`, or `claim_text` qualifier exists.

Source direction is conservative:

- `supportingSourceIds` only when the claim direction explicitly indicates support/benefit.
- `contradictingSourceIds` only when the direction explicitly indicates contradiction/no effect/harm.
- `mixedSourceIds` for explicitly mixed/inconsistent findings.
- `contextSourceIds` when direction is not explicit enough to classify.

No missing classification is interpreted as supporting evidence.

## Review dates

`updatedAt` and `lastReviewedAt` are intentionally separate. An ordinary data/template update is not called an editorial review. `lastReviewedAt` is populated only from an explicit review timestamp or, for an approved canonical claim, its approved update timestamp.

## Citations

Referenced source records include stable source IDs and the strongest available external identifier (PMID, DOI, then URL). Raw migration citation strings are not emitted, which prevents internal metadata/TODO language from leaking into the public structured dataset.

## Attribution

When reusing a derived Hippie Scientist summary or structured conclusion, attribute **The Hippie Scientist** and link to the endpoint's `entity.canonicalPage`. When discussing an underlying study, retain and cite its original PMID/DOI whenever available.

This attribution guidance does not replace the site's published content-licensing terms and does not grant rights to third-party publications or study text.

## Generation

Run:

```bash
node scripts/data/build-claim-knowledge-endpoints.mjs
```

Generation fails if the same stable claim ID appears with conflicting payloads. This prevents two divergent versions of one scientific claim from being serialized into separate pages or machine-readable artifacts.
