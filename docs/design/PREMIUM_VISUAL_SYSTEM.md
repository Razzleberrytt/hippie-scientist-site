# The Hippie Scientist — Premium Visual System

**Status:** Supporting design standard + approved visual target
**Updated:** 2026-08-27
**Implementation parity:** Partial. This document defines the approved direction; current production code must still be inspected before claiming a token, font, logo, component, or state has shipped.
**Implementation inventory:** [`BRAND_UI_IMPLEMENTATION_PLAN.md`](BRAND_UI_IMPLEMENTATION_PLAN.md)

## Direction — locked

The site should feel like a **botanical research journal crossed with a precision scientific instrument**: calm, authoritative, warm, legible, and materially refined without becoming decorative or luxurious at the expense of scientific credibility.

The target balance is approximately:

- **50% editorial publication** — strong hierarchy, disciplined typography, generous paper-like space;
- **40% evidence/data product** — explicit evidence, limitations, safety, provenance, source access, and structured decision support;
- **10% botanical wellness** — restrained imagery and material cues rather than decorative herb-shop motifs.

The name *The Hippie Scientist* already supplies personality. The interface should make the **scientist** half unmistakable.

The visual direction is now considered **locked**. Future work should converge implementation toward it rather than restart logo, palette, or aesthetic exploration without a verified blocker.

## Canonical brand identity

### Logo family

The approved logo direction uses a custom **THS monogram**, the wordmark **THE HIPPIE SCIENTIST**, and the supporting line **EVIDENCE • SAFETY • CLARITY**.

The logo system must be authored as a family, not one graphic scaled everywhere:

1. **Primary emblem** — detailed THS monogram for large brand/editorial placements.
2. **Wordmark** — THE HIPPIE SCIENTIST, with the supporting line only when size/space permits.
3. **Horizontal lockup** — monogram + wordmark for wide placements.
4. **Compact mark** — optically simplified THS mark for navigation/mobile.
5. **32 px favicon/app mark** — separately optimized small mark.
6. **16 px favicon** — bespoke micro version with fewer/heavier strokes; never a blind downscale of the primary emblem.
7. **Reversed/dark-surface variants** — same geometry, controlled color treatment.
8. **Social/OG derivatives** — deterministic exports from committed source artwork.

Until those source assets are committed and wired, the logo direction is approved but not considered implemented.

### Tagline / recurring brand device

**EVIDENCE • SAFETY • CLARITY** is the preferred concise brand line and may act as a structural divider, footer device, or supporting lockup. It must not displace clearer task-specific UI copy.

## Canonical palette

The approved brand primitives are:

- **Forest Green:** `#1F3A2E`
- **Graphite:** `#2B2B2B`
- **Warm Ivory:** `#F7F4EF`
- **Antique Brass:** `#B08D3C`
- **Sage:** utility neutral only, not a fifth co-equal brand color; use a documented token such as `#A5ADA0`

### Color roles

- **Forest Green** — primary brand identity, major actions, selected/anchoring UI where contrast permits.
- **Graphite** — most reading text, essential small UI text, dense scientific information.
- **Warm Ivory** — editorial canvas and primary light surfaces.
- **Antique Brass** — accent only: rules, dots, logo details, selected emphasis, larger decorative type, restrained premium detail.
- **Sage** — utility/secondary neutral; never allowed to sprawl into a second botanical palette.

### Brass restraint

Brass is intentionally scarce. It should feel special because it is not used everywhere.

Do not make brass the default color for ordinary body links, essential microcopy, warnings, or long passages. Essential small text must meet contrast requirements independently of decorative brass treatment.

### Semantic colors are separate

Evidence, safety, risk, warning, success, unknown, stale, and unavailable states are semantic UI and **must not be overwritten by the brand palette**.

No evidence or safety meaning may depend on color alone. Labels, icons, borders/shapes, and explanatory text must preserve the meaning in grayscale and for color-vision differences.

## Typography

### Approved role split

- **Editorial serif target:** **Cormorant Garamond** for major headings, display titles, selected editorial callouts, and large evidence/result figures.
- **Functional sans:** a neutral, highly legible grotesk for navigation, body copy, research summaries, citations, filters, controls, safety text, tables, and metadata.

The exact functional sans is **not** locked to Neue Haas Grotesk Pro unless licensing, self-hosting, performance, localization, and build constraints are satisfied. The role is locked; the proprietary font is not.

### Current implementation reality

As of the 2026-08-27 inspection, `app/layout.tsx` imports self-hosted **Inter Variable** and **Fraunces Variable** through `@fontsource`. That remains the present implementation until a scoped ticket proves a migration.

Do not claim Cormorant is shipped merely because it is approved in the design direction. Do not introduce a Google Fonts build dependency.

### Type rules

- Long scientific prose, citations, safety copy, tables, and dense UI default to the functional sans.
- Editorial serif should create hierarchy, not reduce readability.
- Avoid ultra-light weights at small sizes.
- Responsive type scales must be coded from tokens/constraints, not copied pixel-for-pixel from generated mock imagery.
- Preserve current CJK/localization fallbacks and readable route-specific text direction.
- Use wide tracking sparingly and only at sizes where letter recognition remains strong.

## Signature product visual language

The site's distinctive visual system should come primarily from **how evidence is structured**, not from decorative branding.

### Claim → Evidence

The target signature component is a reusable claim-level evidence relationship that can show, when canonical data supports it:

1. **Claim** — the exact scoped user-facing finding.
2. **Evidence grade** — standardized, accessible label.
3. **Why this grade** — concise governed rationale.
4. **Research base** — study count/type/population/directness context.
5. **Key limitations** — visible and adjacent to the finding.
6. **Safety relevance** — only when supported.
7. **Last reviewed / evidence updated** — explicit date when known.
8. **Sources** — claim-scoped navigation into the existing citation/source system.
9. **Methodology** — link to evidence standards where useful.

This component must consume canonical evidence lineage. It may not paraphrase into a stronger claim, invent a rationale, hide contradictory evidence, or become a second scientific source of truth.

### Evidence grades

Use the standardized evidence semantics already documented for decision primitives unless a later governed decision supersedes them:

- Strong evidence
- Moderate evidence
- Limited evidence
- Mixed evidence
- Preliminary evidence
- Traditional use
- Insufficient evidence
- Needs review

### Confidence and transparency metrics

Do not show pseudo-precise scores such as `86% confidence` or `98% research transparency` merely because they look quantitative.

A percentage may ship only when its formula, inputs, missing-data behavior, interpretation, and audit path are documented and reproducible. Otherwise use categorical confidence plus explanatory factors.

Study counts are supporting context. A larger count does not automatically mean stronger evidence.

## Existing product primitives — reuse before creating

A future design implementation must inspect current exact `main` because several capabilities already exist in one or more forms:

- evidence matrices;
- editorial comparison tables;
- global citation drawer;
- interaction warnings;
- dosage-context UI;
- evidence/safety badges;
- evidence-confidence explanation;
- research-limitations and safety-notice modules;
- shared decision primitives;
- tooltips;
- skeleton/loading states;
- library empty states.

The target is **convergence and canonical ownership**, not another parallel component family. See [`BRAND_UI_IMPLEMENTATION_PLAN.md`](BRAND_UI_IMPLEMENTATION_PLAN.md) for the audited paths and remaining opportunity inventory.

## Content-card hierarchy

Research/herb/compound cards should prioritize the decision, not decorative metric density.

Recommended scan order:

1. entity/topic name;
2. one-sentence research takeaway;
3. evidence strength;
4. most decision-relevant limitation or uncertainty;
5. safety state;
6. supporting study count/type/context;
7. review/evidence freshness;
8. one clear details/evidence action.

Do not let a study count visually overpower evidence quality, directness, or limitations.

## Search and navigation

Search is a primary product path because the corpus is large. It should not be treated as a decorative icon-only afterthought on surfaces where direct discovery is the user's likely job.

Navigation language should follow current route taxonomy and user intent. Conceptual groups may include Explore, Conditions/goals where appropriate, Herbs & Compounds, Compare, Evidence/Learn, and Search. Exact labels remain subject to existing IA, localization, and route evidence.

Stable URLs remain governed by project policy; visual/navigation changes do not authorize route churn.

## Core visual language

- **Canvas:** warm paper rather than pure white, with only low-contrast document texture.
- **Ink:** graphite for primary reading text.
- **Structure:** forest/sage where botanical/material structure is useful.
- **Accent:** brass used sparingly for hierarchy, active emphasis, rules, and logo detail.
- **Display type:** approved target is Cormorant Garamond; current implementation remains Fraunces until a validated migration.
- **Body/UI type:** neutral functional grotesk; current implementation remains Inter until a validated migration.
- **Geometry:** consistent rounded rectangles/circles; avoid unrelated radii within equivalent components.
- **Elevation:** subtle. Prefer border/material contrast and inner highlights before shadow.
- **Motion:** small positional/state movement only; no decorative motion required to understand the interface.
- **Semantic colors:** evidence and safety colors remain independent of brand color.

## Canonical CSS ownership

The cascade is deliberately ordered in `app/layout.tsx`. The approved identity does not authorize adding another global override layer.

### 1. `app/globals.css`

Tailwind theme, browser/base defaults, legacy compatibility primitives, and existing root-vs-template breadcrumb fallback behavior.

### 2. Legacy/template-specific layers

These may define local component behavior but must not become the source of truth for the global brand palette, global surfaces, controls, navigation chrome, or homepage atmosphere.

### 3. `styles/visual-token-hardening.css`

**Single owner of canonical brand values.**

Owns:

- graphite / forest / sage / brass / paper primitives;
- light/dark theme aliases;
- compatibility mappings for older `--hs-*` and Tailwind brand tokens;
- document canvas and low-contrast texture aliases consumed later.

A future palette convergence should update this owner rather than create a second palette stylesheet.

### 4. `styles/premium-foundation.css`

Owns global canvas structure, restrained document-grain treatment, and page measure.

### 5. `styles/premium-surfaces.css`

Owns reusable neutral surface geometry, material contrast, inner highlights, shared elevation, and neutral chip treatment.

Semantic evidence/safety components may opt out because their color communicates meaning.

### 6. `styles/premium-typography.css`

Owns shared editorial voice: heading family, tracking, lede treatment, editorial labels, prose-link treatment, and section rhythm.

A future Cormorant migration belongs here plus the font-loading owner, not in route-specific overrides.

### 7. `styles/premium-controls.css`

**Single owner of generic action presentation.**

Owns generic primary/secondary action material treatment and hover/press/disabled behavior. Forest green is the approved target for primary brand actions where contrast permits; current code must be inspected before changing existing behavior.

### 8. `styles/premium-chrome.css`

**Single owner of shell-facing visual presentation.**

Owns primary navigation material treatment, publication seal/brand mark placement, mega menus, locale rail, mobile navigation drawer treatment, and footer atmosphere.

It does not decide breadcrumb visibility.

### 9. `styles/homepage-structure.css`

Owns homepage-only geometry and responsive layout primitives.

### 10. `styles/homepage-premium-final.css`

**Single owner of homepage visual composition.**

Do not add another homepage override stylesheet after this file merely to force the new brand direction.

## Composition rules

1. **One dominant visual idea per viewport.** Supporting controls should not compete with the main task.
2. **Do not give every block equal weight.** Use open sections, rails, hairlines, typography, and supporting panels before adding another card.
3. **Symmetry is structural, not monotonous.** Peer choices share dimensions/spacing; different section types may use different compositions.
4. **Scientific reading beats decoration.** Decorative detail must never reduce text measure, contrast, or scanability.
5. **Primary actions are visually scarce.** A page should not look like every panel is shouting.
6. **Brass is an accent, not a fill/text system.**
7. **Brand color never overwrites evidence meaning.**
8. **Material refinement is cumulative, not flashy.** Borders, spacing, typography, and restraint should create quality before effects.
9. **Limitations remain visually proximate to conclusions.** Do not bury uncertainty for aesthetics.
10. **Botanical imagery behaves like editorial/specimen imagery.** Avoid mystical decoration.

## Responsive invariants

- 320 px wide screens must not horizontally overflow.
- Primary CTA buttons remain comfortably tappable.
- Dense evidence tables/components must reflow, scroll intentionally, or use an accessible dense-content mobile pattern; critical safety/limitation content must not be hidden to make mobile prettier.
- Safe-area insets are respected in mobile drawers/sheets.
- Hover-only affordances are never required for understanding/navigation.
- Dark mode keeps the same information hierarchy as light mode.
- Reduced-motion/transparency behavior remains explicit on interactive visual layers.
- Logo selection changes by optical size rather than blindly shrinking the full emblem.

## Visual anti-patterns

Reject generic wellness/pseudoscience decoration by default:

- leaf borders;
- moon/star/mystical motifs;
- mushrooms used as generic decoration;
- watercolor botanical backgrounds;
- glassmorphism/glow as a scientific-content style;
- saturated green gradients;
- excessive badges;
- ornamental percentages without transparent methodology;
- low-contrast brass microcopy;
- decorative data charts without source/units/context.

## Premium-quality test

A new visual change should be rejected when it does any of the following:

- introduces a new green/gold shade instead of using a token or documented token mix;
- adds a new global `!important` override to fight another canonical layer;
- creates another evidence matrix, badge family, citation drawer, tooltip, or state primitive without first proving the existing one cannot be extended;
- adds a fourth or fifth card style for equivalent content;
- adds glow or gradient purely to make a section feel more exciting;
- makes dark mode structurally different from light mode;
- reduces accessibility target size, contrast, or readable measure;
- makes evidence/safety color less semantically clear;
- requires another stylesheet loaded after the canonical owner to “fix” the result;
- silently changes claim meaning, evidence grade, safety interpretation, source lineage, publication eligibility, or monetization logic;
- uses a pseudo-precise confidence/transparency percentage without reproducible methodology;
- relies on a large logo asset where a compact optical version is required.

## Current flagship homepage direction

The homepage remains a compact research index rather than a feature dashboard. It should communicate, in order:

1. evidence-first supplement decision support;
2. direct search by ingredient/name;
3. goal-first entry points for Sleep, Anxiety, Stress, and Focus;
4. research-library scale as supporting context, not the main value proposition;
5. high-value comparison paths;
6. methodology, evidence hierarchy, visible limitations, and safety principles.

The result should feel like one publication and one evidence product—not a collection of independently designed widgets.

## Remaining implementation opportunities

The identity is locked, but implementation work remains. The detailed audited queue lives in [`BRAND_UI_IMPLEMENTATION_PLAN.md`](BRAND_UI_IMPLEMENTATION_PLAN.md) and the authoritative start order remains in `docs/MASTER_BACKLOG.md` / `docs/CURRENT_SPRINT.md`.

High-value remaining categories include:

- committed full/compact/32 px/16 px logo assets and deterministic social derivatives;
- token/typography convergence to the approved palette/role split;
- canonical claim-level evidence → limitations → sources UI;
- claim-scoped entry into the existing citation drawer;
- research timeline/history where source data supports it;
- evidence/safety/badge/matrix convergence across duplicate implementations;
- unified error/partial/stale/unknown state contract around existing primitives;
- accessible mobile treatment for dense research UI where needed;
- data-visualization rules before chart expansion;
- visual regression, theme, localization, favicon, responsive, and performance hardening.

These are implementation opportunities, **not permission to bypass the current sprint or duplicate existing systems**.