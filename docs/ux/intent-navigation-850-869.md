# Intent Navigation Upgrade — Backlog 850–869

This tranche makes **Goals, Ingredients, Compare, and Safety** the dominant first-level pathways while keeping advanced research resources one click away.

## Measurement contract

Primary and mobile navigation clicks emit the consent-gated `navigation_click` event with:

- `nav_label`
- `nav_destination`
- `nav_intent`
- `nav_surface`
- `page_path`

The navigation order should be changed only after enough production data exists to show a stable preference. This implementation deliberately does **not** auto-reorder navigation from sparse or local data.

## Differentiator hub

`/tools/` now explains five distinct jobs in seconds:

1. Safety Checker
2. Evidence Database
3. Botanical Activity Atlas
4. Evidence Report
5. Comparisons

It also exposes concrete demo paths so first-time visitors do not face an empty state:

- Check Ashwagandha + Melatonin
- Show A-grade ingredients
- Explore compounds found in Turmeric
- Compare Magnesium vs Melatonin

## Promotion / demotion rule

Use measured `navigation_click` events to compare destination use by surface and page path. Promote destinations only when the result is sustained and statistically meaningful enough to justify changing global information architecture; demote consistently unused entries into the most semantically appropriate submenu rather than deleting discoverability.
