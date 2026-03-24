# Cleanup Notes

## Removed

- Unrelated Roblox project source trees:
  - `src/ReplicatedStorage/`
  - `src/ServerScriptService/`
  - `src/StarterPlayer/`
- Unrelated trading-bot source trees:
  - `src/core/`
  - `src/strategies/`
  - `src/alerts/`
- Dead local backup data:
  - `src/data/backups/`
- Dead herb-source files not used by the live app import graph:
  - `src/data/herbs/deep_audited_subset_updated_v1.28.csv`
  - `src/data/herbs/herbs.ts`
  - `src/data/herbs/herbsData.ts`
  - `src/data/herbs/herbs.json`

## Archived

- No ambiguous files required archiving in this pass.

## Canonical data path(s) that remain

- Runtime herb payloads: `public/data/herbs.json` (loaded via app data loader).
- React herb data hooks/types and app-side helpers:
  - `src/data/herbs/herbsfull.ts`
  - `src/data/herbs/herbs.normalized.json`
  - `src/data/herbs/blurbs.ts`
