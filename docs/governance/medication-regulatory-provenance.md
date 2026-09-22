# Medication regulatory provenance contract

## Purpose

Define a dated, jurisdiction-aware source contract for approval, labeling, warnings, controlled status, and other regulatory facts used by medication and psychoactive compound profiles.

This layer is separate from efficacy evidence. Regulatory provenance answers **what an authority currently says or authorizes**; the evidence ledger answers **what the scientific evidence supports**.

## Canonical regulatory record

Each regulatory assertion should be representable with:

```text
entity_slug
jurisdiction
authority
status_type
status_value
indication_or_scope
source_title
source_url_or_identifier
source_revision_date
checked_at
supersedes
notes
```

`status_type` may include:
- approval
- labeled_indication
- boxed_warning
- contraindication
- medication_guide
- rems
- controlled_schedule
- safety_communication
- withdrawal_or_market_action
- other_authoritative_status

Unknown values remain unknown. Never infer a jurisdiction's status from another jurisdiction or from compound class.

## Source hierarchy

Prefer first-party regulator or official labeling sources for regulatory facts. Secondary literature may explain a regulatory event but must not silently become the canonical source for current approval or labeling state.

The record must preserve both the source revision date when available and the date the site checked it.

## Freshness

A regulatory claim without a review date is incomplete.

Rechecks should be prioritized when:
- the authority publishes a new safety communication;
- labeling changes;
- a REMS/Medication Guide changes;
- controlled status changes;
- a page is materially refreshed;
- the stored source can no longer be resolved.

A stale record must not be rewritten as current merely because no newer source was found.

## Rendering contract

Pages should distinguish:
- current approved indication;
- off-label use;
- investigational use;
- regulatory warning/status;
- scientific evidence.

A regulator warning does not quantify efficacy. Lack of approval does not by itself prove inefficacy. Approval does not mean every off-label or consumer claim is supported.

## Existing runtime mapping

Use existing runtime-facing fields where possible:
- `legal_status`
- `controlled_status`
- `controlled_schedule`
- `dea_status`
- `regulatory_status`
- `regulatory_federal`
- `regulatory_states_summary`
- `regulatory_states_table`
- `last_regulatory_check`
- `regulatory_changelog`
- `regulatory_sources`

Do not add a parallel generated truth store unless an implementation issue demonstrates that these fields cannot represent the required provenance.

## Promotion gates

Medication/psychoactive profiles must fail closed when a material regulatory assertion is required for safe rendering but lacks authoritative provenance.

Restricted/high-risk profiles retain the existing human-review requirements. A regulatory source cannot bypass scientific evidence review, and scientific citations cannot bypass regulatory provenance.

## Change log

When a material status changes, preserve:
- previous value;
- new value;
- authority/source;
- effective or publication date when known;
- site verification date.

Do not silently overwrite historical regulatory state.

## Validation requirements

Future implementation should validate:
- allowed status types;
- jurisdiction presence;
- authoritative source presence for material regulatory claims;
- parseable review/check dates;
- no future-dated checks;
- no duplicate active records for the same entity/jurisdiction/status scope unless explicitly versioned;
- no approved/off-label/investigational category collision.

## Regression contract

Never fabricate an approval, warning, schedule, REMS, indication, or regulator action. Never infer US status from non-US status or vice versa. Never use affiliate/product data as regulatory evidence. Never let a regulatory update rewrite scientific efficacy claims without separate evidence review.
