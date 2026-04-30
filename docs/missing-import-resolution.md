# Missing Import Resolution Log

## 2026-04-30

- Restored `src/data/curatedProducts.ts` as a minimal deferred-data compatibility module.
- Added only shared types and neutral constants needed by import sites.
- Exported an empty `curatedProductRecommendations` list to keep deferred curated-product features inactive without recreating deleted hand-authored data.
