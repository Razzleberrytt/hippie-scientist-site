# Homepage V2 Redesign Specification

## 1. Executive Summary

The homepage should stop behaving like a database index and start behaving like a premium decision-support platform for supplement and botanical choices. Its primary job is not to expose the full content library. Its job is to convert uncertainty into a confident next step.

Homepage V2 should make a first-time visitor feel:

- **Understood** — “This site knows the decision I’m trying to make.”
- **Protected** — “This will not hype supplements or ignore safety.”
- **Guided** — “I can answer a few questions and get a practical shortlist.”
- **Confident** — “Recommendations are evidence-weighted, not random rankings.”
- **Ready to act** — “I know what to compare, avoid, and buy next.”

The homepage should introduce the product promise in one sentence:

> Find the supplement path that fits your goal, safety context, and evidence threshold — without sorting through a database.

This specification is intentionally implementation-agnostic. It defines the content strategy, UX hierarchy, conversion intent, section requirements, mobile behavior, and affiliate monetization placements for a future homepage redesign.

## 2. Current Problem

The current homepage feels too much like a well-organized research database. That creates several conversion problems:

1. **Too many equal choices** — herbs, compounds, comparisons, search, and guides can feel like parallel navigation options rather than a guided journey.
2. **Insufficient decision momentum** — users can browse, but the homepage does not strongly move them from problem to shortlist.
3. **Weak premium perception** — the site’s evidence and safety assets are strong, but the homepage does not frame them as a decision engine.
4. **Limited purchase readiness** — affiliate opportunities are not introduced as helpful decision checkpoints.
5. **Mobile cognitive load** — a database-like homepage forces mobile users to scan too much before understanding where to start.

## 3. Target Experience

Homepage V2 should feel like a premium decision-support interface, similar in confidence to a clinical intake, product advisor, and research concierge combined.

The user should not be asked to “browse the library” as the first mental model. They should be asked:

- What outcome are you trying to improve?
- What constraints matter for you?
- How conservative should the recommendation be?
- Do you want a quick shortlist, a comparison, or deeper evidence?

The homepage should lead with **guided selection**, then support browsing only as a secondary path.

## 4. Conversion Principles

### 4.1 Primary Conversion Goal

The primary homepage conversion is not an affiliate click. It is a **qualified decision path start**.

Primary conversion actions:

1. Start the intake wizard.
2. Select a goal.
3. Open a recommendation preview.
4. Open a comparison path.
5. Continue to a product-quality or affiliate-supported buying step after trust is established.

### 4.2 Secondary Conversion Goals

Secondary conversions:

- Visit a goal page.
- Visit an herb or compound profile from a recommendation preview.
- Visit a comparison page.
- Open a sourcing checklist.
- Click an affiliate disclosure-aware product placement.
- Subscribe or save a plan if that feature exists later.

### 4.3 Conversion Tone

The page should sell confidence, not supplements.

Use language such as:

- “Best fit for your situation” instead of “best supplement.”
- “Evidence-weighted shortlist” instead of “top picks.”
- “Check safety fit first” instead of “start taking.”
- “Compare options” instead of “buy now.”
- “Product-quality checklist” instead of “recommended products” when introducing affiliate content early.

Avoid language such as:

- “Cure.”
- “Guaranteed.”
- “Doctor-approved” unless literally substantiated.
- “The best supplement for everyone.”
- “No side effects.”

## 5. Audience and Intent Model

Homepage V2 should support four high-value visitor states.

| Visitor state | User question | Homepage response | Best conversion path |
| --- | --- | --- | --- |
| Problem-led beginner | “What should I try for sleep, stress, focus, or mood?” | Goal cards and guided intake | Goal selection → wizard → shortlist |
| Ingredient-aware buyer | “Is ashwagandha, magnesium, or L-theanine right for me?” | Search and comparison preview | Search/profile → comparison → sourcing |
| Safety-sensitive user | “What should I avoid with my meds or condition?” | Safety-first wizard prompts | Safety module → conservative shortlist |
| Skeptical researcher | “Where is the evidence?” | Evidence credibility section | Evidence module → profile/comparison |

## 6. Homepage Information Architecture

The V2 homepage should use this section order:

1. Hero section.
2. Goal selection section.
3. Intake wizard.
4. Recommendation preview.
5. Comparison preview.
6. Evidence credibility section.
7. Safety section.
8. Affiliate monetization placements.
9. Mobile experience rules.

This order is designed to move the visitor from promise → intent → personalization → proof → safe action.

## 7. Section 1 — Hero Section

### 7.1 Objective

Position the site as a premium decision-support platform within the first viewport.

The hero should answer three questions immediately:

1. What is this?
2. Who is it for?
3. What should I do first?

### 7.2 Recommended Hero Message

Primary headline direction:

> Choose supplements with evidence, safety, and fit in mind.

Alternative headline directions:

- “A smarter way to decide which supplements fit your goal.”
- “Evidence-weighted supplement guidance for real-world decisions.”
- “Find your safest, most sensible supplement shortlist.”

Recommended subheadline:

> Tell us your goal and constraints. Hippie Scientist turns herb, compound, safety, and evidence data into a practical shortlist — with clear tradeoffs before you buy.

### 7.3 Hero CTAs

The hero should have one dominant CTA and two secondary CTAs.

Primary CTA:

- Label: **Start your recommendation**
- Destination/behavior: Opens intake wizard or routes to a start flow.
- Intent: Highest-priority conversion.

Secondary CTA 1:

- Label: **Choose a goal**
- Destination/behavior: Scrolls to goal selection or links to `/goals`.
- Intent: For users who want a lighter first step.

Secondary CTA 2:

- Label: **Compare options**
- Destination/behavior: Routes to comparison experience.
- Intent: For users already deciding between ingredients.

### 7.4 Hero Trust Strip

Below the CTA row, add a compact trust strip with three proof points:

- Evidence-weighted, not hype-based.
- Safety flags before product links.
- Built for herbs, compounds, and real-world tradeoffs.

The trust strip should be visually calm, not badge-heavy. It should support premium confidence without looking like a certification claim.

### 7.5 Hero Visual Direction

Use a decision-support visual rather than database imagery.

Preferred visual concepts:

- A simplified recommendation card stack showing goal, fit, evidence, and caution.
- A decision path diagram from “Goal” to “Shortlist” to “Compare” to “Quality check.”
- A premium dashboard preview with safety and evidence indicators.

Avoid:

- Huge search bars as the dominant hero element.
- Dense grids of herbs or compounds.
- Stock wellness imagery that makes the site feel generic.
- Visuals that imply clinical diagnosis.

## 8. Section 2 — Goal Selection Section

### 8.1 Objective

Let users self-identify their desired outcome quickly. This section should be the homepage’s simplest low-friction conversion step.

### 8.2 Section Headline

Recommended headline:

> Start with the outcome you care about.

Recommended support copy:

> Pick a goal to see evidence-weighted options, common tradeoffs, and safety considerations before choosing a supplement.

### 8.3 Goal Cards

Recommended initial goal set:

1. Sleep.
2. Stress and calm.
3. Focus and mental energy.
4. Mood support.
5. Inflammation and recovery.
6. Gut comfort.

Each goal card should include:

- Goal name.
- One-line user promise.
- A “common first comparisons” hint.
- A safety-sensitive microcopy line when relevant.

Example card:

**Sleep**

- Promise: “Compare gentle sleep-support options by onset, next-day grogginess, and interaction risk.”
- Hint: “Magnesium vs melatonin vs calming herbs.”
- Safety note: “Check sedative and medication cautions first.”

### 8.4 Interaction Behavior

Goal selection should support two modes:

1. **Quick route** — clicking the card opens the existing goal page.
2. **Guided mode** — clicking “personalize this goal” starts the intake wizard with that goal preselected.

If only one interaction can ship initially, prioritize guided mode for the homepage and keep a text link to the full goal guide.

### 8.5 Conversion Requirements

The goal section should make the user feel that the site is narrowing the universe, not expanding it. Avoid showing too many categories or all available goals on the homepage.

## 9. Section 3 — Intake Wizard

### 9.1 Objective

Turn anonymous homepage traffic into a personalized decision path. The intake wizard should be short, safety-aware, and designed to produce a useful recommendation preview without requiring account creation.

### 9.2 Wizard Positioning

Recommended section headline:

> Get a shortlist in under a minute.

Recommended support copy:

> Answer a few non-diagnostic questions so the site can prioritize fit, evidence, and cautions.

### 9.3 Wizard Steps

The homepage wizard should use 4–6 lightweight questions.

Recommended steps:

1. **Goal** — sleep, calm, focus, mood, inflammation, gut comfort, or exploring.
2. **Preference** — gentle, fast-acting, non-sedating, stimulant-free, budget-conscious, or evidence-first.
3. **Sensitivity** — sensitive to sedation, stimulation, digestion, or medication interactions.
4. **Current context** — taking medications, pregnant/nursing, chronic condition, upcoming surgery, or none of these.
5. **Format preference** — capsules, tea, powder, tincture, food-like, no preference.
6. **Research depth** — quick answer, compare tradeoffs, or show evidence.

### 9.4 Wizard Output

The wizard should produce a non-diagnostic recommendation preview with:

- 2–4 candidate ingredients.
- Best-fit use case for each.
- Evidence confidence label.
- Key safety caution.
- Link to compare.
- Link to read profile.
- Link to product-quality checklist or affiliate-supported product path when appropriate.

### 9.5 Safety Gate

If a user selects high-risk context such as pregnancy, medication use, chronic condition, or surgery, the wizard output should become more conservative.

Recommended behavior:

- Place safety guidance above the shortlist.
- Avoid strong product CTAs.
- Emphasize “discuss with a clinician” language.
- Offer educational comparisons rather than direct buying prompts.

### 9.6 Privacy and Friction

Do not require email, login, or personal identifying information to complete the first recommendation. If email capture is introduced later, it should happen after value is delivered.

Recommended post-output email prompt:

> Want to save this shortlist and get updates when evidence or safety notes change?

## 10. Section 4 — Recommendation Preview

### 10.1 Objective

Show users what the platform can produce before they commit to the wizard. This section is the proof-of-product moment.

### 10.2 Section Headline

Recommended headline:

> See what a recommendation looks like.

Recommended support copy:

> The goal is not a generic ranking. It is a fit-based shortlist with evidence, tradeoffs, and safety notes visible upfront.

### 10.3 Preview Content

Use one example scenario, such as:

> Goal: Sleep support without next-day grogginess.

Show 3 sample recommendation cards:

1. Magnesium glycinate.
2. L-theanine.
3. Lemon balm or passionflower, depending on available site coverage.

Each card should include:

- Fit label: “Best fit when…”
- Evidence label: “Evidence strength.”
- Onset/experience label: “What to expect.”
- Safety flag: “Watch out for…”
- CTA: “View profile” or “Compare.”

### 10.4 Recommendation Card Hierarchy

Each recommendation card should prioritize:

1. Fit.
2. Safety.
3. Evidence.
4. Practical use.
5. Product-quality guidance.

Affiliate-related CTAs should not be the first action inside recommendation cards on the homepage. They can appear after “compare” or “quality checklist” actions.

### 10.5 Premium Feel Requirements

The recommendation preview should feel like a decision card from a trusted advisor, not a blog listicle.

Use:

- Clear ranking logic.
- Calm badges.
- White or warm cards.
- Minimal but precise copy.
- No star ratings unless they represent internal fit scoring with transparent methodology.

## 11. Section 5 — Comparison Preview

### 11.1 Objective

Capture users who are already comparing two or more options. This is a high-intent path and should be closer to monetization than general browsing.

### 11.2 Section Headline

Recommended headline:

> Compare tradeoffs before you choose.

Recommended support copy:

> See how popular options differ by goal fit, onset, evidence, safety cautions, and product form.

### 11.3 Featured Comparisons

Recommended comparison previews:

- Magnesium glycinate vs melatonin for sleep.
- L-theanine vs ashwagandha for calm.
- Rhodiola vs caffeine for mental energy.
- Turmeric/curcumin vs boswellia for inflammation support.

Each comparison tile should include:

- “Best for” summary for each side.
- One key caution.
- Evidence confidence contrast.
- CTA: “Compare side by side.”

### 11.4 Comparison Matrix Preview

Include a small matrix with rows such as:

| Decision factor | Option A | Option B |
| --- | --- | --- |
| Best fit | Short summary | Short summary |
| Onset | Short summary | Short summary |
| Evidence | Label | Label |
| Main caution | Short caution | Short caution |
| Product form | Typical form | Typical form |

This preview should demonstrate that the platform helps users make tradeoff-aware decisions.

### 11.5 Conversion Behavior

Comparison CTAs should route users toward:

1. Full comparison page.
2. Ingredient profile.
3. Product-quality checklist.
4. Affiliate product module only after comparison context is established.

## 12. Section 6 — Evidence Credibility Section

### 12.1 Objective

Convert skepticism into trust. This section should explain how recommendations are formed without overwhelming the visitor with methodology detail.

### 12.2 Section Headline

Recommended headline:

> Evidence is weighted. Uncertainty is shown.

Recommended support copy:

> Recommendations should make the strength of evidence, quality of research, and limits of certainty visible before you act.

### 12.3 Credibility Pillars

Use three or four credibility pillars:

1. **Evidence strength** — distinguishes stronger human evidence from early or traditional-use signals.
2. **Mechanism clarity** — explains plausible pathways without overstating certainty.
3. **Safety context** — surfaces contraindications, interactions, and sensitive populations.
4. **Product quality** — separates ingredient fit from supplement sourcing quality.

### 12.4 Evidence Labels

Recommended labels:

- Stronger human evidence.
- Promising but limited.
- Traditional or early-stage support.
- Mechanism-informed.
- Safety-sensitive.

Avoid labels that sound more precise than the underlying data supports.

### 12.5 Methodology CTA

Include a low-friction CTA:

- Label: **How recommendations are evaluated**
- Destination: methodology, evidence policy, or relevant documentation page.

This CTA should not compete with the primary wizard CTA. It is for trust-building, especially for skeptical users.

## 13. Section 7 — Safety Section

### 13.1 Objective

Make safety feel like a product feature, not a legal afterthought.

### 13.2 Section Headline

Recommended headline:

> Safety checks come before supplement suggestions.

Recommended support copy:

> Herbs and compounds can interact with medications, conditions, surgery, pregnancy, and other supplements. The homepage should make this visible before product links appear.

### 13.3 Safety Content Blocks

Use three concise safety blocks:

1. **Medication and condition cautions** — reminds users to check interactions and clinician guidance.
2. **Sedation, stimulation, and sensitivity** — frames practical side-effect matching.
3. **Stacking and duplication risk** — warns against combining multiple products with overlapping effects.

### 13.4 Safety CTA

Primary safety CTA:

- Label: **Check safety fit first**
- Behavior: opens wizard safety step or routes to safety guidance.

Secondary safety CTA:

- Label: **Read the disclaimer**
- Destination: `/disclaimer`.

### 13.5 Safety Tone

The tone should be calm and serious. Avoid fear-based copy. The section should increase trust and reduce reckless purchase behavior.

Recommended language:

> If you take medications, are pregnant or nursing, manage a chronic condition, or are preparing for surgery, use the shortlist as research support — not medical advice.

## 14. Section 8 — Affiliate Monetization Placements

### 14.1 Monetization Strategy

Homepage affiliate monetization should be present but restrained. The premium positioning depends on showing that recommendations are safety- and evidence-led, not affiliate-led.

The homepage should monetize moments where the user has already received decision value.

### 14.2 Placement Principles

Affiliate placements should:

- Appear after context, not before the first decision.
- Be clearly disclosed.
- Be framed around product quality, form, testing, and fit.
- Avoid pushing products for high-risk users.
- Preserve editorial trust by separating “ingredient fit” from “where to buy.”

### 14.3 Recommended Placements

#### Placement A — Post-Recommendation Quality CTA

Location: After recommendation preview.

Copy direction:

> Once an ingredient looks like a fit, compare product forms, testing signals, and quality markers before buying.

CTA:

- **See product-quality checklist**
- **Compare vetted buying criteria**

Affiliate role:

- Soft monetization path.
- Can later lead to product cards or retailer links.

#### Placement B — Comparison Follow-Up CTA

Location: After comparison preview.

Copy direction:

> Chosen a direction? Check which forms and labels are worth paying for.

CTA:

- **Compare forms and buying criteria**

Affiliate role:

- Higher-intent monetization because the user has narrowed options.

#### Placement C — Goal-Specific Buying Guidance

Location: Optional module below goal cards or after wizard output.

Example:

> For sleep support, product quality often depends on form, dose transparency, third-party testing, and avoiding unnecessary blends.

CTA:

- **View sleep supplement buying guide**

Affiliate role:

- Goal-specific product education before outbound clicks.

#### Placement D — Footer-Level Affiliate Disclosure

Location: Near bottom of homepage and near any monetized CTA.

Copy direction:

> Some links may earn a commission. Recommendations should remain evidence- and safety-led.

This disclosure should be clear but visually secondary.

### 14.4 What Not to Do

Do not place a large “shop supplements” block above the wizard, goal selection, safety framing, or recommendation preview.

Do not use product cards in the hero.

Do not show affiliate CTAs for users who have indicated high-risk safety contexts unless the CTA is reframed as general education or a checklist.

## 15. Section 9 — Mobile Experience

### 15.1 Mobile Objective

Mobile users should understand the site and begin a decision path within 10–20 seconds. The mobile homepage should feel like a guided app, not a compressed desktop database.

### 15.2 Mobile Section Order

Recommended mobile order:

1. Hero headline and primary CTA.
2. Goal chips or compact goal cards.
3. Intake wizard start.
4. Recommendation preview carousel.
5. Comparison preview.
6. Safety checkpoint.
7. Evidence credibility.
8. Product-quality/affiliate CTA.
9. Footer disclosure and secondary navigation.

Safety may move above evidence on mobile because practical cautions are more immediately relevant before action.

### 15.3 Mobile Hero Requirements

The first mobile viewport should include:

- Headline.
- One-sentence value proposition.
- Primary CTA.
- One trust line.

Avoid squeezing three CTAs into the first viewport if it makes the hero feel cluttered. Secondary CTAs can appear as text links below.

### 15.4 Mobile Goal Selection

Use horizontally scrollable goal chips or two-column cards depending on available design system constraints.

Requirements:

- Thumb-friendly tap targets.
- Maximum six visible goals before “See all.”
- Plain-language labels.
- No dense explanatory text inside the first mobile cards.

### 15.5 Mobile Wizard Behavior

The wizard should feel like a sequence of simple cards.

Requirements:

- One question per screen or per card.
- Persistent progress indicator.
- Back button.
- Skip option for non-critical questions.
- Safety-sensitive answers should visibly affect the output.
- No forced account creation.

### 15.6 Mobile Recommendation Preview

Use a swipeable card stack or vertical cards. Each card should show:

- Ingredient name.
- Best-fit statement.
- Evidence label.
- One safety flag.
- One primary action.

Avoid showing full evidence explanations in the card. Use expandable details.

### 15.7 Mobile Sticky Action

After the user scrolls beyond the hero, consider a sticky bottom CTA:

- Default: **Start recommendation**.
- After goal selection: **Continue with [goal]**.
- After wizard completion: **View my shortlist**.

The sticky CTA should not conflict with existing mobile navigation patterns. If persistent site navigation already occupies the bottom of the viewport, use an inline sticky card instead.

### 15.8 Mobile Performance and Payload

The homepage should remain lightweight.

Guidance:

- Avoid loading full herb or compound datasets into the initial homepage bundle.
- Use static preview data for homepage examples where possible.
- Defer non-critical comparison and affiliate modules below the fold.
- Keep imagery optimized and purposeful.
- Avoid heavy animation that delays first interaction.

## 16. Visual and Brand Direction

### 16.1 Desired Feel

Homepage V2 should feel:

- Premium.
- Calm.
- Evidence-aware.
- Human.
- Practical.
- Safe.

It should not feel:

- Like a raw database.
- Like a supplement marketplace.
- Like a generic wellness blog.
- Like a medical diagnostic tool.

### 16.2 Layout Direction

Use spacious sections, strong hierarchy, and card-based decision modules.

Recommended visual hierarchy:

- Large hero headline.
- Clear primary CTA.
- Compact decision cards.
- Evidence and safety badges used sparingly.
- Warm background and emerald accents consistent with the site theme.

### 16.3 Component Patterns

Recommended component patterns:

- Goal cards.
- Wizard question cards.
- Recommendation cards.
- Comparison matrix preview.
- Evidence pillar cards.
- Safety callout.
- Affiliate disclosure bar.

Avoid creating visual noise with too many badges, icons, or equal-weight cards.

## 17. Copy System

### 17.1 Voice

The voice should be:

- Clear.
- Conservative.
- Useful.
- Trustworthy.
- Decision-oriented.

### 17.2 Copy Rules

Use “may,” “can,” and “is often used for” when certainty is limited.

Always separate:

- Evidence strength.
- Safety fit.
- Product quality.
- Personal medical advice.

Do not imply the homepage can diagnose, treat, cure, or replace medical guidance.

### 17.3 Recommended Microcopy

Wizard intro:

> This is educational decision support, not medical advice. Safety-sensitive answers make recommendations more conservative.

Recommendation preview:

> Shortlists prioritize fit and caution before purchase intent.

Affiliate disclosure:

> Some outbound links may earn a commission. Editorial recommendations should remain evidence- and safety-led.

Safety note:

> If you take medication or manage a medical condition, use this as a research starting point and consult a qualified clinician.

## 18. Analytics and Measurement

### 18.1 Primary Events

Track:

- Hero primary CTA click.
- Goal selected.
- Wizard started.
- Wizard completed.
- Safety-sensitive path triggered.
- Recommendation card opened.
- Comparison preview clicked.
- Product-quality CTA clicked.
- Affiliate outbound clicked.
- Methodology clicked.
- Disclaimer clicked.

### 18.2 Funnel Metrics

Key metrics:

1. Hero CTA click-through rate.
2. Goal selection rate.
3. Wizard start rate.
4. Wizard completion rate.
5. Recommendation-to-comparison click rate.
6. Recommendation-to-profile click rate.
7. Product-quality CTA click rate.
8. Affiliate click-through rate after recommendation or comparison.
9. Safety section engagement.
10. Mobile scroll depth.

### 18.3 Success Criteria

Homepage V2 should be considered successful if it improves:

- Wizard starts.
- Goal page entries.
- Comparison entries.
- Qualified affiliate path clicks.
- Time-to-first-action on mobile.
- Scroll depth to recommendation preview.

The homepage should not be judged only by raw affiliate clicks. Premature monetization can reduce trust and lower downstream conversion quality.

## 19. Accessibility and Trust Requirements

The design should support:

- Keyboard navigation.
- Visible focus states.
- High-contrast text on warm backgrounds.
- Clear labels for wizard controls.
- Non-color-only evidence and safety indicators.
- Reduced-motion friendly interactions.
- Screen-reader understandable comparison tables.

Trust requirements:

- Affiliate disclosures must be visible near monetized modules.
- Safety disclaimers must be accessible before or near recommendation outputs.
- Evidence labels must not overstate certainty.
- Product links must not be visually indistinguishable from editorial recommendations.

## 20. Static Export and Architecture Constraints

The homepage redesign should preserve the static-export architecture.

Implementation should avoid requiring:

- API routes.
- Server actions.
- Runtime personalization.
- Runtime revalidation.
- Middleware-dependent flows.

The initial wizard can be client-side and data-light. Recommendation previews can use curated static data or precomputed artifacts. The homepage should not require loading the entire database before the user interacts.

## 21. MVP Scope

### 21.1 MVP Must-Haves

- Premium hero with one dominant CTA.
- Six goal cards or chips.
- Lightweight intake wizard entry.
- Static recommendation preview.
- Static comparison preview.
- Evidence credibility section.
- Safety-first section.
- Affiliate disclosure-aware product-quality CTA.
- Mobile-first CTA hierarchy.

### 21.2 MVP Nice-to-Haves

- Client-side wizard output personalization.
- Sticky mobile CTA.
- Save/share shortlist.
- Email capture after output.
- Dynamic comparison suggestions based on selected goal.
- Goal-specific product-quality guides.

### 21.3 Out of Scope for MVP

- Account system.
- Medical diagnosis.
- Real-time server-side personalization.
- Full product marketplace.
- Large-scale redesign of all depth pages.
- New route architecture that breaks existing route contracts.

## 22. Recommended Homepage Wireframe Narrative

### 22.1 Desktop Narrative

1. **Hero** — headline, subheadline, primary CTA, secondary CTAs, trust strip, dashboard-style preview.
2. **Goal selection** — six goal cards with concise decision promises.
3. **Wizard module** — short card showing question one and the expected output.
4. **Recommendation preview** — three-card example shortlist with fit, evidence, and safety flags.
5. **Comparison preview** — featured comparison tiles and a small matrix.
6. **Evidence credibility** — three or four credibility pillars with methodology CTA.
7. **Safety section** — safety-first callout with “check safety fit first.”
8. **Product-quality CTA** — affiliate-aware, disclosure-supported buying guidance.
9. **Footer support** — disclaimer, methodology, library links, and secondary navigation.

### 22.2 Mobile Narrative

1. One-screen hero with primary CTA.
2. Compact goal chips.
3. Wizard card.
4. Swipeable recommendation preview.
5. One featured comparison.
6. Safety checkpoint.
7. Evidence credibility accordion.
8. Product-quality CTA and disclosure.

## 23. Final Recommendation

Build the homepage around a single strategic idea:

> The homepage is not a library entrance. It is a guided decision start.

Every section should help the user move from uncertainty to a safer, evidence-aware next action. The page should still support search and browsing, but those should become secondary paths. The premium feeling will come from decisive hierarchy, restrained copy, visible safety logic, and recommendation previews that show the site can reduce complexity rather than merely organize it.
