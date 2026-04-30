# Missing Import Resolution Log

## 2026-04-30

- MVP cleanup decision update: removed `src/components/EmailCapture.tsx` from active use instead of rebuilding legacy form dependencies.
- Removed `src/components/ContextualLeadMagnet.tsx` because it was the active importer of `EmailCapture`.
- Did **not** recreate `@/hooks/useSubmissionForm` as part of this MVP cleanup pass.
- Deferred form capture from MVP scope; no form backend integration, fake success behavior, or hardcoded endpoints were introduced.
- Resolved the current TS2307 blocker in `src/components/CuratedProductModule.tsx` by removing the missing type-only import from `@/data/curatedProducts` and defining a local `CuratedProductEntityType` union (`'herb' | 'compound' | 'goal'`) in the component.
- This keeps behavior unchanged while avoiding restoration of deleted hand-authored data modules.
- Added explicit `string` typing for `item` callback parameters in `CuratedProductModule` list rendering to resolve the current implicit-`any` TypeScript blocker without introducing product data.
- Removed `console.warn` from `src/components/BundleUpgradeCard.tsx` catch handling; storage failures now no-op safely and still open the bundle link.
- Removed `console.warn` from `src/lib/analyticsEventStorage.ts` catch handling; analytics storage failures now no-op safely.
- No product data modules were restored and no fake analytics data was introduced.
- Re-ran `npm run check`; build now progresses past CuratedProductModule and no-console blockers and currently stops at `./src/components/EffectExplorer.tsx:3:54` missing `@/utils/effectSearch` (next blocker in queue).
- EffectExplorer status: active in source tree (component exists and remains typechecked); resolved current TS2307 by adding `src/utils/effectSearch.ts` with generic, data-free search helpers operating only on provided herb runtime values.
- `src/utils/effectSearch.ts` intentionally contains no hardcoded effect taxonomy, no seed effect suggestions, and no herb/compound/effect records.
- Future `GENERATOR_FIX`: replace this generic matcher with workbook-generated effect taxonomy/search artifacts when an approved generator policy is available.
- EffectExplorer decision: active fixed. The TS2307 import error for `@/utils/effectSearch` was resolved by creating `src/utils/effectSearch.ts`.
- Added pure utility shims `src/utils/asStringArray.ts` and `src/utils/extractPrimaryEffects.ts` because they were immediately required by active `EffectExplorer` imports and are data-free wrappers over existing library helpers.
- Confirmed no hardcoded effect taxonomy, no fake effect suggestions dataset, and no herb/compound/effect records were introduced.
- Re-ran `npm run check`; next blocker is now `./src/components/EmailCapture.tsx:4:35` missing `@/hooks/useSubmissionForm`.
- EmailCapture decision: active fixed. `src/components/EmailCapture.tsx` is reachable via `src/components/ContextualLeadMagnet.tsx`, so this batch restored the missing `@/hooks/useSubmissionForm` dependency.
- Created `src/hooks/useSubmissionForm.ts` with a minimal generic state model (`idle`/`pending`/`success`/`error`) and API compatible with existing capture/signup components (`status`, `message`, `submit`, `clearFeedback`).
- Endpoint behavior: submission flows through existing `src/lib/formSubmission.ts` endpoint resolution (`VITE_FORM_ENDPOINT` first, then legacy fallbacks). If no endpoint is configured, it returns the existing honest `missingEndpoint` message; no fake success behavior or backend integration was added.
- No new form service/backend was introduced, and no analytics/product/recommendation/effect data was added in this pass.
- Re-ran `npm run check`; next blocker is now `./src/components/ErrorBoundary.tsx:2:34` missing `../utils/devMessages` (outside EmailCapture/form-submission scope).
- Follow-up cleanup: disabled legacy dev-message dependency by removing `../utils/devMessages` imports/calls from active files (`ErrorBoundary`, consent/debug, full-count diagnostics, theme persistence warning, analytics init debug).
- Re-ran `npm run check`; next blocker moved to `./src/components/FavoriteStar.tsx:2:34` missing `../hooks/useHerbFavorites`.
- `FavoriteStar` was unused in active imports and removed from active source to keep MVP minimal and unblock the next essential check path.
- Re-ran `npm run check`; next blocker moved to `./src/components/FeaturedHerbTeaser.tsx:8:39` missing `../utils/format`.
- `FeaturedHerbTeaser` was also unused in active imports and removed from active source as another nonessential legacy blocker.
