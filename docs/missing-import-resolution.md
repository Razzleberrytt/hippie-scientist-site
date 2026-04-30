# Missing Import Resolution Log

## 2026-04-30

- Resolved the current TS2307 blocker in `src/components/CuratedProductModule.tsx` by removing the missing type-only import from `@/data/curatedProducts` and defining a local `CuratedProductEntityType` union (`'herb' | 'compound' | 'goal'`) in the component.
- This keeps behavior unchanged while avoiding restoration of deleted hand-authored data modules.
