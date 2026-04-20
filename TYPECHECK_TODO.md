# TypeScript Typecheck TODO

`npm run typecheck` currently fails with the errors below. These were left intentionally to keep this change minimal and safe while introducing explicit typecheck scripts.

## Remaining error groups

1. **Compound summary shape mismatches**
   - `src/__tests__/browseRanking.test.ts:49`
   - Likely fix: align fixture object keys to `CompoundSummaryRecord` (`summary`, `compoundClass`, `primaryActions`, `mechanisms`, etc.) or explicitly cast through `unknown` in the test if intentional.

2. **Un-typed compound metadata objects (`{}` inference)**
   - `src/components/CompoundCard.tsx:36,51`
   - `src/components/EntityDatabasePage.tsx:541-543`
   - Likely fix: strongly type parsed/derived compound metadata object(s) so `summary`, `keyEffects`, and `mechanism` are known fields.

3. **Compound record model drift**
   - `src/lib/compound-data.ts:251`
   - Likely fix: either add `intensity` to the `CompoundRecord` type or remove/rename the property to match schema.

4. **Herb data field type mismatch**
   - `src/lib/herb-data.ts:275`
   - Likely fix: change value to `string` or widen target type to `string[]` depending on domain intent.

5. **Related herb type missing fields on compound detail page**
   - `src/pages/CompoundDetail.tsx:679-681`
   - Likely fix: extend `RelatedHerb` type (or mapped payload type) with `primaryEffects`, `profileStatus`, and `summaryQuality`.

6. **Unknown curated data typing on herb detail page**
   - `src/pages/HerbDetail.tsx:183,190,200,206,507`
   - Likely fix: add a runtime type guard + concrete interface for `curatedData` before property access/rendering.

