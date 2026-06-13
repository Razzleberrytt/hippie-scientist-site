# Global search

A fast, accessible, fully static search across **herb monographs**, **compound
monographs**, and the **educational content layer** (`content/education/` +
`app/education/*`).

## Architecture

```
data-sources / public/data summaries        content/education/*.md
            │                                      │ (+ app/education/* route list)
            └──────────────┬───────────────────────┘
                           ▼
        scripts/data/build-search-index.mjs   (build time only)
                           ▼
              public/data/search-index.json   (generated artifact, ~1k docs)
                           ▼
        lib/search/search-engine.ts  ── lazy import (Fuse + JSON, code-split)
                           ▼
        components/search/useGlobalSearch.ts  (state, filters, keyboard nav)
              ├── components/search/GlobalSearch.tsx       → /search page
              └── components/search/GlobalSearchModal.tsx  → global Cmd/Ctrl+K palette
```

- **Static-export safe.** All `fs`/frontmatter parsing happens in the build
  script. The runtime only reads a static JSON file — no server, no API routes.
- **Single source of truth.** Both the page and the palette consume the same
  `SearchDoc[]` shape (`lib/search/types.ts`), so ranking, facets, and badges
  stay identical.
- **Generated artifact.** `public/data/search-index.json` is rebuilt by
  `npm run search:build-index` and is wired into `data:build` / `data:build:core`.

## Filters

Derived from the index and tallied client-side (`computeFacets`):

- **Content type** — Herb / Compound / Education
- **Goal / use case** — sleep, stress, focus, energy, cognition, …
- **Pathway** — dopamine, serotonin, GABA, HPA axis, …
- **Evidence grade** — Strong / Moderate / Limited / Preliminary / Educational
- **Safety** — Generally well tolerated / Use with caution / Notable considerations
- **Safety considerations** — has interactions, has contraindications

Within a facet, values are OR-ed; across facets they are AND-ed.

## Accessibility choices

- **Combobox + listbox** pattern (WAI-ARIA): the input is
  `role="combobox"` with `aria-expanded`, `aria-controls`, and
  `aria-activedescendant`; results are a `role="listbox"` of `role="option"`
  items. The active option is tracked by id, not DOM focus, so the input keeps
  focus while arrowing.
- **Keyboard:** ↑/↓ move, Home/End jump, Enter opens, Esc closes/clears. The
  palette opens with ⌘K / Ctrl+K and with `/` (ignored while typing in a field).
- **Modal hygiene:** `role="dialog"` + `aria-modal`, focus trap, body scroll
  lock, backdrop click to close, and focus restoration to the trigger on close.
- **Announcements:** a `aria-live="polite"` region reports the result count as
  the query/filters change.
- **Targets & contrast:** chips and rows meet ≥36px touch targets; badges use
  the site's brand palette with visible focus rings.

## Performance choices

- **Code-split index.** Fuse and the ~1k-doc JSON load via dynamic `import()`
  only when search is first used, keeping them out of the base bundle. The
  palette defers loading until opened (`active` flag in `useGlobalSearch`).
- **Precomputed facets/flags.** Goal/pathway/evidence/safety normalization runs
  at build time; the client only filters and tallies.
- **Memoized derivation.** Results are recomputed only when query/filters/engine
  change. Browse mode (empty query) returns a stable, alphabetized list.
- **Lightweight payload.** The index stores only what search needs (title,
  summary, facets, flattened `searchText`), not full monograph bodies.

## Verification

```bash
npm run search:build-index                       # regenerate the index
npx vitest run lib/search/__tests__/search-engine.test.ts
npx vitest run app/search/__tests__/SearchClient.test.tsx
npm run typecheck
npx eslint components/search lib/search lib/education.ts components/Navigation.tsx app/search/page.tsx --max-warnings=0
node scripts/ci/validate-public-json-imports.mjs
node scripts/ci/validate-static-export-compatibility.mjs
npm run dev                                       # manual: /search + ⌘K palette
```
