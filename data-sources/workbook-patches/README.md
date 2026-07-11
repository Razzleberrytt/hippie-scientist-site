# Reviewable workbook patches

This directory stores small, source-backed proposals for editing `Entity_Master` in
`data-sources/herb_monograph_master.xlsx`.

The goal is to let research tools and language models **draft** enrichment changes
without giving them permission to regenerate or silently rewrite the binary workbook.
The workbook remains the source of truth, and every proposed cell edit is visible in
Git review.

## Safety model

Each JSON patch must include:

- a stable patch ID and status;
- exact `slug` + `column` targets;
- the expected current cell value;
- the proposed new value;
- confidence and rationale;
- one or more real DOI-backed sources;
- an explicit human-review flag for dosage, safety, interaction, and evidence-grade fields.

The runner rejects:

- stale patches whose expected value no longer matches the workbook;
- unknown slugs or columns;
- duplicate edits;
- malformed or missing DOI references;
- governance and publishing-control edits;
- dosage/safety/evidence-risk edits that are not marked for human review;
- write attempts while a patch remains in `proposal` status.

## Validate a proposal

Validation is read-only and is the default:

```bash
node scripts/data/apply-workbook-patch.mjs \
  --patch data-sources/workbook-patches/citicoline-scite-pilot.json
```

Validate every proposal:

```bash
node scripts/ci/validate-workbook-patches.mjs
```

GitHub Actions runs the same validation whenever the workbook, patch files, or patch
infrastructure changes.

## Approve and apply

A human reviewer must first change the patch status from `proposal` to `approved`.
Patches containing dosage, safety, interaction, contraindication, evidence-grade, or
risk-of-bias fields also require the explicit acknowledgement flag.

Write to a review copy:

```bash
node scripts/data/apply-workbook-patch.mjs \
  --patch data-sources/workbook-patches/citicoline-scite-pilot.json \
  --apply \
  --approve-human-review \
  --out /tmp/herb_monograph_master.review.xlsx
```

After review, an approved patch can be applied atomically in place:

```bash
node scripts/data/apply-workbook-patch.mjs \
  --patch data-sources/workbook-patches/citicoline-scite-pilot.json \
  --apply \
  --approve-human-review \
  --in-place
```

Then run the normal workbook verification path:

```bash
npm run workbook:roundtrip-test
npm run data:build:core
npm run guard:source-of-truth
npm run validate:evidence-language
```

Review the workbook and generated-data diff before committing. Once applied and
verified, either remove the proposal or mark it `applied` in the same pull request.

## Editorial rules

- Never fabricate a DOI, PMID, study result, or safety claim.
- Do not infer a universal benefit from a single population or branded-product trial.
- Describe trial doses as studied regimens, not personal recommendations.
- Keep evidence grades, publishing controls, and restricted-substance governance under
  explicit human control.
- Prefer systematic reviews and randomized human studies, while preserving neutral or
  conflicting findings in the rationale.
