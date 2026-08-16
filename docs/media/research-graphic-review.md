# Research graphic review and promotion

Generated share cards and charts are **review artifacts**, not public assets. `scripts/media/build-research-graphics.mjs` writes candidate SVG/PNG files to `artifacts/research-graphics/` from structured site data. That generator covers ingredient cards, comparison cards, evidence-change cards, and evidence charts.

A graphic may move into `public/media/research/` only after a human reviewer records an approval in `data/media/research-graphic-reviews.json` and verifies all four gates:

- `evidenceVerified`: every displayed grade, change, comparison label, and numeric/data statement matches the current canonical evidence data.
- `attributionVerified`: The Hippie Scientist attribution and any required source attribution are present and accurate.
- `destinationVerified`: the card points to the correct canonical human-readable page.
- `visualVerified`: the rendered graphic has been visually inspected for clipping, legibility, misleading emphasis, and missing caveats.

Example review record:

```json
{
  "graphic": "ingredient-ashwagandha.png",
  "reviewer": "Human reviewer name",
  "reviewedAt": "2026-08-15",
  "status": "approved",
  "evidenceVerified": true,
  "attributionVerified": true,
  "destinationVerified": true,
  "visualVerified": true,
  "note": "Verified against the current public profile and evidence data."
}
```

Run `node scripts/media/promote-reviewed-research-graphics.mjs --check` to validate the registry without copying files. Run it without `--check` only when intentionally promoting approved assets. The resulting public manifest preserves reviewer/date provenance beside the PNG/SVG paths and source URL.

Do not create an approval record merely to satisfy CI. A missing approval means the graphic remains an internal review artifact, which is the intended safe default.
