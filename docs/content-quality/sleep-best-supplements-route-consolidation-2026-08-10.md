# Sleep best-supplements route consolidation — 2026-08-10

## Decision

Canonical owner: `/guides/sleep/best-supplements-for-sleep/`

Retired route: `/guides/sleep/sleep-best-supplements/`

The sleep cluster exposed two cornerstone pages serving the same broad “best supplements for sleep” reader job. The current decision guide is already the hub’s primary Best Supplements for Sleep page, while the older route remained in the full library and shared start-here registry as a second beginner entry point.

## Implementation

- retire the older route source;
- permanently redirect it to the current decision guide through the redirect-override pipeline;
- remove the retired route from the sleep hub and schema-backed guide list;
- repoint shared sleep start-here data and the goal-cluster cornerstone registry to the current route;
- protect the consolidation with route-specific regression coverage.

## Boundary

This change only consolidates route ownership and discovery signals. It does not add or strengthen sleep efficacy claims.
