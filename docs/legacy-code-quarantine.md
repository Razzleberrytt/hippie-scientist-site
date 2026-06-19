# Legacy Code Quarantine Manifest

This document records the quarantined legacy directories and files moved out of the active Next.js App Router compilation paths. These files are kept for historical context and reference, but are excluded from active builds, routing, and typechecking.

## Cleanup Status

- Phase 1 alias cleanup is complete.
- Phase 2 moved 49 confirmed-dead `src/components` files into `legacy-quarantine/src/components/`.
- 36 active `src/components` files remain reachable from active app roots.
- `src/components/TagBadge.tsx` was restored and kept because `src/components/CompoundBadge.tsx` still imports it.
- 144 inactive-but-uncertain files were intentionally left in place.
- Empty legacy directories under `src/components/` were removed after confirming they were empty.
- `src/lib` and some `src/components` files are still active and must not be deleted wholesale.

## Quarantined Directories

### 1. `legacy-quarantine/app/`
Contains routes that were defined in the active Next.js root `app/` folder but are redirected in production via `public/_redirects`. Moving them here prevents Next.js from building unused static pages.
- `app/data-moat/` -> Moved to `legacy-quarantine/app/data-moat/`
- `app/supernodes/` -> Moved to `legacy-quarantine/app/supernodes/`
- `app/sourcing/` -> Moved to `legacy-quarantine/app/sourcing/`
- `app/best-adaptogens-for-stress/` -> Moved to `legacy-quarantine/app/best-adaptogens-for-stress/`
- `app/best-herbs-for-anxiety/` -> Moved to `legacy-quarantine/app/best-herbs-for-anxiety/`
- `app/best-nootropics-for-focus/` -> Moved to `legacy-quarantine/app/best-nootropics-for-focus/`
- `app/blog/` -> Moved to `legacy-quarantine/app/blog/`
- `app/buy-guide/` -> Moved to `legacy-quarantine/app/buy-guide/`
- `app/cognition-supplements/` -> Moved to `legacy-quarantine/app/cognition-supplements/`
- `app/compare/ashwagandha-vs-rhodiola-for-stress/` -> Moved to `legacy-quarantine/app/compare/ashwagandha-vs-rhodiola-for-stress/`
- `app/compare/sourcing/` -> Moved to `legacy-quarantine/app/compare/sourcing/`
- `app/ecosystems/` -> Moved to `legacy-quarantine/app/ecosystems/`
- `app/fat-loss-supplements/` -> Moved to `legacy-quarantine/app/fat-loss-supplements/`
- `app/herbs-for-sleep/` -> Moved to `legacy-quarantine/app/herbs-for-sleep/`
- `app/natural-testosterone-boosters/` -> Moved to `legacy-quarantine/app/natural-testosterone-boosters/`
- `app/pathways/` -> Moved to `legacy-quarantine/app/pathways/`
- `app/performance-supplements/` -> Moved to `legacy-quarantine/app/performance-supplements/`
- `app/protocols/` -> Moved to `legacy-quarantine/app/protocols/`
- `app/safety/` -> Moved to `legacy-quarantine/app/safety/`
- `app/sleep-supplements/` -> Moved to `legacy-quarantine/app/sleep-supplements/`
- `app/start-here/` -> Moved to `legacy-quarantine/app/start-here/`
- `app/stress-supplements/` -> Moved to `legacy-quarantine/app/stress-supplements/`
- `app/topics/` -> Moved to `legacy-quarantine/app/topics/`

### 2. `legacy-quarantine/src/app/`
Contains legacy App Router folder structures from a previous structure where typechecked code was housed under `src/app/`. The authoritative Next.js App Router tree is now strictly in the root `app/` directory.
- `src/app/best/` -> Moved to `legacy-quarantine/src/app/best/`
- `src/app/compare/` -> Moved to `legacy-quarantine/src/app/compare/`
- `src/app/ecosystems/` -> Moved to `legacy-quarantine/src/app/ecosystems/`
- `src/app/protocols/` -> Moved to `legacy-quarantine/src/app/protocols/`
- `src/app/stacks/` -> Moved to `legacy-quarantine/src/app/stacks/`
- `src/app/topics/` -> Moved to `legacy-quarantine/src/app/topics/`

### 3. `legacy-quarantine/src/components/`
Contains the 49 confirmed-dead `src/components` files moved during Phase 2 cleanup. These files were not reachable from active app roots and are retained only as legacy reference material.

The source-side empty directories left by those moves were checked and removed:
- `src/components/cta/`
- `src/components/detail/`
- `src/components/filters/`
- `src/components/interactions/`
- `src/components/trust/`

---

## TSConfig & Import Enforcement

To ensure legacy quarantined files do not pollute typechecking or build size:
1. `tsconfig.json` contains `"legacy-quarantine"` in its `"exclude"` list.
2. `scripts/ci/validate-quarantine-imports.mjs` runs in pre-build and blocks any import statements referencing `'legacy-quarantine/'` or `@/src/app/`.
