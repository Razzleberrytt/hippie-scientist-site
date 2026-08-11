# Anxiety alternatives route consolidation — 2026-08-10

## Decision

Canonical owner: `/guides/anxiety/best-herbs-for-anxiety/`

Redirected route: `/guides/anxiety/natural-alternatives-to-anxiety-medication/`

The redirected page already declared the Best Herbs for Anxiety route as its canonical while serving a thin, overlapping anxiety-support decision job. Maintaining it as a discoverable destination split signals and allowed a separate one-ingredient commercial treatment of substantially the same reader intent.

## Implementation

- permanently redirect the overlapping URL through the redirect-override build pipeline;
- retain the existing source only as a build compatibility artifact, with its canonical still pointing to Best Herbs for Anxiety;
- remove the redirected route from the anxiety hub and its schema-backed guide list;
- surface the canonical Best Herbs for Anxiety guide in the hub's best-first section;
- protect the canonical decision with a route-specific regression test.

## Boundary

This consolidation does not claim that herbs replace prescribed anxiety treatment. The canonical guide remains responsible for evidence calibration, safety context, and treatment-boundary language.
