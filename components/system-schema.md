# Shared Component System Schema

**Ticket:** THS-0801  
**Status:** Architecture contract / migration guide  
**Scope:** Shared UI primitives under `components/*` and the semantic styling they consume  
**Source of truth reviewed:** `main` at `0e4f38bce034990173e0295073cca767063f884e`

## Purpose

This document defines the contract for shared UI primitives so page and feature work can converge on one visual, interaction, accessibility, and responsive system instead of introducing route-local variants.

This is intentionally a contract, not a mandate to rewrite every existing component at once. Existing working surfaces may migrate incrementally. New shared UI and touched code should conform to this schema unless a documented exception is required.

## Principles

1. Prefer semantic tokens and shared primitives over route-local hex values or one-off utility bundles.
2. Preserve semantic HTML. A link that navigates remains a link; a button that performs an action remains a button.
3. Interaction state is part of the component API: hover, active, focus-visible, disabled, loading, expanded, selected, and current states must not be improvised by consumers.
4. Light and dark themes express the same semantic hierarchy. Components consume semantic aliases rather than manually swapping raw palette values.
5. Evidence and safety meaning must never be communicated by color alone.
6. Motion is optional decoration. All interactive meaning and state must survive `prefers-reduced-motion: reduce`.
7. Mobile chrome must not obscure primary reading content or duplicate navigation semantics.
8. Component variants should describe product intent (`primary`, `feature`, `caution`) rather than incidental CSS (`green`, `shadow-xl`).

---

## 1. Typography tokens

### Existing foundations

`app/globals.css` currently defines these font families:

- `--font-sans` / `--font-body`: Inter family
- `--font-display`: Fraunces family
- `--font-mono`: JetBrains Mono

It also defines semantic leading and reading-width tokens:

- `--leading-display`
- `--leading-heading`
- `--leading-body`
- `--container-reading`
- `--container-prose`

Base headings currently use display type for `h1`/`h2` and sans for `h3`–`h6`. Body copy uses the sans family.

### Contract

| Role | Family | Intended use |
|---|---|---|
| Display | `font-display` | H1, H2, editorial/identity moments |
| Heading | `font-sans` | H3–H6, compact component titles |
| Body | `font-sans` / `font-body` | Prose, descriptions, controls |
| Mono | `font-mono` | Code, identifiers, machine-readable values when appropriate |

Rules:

- Do not select fonts directly inside a shared component.
- Use global heading semantics when a real heading is appropriate; use existing utilities such as `heading-premium` or `compact-heading` only when the semantic level and visual role intentionally differ.
- Long-form text should honor the current `68ch`–`72ch` reading range rather than filling large desktop containers.
- Chips, badges, metadata, and controls must not use a type size that makes state text unreadable at 200% zoom.
- Uppercase is reserved for short metadata/status labels, not sentences or safety guidance.

---

## 2. Spacing tokens

The project currently uses Tailwind's spacing scale plus semantic layout utilities such as:

- `container-page`
- `section-spacing`
- `detail-stack`
- `card-spacing`
- `section-rhythm-compact`
- `section-rhythm-balanced`

### Contract

Use the Tailwind spacing scale as the primitive scale and semantic classes as the public layout vocabulary.

| Intent | Preferred primitive |
|---|---|
| Inline icon/text gap | `gap-1` to `gap-2` |
| Compact metadata/chips | `gap-2` |
| Control cluster | `gap-2` to `gap-3` |
| Card internal rhythm | `card-spacing` plus local `space-y-*` only where needed |
| Section internal rhythm | `section-rhythm-compact` or `section-rhythm-balanced` |
| Page section rhythm | `section-spacing` / `detail-stack` |
| Page gutters | `container-page` |

Rules:

- Prefer `gap` for flex/grid children and margins for document flow; do not stack both without a reason.
- Shared components must not set page-level outer margins. Consumers own placement; primitives own internal spacing.
- Mobile spacing may compress, but touch targets and readable grouping must remain intact.

---

## 3. Color tokens

### Existing palette tokens

`app/globals.css` defines:

- Brand: `--color-brand-50` through `--color-brand-950`, plus `--color-brand`
- Sage: `--color-sage-50` through `--color-sage-900`
- Paper: `--color-paper-50` through `--color-paper-500`
- Earth accents: clay, ochre, moss, bark
- Evidence: strong, moderate, limited, theoretical, risk
- Safety: info, caution, avoid, ok

### Existing semantic aliases

Prefer these aliases in shared primitives:

- `--bg`
- `--surface`, `--surface-elevated`
- `--surface-card`, `--surface-card-strong`, `--surface-subtle`
- `--surface-code`, `--surface-warning`, `--surface-danger`, `--surface-info`, `--surface-neutral`
- `--text-primary`, `--text-secondary`, `--text-muted`
- `--border-soft`, `--border-strong`, `--border-default`
- `--ring-brand`
- `--accent-primary`, `--accent-secondary`, `--accent-teal`, `--accent-warning`, `--accent-danger`

### Contract

- Shared primitives consume semantic aliases first.
- Raw brand/sage/evidence/safety palette values are allowed when the semantic meaning itself is brand/evidence/safety.
- New hardcoded hex values inside shared components are prohibited unless accompanied by a documented token-gap TODO and tested light/dark contrast.
- Evidence and safety colors require text/icon/shape semantics in addition to color.
- `text-ink`, `text-muted`, and semantic CSS variables are preferred to route-specific gray/green literals.

---

## 4. Button variants

There is no canonical React `Button` primitive on the reviewed `main`. Existing consumers use shared-looking CSS classes such as `button-primary` / `button-secondary` and route-local utility bundles. This schema defines the target API without forcing a broad migration in this ticket.

### Target primitive

```ts
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'
```

Required behavior:

| Variant | Intent |
|---|---|
| `primary` | Highest-priority action in the local context |
| `secondary` | Normal alternative/action |
| `ghost` | Low-emphasis toolbar/inline action |
| `danger` | Destructive or irreversible action only |

States for every variant:

- default
- hover
- active/pressed
- focus-visible
- disabled
- loading when supported

Rules:

- Do not render an `<a>` as a button merely for appearance. Navigation CTAs may share the button visual recipe while remaining `Link`/anchor semantics.
- Disabled buttons use the native `disabled` attribute.
- Loading buttons must expose an accessible busy state, retain an understandable label, and prevent duplicate activation.
- Controls should provide a minimum mobile hit area of approximately 44 CSS px where practical; current decision controls already use `min-h-11`.
- A component may expose `className` for layout composition, but consumers must not use it to redefine variant semantics.

---

## 5. Icon-button states

### Target contract

An icon-only interactive control must have:

- a programmatic accessible name (`aria-label`, visible label via tooltip relationship, or equivalent)
- default, hover, active, focus-visible, and disabled states
- the same focus contract as text buttons
- a hit area large enough for touch use even when the glyph itself is small

Icon state rules:

- Decorative SVGs use `aria-hidden="true"`.
- Do not use icon color alone to communicate selected/error state.
- Toggle icon buttons expose `aria-pressed` when they represent an on/off state.
- Expand/collapse icon buttons expose `aria-expanded` and control association when applicable.
- Loading replaces or accompanies the glyph without removing the control's accessible name.

---

## 6. Card variants

### Current implementation

`components/ui/Card.tsx` currently exports:

- `Card`: general premium card shell with optional eyebrow, title, description, and children
- `DetailCard`: stronger section/detail surface
- `EvidenceBadge` and `RoleBadge` compatibility exports within the same file

Other domain cards also exist (for example decision/profile and evidence-oriented cards). They should compose shared surface rules rather than create unrelated card systems.

### Target vocabulary

| Variant | Purpose |
|---|---|
| `default` | Standard grouped content |
| `compact` | Dense list/decision row content |
| `feature` | Editorially emphasized destination/content |
| `detail` | Major detail-page information section |
| `interactive` | Whole-card link/action with complete keyboard focus state |
| `status` | Evidence/safety/decision status presentation |

Card invariants:

- semantic surface, border, radius, and calm shadow tokens
- predictable internal padding
- no nested heading-level assumption; consumers choose correct semantic heading level
- interactive cards have one obvious primary interactive target and complete focus-visible treatment
- hover lift/shadow is enhancement only and disabled under reduced motion where movement is used
- cards must not become the only way to infer evidence or safety state

---

## 7. Accordion states

The current global contract styles native `details` / `summary`, including open/closed labels and `details[open]` surfaces. `accordion-readable` provides a compact shared recipe.

Required states:

- closed
- hover on summary
- focus-visible on summary
- open/expanded
- disabled only when a non-native implementation genuinely requires it

Rules:

- Prefer native `details`/`summary` for static disclosure content.
- If a custom accordion is necessary, expose `aria-expanded`, an associated panel, keyboard activation, and deterministic IDs.
- Do not duplicate the generated Open/Close affordance when a component already provides its own accessible chevron/label; current CSS intentionally suppresses the generated marker for summaries containing an `aria-hidden` marker.
- Accordion content remains in document order and readable without animation.

---

## 8. Badge, tag, and role chips

Badges are compact status metadata, not miniature buttons.

### Roles

| Primitive | Meaning | Interactive? |
|---|---|---|
| Badge | status or categorical label | usually no |
| Tag/chip | metadata/filter label | only when explicitly implemented as control/link |
| Role chip | role classification such as SUPPORT | no by default |
| Status badge | decision/evidence/safety state | no unless it links to an explanation |

Current code includes `EvidenceBadge`, `RoleBadge`, `chip-readable`, and decision primitive class recipes.

Rules:

- Interactive chips must use anchor/button semantics, focus state, and a touch-safe target.
- Non-interactive badges must not receive `tabIndex` or button styling.
- Use sentence/title case for ordinary metadata; short standardized status codes may use uppercase.
- Avoid putting long explanatory copy inside pills.
- Badge color is supplementary; label text carries the meaning.

---

## 9. Evidence markers

Evidence UI is a trust surface and therefore has stricter semantics than ordinary decoration.

Current shared evidence components include dedicated evidence badges/meters/cards, and `EvidenceBadge` normalizes its label through `lib/decision-primitives` before linking to `/learn/evidence-levels/`.

### Contract

- Evidence components consume canonical normalized evidence values; they do not invent a new grade vocabulary locally.
- A visible label must accompany any meter, dot, bar, or color treatment.
- Tooltip/help text may explain methodology but cannot be the only source of the grade.
- Evidence markers that link to methodology remain links, not clickable `<span>` elements.
- Numeric scores and categorical grades must not imply equivalent precision unless the evidence model explicitly supports that mapping.
- Unknown/missing evidence must render an explicit neutral/insufficient state rather than silently defaulting to strong or positive treatment.
- Safety status and evidence strength are distinct dimensions and must not be merged into one visual scale.

---

## 10. Media slots

Media slots are layout primitives for images, illustrations, video posters, charts, and other embedded media.

### Target variants

- `inline`: bounded by reading column
- `wide`: may exceed prose width but stays within page container
- `card`: media inside a card with card-owned radius/overflow
- `hero`: high-priority identity/editorial media with responsive sizing

Rules:

- Images require meaningful `alt` text or empty `alt=""` when decorative.
- Width/height or an aspect-ratio reservation should prevent layout shift.
- Media must not overflow the viewport at narrow widths.
- Captions remain text, not baked into images.
- Video/audio controls remain keyboard accessible and do not autoplay disruptive media.
- Card media inherits the card's clipping/radius; do not double-round nested edges unnecessarily.

---

## 11. Reading chrome primitives

Reading chrome is UI around the article/detail content rather than the prose itself.

Canonical responsibilities:

- breadcrumb trail
- article/profile metadata row
- reading-width shell
- section anchors / table of contents when present
- evidence/methodology affordances
- related-content navigation
- sticky CTA only when it does not obscure content
- scroll-to-top utility

Rules:

- One breadcrumb trail per page. Current CSS already suppresses the root fallback when a page owns its own `nav[aria-label='Breadcrumb']`.
- Chrome must not create duplicate H1s or duplicate navigation landmarks with the same purpose.
- Sticky/fixed chrome must account for safe areas and must not cover focused elements or the final lines of reading content.
- Print styles should remove navigation/sticky chrome when it is not part of the printable content; current print rules already hide the global header/footer, mobile bottom nav, scroll-to-top control, and privacy notice for printable checklists.

---

## 12. Light / dark rules

The theme contract is class-based: `html.dark` overrides semantic variables, and `color-scheme` follows the active theme.

Rules for shared components:

1. Consume semantic surface/text/border/ring variables wherever possible.
2. Do not implement component-local theme state.
3. Do not assume `bg-white` means a semantic surface; prefer `var(--surface-card)` / `var(--surface-card-strong)` for shared primitives.
4. Raw light-mode utility colors require a corresponding tested dark-mode treatment until migrated.
5. Interactive contrast, focus indicators, evidence/safety labels, and disabled states must be legible in both modes.
6. Theme transition is decorative and cannot be required for understanding state.
7. New shared primitives should avoid adding to the legacy compatibility selector list in `globals.css`; migrate toward semantic variables instead.

---

## 13. Focus states

The current base style applies a 2px `--accent-primary` outline with 4px offset to `a`, `button`, `summary`, form controls, and other interactive elements under `:focus-visible`.

### Contract

- Never remove focus styling without providing an equal or stronger replacement.
- Prefer `:focus-visible` so pointer interaction is not visually noisy while keyboard navigation remains obvious.
- Shared interactive cards/controls that replace the base outline with a ring must maintain comparable contrast and area.
- Focus may not be clipped by `overflow: hidden` wrappers.
- Fixed/sticky chrome must not cover the focused element.
- Programmatic focus after navigation/dialog actions must land on a meaningful element.
- Disabled controls do not receive focus unless a specific accessible composite-widget pattern requires it.

---

## 14. Mobile anchor and footer chrome

The current stylesheet references `.mobile-bottom-nav`, confirming a dedicated mobile navigation surface is part of the application chrome.

### Contract

- Mobile fixed/sticky navigation uses one semantic navigation landmark with an accessible label.
- Account for `env(safe-area-inset-bottom)` on devices with a home indicator.
- The main content/footer must reserve enough bottom space that the last actionable/readable content is never hidden behind fixed chrome.
- Anchor targets require sufficient `scroll-margin-top`/offset for any sticky header.
- Current-route items expose `aria-current="page"`.
- Icons in bottom navigation are decorative when visible text already names the destination.
- Keep the number of persistent bottom-navigation destinations intentionally small; overflow destinations belong in a secondary menu rather than shrinking targets.
- The footer remains reachable and is not duplicated inside mobile navigation.
- Printable surfaces remove mobile fixed chrome unless the navigation itself is explicitly part of the print artifact.

---

## Component authoring contract

Every new shared interactive primitive should answer these questions in code or tests:

1. What semantic element does it render?
2. What are its finite variants and states?
3. What token names does it consume?
4. What is its keyboard behavior?
5. What is its accessible name/role/state exposure?
6. How does it behave in dark mode?
7. How does it behave at narrow/mobile widths?
8. What happens under reduced motion?
9. Does it reserve layout space for asynchronous/media content?
10. Which route-local patterns can safely migrate to it later?

## Migration policy

- **New code:** follow this schema immediately.
- **Touched code:** migrate the local pattern when the change is low-risk and scoped.
- **Untouched legacy code:** do not perform unrelated cleanup solely to satisfy this document.
- **High-risk trust/safety/evidence surfaces:** require their own ticket and verification rather than opportunistic migration.
- **Visual primitives:** preserve semantic HTML and route behavior during migration.

## Verification checklist for future primitive tickets

- Typecheck passes.
- Targeted unit/component tests pass.
- Keyboard focus is visible.
- Accessible name/role/state is correct.
- Light and dark themes are checked.
- Mobile width is checked.
- Reduced-motion behavior is safe.
- No evidence/safety meaning is color-only.
- No duplicate navigation/heading landmarks are introduced.
- Existing route behavior and URLs are preserved.

## Known backlog metadata discrepancy

THS-0801's explicit task is to create this shared component-system schema. The workbook acceptance-criteria text currently references an unrelated H3/nav-search/help hierarchy question. That acceptance text should be corrected or confirmed before THS-0801 is marked **Done**. This document implements the explicit task while intentionally avoiding a false completion claim against mismatched acceptance metadata.
