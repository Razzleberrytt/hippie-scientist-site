# Content Trust & Consistency Audit (Issue #1665)

Date: 2026-05-22  
Scope: herb detail pages, compound detail pages, compare pages, SEO entry pages, relevant goals/learn pages  
Method: audit-first, documentation-only pass; no workbook/public data/generated-file edits

## 1) Executive summary

This audit found the highest trust risks are not primarily in the caution-heavy core pages (`/goals/*`, `/compare/[slug]`, many SEO-entry modules), but in **some “top/best” discovery routes** where ranking-oriented language and simplified “what helps” copy can outpace uncertainty framing.

Overall, the site already includes many conservative disclaimers and safety reminders, but terminology and confidence framing are uneven across route families. The largest consistency gap is between:

- strong caution language in goals/SEO decision scaffolding, and
- stronger marketing-like language on several listicle-style pages.

The recommended strategy is a phased editorial normalization pass (quick copy standards first, then deeper source/data alignment) without changing routing or generated data pipelines.

## 2) Highest-risk trust issues (ranked by user trust impact)

### H1 — Overconfident framing on “best/top” routes (High)

Examples include route titles and headings such as “Best Supplements…” / “Top 3 Herbs…”, plus copy that may read as effectiveness-forward before uncertainty context appears.

Why this matters:
- Users arriving from search may interpret list rank as outcome certainty.
- Trust risk increases when ranking language appears adjacent to affiliate CTAs.

Representative files/routes:
- `app/top/focus/page.tsx`
- `app/top/sleep/page.tsx`
- `app/top/stress/page.tsx`
- `app/top/top-3-herbs-for-stress/page.tsx`
- `app/top/top-3-herbs-for-anxiety/page.tsx`
- `app/top/top-3-natural-sleep-aids/page.tsx`

Quick win:
- Add a short “ranking interpretation” line above first ranked cards (dataset-driven discovery, not clinical superiority).

---

### H2 — Evidence-label drift across page types (High)

Evidence terms vary by route context (`Stronger/Moderate/Limited/Mixed`, grade letters, prose “evidence-aware”, rank-score language), creating potential user confusion.

Why this matters:
- Users can misread differences in wording as differences in evidence model.
- Consistency is key for trust in educational content.

Representative files/routes:
- `app/compare/[slug]/page.tsx` (derived score-to-label mapping)
- `app/goals/[goal]/page.tsx` (normalized decision labels)
- `app/seo-entry-pages.tsx` (evidence-aware prose + FAQs)
- `app/top/*` pages (rank + score + general evidence language)

Quick win:
- Publish one canonical evidence lexicon and apply to headings, badges, and helper copy.

---

### H3 — Safety-framing inconsistency between adjacent routes (High)

Some route families include explicit “educational only” and medication/pregnancy cautions; others rely on softer summaries or place caution lower on page.

Why this matters:
- Safety expectations should not depend on entry path.

Representative files/routes:
- Stronger safety framing: `app/goals/[goal]/page.tsx`, `app/seo-entry-pages.tsx`
- More variable framing: multiple `app/top/*` pages

Quick win:
- Add a consistent “Safety context first” mini-block template for all high-intent entry pages.

## 3) Content consistency issues

1. **Rank semantics vary** (`score`, `best`, `top`, “evidence-aware guide”) without a single interpretation aid.
2. **Route family tone mismatch**: goals/decision pages are conservative; list-style pages are comparatively promotional in tone.
3. **Terminology drift** between “research context,” “dataset signals,” “evidence signals,” and “evidence strength” without clear hierarchy.
4. **Affiliate adjacency optics**: in some routes, product CTA appears before sufficient uncertainty/safety framing.

## 4) Evidence-language issues

Observed patterns:
- Derived evidence scoring in compare routes can appear authoritative even when based on mixed text-source heuristics.
- SEO-entry pages already do better at caveating with “may,” “depends,” and “not all supplements work the same way.”
- Some top pages emphasize popularity/benefit language without immediate evidence limitations.

Recommended standard:
- First-mention rule: each page should define evidence as *signal quality*, not guarantee of effect.
- Keep modality consistent: prefer “may,” “can,” “is associated with,” “evidence is limited/mixed/moderate.”
- Avoid unqualified verbs: “improves,” “works,” “boosts,” “best for everyone.”

## 5) Safety-language issues

Observed patterns:
- Goals and SEO routes include robust guardrails (interactions, pregnancy, medications, conditions).
- Top/discovery pages vary in prominence and timing of safety guidance.

Recommended standard:
- Require a visible above-the-fold safety sentence on all “best/top” pages.
- Require a compact caution list near first actionable CTA.
- Standardize “not medical advice” + individual variation + interaction reminder in one reusable block.

## 6) Dosage/framing concerns

Current risk profile:
- No major direct dosing over-prescription was identified in sampled files; however, some routes mention ranking/selection in ways that may be interpreted as prescriptive without repeating dose-individualization uncertainty.

Potential trust gap:
- If a page references “dose context” but lacks immediate dose variability caveat, users may infer uniformity.

Recommendation:
- Standard dose framing sentence wherever dose is mentioned: “Dose-response varies by preparation, baseline status, tolerance, and co-medications.”
- Keep explicit dose specifics tied to source-backed profile content only (future data-quality/editorial work where needed).

## 7) Thin/placeholder content concerns

Main concerns:
- Some list/discovery pages rely on short generic summaries and repeated link clusters, which can read as template-like and reduce perceived editorial reliability.
- Repetitive “related guides” blocks without unique route-level interpretation can feel mechanically generated.

Recommendation:
- Add small route-specific interpretive paragraphs (2–3 lines) rather than broad rewrites.
- Prioritize pages with highest commercial-intent queries first.

## 8) Recommended terminology standards

Proposed baseline glossary for editorial consistency:

- **Evidence strength**: Limited / Mixed / Moderate / Stronger (or chosen canonical set)
- **Safety context**: “Interaction risk,” “population cautions,” “condition-specific cautions”
- **Uncertainty statement**: “Response varies by individual factors and product quality.”
- **Selection framing**: “Comparison starting point,” not recommendation/prescription
- **Ranking framing**: “Dataset-driven discovery order,” not clinical superiority

Style constraints:
- Prefer cautious modality (`may`, `can`, `might`) over deterministic claims.
- Explicitly avoid cure/treatment certainty language on educational pages.
- Keep “individual variation” wording consistent across herbs, compounds, compare, goals, and SEO entries.

## 9) Suggested PR order for fixes

### Phase 1 — Quick wins (copy-only, low risk)
1. Add standardized trust/safety intro block to `app/top/*` routes.
2. Add rank-interpretation sentence near first ranked cards/CTA.
3. Normalize one-line uncertainty statement across compare/top/SEO templates.

### Phase 2 — Consistency pass (medium)
4. Align evidence badge/label vocabulary across compare/goals/SEO/top route families.
5. Harmonize safety block placement and heading names.
6. Reduce sales-adjacent phrasing where caution is currently delayed.

### Phase 3 — Deeper editorial/data-quality work (larger)
7. Identify workbook-backed fields that need stronger evidence/safety normalization (future source-of-truth work; do not patch generated runtime JSON directly).
8. Add QA checklist for trust language in content publishing workflow.

## 10) Files/routes likely involved (future implementation)

Primary targets:
- `app/top/focus/page.tsx`
- `app/top/sleep/page.tsx`
- `app/top/stress/page.tsx`
- `app/top/top-3-herbs-for-stress/page.tsx`
- `app/top/top-3-herbs-for-anxiety/page.tsx`
- `app/top/top-3-natural-sleep-aids/page.tsx`
- `app/top/best-supplements-for-fatigue/page.tsx`
- `app/top/best-herbs-for-cortisol/page.tsx`

Consistency/alignment targets:
- `app/compare/[slug]/page.tsx`
- `app/seo-entry-pages.tsx`
- `app/goals/[goal]/page.tsx`
- Relevant learn pages that explain evidence/safety methodology (for terminology synchronization)

Out of scope for this audit pass:
- Workbook edits
- `public/data` edits
- Generated artifact rewrites
- Runtime generation script changes
