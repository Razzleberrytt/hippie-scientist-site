# Affiliate Link Checklist

## Where Placeholders Live

- `content/recommendations.ts` contains search-based Amazon affiliate sourcing paths for recommendation cards.
- `config/revenue-products.ts` contains existing revenue product sets and is currently search-link oriented.
- `src/lib/affiliate.ts` builds Amazon search URLs with the configured affiliate tag.

## Replacement Steps

1. Replace search-based URLs with owner-approved product-specific URLs when available.
2. Keep `AFFILIATE_TAGS.amazon` from `config/affiliate.ts`; do not hardcode new tags.
3. Keep affiliate labels visible near recommendation sections.
4. Re-run `npm run typecheck`, `npm run lint`, and `npm run build`.

## Required Rel Attributes

External affiliate links must use:

```html
rel="sponsored nofollow noopener noreferrer"
```

Non-affiliate external links should use:

```html
rel="noopener noreferrer"
```

## FTC Disclosure Placement

- Include a compact disclosure above or inside monetized recommendation sections.
- Use the full disclosure on `/affiliate-disclosure`.
- Do not hide affiliate status in button-only UI.

## Amazon Associates Reminder

If Amazon Associates links are active, include the required Amazon disclosure wherever the owner decides the final compliance language belongs. Current site copy says the site may earn commissions from qualifying links, but the owner should confirm final wording against the active Amazon Associates account requirements.

## Product Selection Rules

- Prefer products with clear ingredient identity, form, serving size, and standardization where relevant.
- Avoid products with disease-treatment claims, proprietary blends that hide core dose, or unsafe stimulant/sedative positioning.
- Do not imply a product treats insomnia, anxiety, depression, ADHD, thyroid disease, anemia, sleep apnea, or any medical condition.
- Keep product copy category-level unless the owner has reviewed the specific product.

## Unsafe Claim Avoidance

- Use "support," "compare," "often discussed for," and "may be relevant when" language.
- Avoid "cures," "treats," "reverses," "guaranteed," and diagnosis-specific promises.
- Keep clinician guidance visible for pregnancy, nursing, medications, health conditions, persistent symptoms, and stimulant or sedative stacking.
