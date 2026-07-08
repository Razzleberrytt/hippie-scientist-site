# International SEO Policy

The site currently publishes one canonical locale:

- `en-US` at `https://thehippiescientist.net/`
- `x-default` points to the same English canonical URL

## Current implementation

The international SEO foundation is intentionally conservative:

- Root `<html>` uses `lang="en-US"` and `dir="ltr"`.
- Homepage metadata emits language alternates for the real current URL only:
  - `en-US`
  - `x-default`
- Locale helpers live in `src/lib/international-seo.ts`.

## Do not add fake hreflang

Do not add `es`, `fr`, `de`, `pt`, or other language alternates until matching translated pages exist and are publishable.

Bad example:

```ts
alternates: {
  languages: {
    es: 'https://thehippiescientist.net/es/sleep/',
  },
}
```

That is only valid when `/es/sleep/` exists, is indexable, and contains equivalent Spanish content.

## Future localization checklist

When translated pages are ready, add them one locale at a time:

1. Create the translated page route.
2. Confirm it has equivalent intent and content depth.
3. Give the translated page a self-canonical URL.
4. Add reciprocal hreflang alternates between the English and translated versions.
5. Keep `x-default` pointed at the best fallback page.
6. Include only canonical, indexable localized URLs in any sitemap alternates.

## Target rollout order

Suggested future order:

1. Spanish, if real translated pages are created.
2. Canadian/UK English only if there is region-specific content, spelling, product availability, or legal context.
3. Other languages only after a translation/review workflow exists.

## Rule of thumb

International SEO should reflect pages that actually exist. It should not be used as a signal generator for content that has not been translated, reviewed, and published.
