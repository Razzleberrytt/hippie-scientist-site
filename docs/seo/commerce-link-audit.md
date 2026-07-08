# Commerce Link Audit

The international platform-integration project should audit existing commerce links before adding regional marketplace URLs.

## Why this exists

The site currently has a US-first revenue-product system. Before adding UK/Canada marketplace destinations, we need a repeatable way to inspect the current commerce-link surface area.

The audit script is intentionally read-only.

```bash
node scripts/audit-commerce-links.mjs
```

To write a JSON report:

```bash
node scripts/audit-commerce-links.mjs --out reports/commerce-link-audit.json
```

## What it checks

The script inventories:

- revenue product affiliate URL call sites
- explicit ASIN-backed product entries
- generic Amazon search fallback entries
- Amazon host mentions across commerce-related files
- whether the regional override registry exists
- UK/Canada override mentions

## What it does not verify

This script does not confirm that a product exists in Amazon UK or Amazon Canada.

It also does not confirm Amazon Associates tracking IDs, OneLink setup, product availability, pricing, or compliance.

Those checks still require manual verification before adding regional URLs.

## Safe rollout sequence

1. Run the audit.
2. Confirm regional affiliate accounts / store IDs.
3. Confirm whether OneLink is available and compliant for the account.
4. Add regional override URLs only when the exact product destination has been verified.
5. Keep US/default affiliate links as the fallback path.

## Guardrail

Do not mass-generate UK/Canada marketplace URLs from US URLs or ASINs. Regional Amazon listings can differ by marketplace, seller, availability, price, supplement rules, and tracking setup.
