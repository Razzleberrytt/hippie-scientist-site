# Thin Content + Structured Data Guard Pass — 2026-07-08

## Goal

Follow-up after the Semrush cleanup PRs to reduce thin utility-page content and prevent the structured-data markup errors from returning.

The earlier structured data exports showed 259–276 affected pages depending on crawl timing. The recurring patterns were:

- Product snippet nodes missing `aggregateRating`, `offers`, or `review`
- Invalid entity properties: `knownUse`, `evidenceLevel`, `safetyWarnings`
- Invalid entity `isPartOf`
- Invalid direct `breadcrumb` on Article-like nodes
- Nested `ListItem` rows missing `item` or `url`

## Implemented structured-data guard

Added `scripts/ci/validate-structured-data-regressions.mjs` and wired it into `scripts/build-deploy.mjs` after the static export and canonical repair steps.

The new validator scans every exported HTML file under `out/`, parses every JSON-LD script block, and fails the deploy build if any known Semrush-style regression appears.

It blocks:

- Invalid properties: `evidenceLevel`, `knownUse`, `safetyWarnings`
- `Product` / `DietarySupplement` nodes that do not include real product support fields
- Article-like nodes with direct `breadcrumb`
- `ListItem` nodes missing both `item` and `url`
- Entity nodes such as `MedicalSubstance`, `ChemicalSubstance`, `Drug`, or `MolecularEntity` with invalid `isPartOf`

This is intentionally a build-time guard, not just documentation, so future schema regressions should fail before Cloudflare deployment.

## Thin-content improvements

Added crawlable explanatory content to utility/tool pages that are useful to readers but previously leaned heavily on interactive client components:

- `/safety-checker/`
- `/info/dosing/`
- `/learn/explorer/`

Each page now includes additional explanatory sections before the client-heavy tool UI. The new sections clarify:

- How to interpret the tool output
- What the tool can and cannot answer
- When safety or clinician review matters
- How mechanism/pathway information fits into evidence evaluation
- Why dose math, extract standardization, and stacking can be misleading

The intent is to improve content depth without inflating runtime data payloads or turning tool pages into long unfocused articles.
