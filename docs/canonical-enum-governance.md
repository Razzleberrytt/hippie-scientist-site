# Canonical Enum Governance

## Purpose

Prevent runtime inconsistency across:

- evidence labels
- safety labels
- compare tables
- decision engine rendering
- semantic filtering
- search indexing

## Principle

Runtime payloads should never invent enum values dynamically.

Enums should be:

- centralized
- normalized
- validated
- versioned
- human-reviewable

## Evidence tiers

Canonical values:

```txt
strong
moderate
limited
theoretical
unknown
```

## Safety levels

Canonical values:

```txt
safe
review
caution
avoid
unknown
```

## Review states

Canonical values:

```txt
draft
review_required
citation_verification_required
approved
blocked
published
```

## Compare categories

Canonical values:

```txt
focus-cognition
stress-anxiety
sleep
physical-recovery
longevity
mood
motivation
```

## Mechanism categories

Canonical values:

```txt
adaptogen
nootropic
mineral
amino-acid
mushroom
stimulant
mitochondrial-support
```

## Runtime behavior

Validation should:

- reject unsupported enum values
- warn on casing mismatches
- normalize whitespace
- normalize unicode

## Editorial behavior

Editors should:

- select from canonical values only
- avoid inventing synonyms
- avoid inconsistent capitalization
- avoid mixed terminology

## Future runtime integration

Future runtime UI can use enums for:

- filtering
- badges
- compare-table rendering
- semantic search
- internal-link generation
- trust-layer rendering
