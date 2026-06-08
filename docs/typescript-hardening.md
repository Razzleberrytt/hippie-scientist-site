# Incremental TypeScript hardening
This repo keeps default `npm run typecheck` unchanged for stable delivery.
We add `npm run typecheck:strict-candidates` to incrementally enforce stricter checks (`noImplicitAny`, `noUncheckedIndexedAccess`) on selected files first, then expand over time.
