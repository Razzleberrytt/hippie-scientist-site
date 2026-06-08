# Post-merge UX consistency audit

## Executive summary
The newer light-card direction is present in several key templates, but cross-section consistency is incomplete. The highest leverage improvements are tightening first-click guidance on discovery pages, normalizing typography/spacing tokens across card grids, and making safety framing consistently visible on high-intent supplement pages.

## High-impact issues
1. **First-click clarity varies by route**
   - Homepage and goals are improving, but `/compare`, `/learn`, and some SEO entry pages still require extra interpretation before a user can decide where to click first.
2. **Card rhythm inconsistency**
   - Mixed radius, border opacity, and body spacing patterns create visual jitter between sections.
3. **Safety/educational framing not uniformly surfaced**
   - Some pages communicate education-only framing clearly, while others defer this too deep in the page.
4. **Abstract language remains in pockets**
   - Discovery pages still contain occasional conceptual wording that slows first-time comprehension.
5. **Mobile scan depth is uneven**
   - Dense card blocks and long line lengths reduce readability on smaller screens.

## Quick wins
- Standardize section intro pattern: eyebrow → concrete H1/H2 → one practical body paragraph.
- Normalize card shell on discovery pages to `rounded-2xl`/`rounded-[2rem]`, `border-brand-900/10`, `bg-white/90` where appropriate.
- Add concise “How to use this page” blocks to high-intent hubs lacking explicit decision flow.
- Move educational/safety caveat modules higher when page intent implies self-directed supplement decisions.
- Replace remaining abstract headers with practical verbs (“Start”, “Compare”, “Check safety”, “Open guide”).

## Larger follow-up work
- Build a shared “decision-hub section primitives” pattern (hero, how-to cards, scannable grid, safety footer) for homepage, goals, compare, and SEO entry hubs.
- Create mobile typography guardrails for card-heavy pages (line length, min tap targets, vertical spacing scale).
- Add a consistency checklist to PR template for discovery/depth routes (first-click path, safety framing, card shell tokens, plain-language pass).

## Suggested PR order
1. `/compare` first-click and copy simplification pass.
2. `/learn` readability + card rhythm normalization.
3. SEO entry page shell alignment + safety framing normalization.
4. Herb/compound detail page micro-consistency (badges, link contrast, empty-state polish).

## Files likely involved
- `app/compare/**`
- `app/learn/**`
- `app/best-for/**` and `app/seo-entry-pages.tsx`
- `components/homepage-v2.tsx`
- `app/goals/page.tsx`
- `app/herbs/**`
- `app/compounds/**`
- shared UI primitives under `components/**` used by discovery/depth cards
