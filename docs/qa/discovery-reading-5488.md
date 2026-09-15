# Shared discovery and reading validation — #5488

## Scope

Extends existing GuideCardGrid, DecisionRouter, HubSectionHeading, GoalHubSections and ArticleLayout. Comparison landing rows share focus, hover and reduced-motion treatment. All existing text, destinations, metadata, evidence and safety semantics are retained; goal comparison notes are no longer visually truncated.

## Local validation

- 23 tests passed across shared discovery/reading, prior premium discovery, mobile UX and accessibility suites.
- `npm run check:ui` passed: lint, typecheck, static-export compatibility and route SEO. Existing locale-link diagnostics are warnings; validator passed.
- Browser inspection: sleep hub at phone width in both themes; turmeric/curcumin ArticleLayout at desktop light and phone dark; comparison landing at phone width dark.
- Measured viewport content width and scroll width both 375px on all three mobile samples (390px configured viewport including scrollbar).
- Short desktop viewport 1280 × 400: TOC client height 288px, scroll height 322px; link heights 44–55px. Navigation remains scrollable.
- Sleep hub contains 108 shared discovery cards; comparison landing contains 35 shared rows. These are sampled rendered counts, not traffic or business outcomes.
- Local development preview showed unloaded hero images on comparison and turmeric pages; image source references are unchanged. Production build verification pending.
- Production build and exact-head CI pending at review creation; final status is recorded in the PR checks and completion comment.

## Impact boundary

Expected benefit: consistent discovery hierarchy, complete contextual notes, stable interaction and accessible long-article navigation across shared consumers. Engagement and revenue impact are Unknown; no measured percentage lift is claimed.
