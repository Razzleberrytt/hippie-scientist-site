# Content Journey Analytics Inventory

## Scope

Lightweight click instrumentation focused on high-value content flows:

1. Homepage → herbs/compounds/collections
2. Collection page → detail page
3. Detail page → interaction checker
4. Detail page → builder
5. Detail page → related entities

Events are stored through the existing local analytics queue (`appendAnalyticsEvent`) and keep the
same low-overhead event model used by current collection funnel tracking.

## Current + Added Coverage

### Existing before this change

- `collection_page_view`
- `collection_cta_click`
- `collection_item_add_to_checker`
- `collection_item_add_to_stack`
- `collection_combo_run`
- `collection_lead_capture_submit`

### Added in this change

| Event name | Trigger | Source (`slug`) | Target (`item`) | Context field |
| --- | --- | --- | --- | --- |
| `homepage_entity_click` | Homepage click-through to herb/compound/collection destinations | `home` | `<type>:<slug>` | `placement` label |
| `collection_detail_click` | Click from collection cards into herb/compound detail pages | `<collection_slug>` | `<type>:<slug>` | `placement` label |
| `detail_interaction_checker_click` | Click from herb/compound detail into interaction checker | `<detail_type>:<detail_slug>` | `interaction-checker` | `placement` label |
| `detail_builder_click` | Click from herb/compound detail into builder | `<detail_type>:<detail_slug>` | `build` | `placement` label |
| `detail_related_entity_click` | Click to related entities from herb/compound detail pages | `<detail_type>:<detail_slug>` | `<type>:<slug>` | `placement` label |

## Naming Notes

- Event names are journey-oriented and explicit.
- `context` stores placement-level detail (e.g., `featured_discoveries`, `similar_herbs`) for
  contractor-friendly analysis without introducing a heavy schema migration.
- Added metadata fields (`context`, `sourceType`, `targetType`) are optional and backward-compatible
  with existing analytics events.
