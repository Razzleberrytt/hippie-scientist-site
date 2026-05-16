# Herbs index simplification pass

## Goals

- Make `/herbs` easier to scan, especially on mobile.
- Reframe herb cards as fast decision tools instead of compact article previews.
- Preserve conservative evidence and safety framing without adding new claims.
- Keep the change scoped to the index experience and avoid touching runtime/workbook generation.

## Hierarchy changes

Herb cards now prioritize the sequence a visitor needs for a quick decision:

1. **Name** — the clearest anchor at the top of each card.
2. **One-line practical summary** — capped to two lines so cards stay compact.
3. **Best for** — derived from existing effect/action/mechanism fields with a conservative fallback.
4. **Evidence** — normalized into cautious labels such as `Insufficient evidence`, `Traditional use`, and `Needs review` when source data is sparse.
5. **Safety** — displayed as its own decision row rather than mixed into a badge system.
6. **Time to effect** — shown only when available from existing runtime fields.
7. **CTA** — a full-width tap target so the next action is obvious on mobile.

## Constraints

- No workbook files, runtime generation scripts, `package.json`, or lockfiles were changed.
- No dosage guidance or new medical promises were added.
- Existing route contracts remain unchanged, including `/herbs/:slug`.
- Generated data remains treated as a build artifact.
- The page still uses the existing herb summary index and runtime visibility filter.

## Reasoning

The previous card design gave evidence/status badges, summaries, and effect chips similar visual weight. That made each card feel like an information dump and increased mobile scanning effort. The revised layout uses repeated labeled rows so visitors can compare cards by the same small set of questions: what it is, what it may be relevant for, how strong the evidence framing is, what the safety context looks like, and whether to open the profile.

The hero and goal-entry sections were also tightened so the first mobile viewport feels calmer and less visually dense before the herb grid appears.
