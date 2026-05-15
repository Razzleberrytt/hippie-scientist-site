# Public JSON Payload Audit

## Summary

This audit reviews references to large `public/data/**` JSON payloads and classifies the current usage patterns by execution surface.

This PR is intentionally docs-only. It does not modify generated data, runtime data loading, route behavior, dependencies, or lockfiles.

## High-level findings

- Several active pages and libraries still reference broad generated datasets.
- `app/search/page.tsx` previously imported full `public/data/compounds.json` and `public/data/herbs.json` directly into a client component. This has now been reduced to compact summary payload imports.
- The main App Router server/static data loader reads broad datasets from disk in `src/lib/runtime-data.ts`. In static export this affects build/static generation payload work, not direct browser fetches by itself.
- Client hook loaders in `src/lib/herb-data.ts` and `src/lib/compound-data.ts` fetch summary indexes and route-specific detail JSON from `/data/**` in the browser.
- `lib/semantic-runtime.ts` imports full `public/data/compounds.json` at module scope. No direct import sites were found during this audit, but it should be treated as a bundle-risk helper if imported by client code later.
- No active references were found for `/data/graph/nodes.json` or `/data/graph/relationships.json`.
- `herbs_combined_updated.json` appears referenced only by scripts/tooling checks, not active browser routes.

## Payload Governance

### Preferred public data access patterns

Preferred patterns for browser-facing routes and client components:

- use compact summary indexes for broad lists and search experiences
- use slug-specific detail JSON for entity detail pages
- keep broad dataset reads inside Node build scripts or App Router server/static utilities
- keep summary payloads intentionally small and presentation-focused
- avoid shipping raw workbook-derived records, large enrichment payloads, source arrays, or graph payloads to the browser unless strictly required

Examples:

- preferred:
  - `herbs-summary.json`
  - `compounds-summary.json`
  - `herbs-detail/{slug}.json`
  - `compounds-detail/{slug}.json`
- avoid in browser-facing code:
  - `herbs.json`
  - `compounds.json`
  - `herbs_combined_updated.json`
  - graph payload snapshots

### Lightweight governance validation

The repository now includes a lightweight validation script:

- `scripts/ci/validate-public-json-imports.mjs`

The validator scans source roots:

- `app/**`
- `components/**`
- `src/**`

The validator is intentionally conservative and browser-focused.

It primarily evaluates:

- client components (`'use client'`)
- obvious browser-facing App Router pages
- component-layer source files
- files using common React client hooks

It flags direct imports, dynamic imports, requires, and fetch references to known broad public JSON payloads.

The validation intentionally does not block:

- Node build/data scripts
- App Router server/static utilities already approved for broad reads
- generated-data workflows
- non-client utility files without browser-facing patterns

Current approved server/static exception:

- `src/lib/runtime-data.ts`

Current documented future bundle-risk helper:

- `lib/semantic-runtime.ts`

`lib/semantic-runtime.ts` is not currently scanned because it is not under the client-facing scan roots and no active client import path was identified during the audit. If it later becomes browser-imported, it should be converted to a compact semantic index or explicitly server-only.

### Reviewer checklist for future PRs

When reviewing new routes or search/discovery features:

- confirm client components do not directly import broad public datasets
- confirm search/list pages use summary indexes where possible
- confirm detail pages use slug-specific payload loading
- confirm graph payloads are not bundled broadly into browser routes
- confirm any new summary payload remains compact and intentionally scoped
- confirm broad `public/data/**` reads remain isolated to Node/build/static utilities unless explicitly justified
- confirm browser-facing code does not reintroduce full `herbs.json` or `compounds.json` imports

## Audited usage matrix

| Payload | Usage sites found | Classification | Notes |
| --- | --- | --- | --- |
| `public/data/herbs.json` | `src/lib/runtime-data.ts`; scripts/tooling | Server/static read | Search page no longer imports the full herb dataset directly into the browser bundle. Runtime-data still reads it from disk during server/static generation. |
| `public/data/compounds.json` | `lib/semantic-runtime.ts`; `src/lib/runtime-data.ts`; scripts/tooling | Module-scope import risk and server/static read | Search page no longer imports the full compound dataset directly into the browser bundle. Semantic runtime still imports the full payload at module scope. |
| `public/data/herbs-summary.json` | `app/search/page.tsx`; `src/lib/herb-data.ts` | Client-side summary payload | Used for compact browser search indexing and canonical slug resolution. |
| `public/data/compounds-summary.json` | `app/search/page.tsx`; `src/lib/compound-data.ts` | Client-side summary payload | Used for compact browser search indexing and canonical slug resolution. |
| `/data/herbs-detail/{slug}.json` | `src/lib/herb-data.ts` | Client-side route/detail fetch | Route-specific detail loading by slug after summary/canonical resolution. Lower risk than loading all detail records. |
| `/data/compounds-detail/{slug}.json` | `src/lib/compound-data.ts` | Client-side route/detail fetch | Route-specific detail loading by slug after summary/canonical resolution. Lower risk than loading all detail records. |
| `public/data/stacks.json` | `app/stacks/page.tsx` | Static import in App Router page | Page imports the full stacks payload. Depending on static export bundling, this may affect page payload size for `/stacks`. |
| `public/data/herbs_combined_updated.json` | scripts/tooling only | Build/tooling | No active browser route usage found. Keep out of client imports. |
| `/data/graph/nodes.json` | no active references found | Not currently used | No active app/component/lib references found during audit. |
| `/data/graph/relationships.json` | no active references found | Not currently used | No active app/component/lib references found during audit. |

## Notable runtime findings

### `app/search/page.tsx`

Status: **partially addressed**.

The search page previously imported:

- `@/public/data/compounds.json`
- `@/public/data/herbs.json`

The page now uses:

- `@/public/data/compounds-summary.json`
- `@/public/data/herbs-summary.json`

This substantially reduces the browser payload footprint while preserving static export compatibility and existing Fuse-based client search behavior.

Remaining follow-up opportunity:

- Create a purpose-built `search-index.json` containing only fields required for search results.
- Prefer small fields only: `slug`, `name`, `type`, short summary, effects, evidence label, safety label, aliases, and search keywords.
- Avoid shipping unused enrichment metadata through summary payloads.

## Explicit non-changes in this PR

This PR does not:

- modify generated public data contents
- introduce remote fetch APIs
- change search page visual design
- modify generated-data scripts
- refactor unrelated routes or components
- update dependencies or lockfiles
