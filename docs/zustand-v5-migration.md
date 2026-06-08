# Zustand v5 Migration

Date: June 1, 2026

Stores migrated:

- `src/store/useResearchStore.ts`

Breaking changes encountered:

- The persisted store needed explicit mutator typing for `persist` under Zustand v5:
  `create<ResearchStore, [['zustand/persist', ResearchStore]]>(persist(...))`.

No `createWithEqualityFn`, `devtools`, or `subscribeWithSelector` stores were present.
