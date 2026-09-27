# Site information architecture

The site has five primary user destinations. Content types and implementation routes should support these destinations instead of competing with them.

## Primary destinations

1. **Goals** — start from an outcome or question.
2. **Guides** — explanations and decisions, including `/guides`, `/learn`, and `/articles`.
3. **Ingredients** — structured herb and compound entities.
4. **Safety** — interaction screening, stacking cautions, and harm-reduction context.
5. **Research** — source records, evidence tools, methodology, reports, and public data.

## Page roles

- **Hub:** routes a user to a smaller set of destinations. It should not reproduce the full contents of those destinations.
- **Editorial:** answers one question or explains one subject. A table of contents and contextual next step may be useful.
- **Profile:** represents one herb or compound. Evidence, safety, dosing, and source trails belong here.
- **Utility:** performs a task such as search, evidence lookup, citation lookup, or safety screening. Keep surrounding chrome minimal.
- **Research surface:** supports verification or methodology. Do not append unrelated marketing captures.
- **Directory:** `/library/` is intentionally exhaustive and is the exception to the “small hub” rule.

## Placement rules

- A page should have one primary owner in navigation.
- “Learn” and “Articles” are content formats under Guides, not top-level destinations.
- “Evidence” and “Tools” are research capabilities under Research, not parallel destinations.
- Cross-links are welcome inside content, but hub cards should mostly point deeper into the hub's own destination.
- Global breadcrumbs, TOCs, and lead magnets are not default decoration. They render only where the page role benefits from them.
- A hub should answer “where do I go next?” in one screenful before adding secondary context.
- Detailed datasets, long card grids, and full indexes belong on dedicated pages, not duplicated across multiple hubs.
- **Ingredients lookup family:** `/herbs/`, `/compounds/`, and `/search/` share one local lookup navigation. `/evidence/evidence-checker/` is the Research-owned evidence-strength handoff, not a competing ingredient directory. Herb/compound indexes stay profile-focused; goal-based decisions belong in Guides.

### Safety family

- **Safety Checker** is the task-first entry point for screening a combination for overlapping caution signals.
- **Interaction Guides** contain only evidence-gated, editorially approved pair reviews; arbitrary dynamic checker results do not become verified guide pages.
- **Understand interactions** at `/learn/interactions/` explains mechanisms, stacking patterns, and uncertainty without acting as a clearance tool.
- **Safety checklist** is the pre-purchase/pre-stack preparation resource and remains supporting content rather than a competing primary Safety hub.
- These core Safety surfaces share local navigation, and interaction-guide detail pages keep that navigation so users do not lose context after drilling in.
- Medication-specific/high-risk contexts continue to escalate to clinician or pharmacist review; navigation changes never weaken the existing uncertainty or safety boundaries.

### Editorial family

- **Guides** is the front door for health topics, comparisons, and practical decisions.
- **Learn** is the front door for concepts, evidence literacy, neuroscience, mechanisms, and educational context.
- **Articles** is the archive for research notes, evidence reviews, regulatory updates, and editorial reading.
- Guides, Learn, and Articles share local navigation so users can switch content modes without mistaking them for unrelated site sections.
- Existing utility URLs under `/learn/*` remain stable, but Research or Safety owns their primary-navigation state when their job is verification, modeling, methodology, or safety rather than education.
- Exhaustive route inventories may remain available in compact or collapsed indexes; above-the-fold hub content should stay curated.

## Cleanup sequence

1. Establish route ownership and global page-experience policy.
2. Simplify Research into a task router.
3. Align Guides, Learn, and Articles under one content hierarchy.
4. Align Ingredients, search, and evidence handoffs.
5. Simplify Safety around checking, understanding, and escalation.
6. Audit page-level duplicate modules and remove redundant cards/callouts.
7. Use the complete Library only as the exhaustive directory.
