# The Hippie Scientist — Brand & UI Implementation Plan

**Status:** Supporting implementation plan; approved target, not proof of shipped parity
**Updated:** 2026-08-27
**Authority:** `docs/MASTER_BACKLOG.md` and `docs/CURRENT_SPRINT.md` decide when work may start. This document defines the target and prevents future agents from re-inventing or forgetting the approved system.
**Companion standard:** [`PREMIUM_VISUAL_SYSTEM.md`](PREMIUM_VISUAL_SYSTEM.md)

## Purpose

The approved visual direction is now stable enough to stop concept exploration and move to implementation convergence. The goal is not to redesign the site again. The goal is to make the existing product behave and look like one evidence-first system while preserving current evidence, safety, SEO, accessibility, performance, localization, static-export, and release contracts.

The target identity is an editorial scientific publication with a restrained botanical cue: approximately **50% editorial publication, 40% evidence/data product, 10% botanical wellness**. The name already supplies personality; the interface should supply rigor.

## Non-negotiable implementation rule

**Audit before creating. Extend or consolidate existing primitives instead of adding duplicates.**

The repository already contains substantial relevant infrastructure. A future implementation ticket must verify current exact-`main` behavior before claiming that a component is missing.

### Verified existing primitives that should be reused or consolidated

The following were present in the repository during the 2026-08-27 design audit:

- global citation drawer: `components/education/CitationDrawerLazy` (wired from `app/layout.tsx`);
- evidence matrices: `components/EvidenceMatrix.tsx`, `components/compare/EvidenceMatrix.tsx`, and `components/compare/CompareEvidenceMatrix.tsx` plus evidence-matrix logic/tests;
- evidence-history UI: `components/evidence/EvidenceHistory.tsx`, backed by immutable evidence-history snapshots;
- comparison tables registered in the editorial component system;
- safety/interaction treatment: `src/components/InteractionWarnings.tsx`;
- dosage-context treatment: `components/DosageBox.tsx` plus the dosing information route;
- evidence and safety badges in more than one component namespace;
- tooltip support: `src/components/InfoTooltip.tsx`;
- shared decision primitives: `components/ui/DecisionPrimitives.tsx` and `lib/decision-primitives.ts`;
- library empty-state handling;
- multiple skeleton/loading primitives, including search, evidence-card, comparison-table, wizard, and detail skeletons;
- `ScientificVerdictCard`, `EvidenceConfidence`, `ResearchLimitations`, `SafetyNotice`, `StudyDesignSnapshot`, and related editorial modules documented in `docs/editorial-components.md`.

These are assets, not evidence that the target system is complete or consistently deployed. The implementation job is primarily **convergence, extension, and gap-filling**, not wholesale replacement.

## Approved identity target

### Logo family

The approved brand system uses a custom **THS monogram** plus the wordmark **THE HIPPIE SCIENTIST** and the supporting line **EVIDENCE • SAFETY • CLARITY**.

The logo family requires separately authored assets for different optical sizes:

1. **Primary emblem** — detailed THS monogram for large editorial/brand surfaces.
2. **Primary wordmark** — `THE HIPPIE SCIENTIST` with editorial tracking and the evidence/safety/clarity line when space permits.
3. **Horizontal lockup** — compact monogram + wordmark for site chrome and horizontal placements.
4. **Compact mark** — simplified THS geometry for constrained header/mobile surfaces.
5. **32 px favicon/app mark** — simplified mark designed specifically for that size.
6. **16 px favicon** — bespoke micro mark with fewer strokes and heavier optical geometry; do not obtain it by merely scaling the large emblem.
7. **Dark-surface/reversed variants** — same geometry, controlled light/forest/brass treatment.
8. **Social/OG brand assets** — deterministic, readable derivatives using committed source artwork.

### Asset requirements

- Commit source vector assets where licensing/ownership allows.
- Keep generated raster derivatives deterministic and reproducible.
- Provide `aria-label`/accessible text through surrounding UI; the decorative SVG itself should not create duplicate accessible names.
- Establish minimum clear space and minimum rendered size for each asset class.
- Do not use the full emblem at sizes where internal strokes collapse.
- Validate light/dark surfaces and high-density/standard-density rendering.
- Extend the existing favicon generator/tests rather than creating an unrelated favicon pipeline.

## Canonical palette

Brand primitives:

- **Forest Green:** `#1F3A2E`
- **Graphite:** `#2B2B2B`
- **Warm Ivory:** `#F7F4EF`
- **Antique Brass:** `#B08D3C`
- **Sage:** utility/secondary neutral only; a documented token such as `#A5ADA0`, not a fifth co-equal brand color

### Color rules

- Forest green is the primary brand/action color where contrast permits.
- Graphite owns most reading text and essential small UI copy.
- Warm ivory is the default editorial canvas/surface family.
- Brass is an accent: dividers, selected emphasis, tiny ornamental details, logo details, and larger decorative type. **Essential small text must not depend on brass when contrast is marginal.**
- Sage is a utility neutral and must not silently become a new identity palette.
- Evidence and safety semantics are separate from brand colors.
- No evidence grade, safety state, risk state, or interactive state may depend on color alone.

## Typography target

### Approved role split

- **Editorial serif:** Cormorant Garamond is the approved visual target for major headings, display titles, selected editorial callouts, and large evidence/result figures.
- **Functional sans:** use a neutral, highly legible grotesk for body copy, navigation, filters, citations, evidence explanations, warnings, tables, metadata, and controls.

The exact functional sans is deliberately not locked to Neue Haas Grotesk Pro unless licensing, self-hosting, loading, and performance are all acceptable. The visual role is locked; the licensed font family is not.

### Current implementation note

As of the 2026-08-27 audit, `app/layout.tsx` self-hosts **Inter Variable** and **Fraunces Variable** through `@fontsource`. That is present reality and should remain until a scoped migration proves the replacement is licensed, locally buildable, performant, accessible, and regression-safe. Do not introduce a Google Fonts build dependency.

### Type rules

- Long scientific prose, safety content, citations, and tables use the functional sans by default.
- Avoid ultra-light text weights at mobile sizes.
- Define a responsive type scale rather than copying generated-mock pixel sizes.
- Preserve a comfortable reading measure and line height.
- Use tracking as a brand device only where it remains readable.
- Localization/CJK fallbacks remain first-class; the Latin identity font must not degrade localized route readability.

## Signature evidence UI

The most important product-specific visual pattern is not a decorative card. It is a **Claim → Evidence** relationship.

### Target `ClaimEvidence` module

A canonical claim-level component should be able to render, when the canonical data actually supplies the fields:

- **Claim** — exact user-facing claim or scoped finding;
- **Evidence grade** — standardized label with icon/text/shape differentiation, never color alone;
- **Why this grade** — concise rationale when governed data provides one;
- **Research base** — study count and types, preserving population/directness boundaries;
- **Key limitations** — visible, not hidden behind marketing copy;
- **Safety relevance** — only when source data supports it;
- **Last reviewed / evidence updated** — exact date when known;
- **Sources** — claim-scoped source links/IDs that can open or focus the existing citation/source experience;
- **Methodology link** — route to the grading/evidence standard.

This component must consume canonical claim/source data. It must not become a second scientific authority or calculate a stronger claim than upstream evidence permits.

### Evidence grades

Use the repository's standardized evidence semantics unless a later governed decision supersedes them:

- Strong evidence
- Moderate evidence
- Limited evidence
- Mixed evidence
- Preliminary evidence
- Traditional use
- Insufficient evidence
- Needs review

A visible badge should combine a text label with at least one additional non-color cue (icon, border/shape, or explicit descriptor).

### Confidence display

Do **not** expose pseudo-precise values such as `86% confidence` or `98% transparency` unless:

1. a deterministic formula is documented;
2. every input is auditable;
3. missing data handling is explicit;
4. the output has a reproducible interpretation;
5. the user can inspect what the number means.

Until that exists, prefer categorical language such as **High confidence**, **Moderate confidence**, or **Low confidence** plus explanatory factors. Study count is supporting evidence, not a substitute for quality/directness.

## Existing evidence/safety modules to converge, not duplicate

Future tickets should inspect the existing component families and establish canonical ownership before adding new markup.

### Evidence matrix

An evidence matrix already exists in multiple forms. The target is one coherent contract and presentation family, not another matrix implementation. Convergence should preserve specialized comparison behavior where necessary while sharing semantics/tokens/accessibility.

### Citation/source experience

A global citation drawer already exists. The target gap is **claim-scoped source entry and focus**, not a second generic citation drawer. A claim module should open or deep-link the existing source surface at the relevant study/claim context when the data contract permits.

### Interaction warnings and contraindications

Interaction warning infrastructure already exists. The target is visual/semantic convergence with the new evidence system:

- clear risk hierarchy;
- explicit unknown/limited-data state;
- medication/population context when supported;
- no deterministic individualized medical advice;
- accessible icons + text;
- prominent placement when decision relevance is high.

### Dosage information

Dosage UI already exists. The target is to ensure it presents **study context**, not universal instructions:

- studied amount/form/extract;
- studied population;
- duration;
- range across studies where appropriate;
- explicit distinction between trial context and personal recommendation;
- no unsupported titration directive.

## Approved extensions / under-specified opportunities

The 2026-08-27 audit identified the following target gaps or extensions. Before implementation, re-run repository search because `main` changes rapidly.

### 1. Claim-level evidence presentation contract

A reusable `ClaimEvidence`/equivalent module as described above, bound to canonical source lineage and limitations.

### 2. Research timeline / evidence-history extension

Extend the existing `components/evidence/EvidenceHistory.tsx` and its immutable evidence-history snapshots rather than creating a parallel timeline component. Add richer timeline/history semantics only when the canonical source model supports them, such as:

- first relevant human study;
- major systematic review/meta-analysis;
- important null/contradictory result;
- regulatory or safety update;
- last evidence review.

This must be source-derived and sparse; it is not a decorative chronology or a place to invent milestones. If the existing immutable history model cannot represent a proposed event safely, improve that canonical history contract first rather than creating a second event store.

### 3. Claim-scoped source navigation

Deep-link/focus behavior from a claim to the existing citation/source experience, preserving source IDs and avoiding duplicate source stores.

### 4. Canonical mobile sheet/drawer pattern for dense research UI

When tables, filters, citations, or evidence details exceed comfortable mobile space, prefer an accessible, focus-managed bottom sheet/drawer pattern rather than shrinking dense desktop UI. Do not add this merely for visual novelty; use it where mobile task completion measurably benefits.

### 5. Data-visualization design rules

Define a small chart contract before expanding charts:

- semantic, color-blind-safe palette;
- labels do not rely on color alone;
- axis/units/source/date visible;
- no 3D, decorative distortion, or truncated-axis manipulation;
- uncertainty/error bars when the underlying measure supports them;
- accessible text/table equivalent for material findings;
- dark-mode parity;
- responsive behavior;
- provenance/source link.

### 6. Unified UI-state contract

Many loading, skeleton, tooltip, and empty-state primitives already exist. The gap is a canonical system-wide contract and coverage audit for:

- loading/skeleton;
- empty/no-match;
- error/retry;
- disabled;
- hover;
- pressed/active;
- focus-visible;
- selected;
- stale/outdated data;
- unknown/unavailable data;
- partial data;
- offline/external-provider failure where relevant.

Do not create a new state component where an existing one can be extended.

### 7. Brand asset test matrix

Add deterministic tests/visual checks for:

- 16/32/64 px favicon optical versions;
- header/mobile compact lockups;
- light/dark surfaces;
- high-DPI rendering;
- minimum contrast;
- no clipping/overflow;
- metadata/manifest/OG references;
- asset file existence.

## Content card target

A canonical herb/compound/research card should prioritize meaning over metric density.

Recommended hierarchy:

1. entity/topic name;
2. concise research takeaway;
3. evidence strength;
4. critical limitation or uncertainty;
5. safety status;
6. supporting study count/type/context;
7. freshness/review date;
8. one clear evidence/details action.

A count such as `24 studies` must not visually imply stronger certainty than a smaller number of higher-quality/direct studies.

## Search and navigation target

Search should remain a major product path, not merely a tiny icon, because the corpus is large. Navigation labels should be organized around user jobs and current route taxonomy. Any navigation rename must preserve existing URLs and SEO contracts.

Recommended conceptual groups include:

- Explore
- Conditions / goals where editorially appropriate
- Herbs & Compounds
- Compare
- Evidence / Learn
- Search

Exact labels should follow current IA evidence and localization constraints rather than blindly copying a mock.

## Interaction and accessibility rules

- WCAG contrast and current repository accessibility gates remain release requirements.
- Keyboard users must receive visible focus and complete task access.
- Icon-only controls require accessible names.
- Hover may enhance but never carry essential meaning.
- Touch targets must meet the current site requirement.
- Reduced motion/transparency preferences remain supported.
- Dark mode preserves information hierarchy and semantic states.
- Evidence/safety status must survive grayscale interpretation.
- Essential small text uses graphite/forest or another passing semantic token, not decorative low-contrast brass.

## Visual restraint rules

Avoid drifting back into generic wellness imagery or decorative pseudoscience. Do not add visual elements merely because the brand covers herbs.

Default to **no** for:

- leaf borders;
- moon/star/mystical iconography;
- mushroom motifs used as decoration;
- watercolor botanical backgrounds;
- crystal/glow effects;
- glassmorphism for scientific content;
- saturated green gradients;
- decorative percentages with no transparent calculation;
- excessive badge clusters.

Botanical imagery may appear when editorially relevant and should behave like specimen/research imagery, not mystical decoration.

## Implementation phases

These phases are sequencing guidance only. `CURRENT_SPRINT.md` and `MASTER_BACKLOG.md` remain the execution authority.

### Phase A — brand asset package

- create/commit vector logo family;
- build optical compact/32/16 px variants;
- update favicon/manifest/header/social references;
- add deterministic asset checks;
- verify responsive/dark-mode use.

### Phase B — token and typography convergence

- map approved palette into canonical token owner;
- keep semantic evidence/safety colors separate;
- resolve editorial-serif migration only after license/performance proof;
- standardize type/spacing/radius/elevation/action/focus tokens;
- preserve localization and static-export behavior.

### Phase C — evidence-semantic convergence

- consolidate duplicate badge/matrix ownership where justified;
- implement claim-level evidence module from existing canonical data;
- connect claim-scoped source navigation to existing citation infrastructure;
- remove pseudo-precise confidence/transparency metrics unless methodology exists.

### Phase D — research interaction completeness

- extend `components/evidence/EvidenceHistory.tsx` for richer source-derived history when canonical snapshot/event data supports it; do not create a parallel timeline;
- mobile dense-content sheet pattern where task evidence supports it;
- standardized error/partial/stale/unknown states;
- data-visualization contract and one validated example before broader charting.

### Phase E — production hardening

- cross-route visual regression sampling;
- 320 px through desktop overflow checks;
- light/dark/theme parity;
- keyboard/screen-reader checks;
- Lighthouse/performance checks;
- no new global style owner conflicts;
- production build and exact-head release gates.

## Acceptance/proof checklist for each future UI ticket

A future ticket should not be considered complete merely because the mock looks similar.

Required proof, as applicable:

- exact file/component/token ownership documented;
- no duplicate component/source-of-truth introduced;
- representative desktop + mobile screenshots;
- light + dark theme visual verification;
- 320 px overflow check;
- keyboard/focus verification;
- contrast/semantic-color verification;
- localized route sanity check where typography/chrome changes;
- component/unit/regression tests for changed behavior;
- relevant accessibility tests;
- relevant performance/Lighthouse check;
- `npm run build` or current production-build contract;
- no evidence, safety, claim, citation, publication, SEO, analytics, or affiliate semantics changed unless the ticket explicitly owns and validates them.

## Stop rules

Stop and re-scope when:

- a target capability already exists and should be extended instead;
- the change requires a new global stylesheet merely to override another canonical owner;
- a typography change introduces external font-fetch/build dependence;
- the logo/brand work creates measurable LCP/CLS or navigation regressions;
- evidence or safety meaning becomes less explicit;
- the implementation uses color as the only semantic signal;
- a visual percentage cannot be reproduced from documented inputs;
- mobile density is solved by hiding critical limitations/safety/source context;
- a design change conflicts with current sprint WIP or an already-open PR that owns the same surface.

## Definition of done for the overall target

The target is considered implemented only when the production site, not a mock, demonstrates:

- the committed THS logo family across appropriate sizes;
- the approved palette and restrained brass usage;
- a licensed/performance-safe editorial + functional type hierarchy;
- a coherent evidence/safety semantic component family;
- claim-level evidence → limitations → sources interaction on at least the selected flagship decision surface before broader rollout;
- no pseudo-precision without methodology;
- consistent responsive, state, accessibility, dark-mode, and localization behavior;
- visual regression/performance proof;
- documentation and backlog parity with the shipped implementation.

Until then, the brand direction is **approved**, but implementation parity remains **partial/unknown per surface**.