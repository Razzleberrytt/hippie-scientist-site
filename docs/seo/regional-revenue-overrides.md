# Regional Revenue Product Overrides

This file documents the product-by-product override layer for international platform integration.

## Purpose

The existing revenue product config can continue to use its current US/default URLs.

Regional URLs should be added separately through `config/regional-revenue-products.ts` only after each marketplace destination is manually verified.

## Why separate overrides?

Keeping regional URLs in a separate registry reduces risk:

- existing US affiliate behavior remains unchanged
- UK/Canada URLs can be added one product at a time
- unverified marketplace guesses are avoided
- product-card routing can use the same resolver introduced in the platform foundation

## Key format

A regional override key is built from:

```txt
<product-set-slug>:<slot>:<normalized-product-title>
```

Example:

```txt
omega-3:premium:sports-research-triple-strength-omega-3
```

## Required fallback

Every override must include a US fallback URL.

This keeps behavior stable when a selected region lacks a verified URL.

## URL requirements

Regional URLs must be absolute HTTPS URLs.

Do not add:

- relative URLs
- HTTP URLs
- guessed Amazon marketplace URLs
- unverified ASIN mappings
- affiliate tags from the wrong regional account

## Future wiring

The next implementation step is to enrich product cards with regional override data by matching:

- revenue product set slug
- recommendation slot
- product title

After that, UK/Canada URLs can be added gradually with verification notes.
