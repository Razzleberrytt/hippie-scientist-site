# Decision-layer simplification pass 1

## Scope audited

- Homepage (`app/page.tsx`, `components/homepage-v2.tsx`)
- Herb detail template (`app/herbs/[slug]/page.tsx`)
- Compound detail template (`app/compounds/[slug]/page.tsx`, `components/ui/CompoundHero.tsx`)

Runtime data loading, route contracts, workbook scripts, generated data, package files, and SEO/data-pipeline infrastructure were intentionally left unchanged.

## Key UX problems identified

1. **Above-the-fold hierarchy was not decisive enough**
   - Users could see rich content quickly, but evidence, safety, timing, and mechanism cues did not always feel like the primary scan target.
   - Compound profiles especially placed practical decision support below a larger hero/artwork area.

2. **Decorative weight competed with comprehension**
   - The homepage background treatment and compound artwork created visual richness, but they competed with the first 5–10 seconds of orientation.

3. **Too many sections had similar visual weight**
   - Homepage sections and profile follow-up modules were useful, but the scan order did not always clearly say: start here, then compare, then deep dive.

4. **Long summaries could slow mobile scanning**
   - Profile hero copy and homepage value proposition needed tighter language so the user can understand the site and profile faster.

5. **Decision-critical signals needed stronger grouping**
   - Evidence, safety, effects, timeline, avoid-if context, and mechanism hints needed to sit together as a decision layer rather than scattered across separate modules.

## Changes made

### Homepage

- Tightened the hero message to explain the site as evidence-aware profiles for herbs, compounds, mechanisms, and safety.
- Reduced oversized hero scale and decorative background intensity.
- Added a compact above-the-fold scan framework: **Scan the signal**, **Check the boundary**, **Decide what fits**.
- Clarified CTA language around the actual user task: browse profiles, compare options, search evidence notes.
- Removed the duplicate lower reasoning-pillar section so the page has fewer equal-weight blocks.
- Retitled ecosystem exploration to “Explore by practical context” to emphasize user intent rather than internal taxonomy.

**Why this improves scanability:** the homepage now communicates what the site is, how to use it, and where to go next without requiring users to read multiple supporting sections first.

### Herb detail template

- Replaced the above-fold “Read next” sidebar with **Decision cues**.
- Surfaced evidence, safety, timeline, and mechanism hints beside the hero summary.
- Retitled the following scan section to **Decision snapshot** and clarified that it is fast orientation before deep research.

**Why this improves decision speed:** users can answer “how strong is the evidence?”, “what should I watch out for?”, “how fast or subtle is this?”, and “what pathways are involved?” before encountering long-form sections.

### Compound detail template

- Simplified the compound hero component by removing the nested card shell inside the page hero.
- Shortened hero summary rendering to the first two sentences for faster initial comprehension.
- Replaced above-fold artwork with a **Decision snapshot** panel containing evidence level, safety read, timeline, and mechanism hints.
- Kept artwork available, but moved it into the collapsed authority/exploration section so it no longer competes with first-scan decision signals.
- Expanded top chips to include both primary effects and mechanism hints.

**Why this improves decision speed:** compound profiles now prioritize practical scan signals over decorative/contextual modules while preserving the deeper educational and semantic exploration content for users who continue reading.

## Intentionally deferred

- No workbook/data semantics were changed.
- No generated JSON artifacts were edited.
- No route structure, runtime generators, graph pipelines, or API/data architecture were changed.
- No new component library, animation system, state system, or dependency was introduced.
- Broader typography/theme redesign was deferred to avoid scope creep.
- Deeper consolidation of duplicated herb/compound decision helpers was deferred because this pass prioritizes minimal, surgical UX changes over architecture churn.
