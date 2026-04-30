# Missing Import Resolution Log

## 2026-04-30

- Resolved the current TS2307 blocker in `src/components/CuratedProductModule.tsx` by removing the missing type-only import from `@/data/curatedProducts` and defining a local `CuratedProductEntityType` union (`'herb' | 'compound' | 'goal'`) in the component.
- This keeps behavior unchanged while avoiding restoration of deleted hand-authored data modules.
- Added explicit `string` typing for `item` callback parameters in `CuratedProductModule` list rendering to resolve the current implicit-`any` TypeScript blocker without introducing product data.
- Removed `console.warn` from `src/components/BundleUpgradeCard.tsx` catch handling; storage failures now no-op safely and still open the bundle link.
- Removed `console.warn` from `src/lib/analyticsEventStorage.ts` catch handling; analytics storage failures now no-op safely.
- No product data modules were restored and no fake analytics data was introduced.

- Per deletion-first cleanup, removed stale unreachable component `src/components/EffectExplorer.tsx` instead of restoring its missing dependency `@/utils/effectSearch`.
- Did not recreate deleted hand-authored modules or synthetic JSON.
- Documented legacy cleanup classification and deferred effect-search feature in `docs/legacy-cleanup.md`.
