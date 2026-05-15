# Public JSON Payload Audit

## Summary

This audit reviews references to large `public/data/**` JSON payloads and classifies the current usage patterns by execution surface.

This PR is intentionally docs-only. It does not modify generated data, runtime data loading, route behavior, dependencies, or lockfiles.

## High-level findings

- Several active pages and libraries still reference broad generated datasets.
- The highest-risk browser payload pattern found is `app/search/page.tsx`, a client component that statically imports full `public/data/compounds.json` and `public/data/herbs.json`.
- The main App Router server/static data loader reads broad datasets from disk in `src/lib/runtime-data.ts`. In static export this affects build/static generation payload work, not direct browser fetches by itself.
- Client hook loaders in `src/lib/herb-data.ts` and `src/lib/compound-data.ts` fetch summary indexes and route-specific detail JSON from `/data/**` in the browser.
- `lib/semantic-runtime.ts` imports full `public/data/compounds.json` at module scope. No direct import sites were found during this audit, but it should be treated as a bundle-risk helper if imported by client code later.
- No active references were found for `/data/graph/nodes.json` or `/data/graph/relationships.json`.
- `herbs_combined_updated.json` appears referenced only by scripts/tooling checks, not active browser routes.

## Audited usage matrix

| Payload | Usage sites found | Classification | Notes |
| --- | --- | --- | --- |
| `public/data/herbs.json` | `app/search/page.tsx`; `src/lib/runtime-data.ts`; scripts/tooling | Client-side broad import and server/static read | Search imports the full file into a client page. Runtime-data reads it from disk during server/static generation and merges with summary data. |
| `public/data/compounds.json` | `app/search/page.tsx`; `lib/semantic-runtime.ts`; `src/lib/runtime-data.ts`; scripts/tooling | Client-side broad import, module-scope import risk, and server/static read | Search imports the full file into a client page. Semantic runtime imports the full payload at module scope. Runtime-data reads it from disk during server/static generation. |
| `/data/herbs-summary.json` | `src/lib/herb-data.ts` | Client-side summary fetch | Used by hooks and canonical slug resolution. This is broad but summary-oriented rather than full detail payload loading. |
| `/data/compounds-summary.json` | `src/lib/compound-data.ts` | Client-side summary fetch | Used by hooks and canonical slug resolution. This is broad but summary-oriented rather than full detail payload loading. |
| `/data/herbs-detail/{slug}.json` | `src/lib/herb-data.ts` | Client-side route/detail fetch | Route-specific detail loading by slug after summary/canonical resolution. Lower risk than loading all detail records. |
| `/data/compounds-detail/{slug}.json` | `src/lib/compound-data.ts` | Client-side route/detail fetch | Route-specific detail loading by slug after summary/canonical resolution. Lower risk than loading all detail records. |
| `public/data/stacks.json` | `app/stacks/page.tsx` | Static import in App Router page | Page imports the full stacks payload. Depending on static export bundling, this may affect page payload size for `/stacks`. |
| `public/data/herbs_combined_updated.json` | scripts/tooling only | Build/tooling | No active browser route usage found. Keep out of client imports. |
| `/data/graph/nodes.json` | no active references found | Not currently used | No active app/component/lib references found during audit. |
| `/data/graph/relationships.json` | no active references found | Not currently used | No active app/component/lib references found during audit. |

## Notable runtime findings

### `app/search/page.tsx`

Risk: **high**.

The search page is a client component and statically imports both full public datasets:

- `@/public/data/compounds.json`
- `@/public/data/herbs.json`

It then builds a Fuse index in the browser. This gives rich search behavior, but it likely ships the full herb and compound datasets to every search-page visitor.

Recommended follow-up:

- Generate a purpose-built `search-index.json` containing only fields required for search results.
- Prefer small fields only: `slug`, `name`, `type`, short summary, effects, evidence label, safety label, and search keywords.
- Avoid shipping full detail text, source arrays, enrichment payloads, and raw workbook-derived fields to the search page.

### `src/lib/runtime-data.ts`

Risk: **medium for build/static work, lower for browser payload unless its results are serialized into pages**.

This module reads generated JSON files from `public/data` with Node `fs` and is used by App Router server/static code. Key broad reads include:

- `herbs.json`
- `herbs-summary.json`
- `compounds.json`
- `compounds-summary.json`
- `herb-compound-map.json`
- `claims.json`
- several route/build/support payloads

Recommended follow-up:

- For index/list pages, prefer summary/index files over full entity payloads.
- For detail pages, avoid loading the full collection when a slug-specific file exists.
- Consider direct slug detail reads before broad collection scans where route generation permits it.

### `src/lib/herb-data.ts`

Risk: **medium**.

This client-capable module fetches:

- `/data/herbs-summary.json`
- `/data/herbs-detail/{slug}.json`

The current detail loading is route-specific, which is good. The summary fetch is still broad and may be acceptable if it remains compact.

Recommended follow-up:

- Keep `herbs-summary.json` intentionally small.
- Avoid adding raw detail fields or large evidence/source arrays to the summary payload.
- Consider a separate alias map if canonical slug resolution is the main reason for loading summaries before details.

### `src/lib/compound-data.ts`

Risk: **medium**.

This client-capable module fetches:

- `/data/compounds-summary.json`
- `/data/compounds-detail/{slug}.json`

The detail fetch is route-specific. The summary fetch is broad and should stay compact.

Recommended follow-up:

- Keep `compounds-summary.json` intentionally small.
- Avoid adding raw detail fields or large evidence/source arrays to the summary payload.
- Consider a compact `compound-slug-alias-map.json` if summary loading is mostly for canonical slug resolution.

### `lib/semantic-runtime.ts`

Risk: **conditional high risk**.

This module imports `../public/data/compounds.json` at module scope and normalizes the whole dataset into memory.

No direct import site was found during this audit, but if this module is imported by a client component in the future, it can pull the full compounds dataset into that bundle.

Recommended follow-up:

- Mark this helper as server-only or script-only if that is its intended usage.
- Replace full `compounds.json` import with a compact semantic index if client usage is desired.
- Add an import-boundary note before exposing it to client components.

### `app/stacks/page.tsx`

Risk: **low to medium**.

The stacks page statically imports `@/public/data/stacks.json`. If the file remains small and route-specific, this is acceptable. If stack generation grows substantially, it should be split into an index and slug-specific detail payloads.

Recommended follow-up:

- Keep stacks payload route-specific and compact.
- Split into `stacks-summary.json` plus `stacks-detail/{slug}.json` if it grows.

## Safe follow-up reduction plan

1. Create generated search-summary payloads before touching runtime behavior.
   - `public/data/search-index.json`
   - include only fields required by `app/search/page.tsx`
2. Convert the search page from full dataset imports to the generated search index.
3. Add payload-size checks for high-risk public JSON files.
4. Split any growing route-specific datasets into summary/detail payloads.
5. Prefer slug-specific detail reads over broad collection reads on detail pages.
6. Keep generated summary files free of raw workbook rows, long source arrays, full evidence objects, and unused enrichment fields.

## Explicit non-changes in this PR

This PR does not:

- modify `public/data/**`
- modify generated files
- change data fetching behavior
- refactor app pages or libraries
- introduce new payload generation scripts
- update dependencies or lockfiles
