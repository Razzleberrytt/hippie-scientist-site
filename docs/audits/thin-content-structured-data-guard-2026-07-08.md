# Thin Content + Structured Data Guard Pass — 2026-07-08

## Goal

Follow-up after the Semrush cleanup PRs to reduce thin utility-page content and prevent the structured-data markup errors from returning.

The earlier structured data exports showed 259–276 affected pages depending on crawl timing. The recurring patterns were:

- Product snippet nodes missing `aggregateRating`, `offers`, or `review`
- Invalid entity properties: `knownUse`, `evidenceLevel`, `safetyWarnings`
- Invalid entity `isPartOf`
- Invalid direct `breadcrumb` on Article-like nodes
- Nested `ListItem` rows missing `item` or `url`

## Refreshed Semrush issue summary

A refreshed aggregate issue CSV, `thehippiescientist.net_issues_20260708 2.csv`, showed major cleanup progress after the redirect and schema work landed:

| Issue | Failed checks |
| --- | ---: |
| 4xx errors | 0 |
| Broken internal links | 0 |
| Large HTML page size | 0 |
| Structured data that contains markup errors | 3 |
| Low text to HTML ratio | 570 |
| Low word count | 36 |
| Duplicate content in H1 and title | 130 |
| Pages with only one internal link | 68 |
| Content not optimized | 236 |

The remaining 3 structured-data failures require a URL-level export before exact row remediation. The validator below therefore runs in report-only mode by default during deploy builds, but supports strict mode for exact debugging.

## Low text-to-HTML ratio export

The uploaded low text-to-HTML CSV, `thehippiescientist.net_text_html_ratio_20260708 2.csv`, included 570 affected URLs:

| URL family | Rows |
| --- | ---: |
| `/herbs/` | 187 |
| `/compounds/` | 171 |
| `/guides/` | 100 |
| `/learn/` | 73 |
| `/articles/` | 15 |
| `/info/` | 13 |
| `/novel-psychoactive-substances/` | 5 |
| `/evidence/` | 3 |
| Home/search/safety-checker | 3 |

The fix is intentionally template/build-level rather than 570 manual edits.

Implemented coverage:

- Added crawlable explanatory sections directly to `/safety-checker/`, `/info/dosing/`, and `/learn/explorer/`.
- Added a normal React-rendered footer research-context block that appears across the site and explains how to use profiles, guides, safety checks, and affiliate/product content.
- Added `scripts/seo/inject-content-depth-support.mjs`, a post-export step that injects route-aware supporting copy into exported HTML for the URL families in the Semrush export: herb profiles, compound profiles, guide pages, compare pages, learn pages, articles, info/tools, evidence pages, search, safety checker, and the homepage.

## Implemented structured-data regression audit

Added `scripts/ci/validate-structured-data-regressions.mjs` and wired it into `scripts/build-deploy.mjs` after the static export and canonical repair steps.

The validator scans every exported HTML file under `out/`, parses every JSON-LD script block, and reports any known Semrush-style regression pattern.

It reports:

- Invalid properties: `evidenceLevel`, `knownUse`, `safetyWarnings`
- `Product` / `DietarySupplement` nodes that do not include real product support fields
- Article-like nodes with direct `breadcrumb`
- `ListItem` nodes missing both `item` and `url`
- Entity nodes such as `MedicalSubstance`, `ChemicalSubstance`, `Drug`, or `MolecularEntity` with invalid `isPartOf`

By default, the deploy build writes `ops/reports/structured-data-regressions.json` and warns without failing. Set `STRICT_STRUCTURED_DATA_REGRESSIONS=1` to make the audit blocking once the remaining URL-level Semrush export is available.

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
