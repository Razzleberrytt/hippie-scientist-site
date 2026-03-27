# PERF_NOTES

## What was slow

- **`/herbs`** rendered the full filtered herb grid at once (plus animated/tilting cards), which could cause frame drops on mid-range devices when result sets were large.
- **`/compounds`** rendered the full filtered compounds grid at once, creating heavy first paint and expensive re-render bursts after filter changes.
- **Effect Explorer** (`src/components/EffectExplorer.tsx`) performed ranking work eagerly while typing and computed both active and fallback rankings in the same render path.
- **`/blog` card images** did not explicitly use lazy-loading hints, so image decoding/loading could compete with interaction work.

## What was changed

- Added progressive rendering on `/herbs` and `/compounds`:
  - initial visible result window
  - "Load more" button in fixed-size chunks
  - automatic visible-count reset when filters change
- Added a `performanceMode` path to `HerbCard`:
  - disables expensive per-card motion wrappers and pointer tilt listeners when result sets are large
  - preserves card content/behavior while reducing runtime animation overhead
- Gated the large Effect Explorer panel on `/herbs` behind an explicit "Open explorer" toggle so the heavy section is not mounted by default.
- Optimized Effect Explorer query work:
  - deferred text input updates with `useDeferredValue`
  - reused fallback ranking when query is empty
  - avoided duplicate ranking passes in the no-query state
- Added `loading="lazy"` and async decoding hints for blog card images.

## Deferred

- Full list virtualization for herb/compound grids (e.g., react-window style) is still deferred; chunked progressive rendering was chosen to minimize behavior changes.
- Home page still contains many sections and can be further split/lazy-mounted by viewport if needed.
- Effect Explorer ranking can be further optimized with precomputed inverted indices if dataset size grows substantially.
