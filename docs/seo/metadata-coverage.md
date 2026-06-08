# SEO Metadata Coverage Audit

## Metadata coverage batch 1

This PR adds route-level metadata coverage to a small first batch of important public App Router pages.

Updated pages:

- `app/education/page.tsx`
- `app/pathways/page.tsx`
- `app/pathways/serotonin/page.tsx`
- `app/pathways/dopamine/page.tsx`
- `app/pathways/gaba/page.tsx`
- `app/compare/page.tsx`

## Intentionally skipped in this PR

Skipped because metadata already exists:

- `app/compare/[slug]/page.tsx`

Skipped because they are internal/demo/admin-oriented or outside this narrowly scoped batch:

- `app/dashboard/**`
- analytics/admin-like routes
- internal demo pages

## Candidate groups for future metadata PRs

Potential future metadata coverage work:

- additional `app/education/**` article routes
- `app/protocols/**`
- `app/psychoactive/**`
- `app/goals/**`
- `app/stacks/**`
- `app/topics/**`
- `app/blog/**`
- static informational/legal pages

## Notes

This audit intentionally avoids:

- layout changes
- routing changes
- content rewrites
- dependency changes
- broad repository-wide SEO refactors
