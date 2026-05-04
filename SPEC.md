# The Hippie Scientist Master Specification

**Version:** 1.7 Ultra Expanded Edition  
**Date:** May 2026  
**Status:** Definitive all-in-one living master document  
**Project:** The Hippie Scientist  
**Canonical data source:** `data-sources/herb_monograph_master.xlsx`

---

## 1. Executive Summary

The Hippie Scientist is a trusted, evidence-aware educational platform for herbs, compounds, mechanisms, safety context, and natural supplement decision support. The project targets informed users who want to go deeper than generic supplement blogs or mainstream reference sites. The site should feel rigorous, practical, searchable, and harm-reduction oriented.

The platform uses a two-layer architecture:

1. **Discovery / Entry Layer** — problem-focused hubs, goal pages, comparisons, curated stacks, learning paths, and search-friendly guidance pages.
2. **Depth Layer** — detailed herb and compound monographs with evidence, mechanisms, safety notes, source-backed claims, and related content.

The workbook is the single source of truth. Generated runtime data under `public/data` must come from the workbook pipeline and must not be manually edited.

---

## 2. Vision and Positioning

### Vision

Build the most credible, usable, and discoverable evidence-aware educational resource for herbs, compounds, natural supplements, mechanisms, safety considerations, and practical decision support.

### Audience

The target reader is the informed, post-Examine user: someone who has already seen basic supplement information and wants deeper context, nuance, mechanisms, risk framing, and evidence honesty.

### Differentiation

- Rigorous, transparent evidence standards.
- Conservative claims and anti-hype tone.
- Practical decision support without pretending to provide medical advice.
- Harm reduction and safety visibility as core product features.
- Workbook-driven consistency and scalability.
- Strong discovery layer paired with detailed reference content.

### Success Definition

The site succeeds when users can quickly find what they need, understand the strength and limits of evidence, identify safety considerations, and move naturally from broad discovery pages into deeper monographs.

---

## 3. Core Principles

Every product, content, UX, and engineering decision should follow these principles:

- **Visibility gets the site seen.** Technical SEO and indexability come first.
- **Structure gets the site used.** Navigation, hubs, cards, tables, and internal links must reduce confusion.
- **Flow gets users retained.** Users should move naturally from goals to stacks to compounds and herbs.
- **Evidence honesty builds trust.** Conservative claims beat inflated claims.
- **Safety is not secondary.** Safety warnings, contraindications, interactions, and disclaimers must be prominent.
- **Workbook first.** The workbook owns production content; the site renders and organizes it.
- **Generated data is generated.** Runtime JSON must be regenerated, not hand-edited.
- **Ship iteratively.** Pilot, measure, refine, then scale.

---

## 4. Source-of-Truth Architecture

### Canonical Source

```text
data-sources/herb_monograph_master.xlsx
```

The workbook controls production data for herbs, compounds, mappings, claims, safety summaries, evidence fields, and normalized exports.

### Pipeline

```text
Workbook → data build scripts → public/data → Next.js static export → Cloudflare Pages
```

### Generated Files

Files under these directories are trusted outputs and must not be manually edited:

```text
public/data/
public/data-next/
src/generated/
```

### Build Contract

A valid production build should pass:

```bash
npm ci
npm run lint
npm run typecheck
npm run data:build
npm run data:validate
npm run data:audit
npm run guard:source-of-truth
npm run build
npm run verify:build
```

If a script is intentionally unavailable in a local environment, CI must still clearly indicate which step failed and why.

---

## 5. Required Public Routes

The site should preserve or implement these core routes:

- `/`
- `/about`
- `/herbs`
- `/herbs/[slug]`
- `/compounds`
- `/compounds/[slug]`
- `/goals`
- `/goals/[slug]`
- `/stacks`
- `/stacks/[slug]`
- `/comparisons`
- `/learning`
- `/blog`
- `/evidence-standards`

Routes should be static-export compatible for Cloudflare Pages unless explicitly documented otherwise.

---

## 6. Strategic Priorities

### Priority 1 — Technical Visibility and Stability

This is non-negotiable. Before polishing content, the site must be crawlable, fast, stable, and indexable.

Required work:

- Valid sitemap including herbs, compounds, goals, stacks, learning pages, and important editorial routes.
- Valid robots configuration.
- Unique metadata per indexable page.
- Canonical URLs.
- Clean static export.
- Strong Core Web Vitals.
- No broken internal links.
- Helpful 404 and error states.
- Source-of-truth guardrails in CI.

### Priority 2 — Discovery / Entry Layer

Build pages that solve user problems before asking them to browse a database.

Highest-priority hubs:

- Sleep
- Stress and anxiety
- Focus and cognition
- Fat loss and metabolism
- Blood pressure
- Gut health
- Joint support and inflammation
- Testosterone support

### Priority 3 — Depth Layer Polish

Turn herb and compound pages into trusted, scannable reference tools.

Focus first on high-ROI, high-interest, evidence-ready entities such as:

- Ashwagandha
- Magnesium
- Creatine
- Omega-3
- Berberine
- Rhodiola
- Lion’s mane
- Kanna
- Cistanche
- L-theanine
- Melatonin

### Priority 4 — Ongoing Content Engine

Use research batches, workbook queues, source verification, and analytics feedback to improve the site continuously.

---

## 7. Discovery / Entry Layer Specification

Discovery pages should guide users who arrive with a problem or goal, not a specific compound name.

### Page Types

- Goal hubs.
- Comparison pages.
- “Beyond mainstream” pages.
- Starter stacks.
- Learning paths.
- Best-for / avoid-if decision guides.

### Standard Goal Hub Layout

1. **Hero section**
   - Clear goal-oriented headline.
   - Short evidence-aware subheadline.
   - Primary CTA buttons.
   - Optional quick filters.

2. **Decision filter bar**
   - Evidence strength.
   - Safety level.
   - Fast onset vs long-term support.
   - Beginner vs advanced.
   - Herb vs compound.

3. **Recommended cards**
   - Name.
   - Short practical summary.
   - Evidence badge.
   - Safety indicator.
   - Best-for field.
   - Avoid-if field where available.
   - CTA to detail page.

4. **Comparison table**
   - Sortable and filterable on desktop.
   - Accordion cards on mobile.
   - Columns: item, evidence, typical role, onset, safety notes, link.

5. **Safety and harm-reduction block**
   - Prominent and standardized.
   - Never hidden at the bottom only.

6. **Related paths**
   - Related goals.
   - Related stacks.
   - Related monographs.

### Discovery UX Rules

- Summaries first, detail second.
- Cards must be scannable on mobile.
- Evidence and safety must be visible without opening the detail page.
- Avoid hype language.
- Always link deeper for nuance.

---

## 8. Depth Layer Specification

Depth pages should feel like reference-grade decision tools.

### Profile Page Structure

1. **Hero**
   - Name.
   - Synonyms.
   - Primary effect badges.
   - Evidence tier.
   - Safety indicator.
   - Short core insight.

2. **Quick facts**
   - Best for.
   - Time to effect.
   - Duration.
   - Common forms.
   - Avoid-if.
   - Dosage only if source-backed.

3. **Overview**
   - Concise summary.
   - Conservative evidence framing.

4. **Mechanisms**
   - Mechanisms and pathways.
   - Related compounds.
   - Plain-language explanations.

5. **Evidence and studies**
   - Claim cards.
   - Study type.
   - Evidence confidence.
   - GRADE or certainty summary.
   - Source links.

6. **Practical use**
   - Forms.
   - Timing.
   - Stacking context.
   - Limitations.

7. **Safety deep dive**
   - Contraindications.
   - Interactions.
   - Population cautions.
   - Clear “who should avoid” language.

8. **Related content**
   - Related herbs.
   - Related compounds.
   - Related goals.
   - Related stacks.
   - Comparisons.

### Depth UX Rules

- Use sticky table of contents on long pages.
- Use accordions for dense evidence detail.
- Use tooltips for technical terms.
- Keep line length readable.
- Make safety impossible to miss.
- Support print-friendly output.

---

## 9. Design System

### Brand Personality

The visual system should feel like:

- Scientific.
- Earthy.
- Calm.
- Trustworthy.
- Modern.
- Not generic wellness-blog aesthetics.

### Palette

- Deep forest green for primary brand identity.
- Soft sage accents.
- Warm off-white / neutral backgrounds.
- Emerald for strong positive evidence.
- Blue for moderate evidence and informational states.
- Amber for caution and limited evidence.
- Slate for traditional or theoretical evidence.
- Red only for serious avoid / danger signals.

### Typography

- Clean sans-serif headings.
- Highly readable body text.
- Strong hierarchy.
- Mobile-first spacing.

### Accessibility

Target WCAG 2.1 AA or better.

Required:

- Strong contrast.
- Visible focus states.
- Keyboard navigation.
- ARIA labels for interactive components.
- Reduced-motion support.
- Screen-reader friendly tables and accordions.

---

## 10. Component Library

### Evidence Tier Badge

Variants:

- Full badge for hero/profile pages.
- Compact badge for cards and tables.
- Mini badge for dense lists.

Tiers:

- A — Strong evidence.
- B — Moderate evidence.
- C — Limited / preliminary evidence.
- D — Traditional / theoretical evidence.

Behavior:

- Tooltip explains criteria.
- Links to `/evidence-standards`.
- Uses accessible label text.

### Safety Warning Block

Severity levels:

- Info.
- Caution.
- Avoid / high concern.

Rules:

- Critical warnings must not be collapsible.
- Use standardized language.
- Include consult-clinician framing.

### Study / Claim Card

Fields:

- Key takeaway.
- Claim.
- Evidence level.
- Study type.
- Sample size when available.
- Duration when available.
- Source link.
- Risk of bias summary when available.

### Comparison Table

Requirements:

- Sortable headers.
- Filter controls.
- Mobile accordion fallback.
- Evidence and safety visual indicators.
- Clear CTA links.

### Card Grid

Cards should include:

- Name.
- Short summary.
- Primary effects.
- Evidence badge.
- Safety indicator.
- Best-for note.
- CTA.

### Global Utilities

- Autocomplete search.
- Breadcrumbs with structured data.
- Loading skeletons.
- Helpful empty states.
- Print stylesheet.
- Share button.
- Bookmark / saved items using localStorage initially.

---

## 11. Evidence Philosophy

The evidence framework should prioritize transparency over perfection.

Rules:

- Human evidence first.
- RCTs, systematic reviews, and meta-analyses are prioritized.
- Mechanistic and animal evidence must be clearly labeled.
- Traditional use can be included, but must not be presented as proven clinical benefit.
- Safety uncertainty should be stated plainly.
- Lower evidence tiers must use conservative wording.

### Claim Language Rules

Preferred:

- “May support...”
- “Preliminary evidence suggests...”
- “Human evidence is limited...”
- “Traditional use includes...”
- “Evidence is stronger for X than Y...”

Avoid:

- “Cures.”
- “Treats.”
- “Proven to fix.”
- “Guaranteed.”
- Disease-treatment claims without strong regulatory and clinical support.

---

## 12. Evidence Framework

### Public Evidence Tiers

#### Tier A — Strong Evidence

Criteria:

- Multiple high-quality human RCTs.
- Supported by systematic reviews or meta-analyses.
- Consistent direction of findings.
- Low risk of bias.
- Good applicability.
- Reasonable safety data.

#### Tier B — Moderate Evidence

Criteria:

- One to three positive human trials or strong clinical support with limitations.
- Some inconsistency or population-specific evidence.
- Reasonable but incomplete certainty.

#### Tier C — Limited / Preliminary Evidence

Criteria:

- Small human studies, pilot studies, open-label data, or early clinical signals.
- Strong mechanistic or preclinical rationale but insufficient clinical validation.

#### Tier D — Traditional / Theoretical Evidence

Criteria:

- Traditional use or theoretical mechanism with minimal direct human evidence.
- Useful for context only.

### GRADE

GRADE is the primary public-facing certainty framework.

Levels:

- High.
- Moderate.
- Low.
- Very low.

Downgrade factors:

- Risk of bias.
- Inconsistency.
- Indirectness.
- Imprecision.
- Publication bias.

Upgrade factors for observational evidence:

- Large effect size.
- Dose-response gradient.
- Residual confounding would reduce the observed effect.

### Risk of Bias Tools

Use these internally and display simplified summaries when useful:

- Cochrane RoB 2 for randomized trials.
- ROBINS-I for non-randomized and observational studies.

### Review Quality Tools

Use these for reviews and meta-analyses:

- AMSTAR 2.
- SIGN levels.

### Triage Tool

Oxford CEBM can be used for quick study-design hierarchy screening.

### Hybrid Rule

Use:

- GRADE for public certainty.
- Evidence Tiers A-D for fast scanning.
- AMSTAR 2 / SIGN for review quality.
- RoB 2 / ROBINS-I for study bias.
- CEBM for internal triage.

---

## 13. Evidence Standards Page

The site should include `/evidence-standards` explaining:

- Evidence tiers.
- GRADE certainty.
- Study types.
- Risk of bias.
- Why animal/mechanistic evidence is treated cautiously.
- Why safety uncertainty matters.
- How claims are updated.
- How users should interpret badges.

Every evidence badge should link or tooltip back to this page.

---

## 14. Safety and Medical Disclaimer Requirements

The site is educational only and must not provide medical advice.

Every herb and compound page must include:

- Educational-only disclaimer.
- Not-medical-advice disclaimer.
- Safety section.
- Avoid-if section where known.
- Interaction warnings where known.
- Pregnancy / lactation caution where appropriate.
- Medication interaction caution where appropriate.
- Emergency advice disclaimer where appropriate.

Dosage instructions must not be shown unless backed by reliable sources and clearly framed as educational, not prescriptive.

---

## 15. SEO and Technical Requirements

Every indexable page should include:

- Unique title.
- Unique meta description.
- Canonical URL.
- Open Graph metadata.
- Structured data where appropriate.
- Breadcrumbs.
- Internal links.
- Safety disclaimer for health-related pages.

Structured data candidates:

- Article.
- FAQPage.
- CollectionPage.
- BreadcrumbList.

Avoid duplicate thin pages. If an entity is too incomplete, gate it or render a minimal but honest page.

---

## 16. Build and Deployment Contract

Cloudflare Pages deployment must:

1. Decode workbook secret when present.
2. Rebuild runtime data.
3. Validate data structure.
4. Audit source-of-truth compliance.
5. Guard against manual generated-data edits.
6. Generate sitemap and robots.
7. Run production build.
8. Verify critical assets and routes.
9. Deploy only if checks pass.

Failures should clearly report:

- Missing environment variables.
- Failed script name.
- Missing generated file.
- Data validation failure.
- Route generation failure.
- Static export failure.

---

## 17. Data Quality Gates

Profiles should be classified using workbook fields such as:

- `profile_status`
- `summary_quality`
- `primary_effects`
- `best_for`
- `time_to_effect`
- `duration`
- `avoid_if`
- `safety_summary`
- `evidence_grade`
- `confidenceTier`

Suggested display behavior:

- Complete / strong profiles get full detail treatment.
- Partial profiles get honest summaries and missing-data-safe UI.
- Minimal profiles should avoid unsupported decision claims.
- Missing dosage should suppress dosage UI.
- Missing safety should show a cautious uncertainty notice.

---

## 18. Implementation Workflow

### Normal Data Workflow

1. Edit workbook.
2. Run data build.
3. Validate generated runtime data.
4. Audit source-of-truth compliance.
5. Build Next.js site.
6. Verify generated pages.
7. Deploy.

### Evidence Workflow

1. Research batch.
2. Extract claims.
3. Verify sources.
4. Assess study quality.
5. Apply GRADE / tier.
6. Merge into workbook.
7. Regenerate site data.

### Content Workflow

1. Identify high-ROI goal or entity.
2. Check workbook readiness.
3. Build or improve page template.
4. Add internal links.
5. Measure performance.
6. Iterate.

---

## 19. 30–60 Day Action Plan

### Days 1–14

- Finish technical visibility pass.
- Stabilize source-of-truth audit.
- Confirm sitemap and robots.
- Fix broken internal links.
- Create or refine evidence standards page.
- Establish design tokens and core badges.

### Days 15–30

- Launch or improve Sleep and Stress goal hubs.
- Add strong cards and comparison tables.
- Add related stack links.
- Improve top 10 commercial / traffic compounds.
- Review Google Search Console indexing.

### Days 31–60

- Expand goal hubs.
- Polish top 15–25 depth profiles.
- Improve decision fields.
- Add best-for / avoid-if visibility.
- Strengthen internal linking.
- Add analytics-driven iteration.

---

## 20. Success Metrics

### Visibility

- Indexed pages.
- Organic impressions.
- Organic clicks.
- Crawl errors.
- Sitemap coverage.

### Engagement

- Time on site.
- Pages per session.
- Scroll depth.
- Entry → depth clickthrough.
- Return visits.

### Quality

- Percent of complete profiles.
- Percent of profiles with safety summaries.
- Percent of profiles with best-for / avoid-if.
- Percent of claims with verified sources.
- Number of evidence-tiered profiles.

### Business

- Affiliate clicks only on appropriate, quality-gated pages.
- Newsletter signups if implemented.
- Returning user growth.

---

## 21. Risk Mitigation

### Risk: Overstating Evidence

Mitigation:

- Conservative language.
- Evidence tiers.
- GRADE notes.
- Safety disclaimers.

### Risk: UX Overwhelm

Mitigation:

- Summaries first.
- Progressive disclosure.
- Sticky navigation.
- Comparison tables.
- Clear cards.

### Risk: Technical Drift

Mitigation:

- Workbook-only policy.
- Source-of-truth audit.
- Generated-data guard.
- CI build contract.

### Risk: Slow Velocity

Mitigation:

- Pilot goal hubs.
- Reusable components.
- Batch research.
- Prioritize high-ROI entities.

---

## 22. Future Roadmap

Potential later phases:

- Saved items and user accounts.
- Advanced faceted search.
- Personalized learning paths.
- PWA features.
- Audio summaries.
- Living evidence tracker.
- Heavily moderated expert/community contribution layer.
- Partnerships with aligned creators or clinicians.

Do not start these until the technical foundation, discovery layer, and high-priority depth profiles are stable.

---

## 23. Acceptance Criteria

A release is valid only when:

- Lint passes.
- TypeScript passes.
- Data build passes.
- Data validation passes.
- Source-of-truth audit passes.
- Production build passes.
- Verify build passes.
- Sitemap includes expected public routes.
- Robots excludes private/dev routes.
- No generated JSON was manually edited.
- Top herb and compound pages render without runtime errors.
- Safety disclaimers are visible on health-related pages.
- No unsupported treatment claims are introduced.

---

## 24. Final Guidance

The workbook and pipeline are the project’s strongest assets. The site should convert that strength into a clear, trustworthy product: discovery pages for users with goals, depth pages for users who want rigorous details, and evidence standards that make the whole system credible.

Key mantra:

> Visibility gets you seen. Structure gets you used. Flow and evidence honesty get you retained and trusted.

Review this document quarterly and update it as the project evolves.
