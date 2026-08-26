# International SEO Policy

The site now publishes eight supported locales through one conservative reciprocal-hreflang registry:

- `en-US` — English at `https://thehippiescientist.net/`
- `es` — Spanish under `/es/`
- `pt-BR` — Brazilian Portuguese under `/pt/`
- `fr` — French under `/fr/`
- `de` — German under `/de/`
- `it` — Italian under `/it/`
- `nl` — Dutch under `/nl/`
- `pl` — Polish under `/pl/`
- `x-default` points to the equivalent English canonical URL

## Current implementation

The international SEO foundation is deliberately route-driven rather than language-count driven:

- Root English content remains `en-US` and `ltr`.
- Localized route wrappers set the appropriate `lang`, `dir`, and `data-locale` values.
- `src/lib/international-seo.ts` is the canonical locale and reciprocal-route registry.
- `src/lib/localized-chrome.ts` owns localized navigation/footer/accessibility chrome.
- The language switchers only expose a locale when the current page has a real reciprocal translated route.
- Localized pages use self-canonical URLs and participate in sitemap/indexability checks only when they actually exist.

## Coverage model

Localization coverage is intentionally uneven when necessary for quality.

Spanish, Brazilian Portuguese, French, and German currently include the core editorial routes plus reviewed translated Ashwagandha and L-theanine scientific profiles.

Italian, Dutch, and Polish launch with ten substantive core editorial pages each:

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

Italian, Dutch, and Polish do **not** yet advertise translated Ashwagandha or L-theanine profile hreflang. Detailed claim-level scientific profiles remain linked in English until a complete translation can preserve every governed claim, limitation, safety statement, dose context, and citation relationship.

## Do not add fake hreflang

Never add a locale alternate merely because the locale is globally supported. A reciprocal alternate is valid only when the matching localized page exists, is indexable, and has equivalent intent.

Bad example:

```ts
translations: {
  it: '/it/erbe/ashwagandha/',
}
```

That mapping is invalid until `/it/erbe/ashwagandha/` is a real reviewed translated profile.

## Localization checklist

When expanding an existing locale or adding a future locale:

1. Create the translated page artifact.
2. Confirm equivalent intent and substantive content depth.
3. Preserve uncertainty, safety language, and scientific meaning.
4. Give the translated page a self-canonical URL.
5. Add the page to the canonical reciprocal-route registry.
6. Confirm hreflang reciprocity from every member of that route cluster.
7. Keep `x-default` pointed at the English fallback.
8. Include only canonical, indexable localized URLs in sitemap/indexability surfaces.
9. Add localized navigation/accessibility chrome for a newly supported locale.
10. Run the international SEO and localization-integrity contracts before merge.

## Scientific-profile rule

Core educational navigation may be translated before detailed scientific profiles, but a scientific profile must fail closed until its governed translation is complete. Do not translate only the headline or summary while leaving claim semantics, safety boundaries, dose context, or citations unmatched.

This lets the site expand discoverability without turning localization into a shortcut around evidence governance.

## Next rollout candidates

Potential future language waves should be chosen from measurable search demand and review capacity. Japanese and Korean remain logical candidates, but should be implemented only after their core content, navigation, typography, metadata, and review workflow are ready. Region-specific English should be added only where spelling, legal context, product availability, or genuinely regional content justifies distinct URLs.

## Rule of thumb

International SEO must describe pages that genuinely exist. Never use hreflang as a signal generator for untranslated, incomplete, or unreviewed content.
