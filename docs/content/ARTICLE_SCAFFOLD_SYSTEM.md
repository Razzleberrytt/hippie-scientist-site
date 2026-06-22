# The Hippie Scientist Article Scaffold System (V3)

**Last Updated**: 2026-06-22  
**Version Notes**: V3 adds 7-OH / kratom-specific guidance, visual content prompts, tighter evidence workflow integration, accessibility notes, and rollout metrics.

This document defines reusable article stamps for consistent, reader-first, evidence-based content on The Hippie Scientist. Use it as the single source of truth for new and promoted articles.

## Global Quality Rules (All Articles)
1. Lead with a **Quick Answer / Verdict** (plain English, cautious).
2. Self-sorting early (`Best For / Not Best For`).
3. Separate **direct human evidence** from indirect/mechanism/preclinical.
4. No treatment/cure/guaranteed claims. No mechanism hype.
5. Safety sections prominent, specific, non-alarmist.
6. Short scannable sections + tables where helpful.
7. Strip editorial/planning notes from rendered output.
8. Link **only** to live relevant routes.
9. Obvious next reader action.
10. Evidence ratings and citations transparent (use `evidence-rating-automator`).

## Global Internal Linking & SEO Rules
- Prioritize: Comparison → Pillar → Stack → Mechanism → Foundational.
- Max 8-12 high-value links, deduped.
- Include structured data (FAQ, Article) and accessibility (headings, ARIA).
- Target keywords naturally; optimize for goal-oriented searches.

## 1. Single Compound / Supplement Evidence (Primary for 7-OH Rollout)
**Use For**: Herbs, nutrients, alkaloids (e.g. 7-Hydroxymitragynine, Citicoline).

**Core Structure**:
1. Quick Answer
2. Best For / Not Best For
3. What [Compound] Is
4. How It Works (mechanism)
5. Evidence Grade & Key Studies (table)
6. Effects on [Goal/Condition]
7. [Compound] vs Closest Alternatives
8. Dosing & Timing
9. Side Effects & Safety
10. Practical Decision Framework
11. FAQ
12. Conclusion & Next Steps

**7-OH / Kratom Variant**: Add dedicated sections for alkaloid content, potency comparison to mitragynine, regulatory notes, harm reduction emphasis.

**Visuals**: Include potency chart or mechanism diagram prompt for `visual-content-generator`.

## 2. Comparison Article
**Core Structure**:
1. Quick Verdict
2. Best by Scenario + Table
3. Side-by-Side Comparison
4. Mechanism & Evidence Diffs
5. Safety Comparison
6. Decision Guidance
7. FAQ

## 3. Stack Article
**Core Structure**:
1. Quick Answer
2. Who For / Not For
3. Philosophy (one-variable testing)
4. Core + Add-Ons
5. Safety & Cautions
6. Protocol Example
7. FAQ

## 4. Pillar Guide
**Core Structure**:
1. Quick Answer
2. How to Use
3. Evidence Tier Table
4. Options by Use Case
5. Safety Overview
6. Related Guides

## 5. Mechanism / Education
**Core Structure**:
1. Summary
2. Why It Matters
3. Core Mechanism
4. Supplement Interactions
5. Takeaways

## 6. Goal / Discovery Page
**Lighter Structure**:
1. Goal Summary
2. Choose Situation
3. Starting Points + Cards
4. Next Guides

## 7. Safety / Harm-Reduction
**Strict Rules**: No monetization, product recs, or casual language. Emphasize regulatory status for 7-OH/kratom.

## Acceptance Checklist
- [ ] Correct scaffold + variants applied
- [ ] Evidence ratings & citations verified
- [ ] Links live only
- [ ] Validation scripts pass (`typecheck`, `lint`, `build`, `validate:content`)
- [ ] Accessibility & SEO basics checked
- [ ] Visuals generated where helpful

## Changelog
- V3 (2026-06-22): 7-OH integration, visuals, evidence workflow, a11y.
- V2 (earlier): Evidence slots, SEO, core blocks.

Reference this doc in all content PRs and the Epic rollout (#1881).