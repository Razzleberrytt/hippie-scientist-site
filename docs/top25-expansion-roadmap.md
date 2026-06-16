# Top 25 Expansion Roadmap

> **Mission 005 — Content Dominance Engine** · 90-day execution plan
> Companion to [`content-priority-scoreboard.md`](./content-priority-scoreboard.md).
>
> **Scope rules (enforced):** This roadmap **plans** expansion only. It does **not** create
> content, rewrite pages, or redesign anything. Every line below is a *specification* for work
> to be executed later. No new pages are proposed — every target already exists.
>
> Generated: 2026-06-16 · Branch: `claude/content-dominance-scoring-ervnsj`

---

## Selection Logic

The Top 25 are the **highest-ROI expansion opportunities**, not simply the highest raw scores.
ROI = **weighted score × remaining headroom**. This deliberately deprioritizes already-elite
pages (e.g. the 3,400–4,600-word sleep-article cluster scores high but has little headroom —
those are *optimize/maintain*, listed in §"Maintenance Tier") in favor of pages that combine
high commercial intent with a large current content gap.

**Each target already exists as a route.** Word counts, links, citations, FAQ, and schema
states are measured from the source tree (see scoreboard §1 for method).

### Target-state conventions
- **Commercial landing / money pages:** 1,800–2,500 words, `ItemList` + `FAQPage` schema,
  3–6 affiliate placements, 8–12 internal links.
- **Guides:** 1,500–2,200 words, `FAQPage` schema, 2–4 affiliate placements, 6–10 internal links.
- **Comparison pages:** 1,800–2,400 words, comparison table + `FAQPage` schema.
- **Herb hubs:** 1,400–2,000 words of body around the existing structured template.

---

## Portfolio Summary

| Metric | Current (Top 25 total) | Target | Delta |
|--------|:----------------------:|:------:|:-----:|
| Combined words | ~13,400 | ~47,000 | **+33,600** |
| Pages with `FAQPage` schema | 4 / 25 | 25 / 25 | +21 |
| Pages with citations (≥4) | 4 / 25 | 25 / 25 | +21 |
| Pages with ≥3 affiliate placements | 6 / 25 | 25 / 25 | +19 |
| Avg. internal links / page | ~3.4 | ~9 | +5.6 |
| Avg. weighted score | 83 | **91** | +8 |

---

## 90-Day Phasing

| Phase | Window | Focus | Pages |
|-------|--------|-------|:-----:|
| **Phase 1 — Money pages** | Days 1–30 | Highest commercial intent + biggest gap. Build the reusable schema/affiliate/FAQ pattern here. | #1–#9 |
| **Phase 2 — High-intent guide stubs** | Days 31–60 | Convert near-empty high-intent guides into full assets; expand mid-depth guides. | #10–#18 |
| **Phase 3 — Hubs, comparisons & authority** | Days 61–90 | Herb hubs and comparison pages; tie internal-link equity together. | #19–#25 |

Pattern reuse: Phase 1 establishes the `ItemList`/`FAQPage` schema block, the affiliate-card
placement convention, and the citation style. Phases 2–3 replicate it, so per-page cost drops
across the quarter.

---

# Phase 1 — Money Pages (Days 1–30)

### #1 — `/best-supplements-for-sleep`
- **Current score:** 89 → **Target score:** 95
- **Current words:** ~580 (via `SeoEntryPage`) → **Target words:** 2,400
- **Sections to add:** "How we ranked these," per-supplement breakdown (melatonin, magnesium
  glycinate, glycine, L-theanine, valerian, apigenin), dosing & timing table, safety/interaction
  notes, "who should avoid," buyer's checklist (form, dose, third-party testing).
- **Internal links to add (8–10):** `/articles/best-herbs-for-sleep`,
  `/articles/magnesium-types-for-sleep`, `/compare/sleep-herbs-vs-melatonin`,
  `/guides/magnesium-vs-melatonin`, `/herbs/valerian`, `/compounds/melatonin`,
  `/compounds/l-theanine`, `/articles/sleep-stack-guide`.
- **Affiliate opportunities:** 4–5 — magnesium glycinate, melatonin, L-theanine, glycine,
  valerian (use `AFFILIATE_TAGS.amazon` via `RecommendedProduct`).
- **FAQ opportunities (6):** "What is the best supplement for sleep?", "Is magnesium or
  melatonin better?", "Are sleep supplements safe long-term?", "What dose of melatonin?",
  "Can I stack them?", "Do they cause grogginess?"
- **Schema opportunities:** `ItemList` (ranked products) + `FAQPage` + `BreadcrumbList`.

### #2 — `/articles/best-supplements-for-adhd`
- **Current score:** 89 → **Target:** 95
- **Current words:** component-driven (`FocusAdhdArticlePage` / `lib/focus-adhd-articles.ts`,
  ~1,557 w across the focus set) → **Target words:** 2,500
- **Sections to add:** evidence tiers per nutrient (omega-3, zinc, iron/ferritin, magnesium,
  L-theanine, saffron, bacopa), "deficiency-driven vs. adjunct," kids vs. adults, "what the
  trials actually show," stack-building section, when to see a clinician.
- **Internal links to add (8–10):** `/articles/omega-3-and-adhd`, `/articles/zinc-and-adhd`,
  `/articles/iron-ferritin-and-adhd`, `/articles/magnesium-for-adhd`,
  `/articles/l-theanine-for-adhd`, `/articles/best-magnesium-supplement-for-adhd`,
  `/articles/adhd-stack-guide`, `/guides/adhd-supplements`.
- **Affiliate opportunities:** 4–6 via existing `AdhdMonetizationWidgets` (omega-3, zinc,
  magnesium glycinate, iron, saffron).
- **FAQ opportunities (6):** "What supplements help ADHD?", "Do supplements replace
  medication?", "Best for adults vs children?", "How long until they work?", "Are they safe
  with stimulants?", "Which has the strongest evidence?"
- **Schema opportunities:** `Article` + `FAQPage` + `ItemList` for the ranked nutrients.

### #3 — `/best-supplements-for-stress`
- **Current score:** 86 → **Target:** 93
- **Current words:** ~580 → **Target words:** 2,200
- **Sections to add:** adaptogen breakdown (ashwagandha, rhodiola, holy basil), cortisol
  mechanism primer, magnesium + L-theanine for acute stress, dosing table, safety, "acute vs
  chronic stress" selection guide.
- **Internal links to add (8):** `/guides/best-adaptogens-for-stress`,
  `/guides/how-to-lower-cortisol-naturally`, `/herbs/ashwagandha`, `/herbs/rhodiola`,
  `/compounds/l-theanine`, `/articles/natural-anxiety-relief`,
  `/compare/rhodiola-vs-ashwagandha`, `/guides/best-supplements-for-overthinking`.
- **Affiliate opportunities:** 4 — ashwagandha (KSM-66), rhodiola, magnesium, L-theanine.
- **FAQ opportunities (5):** "Best supplement for stress?", "Does ashwagandha lower cortisol?",
  "Ashwagandha vs rhodiola?", "How fast do adaptogens work?", "Safe daily?"
- **Schema opportunities:** `ItemList` + `FAQPage` + `BreadcrumbList`.

### #4 — `/best-supplements-for-focus`
- **Current score:** 85 → **Target:** 92
- **Current words:** ~580 → **Target words:** 2,200
- **Sections to add:** nootropic breakdown (L-theanine+caffeine, citicoline, alpha-GPC, bacopa,
  rhodiola, lion's mane), "stimulant vs calm-focus," dosing/timing table, tolerance/cycling,
  safety.
- **Internal links to add (8):** `/guides/best-nootropics-for-focus`,
  `/articles/l-theanine-vs-caffeine-for-focus`, `/articles/citicoline-vs-alpha-gpc`,
  `/herbs/lions-mane`, `/compounds/l-theanine`, `/guides/focus-without-caffeine-crash`,
  `/compare/caffeine-vs-l-theanine-vs-bacopa-for-focus`, `/articles/best-supplements-for-adhd`.
- **Affiliate opportunities:** 4–5 — L-theanine, citicoline, alpha-GPC, lion's mane, bacopa.
- **FAQ opportunities (5):** "Best supplement for focus?", "Nootropics that actually work?",
  "L-theanine + caffeine dose?", "Focus without jitters?", "Citicoline vs alpha-GPC?"
- **Schema opportunities:** `ItemList` + `FAQPage`.

### #5 — `/articles/best-magnesium-supplement-for-adhd`
- **Current score:** 87 → **Target:** 94
- **Current words:** 1,852 (strong base: 10 FAQ, 4 schema, 22 affiliate markers) →
  **Target words:** 2,600
- **Sections to add:** form-by-form bioavailability table (glycinate, L-threonate, citrate,
  malate, oxide), "magnesium + ADHD evidence," dosing by age/weight, GI tolerance, timing,
  "signs of deficiency."
- **Internal links to add (5–7):** `/articles/magnesium-glycinate-vs-citrate-for-adhd`,
  `/articles/magnesium-for-adhd`, `/compare/magnesium-glycinate-vs-l-threonate-for-sleep`,
  `/compounds/magnesium`, `/articles/l-theanine-magnesium-adhd-stack`,
  `/articles/best-supplements-for-adhd`.
- **Affiliate opportunities:** maintain/expand to 4 distinct forms (glycinate, L-threonate,
  citrate, malate).
- **FAQ opportunities:** already 10 — add "Magnesium L-threonate vs glycinate for ADHD?",
  "Can kids take magnesium for ADHD?"
- **Schema opportunities:** add `ItemList` over the form comparison to existing `Article`/`FAQPage`.

### #6 — `/best-magnesium-supplements-for-adhd`
- **Current score:** 84 → **Target:** 92
- **Current words:** 580 (28 affiliate markers, **0 FAQ/schema/citations**) →
  **Target words:** 2,000
- **Sections to add:** "how to choose," bioavailability table, dose guidance, third-party
  testing checklist, "deficiency & ADHD" evidence summary, safety/GI notes.
- **Internal links to add (6–8):** `/articles/best-magnesium-supplement-for-adhd`,
  `/articles/magnesium-glycinate-vs-citrate-for-adhd`, `/articles/magnesium-for-adhd`,
  `/compounds/magnesium`, `/articles/best-supplements-for-adhd`, `/guides/adhd-supplements`.
- **Affiliate opportunities:** consolidate the existing 28 markers into 3–4 vetted product
  cards (avoid over-linking; map to `AFFILIATE_TAGS.amazon`).
- **FAQ opportunities (6):** add the full set — "Best magnesium for ADHD?", "What form?",
  "Dose?", "Glycinate vs threonate?", "Safe with meds?", "How long to work?"
- **Schema opportunities:** add `ItemList` + `FAQPage` + `BreadcrumbList` (currently none).
- ⚠️ **Note:** near-duplicate intent with #5 (`/articles/best-magnesium-supplement-for-adhd`).
  Differentiate angle (product-roundup vs. form-guide) and cross-link; do **not** merge or
  redirect as part of this roadmap.

### #7 — `/guides/best-supplements-for-sleep`
- **Current score:** 84 → **Target:** 92
- **Current words:** 1,104 (5 links, **0 FAQ/schema/citations**) → **Target words:** 2,200
- **Sections to add:** ranked picks with rationale, dosing table, "stacking safely," "natural
  vs melatonin," circadian/timing guidance, safety & interactions.
- **Internal links to add (6–8):** `/best-supplements-for-sleep`,
  `/articles/best-herbs-for-sleep`, `/compare/sleep-herbs-vs-melatonin`,
  `/guides/magnesium-vs-melatonin`, `/articles/magnesium-types-for-sleep`,
  `/herbs/valerian`, `/compounds/melatonin`.
- **Affiliate opportunities:** 3–4 — magnesium, melatonin, L-theanine, valerian.
- **FAQ opportunities (5):** "Best sleep supplement?", "Natural vs melatonin?", "Safe nightly?",
  "Best dose?", "Stack or single?"
- **Schema opportunities:** `FAQPage` + `ItemList` (currently none).

### #8 — `/best-supplements-for-gut-health`
- **Current score:** 84 → **Target:** 92
- **Current words:** ~580 → **Target words:** 2,200
- **Sections to add:** category breakdown (probiotics, prebiotics/fiber, L-glutamine, digestive
  enzymes, ginger, peppermint, zinc carnosine), "by symptom" selector (bloating, IBS,
  regularity), dosing, safety, "what the evidence supports."
- **Internal links to add (6):** relevant `/compounds/*` (l-glutamine, zinc), `/herbs/ginger`,
  `/herbs/peppermint`, `/best-supplements-for-blood-pressure`, `/guides` hub.
- **Affiliate opportunities:** 4–5 — probiotic, psyllium/prebiotic fiber, L-glutamine, digestive
  enzymes, ginger.
- **FAQ opportunities (6):** "Best supplement for gut health?", "Probiotics vs prebiotics?",
  "Best for bloating?", "Do digestive enzymes help?", "How long to work?", "Safe daily?"
- **Schema opportunities:** `ItemList` + `FAQPage` + `BreadcrumbList`.

### #9 — `/best-supplements-for-fat-loss`
- **Current score:** 84 → **Target:** 92
- **Current words:** ~580 → **Target words:** 2,200
- **Sections to add:** evidence-graded breakdown (caffeine, green tea/EGCG, protein, fiber,
  berberine, L-carnitine), "what works vs. hype," realistic-expectations/safety section, "diet
  & training come first" disclaimer, dosing table.
- **Internal links to add (6):** `/compare/berberine-vs-metformin`, `/compounds/berberine`,
  `/compounds/caffeine`, `/best-supplements-for-blood-pressure`,
  `/best-supplements-for-gut-health`, `/guides` hub.
- **Affiliate opportunities:** 4 — green tea extract, protein powder, fiber, berberine
  (with a prominent evidence/safety caveat — high-scrutiny YMYL topic).
- **FAQ opportunities (6):** "Best supplement for fat loss?", "Does berberine help weight?",
  "Do fat burners work?", "Caffeine for fat loss?", "Safe?", "Realistic results?"
- **Schema opportunities:** `ItemList` + `FAQPage`.
- ⚠️ **YMYL caution:** keep claims conservative and evidence-linked; route disclaimer to
  `/disclaimer`.

---

# Phase 2 — High-Intent Guide Stubs (Days 31–60)

### #10 — `/guides/how-to-lower-cortisol-naturally`
- **Current score:** 81 → **Target:** 90
- **Current words:** 132 → **Target words:** 1,900
- **Sections to add:** cortisol 101, lifestyle levers (sleep, light, exercise, breathwork),
  adaptogen evidence (ashwagandha, rhodiola, holy basil), magnesium/L-theanine, "morning vs
  night cortisol," when high cortisol needs a doctor.
- **Internal links to add (7):** `/herbs/ashwagandha`, `/herbs/rhodiola`,
  `/best-supplements-for-stress`, `/guides/best-adaptogens-for-stress`,
  `/education/how-stress-affects-the-brain`, `/articles/natural-anxiety-relief`,
  `/compounds/l-theanine`.
- **Affiliate opportunities:** 3 — ashwagandha, rhodiola, magnesium.
- **FAQ opportunities (5):** "How do I lower cortisol fast?", "Does ashwagandha lower cortisol?",
  "Foods that lower cortisol?", "Best time to take adaptogens?", "Signs of high cortisol?"
- **Schema opportunities:** `FAQPage` + `HowTo` (for the lifestyle protocol).

### #11 — `/guides/natural-alternatives-to-anxiety-medication`
- **Current score:** 80 → **Target:** 90
- **Current words:** 120 → **Target words:** 1,900
- **Sections to add:** evidence-tiered options (ashwagandha, L-theanine, kava, passionflower,
  lemon balm, magnesium), "how they compare to SSRIs/benzos" (mechanism only, not medical
  advice), safety & interactions (serotonergic risk), "talk to your prescriber" guidance.
- **Internal links to add (7):** `/guides/best-herbs-for-anxiety`,
  `/articles/natural-anxiety-relief`, `/herbs/kava`, `/herbs/passionflower`,
  `/compounds/l-theanine`, `/psychoactive/serotonergic-stacking-risks`,
  `/compare/cbd-vs-ashwagandha-for-anxiety` (or `/articles/cbd-vs-ashwagandha-for-anxiety`).
- **Affiliate opportunities:** 3 — L-theanine, ashwagandha, magnesium (conservative; YMYL).
- **FAQ opportunities (6):** "Natural alternatives to anxiety meds?", "Strongest natural
  anxiolytic?", "Can I stop my meds?", "Kava safe?", "L-theanine vs medication?", "Interactions?"
- **Schema opportunities:** `FAQPage`.
- ⚠️ **YMYL caution:** must not advise discontinuing prescribed medication; frame as
  complementary and prescriber-supervised.

### #12 — `/guides/best-supplements-for-overthinking`
- **Current score:** 78 → **Target:** 88
- **Current words:** 145 → **Target words:** 1,700
- **Sections to add:** "overthinking vs anxiety," calming stack (L-theanine, magnesium glycinate,
  ashwagandha, lemon balm, saffron), evening rumination protocol, dosing, safety.
- **Internal links to add (6):** `/best-supplements-for-stress`,
  `/guides/best-herbs-for-anxiety`, `/compounds/l-theanine`, `/herbs/ashwagandha`,
  `/articles/l-theanine-for-anxiety`, `/guides/how-to-lower-cortisol-naturally`.
- **Affiliate opportunities:** 3 — L-theanine, magnesium glycinate, ashwagandha.
- **FAQ opportunities (5):** "Supplements to stop overthinking?", "Does L-theanine quiet the
  mind?", "Best for racing thoughts at night?", "Magnesium for rumination?", "How fast?"
- **Schema opportunities:** `FAQPage`.

### #13 — `/guides/supplements-for-brain-fog-and-fatigue`
- **Current score:** 78 → **Target:** 88
- **Current words:** 136 → **Target words:** 1,800
- **Sections to add:** common causes (sleep, B12/iron/vit-D deficiency, thyroid, dehydration),
  evidence-based options (B-complex, iron, vit-D, rhodiola, lion's mane, citicoline),
  "energy vs focus," when fog signals something medical.
- **Internal links to add (7):** `/herbs/rhodiola`, `/herbs/lions-mane`,
  `/guides/best-nootropics-for-focus`, `/best-supplements-for-focus`,
  `/articles/vitamin-d-and-adhd`, `/articles/iron-ferritin-and-adhd`, `/compounds/citicoline`.
- **Affiliate opportunities:** 3–4 — B-complex, vitamin D, rhodiola, lion's mane.
- **FAQ opportunities (5):** "Best supplement for brain fog?", "What causes brain fog?",
  "Does rhodiola help fatigue?", "B12 for energy?", "How long to clear?"
- **Schema opportunities:** `FAQPage`.

### #14 — `/guides/best-natural-sleep-aids-that-work`
- **Current score:** 79 → **Target:** 89
- **Current words:** 89 → **Target words:** 1,800
- **Sections to add:** ranked aids (magnesium glycinate, valerian, melatonin, glycine,
  L-theanine, passionflower, lemon balm), evidence grade per aid, dosing/timing, "what to try
  first," safety/dependency notes.
- **Internal links to add (7):** `/best-supplements-for-sleep`,
  `/guides/best-supplements-for-sleep`, `/articles/best-herbs-for-sleep`,
  `/compare/sleep-herbs-vs-melatonin`, `/herbs/valerian`, `/herbs/passionflower`,
  `/compounds/melatonin`.
- **Affiliate opportunities:** 3–4 — magnesium, valerian, melatonin, L-theanine.
- **FAQ opportunities (5):** "Natural sleep aids that work?", "Strongest natural sleep aid?",
  "Valerian vs melatonin?", "Safe nightly?", "Fastest-acting?"
- **Schema opportunities:** `ItemList` + `FAQPage`.

### #15 — `/guides/best-herbs-for-anxiety`
- **Current score:** 82 → **Target:** 91
- **Current words:** 998 (5 links, **0 FAQ/schema/citations**) → **Target words:** 2,000
- **Sections to add:** per-herb evidence cards (ashwagandha, kava, passionflower, lemon balm,
  chamomile, lavender/silexan), "fast-acting vs daily," dosing table, serotonergic-interaction
  safety, "which to try first."
- **Internal links to add (7):** `/herbs/kava`, `/herbs/passionflower`, `/herbs/ashwagandha`,
  `/articles/natural-anxiety-relief`, `/articles/l-theanine-for-anxiety`,
  `/guides/natural-alternatives-to-anxiety-medication`,
  `/psychoactive/serotonergic-stacking-risks`.
- **Affiliate opportunities:** 3–4 — ashwagandha, kava, passionflower, lemon balm.
- **FAQ opportunities (6):** "Best herb for anxiety?", "Fastest-acting?", "Kava safe?",
  "Ashwagandha for anxiety dose?", "Daily vs as-needed?", "Interactions with SSRIs?"
- **Schema opportunities:** `FAQPage` + citations (currently none).

### #16 — `/guides/adhd-supplements`
- **Current score:** 83 → **Target:** 91
- **Current words:** 795 (already 12 FAQ markers, 10 schema markers — strong base, thin body) →
  **Target words:** 2,000
- **Sections to add:** evidence-graded nutrient cards (omega-3, zinc, iron, magnesium,
  L-theanine, saffron, bacopa), "adjunct vs deficiency," kids vs adults, stack examples, "what
  not to expect."
- **Internal links to add (7):** `/articles/best-supplements-for-adhd`,
  `/articles/omega-3-and-adhd`, `/articles/zinc-and-adhd`, `/articles/iron-ferritin-and-adhd`,
  `/articles/best-magnesium-supplement-for-adhd`, `/articles/adhd-stack-guide`,
  `/best-magnesium-supplements-for-adhd`.
- **Affiliate opportunities:** 4 — omega-3, zinc, magnesium, saffron.
- **FAQ opportunities:** expand the existing set with evidence depth (keep `FAQPage`).
- **Schema opportunities:** add `ItemList` to the existing schema.

### #17 — `/guides/best-nootropics-for-focus`
- **Current score:** 82 → **Target:** 90
- **Current words:** 985 (5 links, **0 FAQ/schema/citations**) → **Target words:** 2,000
- **Sections to add:** per-nootropic cards (L-theanine+caffeine, citicoline, alpha-GPC, bacopa,
  rhodiola, lion's mane, tyrosine), "stimulant vs calm-focus," stacking, tolerance/cycling,
  safety.
- **Internal links to add (7):** `/best-supplements-for-focus`,
  `/articles/citicoline-vs-alpha-gpc`, `/articles/l-theanine-vs-caffeine-for-focus`,
  `/compare/caffeine-vs-l-theanine-vs-bacopa-for-focus`, `/herbs/lions-mane`,
  `/herbs/rhodiola`, `/guides/focus-without-caffeine-crash`.
- **Affiliate opportunities:** 4 — L-theanine, citicoline, lion's mane, bacopa.
- **FAQ opportunities (6):** "Best nootropic for focus?", "Natural vs synthetic?", "Strongest
  legal nootropic?", "L-theanine + caffeine?", "Do they build tolerance?", "Safe long-term?"
- **Schema opportunities:** `FAQPage` + citations.

### #18 — `/guides/best-adaptogens-for-stress`
- **Current score:** 80 → **Target:** 89
- **Current words:** 935 (5 links, **0 FAQ/schema/citations**) → **Target words:** 2,000
- **Sections to add:** per-adaptogen cards (ashwagandha, rhodiola, holy basil, eleuthero,
  cordyceps, schisandra), mechanism primer, "stimulating vs calming adaptogens," dosing/cycling,
  safety/interactions.
- **Internal links to add (7):** `/herbs/ashwagandha`, `/herbs/rhodiola`,
  `/best-supplements-for-stress`, `/compare/rhodiola-vs-ashwagandha`,
  `/guides/how-to-lower-cortisol-naturally`, `/guides/rhodiola-complete-guide`,
  `/articles/natural-anxiety-relief`.
- **Affiliate opportunities:** 4 — ashwagandha, rhodiola, holy basil, cordyceps.
- **FAQ opportunities (6):** "Best adaptogen for stress?", "Ashwagandha vs rhodiola?", "Do
  adaptogens really work?", "Cycle them?", "Stimulating vs calming?", "Safe daily?"
- **Schema opportunities:** `FAQPage` + citations.

---

# Phase 3 — Hubs, Comparisons & Authority (Days 61–90)

### #19 — `/herbs/ashwagandha`
- **Current score:** 81 → **Target:** 90
- **Current words:** ~200 structured data + template scaffolding → **Target words:** 1,800 (body)
- **Sections to add:** expanded mechanism (cortisol/GABAergic), benefit-by-goal (stress, sleep,
  testosterone, anxiety), KSM-66 vs Sensoril, dosing/timing, side effects & contraindications
  (thyroid, pregnancy), "how to choose a product."
- **Internal links to add (8):** `/best-supplements-for-stress`,
  `/guides/best-adaptogens-for-stress`, `/compare/rhodiola-vs-ashwagandha`,
  `/articles/ashwagandha-for-anxiety`, `/articles/ashwagandha-for-sleep`,
  `/articles/ashwagandha-for-adhd`, `/compounds/withanolides`,
  `/guides/how-to-lower-cortisol-naturally`.
- **Affiliate opportunities:** 2–3 — KSM-66, Sensoril, gummies.
- **FAQ opportunities (6):** "What does ashwagandha do?", "KSM-66 vs Sensoril?", "Best time to
  take?", "Side effects?", "How long to work?", "Safe with thyroid meds?"
- **Schema opportunities:** ensure `FAQPage` renders on the template + `BreadcrumbList`.

### #20 — `/herbs/rhodiola`
- **Current score:** 79 → **Target:** 88
- **Current words:** ~170 + template → **Target words:** 1,700 (body)
- **Sections to add:** rosavin/salidroside standardization, fatigue/endurance/mood benefits,
  extract vs powder, dosing/timing (morning), stimulating profile & caveats, contraindications.
- **Internal links to add (8):** `/guides/rhodiola-complete-guide`,
  `/guides/rhodiola-extract-vs-powder`, `/guides/rhodiola-energy`,
  `/compare/rhodiola-vs-ashwagandha`, `/best-supplements-for-focus`,
  `/best-supplements-for-stress`, `/guides/supplements-for-brain-fog-and-fatigue`,
  `/herbs/ashwagandha`.
- **Affiliate opportunities:** 2–3 — standardized 3% rosavin extract products.
- **FAQ opportunities (5):** "What is rhodiola good for?", "Extract vs powder?", "Best dose?",
  "Morning or night?", "Rhodiola vs ashwagandha?"
- **Schema opportunities:** `FAQPage` + `BreadcrumbList`.

### #21 — `/herbs/turmeric`
- **Current score:** 80 → **Target:** 89
- **Current words:** ~183 + template → **Target words:** 1,700 (body)
- **Sections to add:** curcumin bioavailability (piperine/phytosome/liposomal), joint &
  inflammation evidence, dosing, "with or without black pepper," safety (blood thinners,
  gallbladder), product-selection guide.
- **Internal links to add (7):** `/guides/turmeric-curcumin`,
  `/best-supplements-for-joint-support`, `/compare/curcumin-vs-boswellia-vs-omega-3`,
  `/compounds/curcumin`, `/education/inflammation`, `/education/what-is-neuroinflammation`,
  `/best-supplements-for-gut-health`.
- **Affiliate opportunities:** 2–3 — curcumin phytosome (Meriva), curcumin + piperine.
- **FAQ opportunities (5):** "What is turmeric good for?", "Best curcumin form?", "Dose for
  inflammation?", "Need black pepper?", "Side effects?"
- **Schema opportunities:** `FAQPage` + `BreadcrumbList`.

### #22 — `/herbs/lions-mane`
- **Current score:** 80 → **Target:** 89
- **Current words:** ~177 + template → **Target words:** 1,700 (body)
- **Sections to add:** hericenones/erinacines & NGF mechanism, cognition/focus/mood evidence,
  fruiting body vs mycelium, dosing, safety, product-selection (beta-glucan %).
- **Internal links to add (7):** `/best-supplements-for-focus`,
  `/guides/best-nootropics-for-focus`, `/guides/supplements-for-brain-fog-and-fatigue`,
  `/compounds/hericenones`, `/education/how-learning-affects-neuroplasticity`,
  `/best-supplements-for-adhd` (via `/articles/best-supplements-for-adhd`), `/herbs/rhodiola`.
- **Affiliate opportunities:** 2–3 — fruiting-body extract, dual-extract capsules.
- **FAQ opportunities (5):** "What does lion's mane do?", "Fruiting body vs mycelium?", "Best
  dose?", "How long to feel effects?", "Side effects?"
- **Schema opportunities:** `FAQPage` + `BreadcrumbList`.

### #23 — `/compare/rhodiola-vs-ashwagandha`
- **Current score:** 80 → **Target:** 89
- **Current words:** 679 (3 schema markers, 1 FAQ, **0 citations**) → **Target words:** 2,000
- **Sections to add:** head-to-head comparison table (mechanism, best-for, timing, side
  effects), "stimulating vs calming," "can you stack them," dosing for each, decision tree.
- **Internal links to add (6):** `/herbs/rhodiola`, `/herbs/ashwagandha`,
  `/guides/best-adaptogens-for-stress`, `/best-supplements-for-stress`,
  `/best-supplements-for-focus`, `/guides/rhodiola-complete-guide`.
- **Affiliate opportunities:** maintain 2–3, split by use-case (rhodiola for energy/focus,
  ashwagandha for stress/sleep).
- **FAQ opportunities (5):** "Rhodiola or ashwagandha?", "Can I take both?", "Which for
  anxiety?", "Which for energy?", "Which for sleep?"
- **Schema opportunities:** add citations + expand `FAQPage`; keep comparison schema.

### #24 — `/guides/magnesium-vs-melatonin`
- **Current score:** 79 → **Target:** 88
- **Current words:** 457 (3 links, **0 FAQ/schema/citations**) → **Target words:** 1,800
- **Sections to add:** mechanism comparison (GABA/NMDA vs circadian), "which for which sleep
  problem," can-you-combine section, dosing/timing, safety/dependency, decision guide.
- **Internal links to add (6):** `/compare/sleep-herbs-vs-melatonin`,
  `/best-supplements-for-sleep`, `/guides/best-supplements-for-sleep`,
  `/articles/magnesium-types-for-sleep`, `/compounds/melatonin`, `/compounds/magnesium`.
- **Affiliate opportunities:** 2–3 — magnesium glycinate, low-dose melatonin, combo product.
- **FAQ opportunities (5):** "Magnesium or melatonin for sleep?", "Can I take both?", "Which is
  safer?", "Best dose of each?", "Which for staying asleep?"
- **Schema opportunities:** `FAQPage` + comparison schema.

### #25 — `/best-supplements-for-blood-pressure`
- **Current score:** 83 → **Target:** 91
- **Current words:** ~580 → **Target words:** 2,100
- **Sections to add:** evidence-graded options (magnesium, potassium, CoQ10, omega-3, garlic,
  hibiscus, beetroot/nitrate), "lifestyle first," "talk to your doctor / med interactions,"
  dosing, monitoring guidance.
- **Internal links to add (6):** `/compounds/magnesium`, `/compounds/coenzyme-q10`,
  `/best-supplements-for-fat-loss`, `/best-supplements-for-gut-health`,
  `/herbs/garlic`, `/herbs/hibiscus`.
- **Affiliate opportunities:** 4 — CoQ10, magnesium, omega-3, garlic/beetroot.
- **FAQ opportunities (6):** "Best supplement for blood pressure?", "Does magnesium lower BP?",
  "CoQ10 for BP?", "Garlic for blood pressure?", "Safe with BP meds?", "How fast?"
- **Schema opportunities:** `ItemList` + `FAQPage`.
- ⚠️ **YMYL caution:** highest medical-scrutiny page here — conservative, citation-backed
  claims; explicit "supplements are not a substitute for prescribed treatment" + `/disclaimer`.

---

## Maintenance Tier (high-score, low-headroom — optimize, don't rebuild)

These already-elite pages are **not** Top-25 expansion targets. Recommended light-touch work:
refresh citations, tighten internal-link equity toward the money pages above, confirm schema.

| Page | Words | Score | Action |
|------|------:|:-----:|--------|
| `/articles/sleep-stack-guide` | 4,616 | 86 | Add links to #1, #7, #14; refresh citations |
| `/articles/natural-anxiety-relief` | 4,422 | 86 | Link to #11, #15; refresh |
| `/articles/magnesium-types-for-sleep` | 3,927 | 83 | Link to #1, #24 |
| `/articles/l-theanine-for-sleep` | 3,903 | 83 | Link to #1, #14 |
| `/articles/best-herbs-for-sleep` | 3,738 | 84 | Link to #1, #14 |
| `/articles/ashwagandha-vs-magnesium-for-sleep` | 3,412 | 83 | Link to #1, #19 |
| `/compare/sleep-herbs-vs-melatonin` | 2,879 | 82 | Link to #1, #24 |
| `/compare/l-theanine-vs-magnesium` | 2,156 | 80 | Link to #4, #12 |
| `/compare/magnesium-glycinate-vs-magnesium-oxide` | 2,007 | 81 | Link to #5, #6 |

---

## Cross-Cutting Execution Notes

1. **Build the pattern once (Phase 1).** A shared `ItemList`+`FAQPage` schema block, an
   affiliate-card convention (`AFFILIATE_TAGS.amazon` only — never hardcode), and a citation
   style established on #1–#9 are reused across all later phases.
2. **Internal-link flow is the multiplier.** Every guide/herb/compare page should funnel to a
   money page (#1–#9). The link lists above are directional, not exhaustive.
3. **YMYL discipline.** Fat-loss (#9), blood-pressure (#25), and anxiety-medication (#11) pages
   are health-sensitive — keep claims conservative, citation-backed, and route to `/disclaimer`.
4. **Duplicate-intent watch.** #5 vs #6 (magnesium-for-ADHD) overlap; differentiate angle and
   cross-link rather than merge. No redirects or route changes are in scope for this roadmap.
5. **Measure after each phase.** Re-run the scoreboard signal pass (word count, links, citations,
   FAQ/schema) to confirm target states before moving to the next phase.

> **Reminder:** this document is the *plan*. Content creation, rewriting, and redesign are
> explicitly out of scope per Mission 005 rules.
