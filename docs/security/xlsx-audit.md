# xlsx Dependency Risk Audit

## Summary

`xlsx` is present as an application dependency, but the audited usage is limited to Node-based workbook/data tooling. I did not find an App Router, API route, browser component, user upload, request body, or remote URL path that passes user-controlled spreadsheet bytes into `xlsx` parsing.

Current risk level: **isolated build/local tooling risk**, not confirmed runtime remote-code or upload-input exposure.

## Dependency status

- `package.json` includes `xlsx` in `dependencies`.
- This audit does not change dependency versions, workbook parsing behavior, lockfiles, generated data, or runtime routes.

## Audited usage sites

Direct `xlsx` imports or requires found in source files:

| File | Usage | Input source | Exposure assessment |
| --- | --- | --- | --- |
| `scripts/data/workbook-parser.mjs` | Central adapter: `XLSX.readFile(filePath)` and `XLSX.utils.sheet_to_json(...)` | Caller-provided local filesystem path | Build/local tooling only. No request, upload, browser, or remote URL path found. |
| `scripts/data/build-runtime-from-workbook.mjs` | Uses `readWorkbook(...)` from the adapter after `resolveWorkbookPath(repoRoot)` and `assertWorkbookExists(...)` | Validated local workbook under `data-sources` | Main data build path. Local workbook source only. |
| `scripts/build-runtime-data.mjs` | Direct `XLSX.readFile(workbookPath)` and `sheet_to_json(...)` | `resolveWorkbookPath(repoRoot)` | Legacy/alternate data build script. Local workbook source only. |
| `scripts/export-workbook-to-json.mjs` | Direct `XLSX` import for workbook export pipeline | `resolveWorkbookPath(repoRoot)` | Local export script. No user-controlled runtime input found. |
| `scripts/import-xlsx-monographs.mjs` | Direct `XLSX` import for monograph import pipeline | `resolveWorkbookPath(repoRoot)` | Local import script. No user-controlled runtime input found. |
| `scripts/inspect-workbook.mjs` | Detects installed parser and uses `require('xlsx')` when selected | `resolveWorkbookPath(rootDir)` plus `assertWorkbookExists(...)` | Local inspection utility only. |
| `scripts/inspect-citation-import.mjs` | Reads `.xlsx`/`.csv` from fixed candidate paths | Fixed local candidate paths under `data/import` or `public/data/import` | Local inspection/import utility. No request, upload, browser, or remote URL path found. |
| `scripts/generate-monograph-projection.mjs` | Direct workbook parsing found by repository search | Local workbook/projection tooling | Local script usage only; no runtime path found. |
| `scripts/verify-workbook-import-reconciliation.mjs` | Direct workbook parsing found by repository search | Local workbook/reconciliation tooling | Local script usage only; no runtime path found. |
| `scripts/data/report-migration-parity.mjs` | Workbook parser/parity usage found by repository search | Local workbook/parser parity inputs | Local migration/parity tooling only. |
| `scripts/data/report-workbook-parser-coverage.mjs` | Workbook parser coverage usage found by repository search | Local workbook/parser coverage inputs | Local migration/report tooling only. |

Related files:

| File | Relevance |
| --- | --- |
| `scripts/workbook-source.mjs` | Resolves workbook path from `options.envPath`, `process.env.HERB_XLSX_PATH`, or default `data-sources/herb_monograph_master.xlsx`; rejects empty paths, HTTP/HTTPS URLs, paths outside the repository, and paths outside `data-sources`; asserts absolute path, `.xlsx` extension, file existence, and file type when `assertWorkbookExists(...)` is called. |
| `.env.example` | Documents `HERB_XLSX_PATH`; this is an operator/build-time configuration value, not browser input. |
| `docs/xlsx-migration-plan.md` | Existing migration planning document for parser replacement/parity work. |

## Runtime/user-controlled input assessment

No confirmed path was found where any of the following reach `xlsx` parsing:

- browser file input
- user upload endpoint
- request body
- multipart form parser
- remote URL fetch
- App Router route handler input
- server action input
- client component input

The current parsing surface appears to be local filesystem paths used by scripts. The most important build path is `npm run data:build`, which runs `scripts/data/build-runtime-from-workbook.mjs`; that script uses the workbook parser adapter and a local workbook path resolved by `scripts/workbook-source.mjs`. The primary resolver now rejects empty workbook paths, HTTP/HTTPS workbook URLs, and workbook paths outside the repository `data-sources` directory.

## Risk analysis

Because `xlsx` parses complex spreadsheet formats, it should still be treated as a higher-risk dependency than simple JSON/CSV readers. However, with the current call paths, exposure is limited to people or automation that can place or select local build input files.

Main residual risks:

1. A malicious or corrupted workbook committed to the repository or provided through build environment configuration could be parsed during local/CI data builds.
2. Some older scripts still import `xlsx` directly instead of going through `scripts/data/workbook-parser.mjs`, which weakens the adapter boundary and makes future migration harder.

## Recommendation

No emergency runtime patch is required based on this audit. Use one of these remediation paths in a future PR:

### Preferred: migrate to a maintained parser behind the adapter

- Keep `scripts/data/workbook-parser.mjs` as the parser boundary.
- Replace `xlsx` with a maintained parser such as `exceljs` in a dedicated migration PR.
- Preserve current workbook semantics exactly:
  - blank cells remain `''`
  - header normalization behavior remains stable
  - versioned sheet resolution remains stable
  - row object shape remains stable
  - deterministic JSON output ordering remains stable
- Run parity checks before removing `xlsx`.

### Added interim hardening: keep `xlsx` isolated

- Documented the xlsx boundary near the parser adapter and primary build usage: xlsx is allowed only in trusted local Node build/data scripts.
- Route all workbook reads through `scripts/data/workbook-parser.mjs`.
- Avoid adding new direct `xlsx` imports outside that adapter.
- Constrain workbook input paths to trusted local files under `data-sources`.
- Reject empty workbook path values and HTTP/HTTPS workbook URLs in `scripts/workbook-source.mjs`.
- Prefer default `data-sources/herb_monograph_master.xlsx` for CI.
- Treat `HERB_XLSX_PATH` as trusted maintainer/CI configuration only, never as user input.
- Do not parse spreadsheets from uploads, request bodies, remote URLs, or browser inputs with `xlsx`.
- Future runtime spreadsheet parsing must use a reviewed safer boundary.

## Security decision

Status: **documented, not blocked**.

The dependency should be migrated or further isolated, but no high-priority user-controlled runtime exposure was identified in this audit.
