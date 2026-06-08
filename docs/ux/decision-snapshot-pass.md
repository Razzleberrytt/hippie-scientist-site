# Decision snapshot hierarchy pass

## Scope

This pass audits the herb and compound profile hero areas and strengthens the above-the-fold decision layer without changing route contracts, data pipelines, or runtime data shapes.

## Findings

- Herb profiles split quick decision cues between a small hero aside and a second section below the hero, which diluted the intended "start here" behavior.
- Compound profiles showed summary prose, badges, signal chips, and a separate evidence snapshot metric card near the top, so the practical fit signals did not clearly dominate.
- Both profile types had important scan cues available at runtime, but they were not grouped into a single mobile-first decision read.

## Changes made

- Promoted a larger `Decision snapshot` panel into the hero on herb and compound detail pages.
- Grouped the first-read cues into consistent scan cards:
  - commonly used for
  - evidence strength
  - calming vs stimulating
  - safety level
  - avoid / review first if
  - onset / timeline
  - mechanism hints
- Reduced surrounding hero prose sizing so summary copy supports the decision layer instead of competing with it.
- Removed the duplicate herb decision-snapshot section below the hero.
- Moved the compound evidence metrics card behind a disclosure so it remains available without competing above the fold.

## Data and framing notes

- No new data fields were added.
- The calming/stimulating read is derived conservatively from existing runtime text signals such as effects, mechanisms, and safety notes.
- Fallback copy explicitly says when a signal is not clearly specified instead of inventing details.
- Safety copy preserves conservative educational framing and keeps avoid-if context in the first-read panel.
