# Compounds index simplification pass

## Hierarchy strategy

The `/compounds` index now follows the same decision-engine hierarchy established by the herbs index. The page orients visitors with a calm hero, compact library signal stats, one search module, a short set of orientation links, and then the profile grid.

Compound cards prioritize information in this order:

1. **Name** — the fastest identity cue.
2. **One-line practical summary** — restrained description when source data provides one, with a conservative fallback.
3. **Best-for context** — practical investigation context derived from effects, source herbs, mechanisms, or research context.
4. **Evidence, safety, and timing** — compact decision metrics without overstating confidence.
5. **Mechanism hints** — limited to a small number of secondary chips to avoid badge overload.
6. **CTA** — a single quiet profile action at the bottom of the card.

## Compound-card philosophy

Compounds carry higher trust and safety risk than whole-herb browsing, so cards are intentionally restrained. They are not recommendation cards and do not imply that a compound should be taken in isolation. The card should quickly answer:

- What is this compound?
- Why might someone investigate it?
- Is the evidence mature enough to notice?
- Is there safety context or uncertainty?
- Is the full profile worth opening?

The card structure mirrors the herbs card pattern so users do not need to relearn the scan language between `/herbs` and `/compounds`.

## Evidence and safety presentation rules

Evidence labels use conservative fallbacks:

- `Limited evidence`
- `Mixed evidence`
- `Preliminary evidence`
- `Traditional use`
- `Needs review`
- `Insufficient evidence`

Preclinical, animal, cell, or mechanistic signals are normalized toward `Preliminary evidence`. Unknown or review-oriented values are normalized toward `Needs review`. Safety presentation similarly favors `Needs review`, `Limited safety data`, `Some safety context`, or `Safety notes available` over confident claims when source fields are sparse.

The page avoids deterministic outcome language, dosage language, hype framing, and nootropic marketing claims.

## Reuse strategy from `/herbs`

The pass intentionally reuses the established herbs index primitives and rhythm:

- Same mobile-first hero structure.
- Same compact stat-card pattern.
- Same search form and progressive-disclosure filter pattern.
- Same recovery-oriented empty states.
- Same decision metric component shape.
- Same card CTA hierarchy and hover/focus behavior.
- Same evidence/safety uncertainty philosophy.

The implementation keeps the runtime boundary narrow: the server page loads compound data and applies runtime visibility filtering, while the small index client owns URL-state search, context filters, and card interaction behavior. No workbook/runtime-generation behavior or route contract was changed.

## Mobile scan decisions

Mobile scanability is improved by removing the prior visual glyph emphasis and reducing competing badges. The card reads vertically: identity, summary, best-for context, decision metrics, mechanism hints, CTA. Filters remain behind a `details` disclosure by default unless a search or context filter is active.

The first mobile viewport is designed to show page purpose, restrained scientific framing, and library signals without presenting a dense wall of metadata.

## Constraints and non-goals

This pass does not:

- Change `/compounds/:slug` route contracts.
- Change workbook/runtime generation.
- Modify generated `public/data` artifacts.
- Add dependencies.
- Add dosage guidance or medical claims.
- Redesign unrelated pages.
- Replace existing data pipelines.
- Reframe compounds as aggressive recommendations.
