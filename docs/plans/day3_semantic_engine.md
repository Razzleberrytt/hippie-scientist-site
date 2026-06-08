# Plan — Phase 2 Semantic Intelligence & Decision Engine Sprint

Implement Phase 2 of The Hippie Scientist: Semantic Relationship Engine, Goal Matching Engine, Evidence Confidence Utilities, Semantic SEO Support, and Safe Runtime Integration.

## Objectives
- Build deterministic utilities for ranking entities (herbs, compounds, stacks).
- Enable evidence-aware and safety-aware goal ranking.
- Normalize and stratify evidence confidence.
- Generate semantic link recommendations and metadata targets for SEO.
- Integrate these components seamlessly into detail pages without UI/routing regressions.

## Current State Summary
- Phase 1 Knowledge Graph is complete, type-safe, and validated.
- All 101 tests pass.
- We have central graph retrieval functions, taxonomy helper, and validation scripts.

## Target Files
- `lib/semantic-relationship-engine.ts` [NEW]
- `src/lib/__tests__/semantic-relationship-engine.test.ts` [NEW]
- `lib/goal-matching-engine.ts` [NEW]
- `src/lib/__tests__/goal-matching-engine.test.ts` [NEW]
- `lib/evidence-confidence.ts` [NEW]
- `src/lib/__tests__/evidence-confidence.test.ts` [NEW]
- `lib/semantic-seo.ts` [NEW]
- `src/lib/__tests__/semantic-seo.test.ts` [NEW]
- `app/herbs/[slug]/page.tsx` [MODIFY]
- `app/compounds/[slug]/page.tsx` [MODIFY]

## Atomic Task List & Execution Order
1. **Task 2A**: Build Semantic Relationship Engine.
2. **Task 2B**: Build Goal Matching Engine.
3. **Task 2C**: Build Evidence Confidence Utilities.
4. **Task 2D**: Build Semantic SEO Support.
5. **Task 2E**: Integrate engines into detail page templates.
6. **Task 2F**: Validate, test, typecheck, build, and document handoff notes.

## Staged Validation & Rollback Plan
- After each engine implementation, run: `npm run typecheck` and `npm run test`.
- Use git commits after every successful atomic task.
- If a compilation or integration error occurs, revert using `git checkout` on specific files.
