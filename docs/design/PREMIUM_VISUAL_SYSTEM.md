# The Hippie Scientist — Premium Visual System

## Direction

The site should feel like a **botanical research journal crossed with a precision scientific instrument**: calm, authoritative, warm, legible, and materially refined without becoming decorative or luxurious at the expense of scientific credibility.

The visual system intentionally avoids the common supplement-site look of saturated green gradients, floating glass cards, excessive badges, and marketing-heavy glow effects.

## Core visual language

- **Canvas:** warm paper rather than pure white.
- **Ink:** graphite for primary reading text.
- **Structure:** restrained forest/sage where a botanical cue is useful.
- **Accent:** brass/gold used sparingly for hierarchy, active states, rules, and premium detail.
- **Display type:** Fraunces for editorial authority and distinctiveness.
- **Body/UI type:** Inter for clarity and dense scientific information.
- **Geometry:** consistent rounded rectangles and circles; avoid unrelated radii within the same composition.
- **Elevation:** subtle. Prefer border/material contrast before shadow.
- **Motion:** small positional movement only. No decorative motion required to understand the interface.
- **Semantic colors:** evidence and safety colors remain separate from brand color and must not be neutralized for aesthetics.

## Canonical ownership

The cascade is deliberately ordered in `app/layout.tsx`.

### 1. `app/globals.css`

Tailwind theme, browser/base defaults, and legacy compatibility primitives.

### 2. Legacy/template-specific layers

These may define local component behavior but must not become the source of truth for the global brand palette, global surfaces, controls, navigation chrome, or homepage atmosphere.

### 3. `styles/visual-token-hardening.css`

**Single owner of canonical brand values.**

Owns:

- graphite / forest / sage / brass / paper primitives
- light and dark theme aliases
- compatibility mappings for older `--hs-*` and Tailwind brand tokens
- the document canvas aliases consumed by later layers

It does **not** own buttons, focus rings, cards, navigation, or page composition. Accessibility owns focus behavior; visual components consume tokens instead of redefining them here.

Do not introduce a second brand palette in another stylesheet.

### 4. `styles/premium-foundation.css`

Owns global canvas structure and page measure only.

### 5. `styles/premium-surfaces.css`

Owns reusable neutral surface geometry and shared elevation behavior.

Semantic evidence/safety components may opt out because their color communicates meaning.

### 6. `styles/premium-typography.css`

Owns shared editorial voice: heading family, tracking, lede treatment, prose-link treatment, and section rhythm.

Page templates still own their specific type scale.

### 7. `styles/premium-controls.css`

**Single owner of generic action presentation.**

Owns:

- `.button-primary` and `.btn-primary`
- `.button-secondary`
- global light/dark action material treatment
- generic action lift/press behavior

Homepage-specific controls may refine this treatment later because they belong to a specific composition, but brand tokens themselves must remain value-only.

### 8. `styles/premium-chrome.css`

**Single owner of shell-facing presentation.**

Owns:

- primary navigation material treatment
- mega menus
- locale rail
- mobile navigation drawer
- duplicate breadcrumb suppression
- footer atmosphere

Navigation components should use canonical token variables directly rather than embedding a second hardcoded palette for this stylesheet to override.

### 9. `styles/homepage-structure.css`

Owns homepage-only geometry and interaction primitives that the React component relies on:

- comparison rows
- tool rows
- chips
- editorial link rows
- article labels
- methodology step geometry

It should not become a palette or atmosphere file.

### 10. `styles/homepage-premium-final.css`

**Single owner of homepage visual composition.**

Owns:

- homepage paper/canvas atmosphere
- hero composition and scientific evidence dial
- homepage heading treatment
- goal cards and specimen tiles
- comparison/tool/article materials
- methodology band
- homepage-specific responsive composition

Do not add another homepage override stylesheet after this file.

## Composition rules

1. **One dominant visual idea per viewport.** On desktop the hero evidence dial balances the headline. On mobile the headline and primary action carry the first screen.
2. **Do not give every block equal visual weight.** Use open sections, rails, hairlines, and typography before adding another card.
3. **Symmetry is structural, not monotonous.** Peer cards should share dimensions and spacing, while section types may use different compositions.
4. **Long-form scientific reading beats decoration.** Decorative detail must never reduce text measure, contrast, or scanability.
5. **Primary actions are visually scarce.** Graphite in light mode and brass in dark mode are the default primary-action treatments.
6. **Brass is an accent, not a fill system.** Large brass backgrounds should be exceptional.
7. **Brand color must not overwrite evidence meaning.** Strong/moderate/limited/risk and safety states keep their semantic palette.

## Responsive invariants

- 320 px wide screens must not horizontally overflow.
- Goal cards remain a balanced 2x2 decision grid when practical.
- The decorative evidence dial is desktop-only.
- Primary CTA buttons become comfortably tappable full-width controls on narrow screens when needed.
- Comparison names must remain readable without stranded `vs` markers.
- Safe-area insets must be respected in the mobile drawer.
- Hover-only affordances must not be required for understanding or navigation.

## Premium-quality test

A new visual change should be rejected when it does any of the following:

- introduces a new green/gold shade instead of using a token
- adds a new global `!important` override to fight another canonical layer
- creates a fourth or fifth card style for equivalent content
- adds glow or gradient purely to make a section feel more exciting
- makes dark mode structurally different from light mode
- reduces accessibility target size, contrast, or readable measure
- makes evidence/safety color less semantically clear
- requires another stylesheet loaded after the canonical owner to “fix” the result

## Current flagship homepage direction

The homepage should communicate, in order:

1. what the site helps the reader decide
2. evidence/safety credibility
3. goal-first entry points
4. familiar ingredients
5. comparisons and safety tools
6. recent research/editorial content
7. methodology and trust

The result should feel like one publication, not a collection of independently designed widgets.
