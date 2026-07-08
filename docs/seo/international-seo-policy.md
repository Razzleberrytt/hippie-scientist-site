# International SEO Policy

The site currently publishes one production locale: English for the United States (`en-US`).

## Current safe implementation

- The root HTML document declares `lang="en-US"` and left-to-right text direction.
- The homepage metadata may emit an `en-US` alternate and an `x-default` alternate to the same canonical homepage URL.
- Central locale values live in `src/lib/international-seo.ts` so future localized routes can reuse one source of truth.

## Important rule

Do **not** add Spanish, French, German, UK-English, Canadian-English, or other `hreflang` alternates until the translated or localized URL actually exists and contains equivalent localized content.

Incorrect example:

```ts
// Do not do this unless the Spanish page exists.
languages: {
  'en-US': 'https://thehippiescientist.net/guides/sleep/',
  'es': 'https://thehippiescientist.net/es/guides/sleep/',
}
```

Correct future pattern once a localized URL exists:

```ts
languages: {
  'en-US': 'https://thehippiescientist.net/guides/sleep/',
  'es-US': 'https://thehippiescientist.net/es/guides/sleep/',
  'x-default': 'https://thehippiescientist.net/guides/sleep/',
}
```

## Why this matters

`hreflang` is a reciprocal promise: each listed URL should point back to its alternates and should represent equivalent content for a different language or region. Adding fake alternates before localized pages exist can confuse search engines and dilute canonical signals.

## Future localization checklist

Before adding a new locale to `SUPPORTED_LOCALES`:

1. Create the localized route structure.
2. Translate or localize the page content, not just the title tag.
3. Keep canonical URLs self-referential for each locale.
4. Add reciprocal `hreflang` alternates between equivalent pages.
5. Include the localized URLs in the sitemap only after they are indexable.
6. Confirm navigation lets users switch language/region without forcing auto-redirects.
7. Run a crawl to verify no localized URL points to a missing or English-only page.
