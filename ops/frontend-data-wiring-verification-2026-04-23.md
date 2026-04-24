# Frontend data wiring verification (2026-04-23)

## Scope
Validated that published data artifacts are present and that frontend routes can consume the generated payloads used by runtime pages.

## 1) Data file existence and shape
- `public/data/herbs.json`
  - exists, parses as JSON array
  - record count: **740**
  - required fields present on all items checked (`slug`, `name`): **0 missing**
- `public/data/compounds.json`
  - exists, parses as JSON array
  - record count: **401**
  - required fields present on all items checked (`slug`, `name`): **0 missing**

## 2) Frontend loading paths
- Herb list/detail runtime loader uses:
  - list: `fetch('/data/herbs-summary.json')`
  - detail: `fetch('/data/herbs-detail/<slug>.json')`
- Compound list/detail runtime loader uses:
  - list: `fetch('/data/compounds-summary.json')`
  - detail: `fetch('/data/compounds-detail/<slug>.json')`

## 3) Field expectation alignment
- Herb summary normalization expects keys including `slug`, `name`, `scientificName`, `summary`, `mechanismTags`, `activeCompounds`, `region`.
- Compound summary normalization expects keys including `id`, `slug`, `name`, `summaryShort`, `description`, `effects`, `herbs`, `confidence` and optional metadata.
- Current summary payloads include these fields for sampled records.

## 4) Rendering simulation and slug resolution checks
- `herbs-summary.json` rows: **17**
- `compounds-summary.json` rows: **399**
- Herb detail coverage:
  - summary slugs missing a matching detail file: **0**
- Compound detail coverage:
  - summary slugs missing a matching detail file: **272**
  - sample missing slugs:
    - `syringaresnol-4-o-d-apiofuranosyl-1-2-d-glucopyranoside`
    - `object-object`
    - `2-4-5-trimethoxybenzaldehyde`
    - `5`
    - `7-hydroxybaruol`

## 5) Runtime/preview checks
Using `vite preview`:
- `/herbs` → HTTP 200
- `/herbs/ashwagandha` → HTTP 200
- `/compounds` → HTTP 200
- `/compounds/syringaresnol-4-o-d-apiofuranosyl-1-2-d-glucopyranoside` → HTTP 200 (SPA shell), but client-side detail fetch is expected to resolve to missing detail payload for many compound slugs per coverage check above.

## Conclusion
- **Data artifacts are valid and readable.**
- **Frontend is wired to summary/detail payloads (not directly to `herbs.json` / `compounds.json` for list/detail pages).**
- **Herb list/detail should render successfully for available governed summaries.**
- **Compound list should render, but many compound detail pages are expected to fail to resolve entity detail data due to summary→detail coverage gaps (272 slugs).**
