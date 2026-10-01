# Content Journey Analytics Inventory

## Scope

Lightweight click instrumentation focused on high-value content flows:

1. Homepage → herbs/compounds/collections
2. Collection page → detail page
3. Detail page → interaction checker
4. Detail page → builder
5. Detail page → related entities

Events are stored through the existing consent-gated local analytics queue (`appendAnalyticsEvent`) and keep the
same low-overhead event model used by current collection funnel tracking. The five core content-journey
click events are also forwarded to the existing consent-gated `gtag` path so aggregate production
analytics can observe the same event names without creating a second journey taxonomy.

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


## Social experiment attribution

When a visitor lands with a bounded THS social campaign tag such as:

```text
utm_source=facebook
utm_medium=social
utm_campaign=ths_social_2026q4
utm_content=exp003_glycine_studied_dose
```

the analytics layer may retain only the normalized campaign identity for the current browser session,
and only after analytics consent. The raw query string is not stored as attribution state.

The normalized dimensions are:

- `social_source`
- `social_medium`
- `social_campaign`
- `social_experiment_id`
- `social_landing_path`

The corresponding local analytics-event fields use camelCase names. Page views, guide views,
primary-navigation clicks, and the five content-journey events carry the same experiment identity
when a valid social-attribution session exists.

### Privacy and fail-closed rules

- Social attribution state is not created before analytics consent.
- Revoking/clearing analytics-owned state removes the social-attribution session key.
- Only recognized social sources, `utm_medium=social`, a bounded `ths_social_<year>q<quarter>`
  campaign, and a stable `expNNN_<slug>` content identifier are accepted.
- Free-form query values, search terms, and person-level identifiers are not copied into social
  attribution state.
- Missing or malformed attribution remains absent; it is not rewritten as direct traffic or a zero.
- Session attribution is first-touch within the tab: later internal navigation keeps the original
  social experiment identity.

## Platform performance versus qualified visits

Metricool/provider observations keep upstream platform signals separate from first-party site
outcomes. `platformLinkClicks` is an optional upstream metric and is never substituted for
`qualifiedVisits`.

If a published distribution observation is missing `qualifiedVisits` or another metric required by
the canonical measured-feedback contract, the connector returns an explicit
`waiting-for-qualified-visits` state and leaves the lifecycle published. It does not insert zero and
does not advance the lifecycle to measured.

Only a complete, receipt-bound observation with the canonical source/tagged-destination identity may
enter `ingestDistributionObservations` and transition to measured. This preserves cross-platform
isolation and the existing Unknown-not-zero rule.
