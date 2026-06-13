# Educational content layer

Markdown files in this directory power the **structured educational content
layer** that feeds global search (and can feed the `/education/*` routes).

Every directory under `app/education/*` is automatically searchable using a
titleized fallback. Adding a matching `<slug>.md` here **enriches** that entry
with a real summary, facets, and a body excerpt — which dramatically improves
how findable the page is.

## Recommended frontmatter

```yaml
---
slug: how-stress-affects-the-brain   # must match the app/education/<slug> route
title: How Stress Affects the Brain  # falls back to a titleized slug
summary: One-to-two sentence plain-language description (shown in results).
category: Stress Physiology           # grouping label
goals:                               # use-case facets (see taxonomy below)
  - stress
  - sleep
pathways:                            # mechanism facets (see taxonomy below)
  - hpa-axis
  - cortisol
evidenceGrade: Moderate              # Strong | Moderate | Limited | Preliminary | Educational
safety: Educational overview only.   # short safety framing string
keywords:                            # extra search terms (synonyms, jargon)
  - cortisol
  - allostatic load
tags:                                # short chips shown on the result card
  - stress
  - recovery
relatedHerbs:                        # slugs — power cross-links / co-search
  - ashwagandha
relatedCompounds:
  - magnesium-glycinate
readingTime: 9 min read
updated: 2026-06-08
---
```

### Why these fields improve searchability

| Field | Effect on search |
|-------|------------------|
| `summary` | Indexed (weighted) and shown under the result; the single biggest relevance win. |
| `keywords` | Lets layperson terms and scientific jargon both match the same page. |
| `goals` / `pathways` | Drive the faceted **Goal / use case** and **Pathway** filters. Frontmatter values are merged with anything auto-detected from the text. |
| `evidenceGrade` | Drives the **Evidence grade** filter and badge. |
| `tags` | Rendered as chips and indexed as a high-weight key. |
| `relatedHerbs` / `relatedCompounds` | Reserved for cross-linking; keep them as canonical slugs. |
| Body text | The first ~320 characters become a searchable excerpt. Put the clearest explanation up top. |

## Facet taxonomies

Goals: `sleep, stress, anxiety, focus, energy, mood, cognition, recovery,
inflammation, pain, immune, gut-health, longevity, heart-health`

Pathways: `dopamine, serotonin, gaba, glutamate, acetylcholine, hpa-axis,
inflammation, oxidative-stress, bdnf, endocannabinoid`

Values outside these lists still work (they appear as their own facet chip), but
sticking to the taxonomy keeps filters tidy.

## MDX components (`.mdx` files)

Both `.md` and `.mdx` files are read here. Use `.mdx` when you want to embed
evidence-transparency components. The available components are registered in the
root [`mdx-components.tsx`](../../mdx-components.tsx) registry, so no per-file
import is needed:

- `<StudyDesignSnapshot>` — keeps a practical takeaway prominent and tucks the
  grade rationale, trial design factors, and limitations into an optional,
  accessible disclosure. Live examples on the
  [Study Design Snapshot hub](../../app/education/study-design-snapshot/page.tsx).
- `<EvidenceSummaryCard>`, `<ResearchLimitations>`, `<MisconceptionCallout>`,
  `<SafetyNotice>`.

### Frontmatter that supports `<StudyDesignSnapshot>`

Keep the study facts in frontmatter and spread them into the component so the
component itself stays data-free and reusable:

```yaml
pivotalStudy:
  grade: Moderate                 # Strong | Moderate | Limited | Preliminary | Educational
  summary: One-line practical takeaway (always visible).
  gradeRationale: Why this grade was assigned.
  studyType: Randomized, double-blind, placebo-controlled
  population: Adults with poor sleep
  participants: ~60 per trial
  duration: 6–8 weeks
  comparator: Placebo
  dosing: ~300–600 mg/day standardized extract
  limitations:
    - Small samples and short durations.
    - Several trials are manufacturer-funded.
```

```mdx
<StudyDesignSnapshot {...frontmatter.pivotalStudy} />
```

## Rebuild after editing

```bash
npm run search:build-index
```

This regenerates `public/data/search-index.json`, which is what the UI reads.
The step also runs automatically inside `npm run data:build`.
