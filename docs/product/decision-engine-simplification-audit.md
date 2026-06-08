# Decision engine simplification audit

Date: 2026-05-16

## Mission framing

Convert the audited pages from a broad, cluttered research platform into a clean, mobile-first evidence decision engine. The site should help a user decide quickly:

1. **What should I click next?**
2. **Can I compare these options?**
3. **Can I trust the evidence and safety framing?**
4. **Is this worth further investigation or future purchase research?**

No runtime generation, workbook source-of-truth logic, generated data artifacts, route contracts, medical claims, dosage guidance, or monetization systems should change in this first pass.

## Global audit rules

- Keep above-the-fold content decision-oriented: one plain-language promise, one primary action, one secondary action, and one trust/safety cue.
- Move research ecosystem, semantic hub, and educational context below fold unless it directly helps the next click.
- Remove or defer decorative metadata that does not change a decision.
- Standardize repeated cards and badges before doing visual polish.
- Preserve safety/evidence fields; simplify their presentation rather than removing them.
- Keep mobile layouts single-column-first with short cards and obvious tap targets.

## Page-by-page visible section classification

### `/` homepage (`app/page.tsx`, rendered by `components/homepage-v2.tsx`)

| Visible section | Current purpose | Classification | Recommendation |
| --- | --- | --- | --- |
| Dark decorative background/glow layer | Brand atmosphere | SIMPLIFY | Reduce visual weight and align with light-mode site guidance in a future design pass. It does not directly help a user decide. |
| Hero eyebrow, brand name, value copy | Explains site purpose | KEEP | Reframe from “Botanical research field guide” to a decision-engine promise such as “Decide what is worth investigating.” |
| Primary actions: Search, Herbs, Goals | Routes users into key tasks | KEEP | Keep, but prioritize Search or Goals as the primary mobile CTA. |
| Secondary hero explanation paragraph | Explains evidence/safety scanning | KEEP | Compress into one trust cue: evidence, safety, and mechanism context. |
| Reasoning pillars | Trust framing | MOVE_BELOW_FOLD | Useful, but not urgent above fold. Convert to compact “How we rank” block below primary paths. |
| “Start your research” pill route grid | Navigation | SIMPLIFY | Merge with hero CTAs or convert into a 3-card “Choose your next step” block. |
| “Explore by practical context” ecosystem cards | Goal-based discovery | KEEP | Move directly under hero if Goals becomes the main decision entry path; keep only 3-4 high-intent cards. |
| “Featured profiles” mixed cards | Entry to herb/compound details | SIMPLIFY | Standardize with herb/compound card component showing name, type, evidence badge, safety badge, and one-line decision summary. |
| Disclaimer strip | Trust/safety | KEEP | Keep near bottom and optionally duplicate a compact safety cue above fold. |

### `/herbs` (`app/herbs/page.tsx`)

| Visible section | Current purpose | Classification | Recommendation |
| --- | --- | --- | --- |
| Hero: “Herbal research library” | Sets page context | SIMPLIFY | Shorten to “Find herbs worth investigating” with one-line evidence/safety promise. |
| Library-at-a-glance stat panel | Trust/coverage stats | MOVE_BELOW_FOLD | Counts are useful but not a first-click decision. If retained above fold, show one compact line only. |
| “Start with a goal” browse paths | Guides user intent | KEEP | Move immediately under compact hero or into the hero as the primary decision path. |
| Empty library state | Recovery path | KEEP | Standardize across library pages. |
| Featured herbs | Prioritized choices | KEEP | Keep above full library, but cards need standardized evidence/safety/decision fields. |
| “All herbs” full grid | Exhaustive browse | MOVE_BELOW_FOLD | Keep for depth, but add filters/search before the full grid in implementation. |
| Individual herb cards | Profile entry | SIMPLIFY | Standardize with compound/search cards: title, decision summary, evidence, safety, top signals, CTA. |

### `/compounds` (`app/compounds/page.tsx`)

| Visible section | Current purpose | Classification | Recommendation |
| --- | --- | --- | --- |
| Hero: “Compounds” | Sets page context | SIMPLIFY | Reframe around decision value: “Compare compounds by evidence, mechanism, and caution.” |
| Featured signal chips | Highlights taxonomy | DEFER | Chips are not interactive and do not help a next click unless converted into filters. |
| Stat cards | Coverage/trust | MOVE_BELOW_FOLD | Move to trust/coverage block below top matches. |
| Top Matches | Prioritized choices | KEEP | Keep as first content below hero. Rename to “Best starting points” only if ranking logic is transparent. |
| Discovery structure explainer | Explains ranking | MOVE_BELOW_FOLD | Keep as compact “How this is organized” after top matches. |
| Static discovery chips | Taxonomy labels | REMOVE | If not clickable filters, they add clutter. |
| EcosystemPanelGrid pathways | Semantic exploration | MOVE_BELOW_FOLD | Useful for SEO/discovery, but below decision cards. |
| Compound Library grid | Exhaustive browse | KEEP | Keep below top matches with standardized cards and future filters. |
| Inline empty state | Recovery path | KEEP | Standardize across library pages. |

### `/goals` (`app/goals/page.tsx`)

| Visible section | Current purpose | Classification | Recommendation |
| --- | --- | --- | --- |
| Hero: Decision hub | Strong page framing | KEEP | Good primary concept. Add direct CTAs to “Browse goal paths” and “Search library.” |
| SemanticHubIntro | Explains content model | MOVE_BELOW_FOLD | Trust-building but too abstract above decision links. |
| EcosystemPanelGrid | Cross-site semantic paths | MOVE_BELOW_FOLD | Useful after core goal cards. |
| KnowledgeGraphLinks | Adjacent biology links | DEFER | Defer or move near footer; does not help initial goal choice. |
| Supplement guides | SEO guide entry | SIMPLIFY | Keep fewer cards above goal paths only if guide cards are clearly high-intent. Otherwise move below goal cards. |
| Goal paths | Primary page job | KEEP | Move directly below hero and make cards shorter, scannable, and decision-oriented. |

### `/stacks` (`app/stacks/page.tsx`)

| Visible section | Current purpose | Classification | Recommendation |
| --- | --- | --- | --- |
| Empty stack state | Recovery path | KEEP | Standardize with other empty states. |
| Hero: Supplement stacks | Sets page context | SIMPLIFY | Keep but reduce stats and state that stacks are decision guides, not protocols or medical advice. |
| Hero stat panel: stacks/steps/safe first | Trust/structure | SIMPLIFY | “Safe” as a large stat risks overclaiming. Replace with “Safety notes” or “Caution first.” |
| Featured stack | Prioritized choice | KEEP | Good decision card. Ensure caution, evidence, and who-for fields are visible before the CTA. |
| Stack ingredient preview | Shows contents | KEEP | Helps the user decide whether to click. Keep concise. |
| Stack library | Exhaustive browse | KEEP | Keep below featured card. Standardize cards and avoid dosage prominence above safety context. |
| Avoid-if warning snippets | Safety | KEEP | Preserve and standardize as safety badges/summary blocks. |

### `/compare` (`app/compare/page.tsx`)

| Visible section | Current purpose | Classification | Recommendation |
| --- | --- | --- | --- |
| H1: Compound comparison | Page title | SIMPLIFY | Add a short decision sentence: “Pick two or more compounds and compare evidence, effects, and cautions.” |
| CompareTableClient | Core comparison tool | KEEP | This is the page’s main value; keep above fold. |
| Lack of onboarding/empty prompt | Missing decision support | DEFER | Add a small first-use prompt in implementation if the client table lacks one. |
| Lack of safety/evidence legend near tool | Missing trust support | DEFER | Add standardized evidence/safety badge legend later. |

### `/search` (`app/search/page.tsx`)

| Visible section | Current purpose | Classification | Recommendation |
| --- | --- | --- | --- |
| Hero: Search the Library | Search entry | KEEP | Search is the primary action; keep the input above fold. |
| Search explanation copy | Sets scope | SIMPLIFY | Shorten copy and use placeholder examples to carry detail. |
| Search input | Core interaction | KEEP | Keep prominent and mobile-first. |
| Type filter buttons | Search control | KEEP | Standardize with future filter/search control component. |
| Metadata row: searchable profiles, semantic retrieval, evidence-weighted discovery | Trust/technical details | SIMPLIFY | Keep profile count; move “semantic retrieval” and “evidence-weighted discovery” to a tooltip or below-fold trust note. |
| Suggested searches | Query assistance | KEEP | Move into hero under the input as compact chips to avoid a separate card. |
| Result sections split by Herbs and Compounds | Search results | SIMPLIFY | Consider unified ranking by default with type badges, plus optional type filter. Split sections can force extra scrolling. |
| Result cards | Profile entry | SIMPLIFY | Standardize with herb/compound cards. |
| No matches state | Recovery path | KEEP | Standardize empty state and keep suggested searches plus browse CTAs. |

## Repeated UI/card patterns to standardize

### 1. Herb cards

Current sources:

- `HerbCard` in `app/herbs/page.tsx`
- Featured profile cards in `components/homepage-v2.tsx`
- `ResultCard` herb results in `app/search/page.tsx`

Recommended component:

- `components/decision/profile-card.tsx` or similar.
- Props: `type`, `slug`, `name`, `summary`, `evidenceLabel`, `safetyLabel`, `signals`, `href`, `ctaLabel`, `featured`.
- Mobile layout: one-column, min-height avoided, evidence/safety row above summary, CTA as full-width tap target only when necessary.
- Do not invent evidence or safety values; render fallback labels as “Evidence review” and “Safety review.”

### 2. Compound cards

Current sources:

- `CompoundCard` in `app/compounds/page.tsx`
- Featured profile cards in `components/homepage-v2.tsx`
- `ResultCard` compound results in `app/search/page.tsx`

Recommended approach:

- Use the same profile-card base as herbs with `type="compound"`.
- Optional compound-specific slot for mechanism signals.
- Avoid decorative glyphs unless they provide recognizable scanning value.

### 3. Evidence badges

Current sources:

- `evidenceClass` helpers in herbs/search/compounds pages.
- Static evidence-related chips in compounds and search pages.

Recommended component:

- `EvidenceBadge` with normalized variants: `strong`, `moderate`, `early`, `review`, `unknown`.
- Render source label exactly from data when available.
- Include an optional short tooltip/legend in below-fold trust sections, not inside every card.

### 4. Safety badges

Current sources:

- `getSafety`/`safetyClass` in herbs/search.
- `avoid_if` stack snippets.
- Safety-related profile labels in compound pages.

Recommended component:

- `SafetyBadge` with normalized variants: `lowCaution`, `caution`, `review`, `unknown`.
- Avoid large claims like “Safe” as a standalone stat; use “Safety notes” or “Caution mapped.”
- Preserve warnings and contraindication fields.

### 5. Decision summary blocks

Current sources:

- Hero paragraphs across homepage, herbs, compounds, goals, stacks, and search.
- Featured stack `who_for` block.
- Card summaries across herb, compound, and search cards.

Recommended component:

- `DecisionSummary` for one to three short bullets: “Best for researching,” “Evidence signal,” “Caution starts with.”
- Use only existing source fields; omit unavailable bullets rather than inventing details.

### 6. CTA blocks

Current sources:

- Homepage primary actions.
- Herb browse paths.
- Stack featured CTA.
- Search empty-state browse CTAs.

Recommended component:

- `DecisionCtaGroup` with primary, secondary, and tertiary links.
- Mobile: full-width or two-button max; avoid dense route grids above fold.

### 7. Empty states

Current sources:

- `EmptyLibraryState` in herbs.
- `InlineEmptyState` in compounds and stacks.
- Search no-results state.

Recommended component:

- `LibraryEmptyState` with title, description, recovery links, and optional suggested-search chips.
- Reuse across herbs, compounds, stacks, and search.

### 8. Filter/search controls

Current sources:

- Search input and type filters in `app/search/page.tsx`.
- Static chips on compounds page.
- No filters on herbs/compounds full libraries.

Recommended component:

- `LibrarySearchControls` with search input, type filters, optional evidence/safety filters, and suggested query chips.
- First implementation can reuse only search page behavior; do not add new data pipeline requirements.

## Simplified above-the-fold structures by page

### Page: `/`

**Current issue:** The homepage leads with a strong brand moment, but the dark visual system and multiple navigation blocks compete with the decision task.

**Recommended above-fold structure:**

1. Short eyebrow: “Evidence decision engine.”
2. H1: “Decide which herbs and compounds are worth investigating.”
3. One sentence: “Compare evidence, mechanisms, and safety context before you go deeper.”
4. Primary CTA: Search the library.
5. Secondary CTA: Browse by goal.
6. Three compact trust chips: Evidence-aware, Safety-first, No medical claims.

**Sections to keep:** Hero, primary CTAs, practical context cards, featured profiles, disclaimer.

**Sections to remove/defer:** Move reasoning pillars below fold; merge “Start your research” with hero CTAs; simplify dark decorative background in a later theme pass.

**Implementation risk:** Medium. Homepage currently uses a distinct dark theme, while project guidance says light mode only. A theme correction is perceptible and should be done carefully with screenshots.

**Files likely affected:** `app/page.tsx`, `components/homepage-v2.tsx`, potentially shared card/badge components.

### Page: `/herbs`

**Current issue:** The page explains the library before helping users choose a path or profile.

**Recommended above-fold structure:**

1. H1: “Find herbs worth investigating.”
2. One-line evidence/safety framing.
3. Goal-first browse chips/cards: Sleep, Stress, Focus, Safety-sensitive or similar existing routes.
4. Top 3 featured herb cards with evidence and safety badges.
5. Compact link to all profiles.

**Sections to keep:** Goal browse paths, featured herbs, all herbs, empty state.

**Sections to remove/defer:** Move stat panel below fold; avoid large hero copy; add filters before all-herbs grid in a later implementation.

**Implementation risk:** Low to medium. Mostly layout and shared-card extraction; no data logic changes required.

**Files likely affected:** `app/herbs/page.tsx`, shared profile card, shared badges, empty-state component.

### Page: `/compounds`

**Current issue:** The page mixes taxonomy, ranking, ecosystem context, stats, and library browsing before establishing a simple decision path.

**Recommended above-fold structure:**

1. H1: “Compare compounds by evidence and mechanism.”
2. One short sentence about evidence maturity and safety context.
3. Optional search/filter control or CTA to search.
4. Top 3-6 high-signal compounds as standardized cards.
5. Small “How ranked” link/accordion.

**Sections to keep:** Top Matches, Compound Library, empty state, ecosystem panels below fold.

**Sections to remove/defer:** Remove non-clickable discovery chips; move stats and discovery explanation below top cards.

**Implementation risk:** Medium. Top-match scoring is already local; standardization should avoid changing sort logic.

**Files likely affected:** `app/compounds/page.tsx`, shared profile card, evidence/safety badges, possibly ecosystem section placement.

### Page: `/goals`

**Current issue:** The primary decision object is goal paths, but semantic hub and ecosystem modules appear before goal choices.

**Recommended above-fold structure:**

1. H1: “Start with your goal.”
2. One trust sentence: “Goal pages connect outcomes to evidence, mechanisms, cautions, and profile comparisons.”
3. Primary CTA anchor: Browse goal paths.
4. Secondary CTA: Search library.
5. First row of goal path cards.

**Sections to keep:** Hero, goal paths, selected supplement guides, semantic/ecosystem modules below fold.

**Sections to remove/defer:** Move `SemanticHubIntro`, `EcosystemPanelGrid`, and `KnowledgeGraphLinks` below goal cards; consider deferring KnowledgeGraphLinks entirely.

**Implementation risk:** Low. Reordering sections only; no route or data changes.

**Files likely affected:** `app/goals/page.tsx`, potentially shared CTA/card components.

### Page: `/stacks`

**Current issue:** The page is close to decision-oriented, but the hero stat “Safe” risks overclaiming and ingredient/dosage previews can dominate before safety context.

**Recommended above-fold structure:**

1. H1: “Supplement stacks.”
2. One sentence: “Goal-based stack guides with ingredients, timing, and caution notes.”
3. Featured stack decision card with best-for, caution note if available, and first 2-3 ingredients.
4. Primary CTA: Open full stack.
5. Secondary CTA: Browse goals.

**Sections to keep:** Featured stack, ingredient preview, avoid-if warning snippets, stack library, empty state.

**Sections to remove/defer:** Replace “Safe” stat with “Caution notes”; reduce hero stat panel or move below fold.

**Implementation risk:** Low. Text/layout change only, but be careful not to invent safety or dosage guidance.

**Files likely affected:** `app/stacks/page.tsx`, shared empty-state and CTA components.

### Page: `/compare`

**Current issue:** The comparison tool is appropriately prominent, but the page lacks a decision-oriented intro and trust legend.

**Recommended above-fold structure:**

1. H1: “Compare compounds.”
2. One sentence: “Scan effects, evidence tier, timing, safety flags, complexity, and cost side by side.”
3. Compare table immediately visible.
4. Small helper line: “Start by selecting or scanning compounds; this is research support, not medical advice.”

**Sections to keep:** CompareTableClient.

**Sections to remove/defer:** None currently; add only minimal context.

**Implementation risk:** Low. Avoid changing table behavior.

**Files likely affected:** `app/compare/page.tsx`, `components/compare-table-client.tsx` only if empty/onboarding state is added later.

### Page: `/search`

**Current issue:** Search is strong, but metadata and suggested searches create extra cards and scroll before results.

**Recommended above-fold structure:**

1. H1: “Search herbs and compounds.”
2. Search input.
3. Type filters: All, Herbs, Compounds.
4. Suggested search chips directly below input.
5. One compact count/trust line.
6. Results start as high as possible.

**Sections to keep:** Search input, filters, suggested searches, result cards, no-results state.

**Sections to remove/defer:** Move technical metadata to a below-fold note; consider unified ranked results instead of separate herb/compound sections by default.

**Implementation risk:** Medium. Search page is client-side and result grouping affects perceived ranking; preserve existing scoring when changing presentation.

**Files likely affected:** `app/search/page.tsx`, shared profile card, badges, filter/search control component, empty-state component.

## Recommended implementation sequence

1. **Documentation-only audit**: this file.
2. **Shared primitives pass**: add badges, empty state, CTA group, and profile card without changing page order.
3. **Search and compare pass**: simplify above-fold search and add minimal compare intro.
4. **Library pages pass**: standardize herbs and compounds cards; move stats/explainers below decision cards.
5. **Goals/stacks pass**: reorder goals to show goal paths first; adjust stack safety wording.
6. **Homepage pass**: align homepage with the decision-engine promise and light-mode system; capture screenshot because this is perceptible.

## Non-goals for this audit

- No dataset expansion.
- No workbook edits.
- No generated JSON edits.
- No changes to runtime generation.
- No affiliate system changes.
- No new medical claims or dosage guidance.
- No package file changes.
