# Reduce visual fragmentation pass

## Scope

This pass focused only on the homepage, herb detail pages, compound detail pages, and shared profile/hero surfaces. It preserved runtime data loading, route contracts, workbook semantics, and existing component architecture.

## Fragmentation problems identified

- Homepage sections used multiple equal-weight bordered panels in quick succession: hero shell, research launcher, ecosystem cards, featured cards, and disclaimer all competed as separate surfaces.
- Profile heroes stacked a bordered hero card, pill navigation, evidence badges, chip groups, and a bordered decision sidebar, creating nested-card fatigue before users reached the actual evidence context.
- Decision snapshots used many small cardlets with matching border, radius, background, and shadow treatments, making supporting facts feel as important as primary headings.
- Collapsed long-form profile sections appeared as repeated rounded cards, which made deferred content feel like a dashboard module list instead of a calmer reading flow.
- Evidence snapshot and trust surfaces used boxed treatments inside already structured profile pages, adding extra visual compartments for supporting trust information.

## Containers removed or simplified

- Removed the homepage hero's bordered glass-card treatment in favor of direct page flow, stronger type, and whitespace.
- Converted homepage reasoning pillars from boxed mini-cards into a light text row separated by a single top rule.
- Replaced the homepage research launcher card with a simple horizontal band and softened the secondary navigation buttons.
- Changed practical-context homepage cards to left-rule text links instead of four competing boxed cards.
- Simplified featured profile metadata from bordered pills to quieter text labels while retaining the card as the one primary browsing surface.
- Removed herb and compound profile hero borders and shadows while keeping the warm hero background.
- Converted herb and compound decision sidebars from nested bordered cards into a single quiet tinted sidebar with divider-led rows.
- Converted herb and compound disclosure sections from repeated rounded cards into open page-flow sections divided by horizontal rules.
- Simplified collection links inside profile disclosures from boxed chips to quiet underline-style links.
- Changed the shared evidence snapshot from a card containing smaller cards into one horizontal evidence band with divider-led metrics.
- Changed the trust bar from a rounded bordered widget into a simple horizontal trust strip.

## Hierarchy improvements

- Increased macro spacing between major homepage and profile sections so users perceive fewer simultaneous regions.
- Reduced micro-surface density inside decision sidebars by replacing each small fact card with a row separated by a subtle top rule.
- Limited highly visible homepage and profile badge/chip density where signals were competing with page titles and summaries.
- Preserved emphasis for primary decision moments: the hero, safety callout, decision snapshot, and featured profiles remain visually distinct.
- Made secondary educational and discovery material recede by using borders as separators rather than full containers.

## Intentionally deferred issues

- Deeper nested-card patterns inside authority, discovery, semantic graph, and decision-layer child components were not refactored to avoid broad architecture changes.
- Collection, goal, stack, comparison, education, and SEO entry page visual systems were left untouched because they were outside scope.
- Global card/chip utility classes were not rewritten, since many pages outside this pass depend on them.
- No new design system primitives or animation patterns were introduced.
- Generated data and workbook semantics were intentionally left unchanged.
