# Semrush Follow-up Exact Issue Fixes — 2026-07-08

Uploaded follow-up exports:

- `www.thehippiescientist.net_structured_data_that_contains_markup_errors_20260708.csv`
- `www.thehippiescientist.net_http_4xx_client_errors_20260708.csv`
- `www.thehippiescientist.net_broken_canonical_urls_20260708.csv`

## Export summary

| Export | Rows | Main finding |
| --- | ---: | --- |
| Structured data markup errors | 1,051 | Product snippet/entity schema warnings across 276 unique pages, plus 10 Article breadcrumb rows and 1 Carousel/ListItem row. |
| HTTP 4XX client errors | 392 | Exact 404 URLs, mostly stale `/guides/compare/...` routes plus legacy `/articles`, `/goals`, `/education`, `/guides`, and scientific-name herb slugs. |
| Broken canonical URLs | 8 | Canonicals pointing at deprecated scientific herb slugs such as `/herbs/piper-methysticum/`, `/herbs/passiflora-incarnata/`, and `/herbs/hericium-erinaceus/`. |

## Implemented fixes

### Full HTTP 4XX coverage

Added `public/redirect-overrides/001-semrush-http-4xx-2026-07-08.txt` with exact 301 redirects for all 392 URLs in the HTTP 4XX export.

The large group of stale `/guides/compare/...` URLs now goes to `/guides/compare/`. Legacy topic paths are routed to the closest live hub or guide, for example:

- `/articles/alpha-gpc-and-adhd/` → `/guides/adhd/alpha-gpc-and-adhd/`
- `/goals/anxiety/` → `/guides/anxiety/`
- `/education/how-focus-and-motivation-work/` → `/learn/how-focus-and-motivation-work/`
- `/herbs/piper-methysticum/` → `/herbs/kava/`

The deploy redirect merger emits both slash and non-slash variants for these path rules.

### Broken canonicals

Added `scripts/seo/repair-broken-canonicals.mjs` and wired it into `scripts/build-deploy.mjs` immediately after `build-production`.

The script scans exported HTML and replaces deprecated scientific-name canonical aliases with the live public canonical URLs, including:

- `/herbs/piper-methysticum/` → `/herbs/kava/`
- `/herbs/passiflora-incarnata/` → `/herbs/passionflower/`
- `/herbs/hericium-erinaceus/` → `/herbs/lions-mane/`

This directly targets the 8 broken canonical URL rows without changing page rendering.

### Structured data markup errors

The JSON-LD sanitizer was already responsible for removing invalid Article breadcrumb attachments, invalid ListItem rows, invalid entity fields, and entity-level `isPartOf` problems.

This follow-up hardens the sanitizer further so Product/DietarySupplement-style rich-result types are stripped when the node does not actually provide product support fields such as `offers`, `review`, or `aggregateRating`. The site profiles are editorial reference pages, not purchasable product listings, so this avoids fake offers/ratings while preserving useful entity schema as `Thing`, `MedicalSubstance`, `ChemicalSubstance`, or related non-product types.

## Notes

These are exact export-driven fixes. After merge and Cloudflare deployment, Semrush needs a rerun to verify reductions because its current issue list reflects the pre-fix crawl.
