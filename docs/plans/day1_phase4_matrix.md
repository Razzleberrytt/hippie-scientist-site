# Day 1 & Phase 4: Relational Intelligence Layer Plan

This plan establishes the foundation of the Phase 4 relational intelligence architecture.

## Proposed Changes (Cluster A)

### Task 1.1: Strongly Typed Relational Graph Schema
- Create or update type definitions to establish strict interfaces for relationships between herbs, compounds, biological pathways, and goals.
- File: `types/relational.ts`

### Task 1.2: Evidence Interoperability Mapping
- Implement helper utilities that normalize research evidence levels (e.g. RCT counts, GRADE grades, study sizes) across entities.
- File: `lib/evidence-mapping.ts`

### Task 1.3: Relational UI Explorer Panel
- Create a reusable UI component that renders interactive relationship paths and related solutions for profiles.
- File: `components/relational-ui.tsx`
