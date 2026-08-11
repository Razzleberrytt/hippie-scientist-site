# Focus best-supplements route consolidation — 2026-08-10

## Decision

Canonical owner: `/guides/focus/best-nootropics-for-focus/`

Redirected route: `/guides/focus/best-supplements-for-focus/`

The focus hub already identified Best Nootropics for Focus as its evidence-graded starting point, while a second Best Supplements for Focus route remained as a quick reference for substantially the same broad decision job. Shared canonical and goal-SEO registries still pointed at the older route, splitting discovery signals and creating inconsistent ownership.

## Implementation

- permanently redirect the older route to the evidence-first Best Nootropics for Focus guide;
- retain its tiny SEO-entry wrapper only because the shared generator expects that source, while canonicalizing the wrapper to the primary guide;
- remove the older route from the focus hub and schema-backed guide list;
- point canonical and goal-SEO route registries at the evidence-first guide;
- protect the consolidation with route-specific regression coverage.

## Boundary

This change only consolidates deployed route ownership and discovery signals. It does not add or strengthen focus or nootropic efficacy claims.
