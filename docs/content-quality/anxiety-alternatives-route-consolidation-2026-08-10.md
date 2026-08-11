# Anxiety alternatives route consolidation — 2026-08-10

## Decision

Canonical owner: `/guides/anxiety/best-herbs-for-anxiety/`

Retired route: `/guides/anxiety/natural-alternatives-to-anxiety-medication/`

The retired page already declared the Best Herbs for Anxiety route as its canonical while serving a thin, overlapping anxiety-support decision job. Maintaining both routes split discovery signals and allowed a separate one-ingredient commercial treatment of substantially the same reader intent.

## Implementation

- retire the duplicate page source;
- redirect both slash and non-slash variants through the redirect-override build pipeline;
- remove the retired route from the anxiety hub and its schema-backed guide list;
- protect the canonical decision with a route-specific regression test.

## Boundary

This consolidation does not claim that herbs replace prescribed anxiety treatment. The surviving canonical guide remains responsible for evidence calibration, safety context, and treatment-boundary language.
