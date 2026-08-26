# Localization Expansion Audit — 2026-08-26

## Scope

Audit and harden the multilingual system after the Italian/Dutch/Polish expansion, then add the next safe language wave without weakening scientific translation governance.

## Implemented expansion

- Supported locales: **8 → 10**.
- Added core Japanese locale: `ja` under `/ja/`.
- Added core Korean locale: `ko` under `/ko/`.
- Added **20 substantive localized core pages**: ten Japanese + ten Korean.
- Total translated core route artifacts after this wave: **90** across nine non-English locales.
- Existing reviewed detailed scientific profile translations remain limited to Spanish, Brazilian Portuguese, French, and German.
- New unsupported detailed-profile hreflang mappings introduced: **0**.

## Integration audit findings and fixes

### 1. Locale identity was duplicated across UI surfaces

Before this wave, language labels, short switcher labels, and pathname-prefix detection were repeated outside the canonical SEO registry.

Fix:

- `src/lib/international-seo.ts` now owns language labels, short labels, path prefixes, language/region metadata, Open Graph locale, and text direction.
- Standalone language switching now reads those values directly.
- `src/lib/localized-chrome.ts` consumes the same identity registry.
- Pathname locale detection is centralized and reused.

Result: a future locale cannot be added to SEO while silently missing from switcher detection or language labeling without failing tests.

### 2. Theme-control localization was trapped inside a client component

Fix:

- Moved theme accessibility copy into `src/lib/localized-theme-copy.ts`.
- Added Japanese and Korean theme labels.
- The integration contract can now audit theme copy without importing a client UI runtime.

### 3. Localized sitemap clusters omitted `x-default`

Page metadata already emitted `x-default`, but `app/localized/sitemap.ts` did not include it in its language-alternate map.

Fix:

- Every localized sitemap cluster now includes `x-default` pointing to the English canonical.
- Sitemap tests require it.

### 4. New-language integration depended on a manual checklist

Fix:

Added `src/lib/__tests__/localization-contract.test.ts` to fail closed when a supported locale is missing:

- unique locale prefix
- locale metadata
- language label / short label
- navigation and accessibility chrome
- theme-control copy
- locale layout
- locale homepage
- catch-all localized route runtime
- any of the ten required core route families
- resolvable localized navigation links
- registry-driven locale detection

### 5. Scientific-profile expansion remains deliberately gated

Japanese and Korean detailed profiles are **not** advertised in hreflang until claim-level translations are complete and reviewed. The audit explicitly tests that Ashwagandha and L-theanine remain absent from the Japanese/Korean detailed-profile clusters.

## Current core localization matrix

| Locale | Core pages | Ashwagandha profile | L-theanine profile |
| --- | ---: | ---: | ---: |
| `es` | 10 | yes | yes |
| `pt-BR` | 10 | yes | yes |
| `fr` | 10 | yes | yes |
| `de` | 10 | yes | yes |
| `it` | 10 | no | no |
| `nl` | 10 | no | no |
| `pl` | 10 | no | no |
| `ja` | 10 | no | no |
| `ko` | 10 | no | no |

## SEO invariants

- English remains the `x-default` fallback.
- Hreflang is emitted only for real reciprocal pages.
- Published localized pages remain self-canonical and indexable.
- Localized sitemap entries are sourced from the same route registry as metadata and UI switching.
- Detailed scientific profile translation coverage may be narrower than core-page coverage.
- Language locale and commerce marketplace remain separate concepts.

## Next highest-ROI localization work

Do not immediately add another language simply to increase the locale count. Measure indexing, impressions, clicks, and query demand for the current locale set first. The next expansion should normally be one of:

1. deeper translated topic coverage in locales showing real demand;
2. reviewed claim-level translations for high-value scientific profiles;
3. query/localization refinement based on Search Console language-market performance;
4. another language only when demand and review capacity justify it.
