# Day 3 & Phase 5: Testing Rigor & Quality Gates Plan

This plan details the verification and unit testing suite for Phase 5.

## Proposed Changes (Cluster C)

### Task 5.7: Efficacy Modeler & Affiliate Routing Unit Tests
- Implement Vitest unit tests verifying dynamic affiliate product resolution, yield routing, and efficacy curve calculations.
- File: `src/components/education/__tests__/EfficacyModelerClient.test.tsx`

### Task 5.8: Monetization Compliance Audit Script
- Create a checking script ensuring all Amazon links carry correct affiliate tag structure.
- File: `scripts/ci/validate-affiliate-links.mjs`

### Task 5.9: Automated Build, Compile, and Export Checks
- Run typecheck, linting, sitemap integrity, and full production build checks.
