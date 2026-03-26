# Final Netlify/Vite Conflict Fix Diff

## 1) Netlify config hardened (exact replacement)

### `netlify.toml`

- Replaced prior config with exact required settings:
  - build command: `npm ci && npm run build`
  - publish dir: `dist`
  - SPA redirect fallback to `/index.html`
- Removed extra headers block to keep behavior minimal/predictable.

## 2) Root entry HTML normalized to Vite-only shell

### `index.html`

- Replaced custom/static shell markup with a minimal Vite entry document.
- Keeps only:
  - `<div id="root"></div>`
  - `<script type="module" src="/src/main.tsx"></script>`

## 3) Public directory cleaned of HTML entry pages

### Removed from `public/`:

- All `*.html` files (legacy static entry pages), including:
  - `public/blog/**/index.html`
  - `public/herbs/**/index.html`
  - `public/compounds/**/index.html`
  - `public/offline.html`

Result: `public/` now contains only static assets/data files (no HTML entry pages).

## 4) Forced `_redirects` into build output

### Added `scripts/ensure-dist-redirects.mjs`

- Post-build check:
  - If `dist/_redirects` exists: no-op
  - Else copies `public/_redirects -> dist/_redirects`

### Updated `package.json`

- `postbuild` now runs:
  - `node scripts/generate-sitemap.mjs dist && node scripts/ensure-dist-redirects.mjs`

## 5) Vite output explicitly pinned

### `vite.config.ts`

- Ensured:
  - `base: '/'`
  - `build.outDir: 'dist'`

## 6) Build pipeline adjusted to avoid re-generating conflicting static HTML

### `package.json` `prebuild`

- Removed blog static HTML generation steps from prebuild chain.
- Kept only data sync/counts + RSS generation.

This prevents regeneration of `public/**/index.html` files during CI build.

## 7) Clean rebuild performed

- Deleted `node_modules`
- Reinstalled dependencies with `npm ci`
- Rebuilt with `npm run build`
- Confirmed build completes and `dist/_redirects` is present.
