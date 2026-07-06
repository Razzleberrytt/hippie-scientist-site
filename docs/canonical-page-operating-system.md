# Canonical Page Operating System (CPOS)

The operating system for every indexable page on The Hippie Scientist. It is the
"Human Interface Guidelines" for pages: from here on, **no page should exist
without belonging to a defined page product below.**

Companion docs:
- [`editorial-components.md`](./editorial-components.md) — the reusable article/MDX
  components (`ScientificVerdictCard`, `DecisionMatrix`, …) referenced throughout.
- Hub primitives live in `components/guides/`; editorial components in
  `components/editorial/` (all registered in `mdx-components.tsx`).

---

## Fundamental principle

**Every page is a product, not a document.** Each product solves *one* primary
reader problem, and its structure reflects that problem. The test every page
must pass: within 30–60 seconds the reader knows what this is, whether it applies
to them, whether it's worth considering, who should avoid it, how strong the
evidence is, and where to go next.

---

## Page product inventory

| Page product | Route(s) | Primary job |
|---|---|---|
| **Homepage** | `/` | Route a first-time visitor to the right goal or tool. |
| **Goal hub** | `/guides/{sleep,anxiety,focus}/`, `/guides/adhd/` | Identify the reader's problem and route them to the right guide. |
| **Guide / article (MDX)** | `/articles/{slug}/` | Help the reader decide whether a specific intervention fits their situation. |
| **Guide page (curated)** | `/guides/{cluster}/{slug}/` | Answer one high-intent question ("best supplements for sleep"). |
| **Comparison page** | `/guides/**/{a}-vs-{b}/`, `/compare/{slug}/` | Help the reader **choose** between two options. |
| **Herb page** | `/herbs/{slug}/` | Authoritative profile of one herb (workbook-driven). |
| **Compound page** | `/compounds/{slug}/` | Authoritative profile of one compound (workbook-driven). |
| **Stack page** | `/articles/*-stack*`, `/stacks/{slug}/` | Help the reader combine supplements safely. |
| **Educational page** | `/learn/{slug}/` | Explain a concept (evidence levels, a neurotransmitter) so a decision elsewhere makes sense. |
| **Category index** | `/herbs/`, `/compounds/`, `/articles/`, `/guides/` | Let the reader browse/filter an ecosystem. |
| **Discovery / search** | `/search/` | Find a specific page fast. |

---

## Blueprints

Each blueprint is implementation-oriented. "Required components" reference the
Pass 1–2 primitives.

### 1. Goal hub (`/guides/{goal}/`)

- **Purpose:** identify the reader's specific problem and route to the right guide.
- **Primary intent:** "I have *this* problem — where do I go?" **Secondary:** browse the ecosystem.
- **Must answer:** What kind of problem do you have? What's the first-line option for it? Where's the full plan? Which comparison decides it?
- **Must NOT answer:** deep mechanism, exhaustive monographs, dosing tables. (Those belong to articles.)
- **Required:** `HubSectionHeading`, `DecisionRouter` (the "what's your problem?" section), `GuideCardGrid` (best-first + comparisons), an editorial note, a secondary full-library list.
- **Hierarchy:** Hero → **Start here / DecisionRouter** → Best first reads → Comparisons → Editorial note → Full library.
- **Linking responsibility:** every DecisionRouter route points to a real, existing page; the hub is the *distributor* of link equity to its cluster.
- **Entry:** homepage, nav, search, organic ("supplements for sleep"). **Exit:** a specific guide/article/comparison.
- **SEO role:** cluster pillar; captures broad head terms, funnels to depth.
- **Anti-patterns:** a flat card directory ("file cabinet"); listing 15 undifferentiated cards; routes to 404s.
- **Acceptance:** a reader can self-identify in the DecisionRouter and reach the right page in one click; no broken routes; mobile-first; light+dark.
- **Reference impl:** `app/guides/sleep/page.tsx`, `app/guides/anxiety/page.tsx`.

### 2. Article / MDX guide (`/articles/{slug}/`)

- **Purpose:** help the reader decide whether *this* intervention fits *their* situation.
- **Primary intent:** "Should I use X, and how?" **Secondary:** understand the evidence and mechanism.
- **Must answer:** Should I consider it? Who is it for / who should skip it? How fast? How to use it? Risks? What does the evidence actually show (and how strong)? What's better if it's not for me? Where next?
- **Must NOT:** act as a directory/hub; re-explain another supplement's full biology (link out).
- **Required:** trust strip + anchored references (template-provided), `ScientificVerdictCard` (opens the page), `DecisionMatrix`, `RealityCheck`, `EvidenceConfidence`, `BetterAlternatives`, `WhereNext`. **Optional:** `CommonMistakes`, `CollapsibleDetails` (deep mechanism), `EditorialNote`.
- **Canonical flow (justified):**
  1. **Brief intro** (1 line, names the entity) — orients + satisfies entity-integrity.
  2. **ScientificVerdictCard** — the decision, up front.
  3. **At a Glance** — scannable facts.
  4. **DecisionMatrix ("Should you use it?")** — fit-by-situation.
  5. **RealityCheck** — kill hype before it forms.
  6. **Practical** (dosing/timing, `CommonMistakes`).
  7. **EvidenceConfidence** → deep evidence → **mechanism** (collapsible) — progressive disclosure: the practical answer is never buried under biology.
  8. **Safety** — visible, before deep science.
  9. **BetterAlternatives** — trust.
  10. **WhereNext** — journey, replacing generic "Related Articles".
  11. **FAQ**.
- **Linking responsibility:** inline-cite numeric claims to `#ref-{pmid}`; route out via BetterAlternatives/WhereNext.
- **SEO role:** depth/authority; targets "{supplement} benefits/dosage/evidence".
- **Anti-patterns:** opening with a dictionary definition; mechanism above the practical answer; a bare "Related Articles" dump.
- **Acceptance:** verdict renders first; `validate:article-quality` passes; safety visible; no unsupported medical claims.
- **Reference impl:** `content/articles/{l-theanine,ashwagandha,magnesium-glycinate}.md`.

### 3. Comparison page (`/guides/**/{a}-vs-{b}/`)

- **Purpose:** help the reader **choose**. This is the whole job.
- **Primary intent:** "A or B — which is right for me?"
- **Must answer:** Choose A if…, choose B if…, use both if…, when neither is enough, and who wins each dimension (fastest, best evidence, best safety, best for the specific goal).
- **Must NOT:** re-teach the full biology of both compounds (link to each profile/article).
- **Required:** `ComparisonVerdict` at the very top; a concise side-by-side table; short mechanism contrast; a bottom line with links to each option's profile.
- **Hierarchy:** Breadcrumb → **ComparisonVerdict (the call)** → quick comparison table → how they differ (brief) → decision framework → bottom line + profile links.
- **Linking responsibility:** links to both option profiles/articles and back to the parent goal hub.
- **SEO role:** decision-stage intent ("magnesium vs melatonin") — high commercial value; make the call clearly.
- **Anti-patterns:** "both may help" with no recommendation; two mini-monographs; no explicit winner rows.
- **Acceptance:** the choice is stated above the fold; every situation maps to a clear lean.
- **Reference impl:** `app/guides/sleep/magnesium-vs-melatonin/page.tsx`.

### 4. Herb / Compound page (`/herbs/{slug}/`, `/compounds/{slug}/`)

- **Purpose:** the authoritative, workbook-driven profile of one entity.
- **Must answer:** what it is, evidence grade, primary effects, safety/interactions, and "is this for me?"
- **Must NOT:** invent facts — structured data is owned by the workbook (`data-sources/…xlsx` → `public/data`). Do not hand-edit generated JSON; change the workbook and rebuild (`npm run data:build`).
- **Required (where the type supports it):** a verdict/decision surface, evidence grade with plain-English context, visible safety, links to the relevant goal hub and any comparison.
- **SEO role:** entity authority ("{herb} benefits/safety"). **Anti-pattern:** a PubMed dump with no decision layer.
- **Note:** these are the biggest future-migration surface; treat CPOS adoption here as Pass 4+.

### 5. Stack page (`/articles/*-stack*`, `/stacks/{slug}/`)

- **Purpose:** help the reader combine supplements safely into one routine.
- **Must answer:** what goes together, timing/dosing, why it works, and interaction cautions.
- **Must NOT:** re-derive each ingredient's full evidence (link to each).
- **Required:** a verdict/summary, a timing table, a safety/interaction callout, links to each component article.

### 6. Educational page (`/learn/{slug}/`)

- **Purpose:** explain a concept so a decision *elsewhere* makes sense (e.g. "what evidence grades mean").
- **Must NOT:** recommend products. **SEO role:** informational, internal-link support for decision pages.

### 7. Category index & search

- **Purpose:** browse/filter (`/herbs`, `/compounds`) or find (`/search`).
- **Must NOT:** carry editorial decision content — they are navigation surfaces. Keep filters labeled and accessible (see the `/herbs` evidence-filter fix).

---

## Content ownership rules (avoid duplication)

Information lives in exactly one place; everything else links to it.

| Information | Owner | Everyone else |
|---|---|---|
| Mechanism / biochemistry | **Article** (or herb/compound profile) | link to it |
| "Is this for me?" decision for one supplement | **Article** (`ScientificVerdictCard` + `DecisionMatrix`) | link |
| Problem identification & routing | **Goal hub** (`DecisionRouter`) | link |
| A-vs-B choice logic | **Comparison page** (`ComparisonVerdict`) | link |
| Combining/stacking logic | **Stack page** | link |
| Structured facts (dose ranges, evidence grade, safety flags) | **Workbook → `public/data`** | render, never re-key |
| Concept explainers (evidence levels, neurotransmitters) | **Educational page** | link |

If two page types currently explain the same thing, the non-owner should be
trimmed to a one-line summary + a link to the owner.

---

## Page relationship map (intended movement)

```
Homepage
   ↓ (pick a goal)
Goal hub  ──────────────►  Comparison page
   ↓ (pick a supplement)        │ (pick the winner)
Article  ◄─────────────────────┘
   ↓ (not for me / what next)
BetterAlternatives → another Article
WhereNext → Comparison / Stack / back to Goal hub
```

Navigation should feel intentional: hubs distribute, comparisons decide,
articles convince, stacks combine. Every decision surface offers a labeled next
step (never a dead end).

---

## Editorial hierarchy (single responsibility)

- Only **hubs** identify the reader's problem and organize an ecosystem.
- Only **comparison pages** decide between named alternatives.
- Only **articles / profiles** explain mechanism and make the per-supplement call.
- Only **stack pages** own combination logic.
- Only the **workbook** owns structured facts.
- Only **educational pages** own concept explainers.

When adding a page, name its product, confirm it isn't duplicating an owner's
job, and give it the required components for that blueprint.

---

## Acceptance checklist for any new/edited page

1. It maps to exactly one page product above.
2. It answers that product's "must answer" questions and defers the rest via links.
3. It uses the blueprint's required components.
4. Every internal link resolves to a real route.
5. `typecheck`, `lint`, `build`, and (for articles) `validate:article-quality` pass.
6. Mobile-first, light+dark, no color-only meaning, semantic headings.
