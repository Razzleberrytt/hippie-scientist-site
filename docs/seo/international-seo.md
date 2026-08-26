# International SEO Policy

The site publishes ten supported locales through one conservative reciprocal-hreflang registry:

- `en-US` — English at `https://thehippiescientist.net/`
- `es` — Spanish under `/es/`
- `pt-BR` — Brazilian Portuguese under `/pt/`
- `fr` — French under `/fr/`
- `de` — German under `/de/`
- `it` — Italian under `/it/`
- `nl` — Dutch under `/nl/`
- `pl` — Polish under `/pl/`
- `ja` — Japanese under `/ja/`
- `ko` — Korean under `/ko/`
- `x-default` points to the equivalent English canonical URL

## Source of truth

`src/lib/international-seo.ts` is the canonical locale registry. It owns:

- supported locale IDs
- language and region metadata
- Open Graph locale values
- text direction
- locale path prefixes
- language labels and short switcher labels
- reciprocal localized route mappings
- locale detection from a pathname

UI components should consume this registry instead of maintaining separate language lists or prefix-detection logic.

## Current implementation

The international SEO foundation is deliberately route-driven rather than language-count driven:

- Root English content remains `en-US` and `ltr`.
- Localized route wrappers set the appropriate `lang`, `dir`, and `data-locale` values.
- `src/lib/localized-chrome.ts` owns localized navigation/footer/accessibility copy while sourcing locale identity from the canonical registry.
- Language switchers only expose a locale when the current page has a real reciprocal translated route.
- Localized pages use self-canonical URLs and participate in sitemap/indexability checks only when they actually exist.
- Localized sitemap clusters include the English canonical, every real translated equivalent, and `x-default` back to English.

## Coverage model

Localization coverage is intentionally uneven when necessary for scientific quality.

Spanish, Brazilian Portuguese, French, and German currently include the ten core editorial routes plus reviewed translated Ashwagandha and L-theanine scientific profiles.

Italian, Dutch, Polish, Japanese, and Korean currently publish ten substantive core editorial pages each:

1. Homepage
2. Herbs library
3. Compounds/supplements library
4. Goals hub
5. Sleep goal
6. Stress goal
7. Anxiety goal
8. Focus goal
9. Methodology
10. Safety

Those five newer locales do **not** advertise translated Ashwagandha or L-theanine profile hreflang. Detailed claim-level scientific profiles remain linked in English until a complete translation can preserve every governed claim, limitation, safety statement, dose context, and citation relationship.

Japanese and Korean use stable ASCII route segments inside their locale prefix for the first core wave. The visible titles, navigation, metadata, explanatory copy, and accessibility chrome are localized; URL transliteration is not required for hreflang correctness and can be reconsidered only with a measured migration plan.

## Do not add fake hreflang

Never add a locale alternate merely because the locale is globally supported. A reciprocal alternate is valid only when the matching localized page exists, is indexable, and has equivalent intent.

Bad example:

```ts
translations: {
  ja: '/ja/herbs/ashwagandha/',
}
```

That mapping is invalid until the Japanese Ashwagandha page is a real reviewed translated scientific profile.

## Localization integration contract

Every newly supported translation locale must have all of the following before it is considered integrated:

1. A unique configured locale prefix.
2. Language/Open Graph/region/text-direction metadata.
3. A localized layout route.
4. A localized homepage route.
5. A localized catch-all core route runtime.
6. Complete coverage for every core route family.
7. Localized navigation/footer/accessibility chrome.
8. Localized theme-control copy.
9. Reciprocal hreflang from every member of each published route cluster.
10. Localized sitemap entries with reciprocal alternates and `x-default`.
11. Self-canonical and indexable metadata for each published localized page.
12. Tests proving the route registry exactly matches real published artifacts.

`src/lib/__tests__/localization-contract.test.ts`, `src/lib/__tests__/international-seo.test.ts`, `src/lib/__tests__/localization-integrity.test.ts`, and `app/__tests__/localized-sitemap.test.ts` collectively enforce this contract.

## Scientific-profile rule

Core educational navigation may be translated before detailed scientific profiles, but a scientific profile must fail closed until its governed translation is complete. Do not translate only the headline or summary while leaving claim semantics, safety boundaries, dose context, or citations unmatched.

This lets the site expand discoverability without turning localization into a shortcut around evidence governance.

## Audit cadence

Language expansion should be followed by recurring audits for:

- locale-registry completeness
- missing route artifacts
- duplicate or conflicting translated URLs
- broken localized internal links
- reciprocal hreflang parity
- sitemap alternate parity
- localized navigation links pointing at unpublished pages
- stale documentation language counts
- accidental profile hreflang for unreviewed translations
- search/indexability regressions after deployment

## Next expansion priorities

The next ROI should come from depth and measured demand rather than adding languages indefinitely. Before another locale wave, compare search demand and indexing performance across the current ten locales and prioritize:

1. expanding high-performing core topics within existing locales;
2. reviewed claim-level profile translations where demand justifies the review cost;
3. additional languages only when measurable demand and review capacity support them.

Region-specific English should be added only where spelling, legal context, product availability, or genuinely regional content justifies distinct URLs.

## Rule of thumb

International SEO must describe pages that genuinely exist. Never use hreflang as a signal generator for untranslated, incomplete, or unreviewed content.
