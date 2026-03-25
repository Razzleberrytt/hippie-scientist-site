# The Hippie Scientist

Data-driven educational site for psychoactive herbs and compounds.

## Quick start

```bash
npm install
npm run dev
```

Build production bundle:

```bash
npm run build
```

## Data pipeline (canonical)

The app now uses a single canonical runtime pipeline:

- Herb data source: `public/data/herbs.json`
- Compound data source: `public/data/compounds.json`
- Herb normalization + hooks: `src/lib/herb-data.ts`
- Compound normalization + hooks: `src/lib/compound-data.ts`
- Shared sanitization helpers: `src/lib/sanitize.ts`

When ingesting refreshed datasets:

```bash
npm run update-data
```

## Learning routes

Primary learning page is `/learning`.

The learning-path catalog is dynamically imported (code-split) from `src/data/learning-paths.ts` by `src/pages/LearningPaths.tsx`.

## Analytics route access (`/analytics`)

`/analytics` is disabled by default in production builds.

- Development (`npm run dev`): enabled automatically.
- Production: enable explicitly with:

```bash
VITE_ENABLE_ANALYTICS_ROUTE=true
```

If the variable is not `true`, `/analytics` renders a not-available fallback.

## Useful checks

```bash
npm run lint
npm run build
```
