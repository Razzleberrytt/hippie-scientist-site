# Day 1 & Phase 5: Affiliate Link Intelligence & Yield-Aware Monetization Routing Plan

This plan establishes the Phase 5 monetization layer for The Hippie Scientist.

## Proposed Changes (Cluster A)

### Task 5.1: Centralized Affiliate Registry & Product Parser
- Establish or enrich a product registry that details verified supplement products (Amazon links, GMP certification status, pricing, and active yield standardizations).
- File: `src/lib/affiliate-registry.ts`

### Task 5.2: Yield-Aware Affiliate Router
- Create `src/lib/affiliate-intelligence-routing.ts` to dynamically resolve the best-fit affiliate product based on user dosage, standardizations, and cost-per-serving optimization.

### Task 5.3: In-Context Monetization Cards
- Create a reusable functional React component `AffiliateProductCard` displaying GMP/COA verification badges and Amazon affiliate links.
- File: `src/components/sourcing/AffiliateProductCard.tsx`
