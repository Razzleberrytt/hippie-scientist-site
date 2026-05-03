# The Hippie Scientist Master Specification

**Version:** 1.7 Ultra-Expanded Merge  
**Date:** May 2026  
**Status:** Complete all-in-one living reference  

## Executive Summary

The Hippie Scientist is an evidence-aware educational platform for herbs, compounds, and natural supplements. The goal is to combine practical decision support with reference-quality depth while staying conservative, transparent, and harm-reduction focused.

The site should serve informed users who have already seen mainstream supplement content and want a deeper, safer, more evidence-disciplined resource for both common and non-mainstream compounds.

## Core Vision

Build the most credible, usable, and discoverable evidence-aware educational platform for herbs, compounds, and natural supplements.

The platform should help users:

- Find practical answers quickly.
- Compare herbs, compounds, stacks, and goals without hype.
- Understand evidence strength, safety concerns, and uncertainty.
- Move from broad discovery pages into detailed source-backed monographs.
- Leave feeling empowered instead of overwhelmed.

## Core Architecture

### Layer 1: Discovery and Entry

This layer attracts search traffic and guides users into the site.

Primary entry page types:

- Goal hubs.
- Symptom and use-case hubs.
- Comparison pages.
- Beyond-mainstream pages.
- Starter stacks.
- Learning paths.
- Curated collections.

Priority hubs:

- Sleep.
- Stress and anxiety.
- Focus and cognition.
- Metabolic health and fat loss.
- Inflammation and pain.
- Immunity.
- Gut health.
- Joint support.
- Testosterone support.
- Blood pressure.

### Layer 2: Depth

This layer is the credibility moat.

Primary depth page types:

- Herb monographs.
- Compound monographs.
- Stack pages.
- Comparison pages.
- Evidence standards pages.
- Safety and interaction references.

Depth pages should feel like trusted decision tools, not generic encyclopedia entries.

## Guiding Principles

- Visibility gets the site seen.
- Structure gets the site used.
- Flow gets visitors retained.
- Evidence honesty builds trust.
- Conservative claims outperform hype long term.
- Safety and harm reduction must be obvious, not buried.
- The workbook remains the source of truth.
- Generated JSON should not be manually edited.
- The site should consume normalized data, not invent claims at runtime.
- Users need summaries first and depth second.
- Every important page should create a next step.

---

# Part 1: Site Development Plan

## Phase 0: Technical Visibility and Stability

**Timeframe:** 1 to 3 weeks.  
**Priority:** Non-negotiable foundation.

### Objectives

Make sure every publishable page exists, can be crawled, loads quickly, and has clean metadata.

### Actions

- Audit crawlability and indexing.
- Verify sitemap coverage for herbs, compounds, goals, stacks, comparisons, and learning pages.
- Fix rendering bugs and metadata leakage.
- Validate canonical URLs.
- Remove duplicate or dead routes.
- Improve Core Web Vitals.
- Optimize images and static assets.
- Add or verify structured data where appropriate.
- Confirm Cloudflare static export reliability.
- Preserve the workbook-driven build pipeline.
- Keep generated data out of manual edits.
- Maintain build gates.

### Technical SEO Requirements

- Unique title for every indexable page.
- Unique meta description for every major page type.
- Canonical tags on all public routes.
- Breadcrumb structure on depth pages and hubs.
- Sitemap includes only valid routes.
- Robots settings do not block important content.
- Internal links connect hubs to detail pages and detail pages back to hubs.

### UI and UX Deliverables

- Fast initial load.
- Skeleton states for cards and dense content areas.
- Consistent header and footer.
- Mobile-first navigation.
- Helpful error pages with links to popular goals and search.
- Dark mode support.
- Accessible focus states.
- Skip links.
- Readable color contrast.

### Success Metrics

- Zero critical crawl errors.
- Lighthouse scores near or above 90 where practical.
- Core routes verified by the build process.
- Sitemap submitted and accepted.
- Important pages indexed.

## Phase 1: Discovery and Entry Layer

**Timeframe:** 4 to 10 weeks.  
**Priority:** Highest leverage for traffic and user flow.

### Objectives

Create user-friendly entry pages for high-intent problems and comparisons.

### Priority Page Types

1. Goal hubs.
2. Beyond-mainstream comparison pages.
3. Curated collections.
4. Starter stacks.
5. Learning paths.
6. Practical safety guides.

### Goal Hub Template

Each goal hub should include:

- Clear hero headline.
- Short empathetic subheadline.
- Evidence stance statement.
- Quick filters.
- Top compounds or herbs.
- Related stacks.
- Comparison table.
- Safety and harm-reduction block.
- Related learning paths.
- Links to detailed monographs.
- Strong CTA back to broader browsing.

### Card Grid Requirements

Cards should show:

- Name.
- Short summary.
- Evidence tier badge.
- Primary effects.
- Best-for signal when available.
- Safety caution indicator.
- Clear link to the detail page.

Cards should support:

- Filtering by goal.
- Filtering by evidence tier.
- Filtering by safety concern.
- Sorting by relevance, evidence, or priority.
- Mobile-friendly stacked layouts.

### Comparison Table Requirements

Comparison tables should include:

- Compound or herb name.
- Primary use case.
- Evidence strength.
- Mechanism summary.
- Typical dose only when verified.
- Time to effect when verified.
- Safety notes.
- Link to full profile.

Mobile fallback should use accordion cards rather than forcing tiny columns.

### Decision Support Ideas

The site should eventually support simple decision helpers such as:

- Beginner vs advanced view.
- Fast onset vs long-term support.
- Low-risk first options.
- Avoid-if filters.
- Evidence-first filters.
- Save or compare selected items.

### Success Metrics

- More organic impressions.
- Higher pages per session.
- Better click-through from hubs to monographs.
- Longer engagement on comparison pages.
- Lower bounce from broad entry pages.

## Phase 2: Depth Layer Polish

**Timeframe:** Ongoing.  
**Priority:** Parallel with Phase 1 after technical stability.

### Objectives

Convert herb and compound pages into reference-quality decision tools.

### Prioritization Criteria

Prioritize profiles with:

- High search intent.
- Strong alignment with sleep, stress, cognition, inflammation, metabolic health, or gut health.
- Strong or moderate evidence.
- Existing source verification.
- Commercial or affiliate relevance only after quality gates pass.
- Clear safety importance.

Examples of high-priority items:

- Ashwagandha.
- Berberine.
- Magnesium forms.
- Lion's mane.
- Rhodiola.
- Kanna.
- Cistanche.
- Creatine.
- L-theanine.
- Melatonin.
- Omega-3.
- Bacopa.

### Profile Page Structure

Each herb or compound detail page should include:

- Name and synonyms.
- Primary effect badges.
- Evidence tier.
- Net benefit/risk signal when available.
- Quick facts panel.
- Jump navigation.
- Overview summary.
- Mechanisms.
- Evidence and studies.
- Practical use.
- Safety deep dive.
- Traditional context where relevant.
- Related compounds, herbs, stacks, and goals.
- Disclaimer.

### Quick Facts Requirements

Quick facts should include only verified fields:

- Typical dose range.
- Available forms.
- Time to effect.
- Duration.
- Best-for audience.
- Avoid-if cautions.
- Key interactions.
- Evidence tier.

If a field is not verified, suppress it or clearly mark insufficient data.

### Evidence Section Requirements

Evidence sections should show:

- Human evidence first.
- Study cards with source links.
- GRADE or certainty rating when available.
- Risk-of-bias signal when available.
- Clear distinction between human findings, preclinical mechanisms, and traditional use.
- Negative or mixed findings where relevant.

### Safety Section Requirements

Safety must be prominent.

Include:

- Contraindications.
- Interaction warnings.
- Pregnancy and lactation cautions where known.
- Medication-specific cautions where known.
- Population-specific concerns.
- Liver, kidney, cardiovascular, psychiatric, and sedative concerns where relevant.

Never bury critical safety warnings inside collapsed sections.

---

# Part 2: Design System

## Brand Personality

The visual and editorial brand should combine:

- Scientific rigor.
- Earthy natural warmth.
- Practical harm reduction.
- Calm confidence.
- Non-hype transparency.

The site should feel credible, readable, modern, and slightly botanical without becoming cluttered or mystical.

## Visual Language

### Palette

Recommended palette direction:

- Deep forest green for primary brand anchors.
- Soft sage for secondary surfaces.
- Warm off-white for backgrounds.
- Slate for text and low-emphasis UI.
- Emerald for strong evidence.
- Blue for moderate evidence or informational notes.
- Amber for caution or limited evidence.
- Red for avoid or high-risk warnings.

### Typography

- Use a clean sans-serif for headings.
- Use a highly readable body font.
- Keep body line length around 65 to 75 characters.
- Prefer clear hierarchy over decoration.

### Spacing

- Use an 8px base grid.
- Increase whitespace on monographs.
- Avoid dense card walls.
- Use clear separation between summary, evidence, and safety.

### Icons

Use a consistent line-style icon set for:

- Evidence.
- Safety.
- Sleep.
- Stress.
- Focus.
- Metabolic health.
- Gut health.
- Pain and inflammation.
- Immunity.
- Time to effect.
- Duration.
- Contraindications.

## Component Library

### Evidence Tier Badges

Variants:

- Compact.
- Full.
- Mini.

Public tiers:

- A: Strong evidence.
- B: Moderate evidence.
- C: Limited or preliminary evidence.
- D: Traditional or theoretical evidence.

Behavior:

- Tooltip shows tier criteria.
- Link to evidence standards page.
- Use consistent colors everywhere.
- Display prominently on cards and detail heroes.

### Safety Warning Blocks

Severity levels:

- Info.
- Caution.
- Avoid.

Required structure:

- Icon.
- Clear headline.
- Practical warning text.
- Link to safety section or full profile.
- Clinician-consult reminder.

Critical warnings should never be collapsible.

### Study and Claim Cards

Each study card should include:

- One-sentence takeaway.
- Evidence certainty.
- Study type.
- Population.
- Dose or intervention if available.
- Duration.
- Result direction.
- Source link.
- Expandable detail section.

### Comparison Tables

Features:

- Sortable columns.
- Filter controls.
- Evidence bars or badges.
- Risk icons.
- Mobile accordion fallback.
- Pin or compare selected rows eventually.

### Hero Banners

Hero banners should include:

- Clear headline.
- Short subheadline.
- Primary CTA.
- Secondary CTA.
- Optional quick filter chips.
- Subtle botanical or abstract visual treatment.

### Card Grids

Card grids should include:

- Responsive layout.
- Hover or focus lift.
- Loading skeletons.
- Filter and sort toolbar.
- Empty state with suggestions.

### Progressive Disclosure

Use:

- Accordions.
- Tabs.
- Show-more sections.
- Tooltips.
- Modals for glossary or detailed evidence.

Summaries should appear before dense details.

### Engagement Components

Future-friendly components:

- Save item.
- Recently viewed.
- Compare selected.
- Add to learning path.
- Share button.
- Print button.
- Feedback widget.

Start with localStorage before adding accounts.

## Accessibility Standards

Target WCAG 2.1 AA or better.

Requirements:

- Keyboard navigation.
- Visible focus indicators.
- ARIA labels on interactive controls.
- Screen-reader-friendly tables.
- Reduced-motion support.
- High contrast for text.
- No information conveyed by color alone.

---

# Part 3: Evidence Assessment Framework

## Public Evidence Tiers

### Tier A: Strong Evidence

Criteria:

- Multiple high-quality human RCTs.
- Supported by systematic reviews or meta-analyses.
- Consistent findings.
- Good applicability to the target population.
- Low major safety uncertainty for common use cases.

### Tier B: Moderate Evidence

Criteria:

- One to three positive human studies or RCTs.
- Some consistency, but limitations remain.
- Population or outcome may be narrower.
- Safety data is reasonably available.

### Tier C: Limited or Preliminary Evidence

Criteria:

- Small human studies.
- Early clinical signals.
- Heavy reliance on mechanistic, animal, in-vitro, or traditional evidence.
- Insufficient replication.

### Tier D: Traditional or Theoretical Evidence

Criteria:

- Historical or traditional use with minimal clinical validation.
- Mechanistic hypotheses without direct human evidence.
- Insufficient data for confident practical claims.

## Study Quality Markers

Use concise markers:

- High.
- Moderate.
- Preliminary.
- Low or theoretical.

Markers should consider:

- Study design.
- Sample size.
- Population relevance.
- Risk of bias.
- Outcome relevance.
- Replication.
- Consistency.

## Risk of Bias Tools

### Cochrane RoB 2

Use for randomized controlled trials.

Domains:

- Randomization process.
- Deviations from intended interventions.
- Missing outcome data.
- Outcome measurement.
- Selection of reported result.

### ROBINS-I

Use for non-randomized observational studies.

Domains:

- Confounding.
- Selection of participants.
- Classification of interventions.
- Deviations from intended interventions.
- Missing data.
- Measurement of outcomes.
- Selection of reported result.

## Systematic Review Tools

### AMSTAR 2

Use for systematic reviews and meta-analyses.

Key domains:

- Protocol registration.
- Literature search.
- Study selection process.
- Data extraction process.
- Exclusion justification.
- Risk-of-bias assessment.
- Appropriate statistical methods.
- Publication bias.
- Conflict-of-interest handling.

### SIGN Levels

Use as a supporting guideline-style hierarchy.

Range:

- 1++: High-quality meta-analyses, systematic reviews, or RCTs with very low risk of bias.
- 1+: Well-conducted meta-analyses, systematic reviews, or RCTs with low risk of bias.
- 1-: Studies with high risk of bias.
- 2++: High-quality case-control or cohort studies with low confounding risk.
- 2+: Well-conducted case-control or cohort studies.
- 2-: Observational studies with high risk of bias.
- 3: Non-analytic studies.
- 4: Expert opinion.

## GRADE Certainty

Use GRADE as the main public-facing certainty concept where possible.

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

- Large effect.
- Dose-response gradient.
- Plausible confounding would reduce the observed effect.

## Oxford CEBM

Use as a fast triage hierarchy during evidence review, not as the only public scoring system.

## Hybrid Recommendation

Recommended internal model:

- GRADE for public certainty.
- Evidence tiers for simplified user-facing badges.
- RoB 2 for RCT quality checks.
- ROBINS-I for observational studies.
- AMSTAR 2 for systematic reviews.
- SIGN for supporting hierarchy.
- Oxford CEBM for quick triage.

## Evidence Standards Page

Create or maintain a central evidence standards page explaining:

- Evidence tiers.
- GRADE certainty.
- Study types.
- Risk of bias.
- Why some claims are conservative.
- Why traditional use is not the same as proven human benefit.
- How safety warnings are handled.
- Update log and review process.

---

# Part 4: Data and Workflow Rules

## Workbook Source of Truth

The workbook remains the central content authority.

The site should read from normalized exports generated from the workbook. Do not manually edit generated JSON.

Important workbook concepts:

- Herb master data.
- Compound master data.
- Herb-compound mapping.
- Compound pathway mapping.
- Claims and sources.
- UX fields.
- Decision fields.
- Quality and status fields.

## Quality Gates

Publishable profile gates should include:

- Summary quality is strong enough for display.
- Safety section exists.
- Evidence tier exists or insufficient evidence is clearly marked.
- Dosage appears only when source-backed.
- Claims link to valid sources where possible.
- Avoid-if and interaction concerns are normalized.
- Low-quality fields are hidden or marked as insufficient.

## Runtime Display Rules

The frontend should:

- Suppress empty sections.
- Avoid showing placeholder text.
- Avoid invented claims.
- Prefer verified fields.
- Use conservative labels for incomplete data.
- Link only to valid slugs.
- Avoid broken related-item links.

## Research Workflow

Recommended research order:

1. Human evidence.
2. Systematic reviews and meta-analyses.
3. Randomized controlled trials.
4. Clinical studies.
5. Authoritative government or institutional sources.
6. Pharmacology and safety references.
7. Traditional use only with clear labeling.
8. Mechanistic or animal evidence only when clearly marked.

Preferred sources:

- PubMed.
- NIH ODS.
- NCCIH.
- PubChem.
- LiverTox.
- FDA.
- DailyMed.
- ClinicalTrials.gov.
- EMA monographs.
- Kew POWO for botanical identity.
- NCBI Taxonomy.

Avoid:

- Vendor pages.
- Blog summaries.
- Forums.
- Reddit.
- Unsourced marketing claims.
- SEO-only supplement content.

---

# Part 5: Implementation Action Plan

## 30-Day Plan

### Week 1: Technical Foundation

- Verify build pipeline.
- Check sitemap and route generation.
- Validate core routes.
- Fix crawl blockers.
- Confirm metadata quality.
- Confirm homepage and library navigation.

### Week 2: Entry Layer Pilots

- Polish Sleep hub.
- Polish Stress hub.
- Add strong internal links from homepage.
- Add related stacks and top compounds.
- Add safety blocks.
- Add comparison tables where available.

### Week 3: Depth Profile Upgrade

Upgrade top 15 to 20 profiles.

Focus on:

- Strong summaries.
- Evidence tier display.
- Quick facts.
- Safety.
- Internal links.
- Related goals.
- Study cards where data exists.

### Week 4: Evidence Standards and Measurement

- Create or polish evidence standards page.
- Add internal links to it from badges/tooltips.
- Review analytics and Search Console.
- Identify pages with impressions but poor CTR.
- Identify hubs that do not send users deeper.

## Roadmap After 30 Days

- Add more goal hubs.
- Expand beyond-mainstream series.
- Improve comparison pages.
- Add local saved items.
- Add print-friendly reference layouts.
- Add glossary and learning paths.
- Add affiliate modules only after page trust is strong.

---

# Part 6: Risk Mitigation

## Content Risk

Risk: Overstated claims.  
Mitigation: Conservative language, explicit evidence tiers, verified sources.

Risk: Unsafe user interpretation.  
Mitigation: Prominent safety blocks, avoid-if fields, disclaimers.

Risk: Unverified dosage guidance.  
Mitigation: Only show dosage when source-backed and reviewed.

## Technical Risk

Risk: Broken build from generated data edits.  
Mitigation: Do not manually edit generated JSON. Use workbook pipeline.

Risk: Route desync.  
Mitigation: Verify slugs and generated route manifests.

Risk: Cloudflare static export issues.  
Mitigation: Keep static export checks in build and verify core routes.

## UX Risk

Risk: Dense pages overwhelm users.  
Mitigation: Summaries first, progressive disclosure, sticky navigation.

Risk: Too much database feel.  
Mitigation: Decision-first cards, goal hubs, safety signals, practical summaries.

Risk: Trust loss from affiliate placement.  
Mitigation: Evidence and safety before monetization. Affiliate links should be clearly secondary.

---

# Part 7: Success Metrics

## Visibility

- Indexed pages.
- Organic impressions.
- Click-through rate.
- Sitemap coverage.
- Search Console errors.

## Engagement

- Time on page.
- Pages per session.
- Hub to profile clicks.
- Comparison interactions.
- Search usage.
- Return visits.

## Quality

- Profiles with complete safety fields.
- Profiles with strong summaries.
- Profiles with evidence tiers.
- Claims with verified source links.
- Pages passing display quality gates.

## Conversion

- Stack page engagement.
- Affiliate module clicks.
- Newsletter signup if added.
- Saved items if added.
- Repeat visits from high-intent pages.

---

# Final Philosophy

The Hippie Scientist should not try to become a generic supplement blog. Its advantage is the combination of structured workbook data, evidence discipline, practical safety framing, and a more interesting niche than mainstream supplement databases.

The best version of the site is both:

- A discovery engine for practical user goals.
- A reference library for deeper evidence-aware decisions.

The core mantra:

**Visibility gets you seen. Structure gets you used. Flow gets you retained. Evidence honesty builds trust.**

Review and update this document quarterly.
