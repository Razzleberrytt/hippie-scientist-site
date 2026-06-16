# Expansion Blueprint

> **Mission 008 — Expansion Executor**
> Purpose: a **reusable expansion blueprint** that defines the canonical section order, the
> done-criteria, and the real components/schema each section uses — so **any** Magnificent 10
> page (and any future page) can be expanded the same way without re-inventing the structure.
>
> **Scope rules (enforced):** This is a **blueprint and specification artifact only**. It does
> **not** create page content, redesign anything, create pages, or build new systems/workflows.
> It standardizes the *shape* of an expanded page and points at components that already exist in
> the repo.
>
> Companions:
> [`magnificent-10.md`](./magnificent-10.md) (what to expand) ·
> [`expansion-order.md`](./expansion-order.md) (in what order) ·
> [`content-expansion-playbook.md`](./content-expansion-playbook.md) (the assembly line) ·
> per-page specs in [`page-expansion-specs/`](./page-expansion-specs/).
>
> Generated: 2026-06-16 · Branch: `claude/magnificent-10-expansion-blueprint-l0rf8t`

---

## How to use this blueprint

1. Open the page's spec in [`page-expansion-specs/`](./page-expansion-specs/) — it tells you the
   current state, the missing sections, the target word count, and the suggested
   citations/links/affiliate placements **for that page**.
2. Open this blueprint — it tells you the **section order** and **what "done" means** for each
   section, identically for every page.
3. Build the page in the app using the existing components named below. **Do not design anything
   new** — every building block already exists (see the
   [components table](./content-expansion-playbook.md#3-build--expand-the-page-in-the-app)).
4. Not every section applies to every archetype. Use the **applicability** note on each section;
   skip sections that don't fit and record the skip in the page's checklist.

The 15 sections below are the full menu. A typical page renders them top-to-bottom in this order;
herb/compound hubs lean on §4–§7, money/guide pages lean on §3, §5, §8.

---

## The 15 sections

### 1. Search intent

- **Purpose:** State, in one or two lines, the dominant query intent the page must satisfy
  (commercial-investigational, informational→commercial, decision/comparison, etc.) and the head
  term + cluster it owns. Everything else on the page serves this intent.
- **What to capture:** Primary keyword cluster · searcher's job-to-be-done · whether they are
  comparing, buying, or learning · the single question the page must answer above the fold.
- **Applies to:** every page.
- **Done when:** the intent is named in the spec and the H1 + intro answer it in the first 100
  words.

### 2. Who this page is for

- **Purpose:** Name the reader segment(s) so tone, examples, and selection guidance are
  calibrated (e.g. adults vs. kids, beginners vs. experienced, deficiency-driven vs. adjunct
  users).
- **What to capture:** audience segments · their constraints (budget, medication context,
  sensitivity) · what would make the page *not* for them (route those readers elsewhere via §11).
- **Applies to:** every page; especially YMYL pages (ADHD, anxiety, blood pressure, fat loss).
- **Done when:** at least one explicit "this is for / this is not for" framing exists, and YMYL
  readers are routed to `/disclaimer` where relevant.

### 3. Evidence summary

- **Purpose:** Up-front, scannable verdict on how strong the evidence is for each option — the
  page's authority spine.
- **What to capture:** per-option evidence tier (high / moderate / low / preliminary) ·
  deficiency-context caveats · what the trials actually measured.
- **Components:** `EvidenceSummaryBox`, `EvidenceMeter`, `EvidenceLegend` (`components/`).
- **Applies to:** every commercial, guide, and hub page.
- **Done when:** every ranked/listed item carries an evidence tier, and tiers are backed by §10
  references.

### 4. How it works

- **Purpose:** The mechanism primer — why the option plausibly does anything (receptor/pathway,
  cortisol axis, NGF, bioavailability, etc.).
- **What to capture:** plain-language mechanism · the active constituent/compound · the
  physiological target.
- **Components:** `MechanismBox` (`components/`); link constituents to `/compounds/[slug]`.
- **Applies to:** herb/compound hubs (primary), money/guide pages (brief primer).
- **Done when:** mechanism is stated without overclaiming and links to the relevant compound
  depth page.

### 5. Best options

- **Purpose:** The ranked/curated list the searcher came for ("best X for Y") — the conversion
  core of a money page.
- **What to capture:** ranked items with a one-line "why it's here" · the selection criteria
  ("how we ranked these") · per-item form/standardization notes.
- **Components:** affiliate cards via `RecommendedProduct` / `AffiliateProductCard`; `ItemList`
  schema via `buildClusterItemListNode` (`lib/schema.ts`).
- **Applies to:** money pages and guides (primary); hubs use a lighter "how to choose a product"
  variant.
- **Done when:** the list is ranked with transparent criteria and each item ties to an evidence
  tier (§3) and a §12 placement.

### 6. Dosing

- **Purpose:** Actionable dose, form, and timing guidance.
- **What to capture:** typical dose range · form/standardization (e.g. KSM-66, glycinate,
  fruiting-body) · timing · titration/tolerance notes.
- **Components:** `DosageBox` (`components/`); a dosing table where multiple options are compared.
- **Applies to:** every page that recommends an intake.
- **Done when:** doses are sourced (§10), ranges (not single numbers) are given, and YMYL dosing
  carries a clinician caveat.

### 7. Safety

- **Purpose:** Contraindications, interactions, and side effects — non-negotiable on YMYL pages.
- **What to capture:** common side effects · drug/condition interactions (SSRIs, blood thinners,
  thyroid, pregnancy) · "who should avoid" · when to see a clinician.
- **Components:** `SafetyBox` (`components/`); route to `/disclaimer` and relevant
  `/psychoactive/*` interaction pages.
- **Applies to:** every page; mandatory and expanded on YMYL pages.
- **Done when:** interactions are explicit, never advises discontinuing prescribed medication, and
  links to `/disclaimer`.

### 8. Comparisons

- **Purpose:** Resolve the "X vs Y" decision the searcher is weighing without sending them away
  prematurely.
- **What to capture:** head-to-head of the top alternatives (form vs form, herb vs herb,
  supplement vs medication framing) · a "which to try first" decision aid.
- **Components:** `ComparisonTable` / `compare-table-client` (`components/`);
  `buildFAQPageFromComparisonRows` (`lib/schema.ts`); link to dedicated `/compare/*` pages.
- **Applies to:** money pages, guides, hubs; the spine of `/compare/*` pages.
- **Done when:** the comparison is a real table and funnels to the deeper `/compare/*` page rather
  than duplicating it.

### 9. FAQs

- **Purpose:** Capture long-tail question intent and earn `FAQPage` rich results.
- **What to capture:** 5–12 real questions (dose, timing, safety, "vs", "how long until it
  works") drawn from the spec's FAQ list.
- **Components:** `FAQAccordion`, `FaqJsonLd` (`components/`, `components/seo/`).
- **Applies to:** every page.
- **Done when:** questions render in an accordion and emit valid `FAQPage` JSON-LD.

### 10. References

- **Purpose:** The citation backbone behind every evidence and dosing claim — the E-E-A-T floor.
- **What to capture:** PubMed/DOI/NIH-linked sources for each graded claim; meta-analyses
  preferred over single trials.
- **Markers:** `pubmed | doi | ncbi | nih.gov | et al | pmid` (the signal the scoreboard counts).
- **Applies to:** every page; density scales with YMYL risk.
- **Done when:** every evidence tier (§3) and dose (§6) has at least one citation; no uncited
  efficacy claims remain.

### 11. Internal links

- **Purpose:** Distribute link equity and route the funnel — the portfolio multiplier.
- **What to capture:** links following the dependency direction in
  [`expansion-order.md`](./expansion-order.md): money pages link *down* into hubs; hubs/guides
  funnel *up* into money pages. Use the spec's suggested list as the floor.
- **Components:** `SeeAlsoCluster`, `SeeAlsoInCluster`, `Breadcrumbs` + `BreadcrumbSchema`.
- **Applies to:** every page.
- **Done when:** the page links to its money-page anchor and at least the spec's suggested links,
  with breadcrumbs present.

### 12. Affiliate opportunities

- **Purpose:** Monetize without degrading trust.
- **What to capture:** the specific placements from the spec (forms/brands) · disclosure before
  the first link · consolidation over over-linking.
- **Components:** `RecommendedProduct` / `AffiliateProductCard`; `AffiliateDisclosure`
  (`components/AffiliateDisclosure.tsx`); **always** `AFFILIATE_TAGS.amazon` (`config/affiliate.ts`).
- **Hygiene:** never hardcode an affiliate string; disclosure precedes the first affiliate link.
- **Applies to:** money pages and hubs (primary); guides (secondary).
- **Done when:** every link uses `AFFILIATE_TAGS.amazon`, disclosure renders first, and placements
  map to ranked items in §5.

### 13. Schema opportunities

- **Purpose:** Make the page machine-readable for rich results and entity graph.
- **What to capture:** the JSON-LD types the page earns — typically `BreadcrumbList`, `FAQPage`,
  `ItemList` (ranked pages), `Article` (article routes), plus `buildWorkbookEntitySchema` for
  herb/compound hubs.
- **Builders:** `buildClusterItemListNode`, `buildFAQPageFromComparisonRows`,
  `buildWorkbookEntitySchema` (`lib/schema.ts`); `GuideData` (`lib/schemas/guide-schemas.ts`).
- **Static-export note:** all schema must be emitted at build time — no `force-dynamic`,
  `cookies()`, or `headers()` (see `CLAUDE.md`).
- **Applies to:** every page.
- **Done when:** the page emits at least `BreadcrumbList` + `FAQPage`, plus `ItemList`/`Article`
  where applicable, and validates.

### 14. EEAT opportunities

- **Purpose:** Signal Experience, Expertise, Authoritativeness, and Trust — the durable moat the
  Mission 007 re-weighting rewards.
- **What to capture:** author/reviewer attribution (`/author`) · "last reviewed" date ·
  methodology transparency ("how we ranked / how we score evidence") · conservative YMYL framing ·
  citation density (§10) · disclosure (§12) · linking to first-hand testing or original data
  where it exists.
- **Applies to:** every page; weighted heaviest on authority hubs and YMYL money pages.
- **Done when:** the page shows author + review date, states its methodology, and meets the §10
  citation floor.

### 15. Completion checklist

- **Purpose:** The single definition-of-done gate. A page is expanded only when every applicable
  box passes. Copy this into the page's tracking issue/PR.

```
- [ ] 1. Search intent — H1 + intro answer the named intent
- [ ] 2. Who this page is for — audience + "not for" framing (YMYL → /disclaimer)
- [ ] 3. Evidence summary — every option carries an evidence tier
- [ ] 4. How it works — mechanism stated, linked to compound depth
- [ ] 5. Best options — ranked list with transparent criteria
- [ ] 6. Dosing — sourced ranges, form/timing, clinician caveat where YMYL
- [ ] 7. Safety — interactions explicit, links to /disclaimer
- [ ] 8. Comparisons — real table, funnels to /compare/*
- [ ] 9. FAQs — accordion + valid FAQPage JSON-LD
- [ ] 10. References — every tier/dose cited
- [ ] 11. Internal links — money-page anchor + spec floor, breadcrumbs present
- [ ] 12. Affiliate opportunities — AFFILIATE_TAGS.amazon only, disclosure first
- [ ] 13. Schema opportunities — BreadcrumbList + FAQPage (+ ItemList/Article)
- [ ] 14. EEAT opportunities — author + review date + methodology + citation floor
- [ ] Target word count reached (see page spec)
- [ ] Quality gate: npm run lint && npm run typecheck && npm run check
```

---

## Archetype → section emphasis

Not every page weights the 15 sections equally. Use this to know where to spend effort.

| Archetype | Heaviest sections | Lighter / optional |
|-----------|-------------------|--------------------|
| Money / commercial landing (`/best-supplements-for-*`, `/articles/best-*`) | §1, §3, §5, §6, §12, §13 | §4 (brief primer) |
| Guide (`/guides/*`) | §1, §2, §3, §5, §8, §9 | §12 (secondary) |
| Herb / compound authority hub (`/herbs/*`, `/compounds/*`) | §3, §4, §6, §7, §10, §14 | §8 (link out, don't duplicate) |
| Comparison (`/compare/*`) | §1, §8, §3, §9 | §5 (light) |

---

## Guardrails (carried from Missions 006–007)

1. **No new pages, no redesign, no new systems.** This blueprint specifies how to expand
   existing routes with existing components only.
2. **Build the pattern once.** Schema block, affiliate convention, and citation style established
   on the first money page are reused on every later page.
3. **Internal-link flow is the multiplier.** Every guide/herb/compare page funnels to a money
   page; money pages link down into hubs.
4. **YMYL discipline.** Conservative, citation-backed claims; route to `/disclaimer`; never
   advise discontinuing prescribed medication.
5. **Affiliate hygiene.** `AFFILIATE_TAGS.amazon` only; disclosure before the first link;
   consolidate rather than over-link.
6. **Static-export safe.** All data and schema available at build time (see `CLAUDE.md`).

> **Reminder:** this blueprint *prepares the shape* of expansion work. Content creation,
> rewriting, redesign, new pages, and new systems are explicitly out of scope per Mission 008
> rules.
