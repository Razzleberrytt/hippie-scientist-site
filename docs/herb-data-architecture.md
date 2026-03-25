# Herb Data Architecture

## Canonical source files

- Runtime herb payload: `public/data/herbs.json`.
- Canonical runtime loader + normalization + confidence scoring: `src/lib/herb-data.ts`.
- Primary UI hook: `useHerbData()` (and `useHerbDataState()` when loading/error state is needed).

## Normalization flow

1. `loadHerbData()` fetches `/data/herbs.json` once and caches the resolved promise.
2. Each row is passed through `normalizeHerbRow(...)`.
3. `normalizeHerbRow(...)` sanitizes scalar text with `cleanText`, list-like fields with `splitClean`, and source metadata with `normalizeSources`.
4. Interaction metadata is merged through `getHerbSeedInteractionData(...)` + `mergeInteractionData(...)`.
5. Confidence is computed once via `calculateHerbConfidence(...)` and stored on `herb.confidence`.

## Hook entry point

- Use `useHerbData()` as the default hook for all herb listing/detail/search/interaction UI.
- Use `useHerbDataState()` only when the component must explicitly render loading or error state.

## Guaranteed UI fields (post-normalization)

The canonical normalized herb object guarantees these fields for UI use:

- identity: `id`, `slug`, `name`, `common`, `scientific`
- classification/context: `category`, `class`, `intensity`, `region`, `legalStatus`
- content: `description`, `mechanism`, `effects`, `therapeuticUses`
- safety/interactions: `contraindications`, `interactions`, `interactionTags`, `interactionNotes`, `sideeffects`
- compounds: `activeCompounds`, `compounds`, `active_compounds`
- usage: `dosage`, `duration`, `preparation`
- provenance: `sources`
- quality: `confidence`

## Legacy compatibility

- Runtime UI code should consume `useHerbData()` / `useHerbDataState()` directly from `src/lib/herb-data.ts`.
- `src/lib/data.ts` remains only for legacy entity-index paths and still delegates herb loading to `loadHerbData()`.
