# Editorial Runtime Payload Contract

## Scope

The editorial runtime exporter is intentionally review-oriented.

Its responsibility is:

- workbook ingestion
- normalization
- review payload export
- governance metadata generation

It is not responsible for:

- production publishing
- route generation
- static export generation
- mutation of runtime payloads already under `public/data`

## Export destination

Default export directory:

```txt
ops/editorial-runtime/
```

## Payloads

### compound-pages.json

Array of normalized compound-page records.

Minimum shape:

```txt
slug
title
subtitle
summary
evidence_tier
safety_level
introduction
evidence_research
practical_use_dosage
safety_side_effects
personal_notes
where_to_buy
references
review_status
```

## learn-articles.json

Minimum shape:

```txt
slug
title
dek
body
practical_takeaways
cautions
review_status
```

## research-notes.json

Minimum shape:

```txt
slug
title
compound_or_topic
study_type
what_was_studied
findings
limitations
practical_takeaway
citation
review_status
```

## compare-rows.json

Minimum shape:

```txt
category
compound
best_fit_use_case
evidence_confidence
typical_onset
stimulation_sedation_profile
main_caution
better_avoided_when
notes
review_status
```

## manifest.json

Should contain:

```txt
export timestamp
source workbook path
record counts
missing optional sheets
validation summary
review status
```

## Canonical normalization

### Slugs

- lowercase
- kebab-case
- normalized unicode
- trimmed repeated hyphens

### Evidence tiers

Canonical runtime values:

```txt
strong
moderate
limited
theoretical
unknown
```

### Safety levels

Canonical runtime values:

```txt
safe
review
caution
avoid
unknown
```

## Runtime promotion policy

Payloads under `ops/editorial-runtime/` are review artifacts only.

A future promotion step may:

- validate schemas
- validate citations
- verify safety language
- require human approval
- then promote approved records into `public/data`

That workflow is intentionally deferred.
