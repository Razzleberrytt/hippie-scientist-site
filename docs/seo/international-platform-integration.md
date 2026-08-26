# International Platform Integration

This document defines the safe implementation layer for regional shopping and commerce links. Language localization and commerce-region routing are related user experiences, but they remain separate systems with separate sources of truth.

## Current localization context

The site currently publishes English, Spanish, Brazilian Portuguese, French, German, Italian, Dutch, Polish, Japanese, and Korean localized routes. Locale availability does **not** imply that a matching regional commerce destination exists, and regional commerce support does **not** justify creating a translated page.

Japanese (`ja`) and Korean (`ko`) are language locales, not automatic marketplace selections. Likewise, Brazilian Portuguese (`pt-BR`) describes content language/region metadata but does not by itself authorize or imply a Brazilian commerce destination.

## Current commerce priority

The business goal is to make international visitors more useful without guessing product-marketplace equivalence.

The first supported commerce regions are:

- United States (`US`)
- United Kingdom (`UK`)
- Canada (`CA`)

The first platform modeled is Amazon, because many current product links use Amazon US.

## Core rule

Regional links must be explicit.

Do not guess that a US product URL, ASIN, search URL, or product detail page automatically maps cleanly to the same product in another country. Product availability, listing IDs, pricing, affiliate programs, tax treatment, and compliance can differ by marketplace.

Likewise, do not create or advertise locale-specific content merely to match a commerce region. Hreflang remains controlled by `src/lib/international-seo.ts` and requires a real equivalent localized page.

## Safe fallback order

When resolving a product destination:

1. Use the explicitly configured URL for the user-selected region.
2. Fall back to the explicitly configured US URL.
3. Fall back to the generic default URL already stored on the product.

This preserves current monetization behavior while allowing regional upgrades one product at a time.

## What this foundation does

- Adds a central region/platform model.
- Supports explicit regional URL maps.
- Keeps US as the default fallback.
- Keeps outbound link `rel` behavior explicit.
- Adds tests for fallback behavior.
- Coexists with the multilingual routing system without coupling locale to marketplace.

## What this foundation intentionally does not do

- It does not auto-redirect by IP address.
- It does not auto-redirect by browser language.
- It does not infer marketplace from locale alone.
- It does not infer language from marketplace alone.
- It does not add `hreflang`; localization owns that separately.
- It does not create translations solely for commerce coverage.
- It does not rewrite every product card yet.
- It does not assume Amazon OneLink is enabled.
- It does not reuse a US tracking ID for another marketplace.

## Future PR sequence

### PR 1: foundation

- Platform region config
- Resolver tests
- Documentation

### PR 2: revenue product data model

Add optional regional URLs to product entries, for example:

```ts
regionalUrls: {
  US: 'https://www.amazon.com/...',
  UK: 'https://www.amazon.co.uk/...',
  CA: 'https://www.amazon.ca/...',
}
```

### PR 3: recommendation component wiring

Let recommendation cards use the resolver while preserving current US fallback behavior.

### PR 4: user-selected region

Add a lightweight region selector with local storage:

- US
- UK
- Canada

No forced redirects.

### PR 5: measured marketplace expansion

Add Japan, South Korea, EU, or other regional destinations only when the relevant affiliate account, product availability, destination URLs, tracking behavior, and compliance requirements are confirmed. A language locale alone is never sufficient evidence to enable a marketplace.

## Amazon OneLink note

OneLink or any equivalent platform-routing feature should be evaluated separately before implementation. The site should only rely on it if the account setup, store IDs, and tracking behavior are confirmed.
