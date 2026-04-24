# Herb Monograph Projection Pipeline

This pipeline reads the `Herb Monographs` worksheet from `data-sources/herb_monograph_master.xlsx` and projects rows into a **frontend runtime schema** without mutating legacy datasets.

## Run

```bash
npm run data:project:monographs
```

Outputs are generated side-by-side under:

- `public/data/projections/monograph-runtime/herbs.json`
- `public/data/projections/monograph-runtime/herbs-summary.json`
- `public/data/projections/monograph-runtime/herbs-detail/*.json`

Archived migration note:

- The prior migration-era snapshot has been moved to `archive/legacy-data/public/data/projections/monograph-runtime/`.
- Files in `archive/legacy-data` are migration artifacts and are not part of the default production data path.

## Runtime field mapping

Source worksheet: `Herb Monographs`

- `name` <- `name`
- `slug` <- `slug` (fallback: slugified `name`)
- `scientificName` <- `scientificName`
- `summary` <- `summary`
- `description` <- `description`
- `mechanism` <- `mechanism`
- `mechanismTags` <- `mechanismTags` (split + lowercased + deduped)
- `activeCompounds` <- `activeCompounds` (fallback: `markerCompounds`), normalized to slug IDs
- `safetyNotes` <- `safetyNotes`
- `interactions` <- `interactions` (split + deduped array)
- `dosage` <- `dosage`
- `preparation` <- `preparation`
- `region` <- `region`

## Exclusions (intentionally not projected)

The pipeline excludes non-runtime columns such as:

- scoring: `score_confidence`, `score_evidence`, `score_citation`, `totalScore`
- editorial workflow and publish flags: `status`, `publishStatus`, `frontendReadyFlag`, `webCopyReadyFlag`, `publishBlocker`, `sourceLockFlag`
- QA/review metadata: `qaStatus`, `reviewStage`, `reviewStatus`, `reviewerName`, `reviewerRole`, `reviewerNotes`, `approvalTimestamp`
- history/change metadata: `lastModifiedTimestamp`, `changeSummary`, `historyEntries`, `reviewRound`, `rowReviewKey`

## Normalization behavior

- **Slug normalization**: strips diacritics/punctuation, lowercases, and converts separators to `-`.
- **Array normalization**: supports semicolon/comma/pipe/newline delimiters, removes junk values, and dedupes case-insensitively.
- **Null/empty handling**: empty, placeholder, or junk values are emitted as `null` for scalar fields and `[]` for arrays.
- **Compound normalization**: attempts name/id/slug matching against `public/data/compounds.json`; falls back to slugified source text.
