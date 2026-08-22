# The Hippie Scientist — Premium Visual System

Tracking issue: #4070

## Direction

The site should feel like a **botanical research journal crossed with a precision scientific instrument**: calm, authoritative, warm, legible, and materially refined without becoming decorative or luxurious at the expense of scientific credibility.

The visual system intentionally avoids the common supplement-site look of saturated green gradients, floating glass cards, excessive badges, and marketing-heavy glow effects.

## Core visual language

- **Canvas:** warm paper rather than pure white, with only low-contrast document texture.
- **Ink:** graphite for primary reading text.
- **Structure:** restrained forest/sage where a botanical cue is useful.
- **Accent:** brass/gold used sparingly for hierarchy, active states, rules, and premium detail.
- **Display type:** Fraunces for editorial authority and distinctiveness.
- **Body/UI type:** Inter for clarity and dense scientific information.
- **Geometry:** consistent rounded rectangles and circles; avoid unrelated radii within the same composition.
- **Elevation:** subtle. Prefer border/material contrast and inner highlights before shadow.
- **Motion:** small positional movement only. No decorative motion required to understand the interface.
- **Semantic colors:** evidence and safety colors remain separate from brand color and must not be neutralized for aesthetics.

## Canonical ownership

The cascade is deliberately ordered in `app/layout.tsx`.

### 1. `app/globals.css`

Tailwind theme, browser/base defaults, legacy compatibility primitives, and existing root-vs-template breadcrumb fallback behavior.

### 2. Legacy/template-specific layers

These may define local component behavior but must not become the source of truth for the global brand palette, global surfaces, controls, navigation chrome, or homepage atmosphere.

### 3. `styles/visual-token-hardening.css`

**Single owner of canonical brand values.**

Owns:

- graphite / forest / sage / brass / paper primitives
- light and dark theme aliases
- compatibility mappings for older `--hs-*` and Tailwind brand tokens
- the document canvas and low-contrast texture aliases consumed by later layers

It does **not** own buttons, focus rings, cards, navigation, or page composition. Accessibility owns focus behavior; visual components consume tokens instead of redefining them here.

Do not introduce a second brand palette in another stylesheet.

### 4. `styles/premium-foundation.css`

Owns global canvas structure, the restrained document-grain treatment, and page measure. The texture must remain non-interactive, low contrast, theme-aware, and removable for reduced-transparency preferences; it must never become route-specific decoration.

### 5. `styles/premium-surfaces.css`

Owns reusable neutral surface geometry, material contrast, inner highlights, shared elevation, and neutral chip treatment.

Semantic evidence/safety components may opt out because their color communicates meaning.

### 6. `styles/premium-typography.css`

Owns shared editorial voice: heading family, tracking, lede treatment, editorial labels, prose-link treatment, and section rhythm.

Page templates still own their specific type scale.

### 7. `styles/premium-controls.css`

**Single owner of generic action presentation.**

Owns:

- `.button-primary` and `.btn-primary`
- `.button-secondary`
- global light/dark action material treatment
- generic action hover, press, and disabled behavior

Homepage-specific controls may refine this treatment later because they belong to a specific composition, but brand tokens themselves must remain value-only.

### 8. `styles/premium-chrome.css`

**Single owner of shell-facing visual presentation.**

Owns:

- primary navigation material treatment and publication seal
- mega menus
- locale rail
- mobile navigation drawer material treatment
- footer atmosphere

It does not decide which breadcrumb instance is visible. That fallback behavior already exists in `app/globals.css`, and having two visibility owners can hide both trails.

Navigation components should use canonical token variables directly rather than embedding a second hardcoded palette for this stylesheet to override.

### 9. `styles/homepage-structure.css`

Owns homepage-only geometry and responsive layout primitives that the React component relies on:

- hero/search geometry
- goal decision grid
- comparison-row structure and editorial index column
- methodology/principle layout
- responsive composition

It should not become a palette or atmosphere file.

### 10. `styles/homepage-premium-final.css`

**Single owner of homepage visual composition.**

Owns:

- homepage paper/canvas atmosphere
- homepage heading and search treatment
- goal decision-panel material
- research-library statistics treatment
- comparison index/row materials
- methodology band and principle icon treatment
- homepage-specific responsive visual behavior

Do not add another homepage override stylesheet after this file.

## Composition rules

1. **One dominant visual idea per viewport.** The homepage hero is the dominant opening idea; search and the goal chooser support it rather than competing with it.
2. **Do not give every block equal visual weight.** Use open sections, rails, hairlines, typography, and supporting panels before adding another card.
3. **Symmetry is structural, not monotonous.** Peer choices should share dimensions and spacing, while section types may use different compositions.
4. **Long-form scientific reading beats decoration.** Decorative detail must never reduce text measure, contrast, or scanability.
5. **Primary actions are visually scarce.** Graphite in light mode and brass in dark mode are the default primary-action treatments.
6. **Brass is an accent, not a fill system.** Large brass backgrounds should be exceptional.
7. **Brand color must not overwrite evidence meaning.** Strong/moderate/limited/risk and safety states keep their semantic palette.
8. **Material refinement is cumulative, not flashy.** Thin borders, tiny inner highlights, restrained shadows, and consistent spacing should create the premium feel before gradients or ornament are considered.

## Responsive invariants

- 320 px wide screens must not horizontally overflow.
- The four homepage health goals remain a balanced 2×2 decision grid on narrow screens and a four-across rail on wider screens.
- Primary CTA buttons remain comfortably tappable and preserve existing touch-target requirements.
- Comparison names remain readable without stranded `vs` markers; editorial numbering is decorative and hidden from assistive technology.
- Safe-area insets are respected in the mobile drawer.
- Hover-only affordances are not required for understanding or navigation.
- Dark mode keeps the same information hierarchy as light mode.
- Reduced-motion behavior remains explicit on interactive visual layers.

## Premium-quality test

A new visual change should be rejected when it does any of the following:

- introduces a new green/gold shade instead of using a token or a documented token mix
- adds a new global `!important` override to fight another canonical layer
- creates a fourth or fifth card style for equivalent content
- adds glow or gradient purely to make a section feel more exciting
- makes dark mode structurally different from light mode
- reduces accessibility target size, contrast, or readable measure
- makes evidence/safety color less semantically clear
- requires another stylesheet loaded after the canonical owner to “fix” the result
- reintroduces stale homepage concepts that are no longer rendered

## Current flagship homepage direction

The current homepage is deliberately a compact research index rather than a feature dashboard. It should communicate, in order:

1. evidence-based supplement decision support
2. direct search by ingredient/name
3. goal-first entry points for Sleep, Anxiety, Stress, and Focus
4. research-library scale as supporting context, not the main value proposition
5. high-value comparison paths
6. methodology, evidence hierarchy, and visible safety principles

The result should feel like one publication, not a collection of independently designed widgets.
