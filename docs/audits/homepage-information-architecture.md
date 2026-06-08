# Homepage Information Architecture Audit (Post Density/Pruning Pass)

## 1) Executive summary

The homepage should now act as a **fast triage layer**, not a full onboarding destination. With `/start-here`, `/goals`, `/search`, `/compare`, dedicated herb/compound libraries, and persistent bottom mobile navigation already in place, the homepage’s best job is to:

- orient first-time users in ~10–20 seconds,
- present one clear “choose your next step” decision,
- provide a compact set of high-confidence jump-off points,
- and keep safety framing visible but lightweight.

Current homepage implementation is already relatively concise, but it still contains mild redundancy versus global/mobile navigation in the “Research pathways” block. The most impactful refinement is to **compress pathway/navigation duplication** and reframe content toward **“start task selection + popular starting points.”**

Recommended headline direction:

- Keep hero + action cluster,
- shrink “Research pathways” into fewer high-intent choices,
- keep profile discovery but rename/reposition as “Popular starting points,”
- keep disclaimer but reduce visual weight and card prominence near footer,
- prioritize mobile order for decision flow and thumb-friendly progression.

---

## 2) Current homepage jobs

Based on the current `/` page composition, the homepage is doing five jobs:

1. **Brand + value proposition anchoring**
   - States “evidence-aware botanical research” and defines decision framing (evidence, mechanism, safety tradeoffs).
2. **Primary action routing**
   - Top CTA row routes to `/herbs`, `/compare`, `/search`.
3. **Cross-surface navigation**
   - “Research pathways” links to `/goals`, `/compare`, `/search`, `/herbs`, `/compounds`.
4. **Depth discovery seeding**
   - “Featured profiles” links directly to selected herb/compound detail pages.
5. **Safety/legal framing**
   - Bottom amber disclaimer card links to `/disclaimer`.

These are mostly valid jobs, but #3 is partially redundant with persistent nav systems already available elsewhere.

---

## 3) Redundant sections

### A. “Research pathways” (current full 5-card grid)

This section duplicates paths already available in:

- desktop/global nav patterns,
- bottom mobile nav (`/goals`, `/compare`, `/search`, plus `/herbs` and `/compounds` entries),
- hero CTA cluster (already includes `/compare`, `/search`, and browsing entry).

**Redundancy diagnosis:** moderate-high.

**What’s still useful in it:** short descriptions can help first-time users understand *why* to choose each route.

### B. Minor CTA overlap between hero and section-level links

- Hero offers 3 actions.
- Later sections offer additional library links (“Herb library,” “Compound library”).

Not severe, but can feel repetitive on mobile if both are visually equivalent weight.

---

## 4) Sections that should stay

### A. Hero (keep)

Should remain as the homepage anchor. It currently communicates scope and caution clearly and provides immediate routes.

### B. Quick primary actions (keep, potentially tune labels)

The top CTA cluster is valuable for first-time routing. Keep 3 action buttons but align to strongest entry flows:

- Start here (`/start-here`) or Goals (`/goals`),
- Compare (`/compare`),
- Search (`/search`).

### C. Profile discovery module (keep with revised framing)

The current featured cards are useful as concrete first clicks for users who don’t yet know where to start. Keep this, but reframe for intent clarity.

### D. Safety/disclaimer presence (keep)

Safety framing should remain on homepage, but with lighter visual treatment than a high-contrast warning block near the bottom.

---

## 5) Sections to compress or remove

### Q4) “Start your research” — remain, shrink, or remove?

**Recommendation: remain, but shrink.**

Interpret this as the homepage’s route-selection utility (hero + initial path chooser). Keep conceptually, but avoid verbose multi-card repetition.

### Q5) “Explore by practical context” — remain, shrink, or become single `/goals` link?

**Recommendation: shrink to a single strong `/goals` primary pathway (with optional one-line support text).**

Reason: goals architecture already exists as dedicated intent-routing surface. Homepage should point to it, not recreate it.

### Q6) “Featured profiles” — remain, rename, move, or remove?

**Recommendation: remain, rename to “Popular starting points.”**

- Keep compact 3–6 cards max.
- Position after primary route selection.
- Emphasize these as examples, not endorsements.

### Q7) Disclaimer/safety card placement/weight

**Recommendation: placement is acceptable, but visual weight is too heavy for current information density goals.**

- Keep near footer.
- Reduce contrast/intensity or card prominence.
- Preserve explicit link to `/disclaimer`.

### Q9) Remove vs compress vs leave alone

**Remove:**
- Full-width, high-density “pathway” duplication if it repeats nav one-for-one.

**Compress:**
- Research pathways into 1–3 high-intent choices (not 5 nav duplicates).
- Safety block visual footprint.

**Leave alone:**
- Core hero value proposition.
- Featured/depth discovery concept (with naming tweak).

---

## 6) Recommended final homepage structure

Target structure optimized for first-time mobile and cross-surface consistency:

1. **Hero + one-sentence positioning**
2. **Primary decision actions (3 max)**
   - Start Here / Goals
   - Compare
   - Search
3. **Popular starting points** (formerly Featured profiles)
   - 3–6 cards
   - mixed herbs/compounds
4. **Single “Explore by goal” bridge**
   - one compact row/card linking to `/goals`
5. **Low-weight safety notice + disclaimer link**

This makes homepage a **decision launcher**, while `/start-here` handles deeper onboarding and `/goals` handles context routing.

### Q8) Ideal mobile homepage section order

Recommended mobile order:

1. Hero headline/value proposition
2. Primary actions (thumb-reachable)
3. Popular starting points
4. Explore by goals (single bridge)
5. Safety/disclaimer micro-card

Why: choose path quickly, offer concrete examples, then provide broader context routing and legal safety framing without overwhelming the first screen-depth.

---

## 7) Suggested small PR order

1. **Copy-only IA relabel pass**
   - Rename “Featured profiles” → “Popular starting points”.
   - Adjust helper text to “examples to begin research,” not recommendations.
2. **Pathway compression pass**
   - Replace full 5-card “Research pathways” grid with compact goal-first bridge plus 1–2 optional supporting links.
3. **Safety weight tuning**
   - Keep disclaimer section and link, but reduce visual dominance.
4. **Mobile sequencing polish**
   - Confirm section order, spacing, and scan rhythm on small screens.
5. **Validation pass**
   - Ensure no route contract changes and no new runtime behavior; keep static-export-safe architecture intact.

