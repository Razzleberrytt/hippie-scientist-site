# International Platform Integration

This document defines the first safe implementation layer for regional shopping and commerce links.

## Current priority

The business goal is to make international visitors more useful without creating fake translated pages first.

The first supported regions are:

- United States (`US`)
- United Kingdom (`UK`)
- Canada (`CA`)

The first platform modeled is Amazon, because many current product links use Amazon US.

## Core rule

Regional links must be explicit.

Do not guess that a US product URL, ASIN, search URL, or product detail page automatically maps cleanly to the same product in another country. Product availability, listing IDs, pricing, and compliance can differ by marketplace.

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

## What this foundation intentionally does not do

- It does not auto-redirect by IP address.
- It does not auto-redirect by browser language.
- It does not create Spanish/French/etc. translated pages.
- It does not add `hreflang` for pages that do not exist.
- It does not rewrite every product card yet.
- It does not assume Amazon OneLink is enabled.
- It does not reuse a US tracking ID for UK or Canada.

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

### PR 5: product-by-product regional expansion

Add regional URLs only where they are confirmed.

## Amazon OneLink note

OneLink or any equivalent platform-routing feature should be evaluated separately before implementation. The site should only rely on it if the account setup, store IDs, and tracking behavior are confirmed.
