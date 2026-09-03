# Article social preview system

The article social preview pipeline is a build-time distribution surface for Facebook, X/Twitter, messaging apps, search surfaces, and any crawler that consumes Open Graph metadata.

## Source of truth

Article and blog Markdown/MDX frontmatter remains the content source of truth. Social cards may use only presentation-safe fields:

- `slug`
- `title`
- `category`
- count of declared references

The social card must **not** promote evidence grades, treatment conclusions, safety conclusions, efficacy claims, recommendations, reviewer credentials, or other governed scientific assertions unless a future change explicitly binds those fields to the canonical governance layer and adds dedicated regression coverage.

## Shared identity contract

`lib/article-social.js` is the shared identity layer used by both Next metadata and the build-time image generator.

It owns:

- card template version
- 1200×630 dimensions
- JPEG format contract
- title/category normalization
- physical asset path
- deterministic cache key
- crawler-visible image URL
- image alt text

The crawler-visible URL is intentionally different from the physical file path:

```text
physical: /media/social/articles/valerian-root.jpg
public:   /media/social/articles/valerian-root.jpg?v=<template-and-content-key>
```

This preserves a simple, correctly typed static JPEG for Cloudflare while forcing social crawlers to see a new URL whenever the rendered title, category, source count, slug identity, or card template version changes.

## Build pipeline

`scripts/media/build-article-social-images.mjs` runs from the article build and:

1. scans article/blog content sources;
2. rejects duplicate slugs;
3. builds a deterministic, article-specific SVG composition;
4. renders a real JPEG with Sharp;
5. verifies JPEG format and exact 1200×630 dimensions;
6. enforces an asset-size budget;
7. computes SHA-256 for the rendered bytes;
8. rejects duplicate rendered digests;
9. writes `public/media/social/articles/manifest.json` with integrity metadata.

Generated JPEGs and the manifest are disposable build artifacts; they are reproducible from source and should not become a second editorial source of truth.

## Metadata contract

`app/articles/[slug]/page.tsx` is the **only** article social metadata authority.

The page must keep these surfaces aligned on the same cache-keyed image URL:

- Open Graph image
- Twitter/X large image card
- Article JSON-LD `ImageObject`
- Article JSON-LD `thumbnailUrl`

The nested article layout must not create a second Twitter/Open Graph image definition.

## Visual contract

Cards should be recognizable as The Hippie Scientist without becoming repetitive generic billboards.

Required design properties:

- title-first hierarchy;
- restrained forest / graphite / ivory / brass visual system;
- subtle category accent;
- deterministic article-specific motif derived from slug identity;
- at most three title lines;
- cited-source count only when references exist;
- no legacy `SUPPLEMENT RESEARCH FRAMEWORK` artwork;
- no evidence-grade badge or ungoverned scientific claim.

## Debugging a stale Facebook preview

1. Confirm the deployed article HTML contains the expected cache-keyed `og:image` URL.
2. Open that image URL directly and confirm it returns the intended JPEG.
3. Confirm the physical image is 1200×630 and the server returns an image content type.
4. Compare the URL's `?v=` key with the current article title/category/source count/template version.
5. If Facebook still shows an older card, request a fresh scrape with Meta's current sharing/debugging tool or republish after the new URL is deployed. Existing Facebook posts can retain cached preview data even after the site source is corrected.

## Change rule

Any future change to social-card semantics or layout must either:

- leave `ARTICLE_SOCIAL_CARD_VERSION` unchanged only when rendered output semantics cannot change; or
- increment the version when a template-level visual/semantic change should invalidate crawler caches globally.

Tests in `tests/article-social-images.test.mjs` lock the current trust, cache, metadata, and visual contracts.
