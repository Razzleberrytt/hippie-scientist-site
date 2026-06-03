# Day 2 & Phase 5: Interactive Efficacy Modeler & Tolerance Calculator Plan

This plan outlines the Day 2 Phase 5 tasks.

## Proposed Changes (Cluster B)

### Task 5.4: Interactive Efficacy Timeline Dashboard
- Create static route `/education/efficacy-model` and a client-side component visualizing timing curves (onset, peak, offset, half-life) for acute vs cumulative ingredients.
- File: `app/education/efficacy-model/page.tsx`, `src/components/education/EfficacyModelerClient.tsx`

### Task 5.5: Personal Tolerance & Cycling Planner
- Create route `/protocols/cycling` with cycling guidelines, wash-out period recommendations, and cycling checklists.
- File: `app/protocols/cycling/page.tsx`, `src/components/protocols/CyclingPlannerClient.tsx`

### Task 5.6: Interactive Botanical Substitution Engine
- Create a panel that lets users explore alternative ingredients based on contraindications (e.g., swapping caffeine for L-Tyrosine if stimulant sensitive).
- File: `src/components/sourcing/SubstitutionEnginePanel.tsx`
