# Enrichment editorial workflow and publish gating

This workflow governs when normalized enrichment can appear as public research content.

Source policy reference: `docs/enrichment-source-policy.md` is the canonical evidence hierarchy for all herb/compound enrichment prompts.

## Editorial states

Use one of these states in `editorialStatus`:

- `draft` — authoring only; internal notes and partial extraction.
- `needs_review` — contractor completed initial extraction and requests editorial review.
- `reviewed` — reviewer checked structure/provenance but not approved for publish.
- `in-review` — active editorial/safety review in progress.
- `approved` — eligible for publish if all readiness gates pass.
- `published` — currently approved and actively used in public enrichment output.
- `blocked` — explicitly blocked due to quality/provenance/safety concerns.
- `needs-update` — previously reviewed, now stale or requires revision before publish.
- `deprecated` — retired entry; should not be published.

## Minimum requirements for publishable enrichment

An enrichment row is publishable only when all checks pass:

1. `active=true`.
2. `editorialStatus` is publish-allowed (`approved` or `published`).
3. `reviewer` and `reviewedAt` are present.
4. `sourceId` resolves to source registry metadata.
5. source is active and not `withdrawn`/`superseded`.
6. no validation errors (schema/domain/duplicate rules).
7. weak evidence classes (`preclinical-mechanistic`, `traditional-use`) include `uncertaintyNote`.
8. when evidence is weak/conflicting at page level, conflict/uncertainty labeling must be present.

## What blocks publish

The gate blocks or downgrades output for:

- unreviewed or non-publish editorial states;
- missing reviewer metadata;
- missing or inactive provenance sources;
- withdrawn/superseded sources;
- unresolved validation failures;
- weak/conflicting evidence without required uncertainty/conflict labeling;
- deprecated/blocked/inactive rows.

## What can remain internal-only

The following are valid internal states and **must not** be rendered as authoritative public claims:

- `draft`, `needs_review`, `reviewed`, `in-review`, `needs-update`, `blocked`, `deprecated`.

## Reports and verification

- Readiness report: `ops/reports/enrichment-editorial-readiness.json`
- Gate command: `npm run verify:enrichment-editorial`
- Build verification includes this gate via `postbuild` and `verify:build`.

The gate fails closed: partially blocked entities cannot expose public enriched sections.
