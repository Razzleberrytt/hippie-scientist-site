# Workbook Parsing Threat Model

## Accepted workbook sources

- Default canonical source: `data-sources/herb_monograph_master.xlsx`.
- Optional explicit override: `HERB_XLSX_PATH` pointing to a local `.xlsx` file.
- External paths are blocked unless `ALLOW_EXTERNAL_WORKBOOK_PATH=true` is explicitly set.

## Forbidden workbook sources

- HTTP/HTTPS workbook URLs.
- Empty path values.
- Non-`.xlsx` files.
- Missing files, non-files, or zero-byte files.
- Generated artifacts in `public/data` as canonical workbook source (`workbook-herbs.json`, `workbook-compounds.json`).

## User uploads

- User-uploaded workbook parsing is **not supported**.
- No App Router/API upload endpoint is used to pass user-provided XLSX data into parser code.

## Parsing lifecycle

- Parsing occurs in Node scripts used for data generation, validation, and workbook tooling.
- Parsing is not part of request-time runtime for `/herbs/:slug`, `/compounds/:slug`, `/goals/:slug`, or other site routes.

## xlsx risk notes

- `xlsx` currently reports a high-severity advisory in `npm audit` with no upstream fix available in the current package line.
- In this repository, parser input is restricted to trusted local workbook sources and validated before parsing.

## Compensating controls

- Canonical workbook path resolution centralized in `scripts/workbook-source.mjs`.
- Explicit rejection of remote workbook URLs.
- Explicit rejection of out-of-scope paths unless `ALLOW_EXTERNAL_WORKBOOK_PATH=true`.
- Extension/type/existence/non-empty checks before parsing.
- CI gate: `npm run validate:workbook-source` and `npm run guard:source-of-truth`.

## Operational guidance for contractors

- Do not parse workbooks from browser uploads, request bodies, or remote URLs.
- Keep workbook authority in `data-sources/herb_monograph_master.xlsx` unless a reviewed exception is required.
- If using `HERB_XLSX_PATH` for a one-off trusted local workbook, prefer paths under `data-sources/` and avoid checking secrets into the repository.
- If an external trusted workbook is required for a controlled run, set `ALLOW_EXTERNAL_WORKBOOK_PATH=true` only for that run and clear it immediately after.
