# Day 2 & Phase 4: Metadata Automation & SEO Structure Plan

This plan implements the Phase 4 Day 2 tasks focusing on automated metadata generation, deep JSON-LD structures, and robots/indexing safety gates.

## Proposed Changes (Cluster B)

### Task 2.1: Dynamic Automated Metadata Pipeline
- Update `app/herbs/[slug]/page.tsx` and `app/compounds/[slug]/page.tsx` to utilize a unified automated metadata helper derived from runtime data metrics (evidence tier, safety flag presence, active compounds).
- Add support for fallback templates, auto-truncated description generation, and canonical alternates.

### Task 2.2: Structured Data Deepening (JSON-LD)
- Update `components/seo/AuthorityJsonLd.tsx` or create `components/seo/MedicalWebPageJsonLd.tsx` to support the `MedicalWebPage` and `Article` schema types.
- Embed active constituents, evidence levels, and safety warnings directly into JSON-LD scripts for all herb and compound detail pages.

### Task 2.3: Robots Governance & Indexing Safety Gates
- Standardize the indexability logic based on profile visibility rules (e.g. pending reviews, drafts, or placeholder pages should render with a `noindex, follow` tag).
- Integrate route/query-string normalization to enforce correct canonical paths.

## Verification Plan
- Run ESLint check: `npm run lint`
- Run TypeScript compiler checks: `npm run typecheck`
- Run Vitest unit tests: `npm run test`
- Build verification check: `npm run build`
