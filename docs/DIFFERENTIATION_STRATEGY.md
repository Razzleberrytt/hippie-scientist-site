# Differentiation Strategy — The Hippie Scientist
*Workstream D: Unique Value Proposition*

---

## 1. Evidence Score System

### What It Is
A single, visible score (or tier badge) that tells a visitor at a glance how strong the science is behind a given herb or compound — before they read a word of body copy.

### Metrics That Make Up the Score

| Dimension | Weight | How to Measure |
|-----------|--------|----------------|
| **Study Count** | 20% | Number of human RCTs / clinical trials in source registry |
| **Publication Quality** | 25% | Proportion of studies in peer-reviewed, indexed journals (PubMed); penalize grey lit |
| **Effect Size** | 25% | Average standardized effect size (Cohen's d) across studies; flag inconclusive when ≤ 0.2 |
| **Consistency** | 20% | % of studies pointing in the same direction; penalize conflicting results |
| **Recency** | 10% | Proportion of citations from last 10 years; older evidence scores lower |

**Score output:** 4 discrete tiers (not a decimal score — tiers are harder to game and easier to skim):

| Tier | Label | Color | Meaning |
|------|-------|-------|---------|
| A | Strong Evidence | Green | Multiple RCTs, consistent direction, adequate effect size |
| B | Moderate Evidence | Yellow-green | Some RCTs or consistent observational data |
| C | Preliminary / Mixed | Amber | Animal/in-vitro only, or inconsistent human data |
| D | Traditional / Theoretical | Gray | Traditional use only; no human trials |

This maps directly to the existing `confidenceTier` field (`low / moderate / strong`) in the herb/compound schema — the tier rename to A/B/C/D is a display-layer decision, no workbook change required.

### How to Display It

**On detail pages (herb/compound):**
- Sticky badge in the page header (above the fold) — e.g., a colored pill reading "Evidence: B — Moderate"
- A collapsible "Why this score?" callout that lists the 5 dimensions with individual ratings
- Source count shown inline: "Based on 14 human studies"

**On goal decision guides (already exist at `/goals/:slug`):**
- Evidence column in the comparison matrix already exists — upgrade it from free text to the A/B/C/D badge
- Sort options by tier by default (A first)

**On comparison pages:**
- Show both entities' scores side-by-side at the top of the page: "Ashwagandha [A] vs Rhodiola [B]"

**On list/browse pages (herbs, compounds):**
- Filter by evidence tier (checkbox: show only A+B)
- Sort by evidence tier

### What Makes This Different From Examine.com

Examine uses a proprietary "Human Effect Matrix" that scores many outcomes per compound. It's excellent but has three weaknesses:

1. **It's overwhelming.** The HEM shows dozens of outcome rows per compound; casual users bounce before they understand it.
2. **It's not goal-oriented.** Examine scores curcumin on 40+ outcomes. A user who just wants to know "does it help with joint pain?" has to do the work themselves.
3. **It doesn't penalize inconsistency.** A compound with 5 positive and 5 contradictory studies can look similar to one with 10 consistent positives.

**The Hippie Scientist's advantage:**
- Single tier badge that's instantly scannable
- Consistency penalty is explicit (a split literature gets flagged, not buried)
- Scored *relative to a specific goal*, not in the abstract — Ashwagandha's "stress" evidence is A, its "testosterone" evidence is C; these are shown in goal context
- Translational disclaimer built in: if the evidence is from rats, the badge says so

---

## 2. "Show Me The Studies" Feature

### What It Is
An inline, expandable studies panel on every herb/compound detail page that surfaces the actual citations behind every claim — not just a footnote list, but a structured, skimmable studies table.

### What It Looks Like

On any claim or mechanism statement (e.g., "Ashwagandha reduces cortisol levels"), a small "📄 3 studies" link appears inline. Clicking it expands an accordion panel showing:

```
┌─────────────────────────────────────────────────────────────────────┐
│ STUDIES SUPPORTING THIS CLAIM                                        │
├───────────────────────────────┬──────────┬───────────┬──────────────┤
│ Study                         │ Design   │ Effect    │ Quality      │
├───────────────────────────────┼──────────┼───────────┼──────────────┤
│ Chandrasekhar et al. (2012)   │ RCT      │ −27% STAI │ ★★★★☆        │
│ Andrade et al. (2000)         │ RCT      │ Moderate  │ ★★★☆☆        │
│ Pratte et al. (2014)          │ RCT      │ −14% PSS  │ ★★★★☆        │
├───────────────────────────────┴──────────┴───────────┴──────────────┤
│ [View all studies for Ashwagandha →]   [PubMed links open externally]│
└─────────────────────────────────────────────────────────────────────┘
```

**Each row includes:**
- Author + year (clickable → PubMed)
- Study design (RCT, open-label, observational, in vitro, animal)
- Primary outcome and direction of effect
- Quick quality stars (derived from the Evidence Score dimensions)
- Population note if non-human: "⚠ Rat study"

### How Users Interact With It

- **Default:** collapsed — the page is still clean and readable
- **Expand:** click the inline citation link to expand inline, without losing page position
- **Scan:** skim study type, effect, and quality without opening external tabs
- **Verify:** click PubMed link if they want the full abstract
- **Share:** the expanded panel is the ideal screenshot for anyone linking to your page — it's a trust signal

For power users, a `/evidence/:slug` route (or anchor) could exist for direct deep-linking into the studies panel — useful for Reddit/Discord discussions.

### What Value It Creates

**For casual visitors:** builds trust immediately. "You're not just claiming this — you're showing me exactly what studies you're citing and how good they are." This is the single biggest trust gap vs. Healthline/WebMD.

**For SEO:** PMID-linked references establish topical authority. Google's helpful content signals favor pages that provide genuine expert evidence, not just paraphrased claims.

**For affiliate conversion:** a user who has verified the evidence themselves is a higher-confidence buyer. They're not buying on hope — they've seen the data.

**For brand differentiation:** Healthline has no study tables. WebMD has bare citations. Examine has the matrix but no inline claim-to-study linkage. No one ties individual claims to individual studies in a skimmable format.

### Data Requirements

The infrastructure already exists:
- `claims.json` contains PMIDs and study metadata from the workbook
- `source-registry.json` tracks publication sources
- The workbook's "Study Registry" sheet is the source of truth

The build pipeline needs one new step: output a `claims-by-slug.json` that maps herb/compound slugs to their associated claims with study metadata. Then the detail page component renders the expandable panel.

---

## 3. Unique Value Proposition

### One-Sentence UVP

> **The Hippie Scientist is the only supplement resource that tells you which goal a compound actually helps with, grades the evidence honestly (including when it's weak), and shows you the exact studies behind every claim.**

### Two-Sentence Expanded Version

> Most supplement sites either oversell everything (Healthline, WebMD) or drown you in raw data (Examine). The Hippie Scientist is built for the thoughtful experimenter: goal-first recommendations, honest evidence tiers, and full study transparency — so you can make an informed decision instead of hoping for the best.

### Why Someone Uses This Instead of Competitors

| If you go to... | You get... | What's missing |
|----------------|------------|----------------|
| **Healthline** | Clean, readable summaries | No evidence grading; everything sounds equally credible |
| **WebMD** | Medical coverage breadth | Pharmaceutical bias; supplements treated as afterthoughts |
| **Examine.com** | Deep research breakdowns | Goal-blind; overwhelming; not built for decision-making |
| **Reddit/Nootropics** | Real user experience | Anecdote-heavy; no evidence context; hard to navigate |
| **The Hippie Scientist** | Goal-oriented recommendations + honest evidence grading + full study transparency | — |

### Brand Positioning Sentence (for About page / meta descriptions)

> We rate the evidence, not the hype. Goal-first supplement research for people who want to think, not just buy.

---

## 4. Implementation Priority

| Feature | Effort | Impact | Do When |
|---------|--------|--------|---------|
| Upgrade `confidenceTier` display to A/B/C/D badges | Low | High | Sprint 1 |
| Add evidence tier filter to /herbs and /compounds browse pages | Low | Medium | Sprint 1 |
| Add study count + tier to goal decision matrix (already has text) | Low | High | Sprint 1 |
| Build `claims-by-slug.json` pipeline output | Medium | High | Sprint 2 |
| Inline "Show Me The Studies" accordion on detail pages | Medium | High | Sprint 2 |
| Add evidence tier to comparison page headers | Low | Medium | Sprint 2 |
| `/evidence/:slug` deep-link route | Low | Medium | Sprint 3 |
| Study quality star breakdown ("Why this score?" callout) | Medium | Medium | Sprint 3 |
