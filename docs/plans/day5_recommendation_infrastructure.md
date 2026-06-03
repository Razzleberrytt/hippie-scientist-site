# Day 5: Phase 4 Recommendation Infrastructure, Integration Rigor & Verification

Primary Objective:
Implement a typed relational graph schema, evidence interoperability mapping utilities, a relational UI explorer panel, hardened recommendation scoring with safety gates, and add robust integration testing to ensure build and runtime integrity.

## Objectives & Focus Areas
1. **Relational Intelligence Layer**:
   - **Strongly Typed Relational Graph Schema**: Create `src/types/relational.ts` defining strict types for connections, node relations, and pathways.
   - **Evidence Interoperability Mapping**: Create `src/lib/evidence-mapping.ts` to normalize study counts, GRADE grades, and meta-analyses into a score/grade rating.
   - **Relational UI Explorer Panel**: Create `src/components/decision/RelationalUi.tsx` to dynamically render relationship paths, shared mechanisms, and adjacent goals below the profiles.
2. **Metadata & Dynamic SEO checks**:
   - Verify dynamic metadata pipelines and JSON-LD schema integrations.
3. **Hardened Recommendation Engine**:
   - Harden `src/lib/adaptive-recommendation-scoring.ts` by factoring in safety checkers (warn/deduct score if safety flags are present) and clinical trial count weightings.
4. **Integration Rigor & Vitest Suite**:
   - Implement RTL integration tests for the Relational UI.
   - Run typechecks and Next.js static builds.

## Touch List
- `docs/plans/day5_recommendation_infrastructure.md` [NEW]
- `src/types/relational.ts` [NEW]
- `src/lib/evidence-mapping.ts` [NEW]
- `src/components/decision/RelationalUi.tsx` [NEW]
- `src/lib/adaptive-recommendation-scoring.ts` [MODIFY]
- `app/herbs/[slug]/page.tsx` [MODIFY]
- `app/compounds/[slug]/page.tsx` [MODIFY]
- `src/lib/__tests__/evidence-mapping.test.ts` [NEW]
- `src/components/decision/__tests__/RelationalUi.test.tsx` [NEW]

## Ordered Task List

### Task 4A: strongly typed relational graph schema
- Create `src/types/relational.ts`. Define:
  - `RelationalConnection`
  - `RelationalGraphProfile`
  - `EvidenceMetrics`

### Task 4B: evidence interoperability mapping
- Create `src/lib/evidence-mapping.ts`.
- Implement `normalizeEvidenceMetrics` which processes studies counts, meta-analyses, and citation counts to produce an evidence grade (A, B, C, D, F) and a normalized score (0-100).
- Integrate it into the `evidence-mapping` utility suite.

### Task 4C: hardened recommendation scoring
- Modify `src/lib/adaptive-recommendation-scoring.ts`.
- Integrate safety gate deductions: if the candidate entity has a safety level of `caution` or `warning`, or has active contraindications, apply a penalty (e.g., -15 points) to the recommendation score.
- Integrate clinical trial count weighting: award extra points or boost evidence component weight based on `clinical_trial_count` or `meta_analysis_count` when present.

### Task 4D: Relational UI Explorer Panel
- Create `src/components/decision/RelationalUi.tsx` using Tailwind.
- Show shared pathways, shared mechanisms, and connected entities.
- Render dynamic list of related herbs/compounds categorized by their clinical evidence strength.
- Integrate it into the `decision-support` tab of:
  - `app/herbs/[slug]/page.tsx`
  - `app/compounds/[slug]/page.tsx`

### Task 4E: Vitest Integration Testing & Build Check
- Create `src/lib/__tests__/evidence-mapping.test.ts` and test the normalization logic.
- Create `src/components/decision/__tests__/RelationalUi.test.tsx` using `@testing-library/react` to assert correct layout.
- Run `npm run check:fast`, `npm run test`, and `npm run check` to verify full compilation.

## Verification & Rollback Strategy
- Validate after each atomic change using `npm run check:fast` and `npm run test`.
- Commit atomically. Revert via git if any validation fails.
