# Canonical Page Operating System (CPOS)

The operating system for every indexable page on The Hippie Scientist. It is the
"Human Interface Guidelines" for pages: from here on, **no page should exist
without belonging to a defined page product below.**

Companion docs:
- [`editorial-operating-system-handoff.md`](./editorial-operating-system-handoff.md)
  — **start here to operate the system**: how to add a profile, upgrade a hub or
  article, add a comparison, what to run before merging, and what never to do.
- [`editorial-components.md`](./editorial-components.md) — the reusable article/MDX
  components (`ScientificVerdictCard`, `DecisionMatrix`, …) referenced throughout.
- [`evidence-and-claim-discipline.md`](./evidence-and-claim-discipline.md) — how to
  phrase evidence, safety, and recommendations.
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

## Profile Template Specification (herb & compound engine)

Herb (`/herbs/{slug}/`) and compound (`/compounds/{slug}/`) profiles are
**engine-rendered**: ~850 pages share two templates. The rule for this type is
*improve the machine, not the output* — a change to the shared template or its
data layer improves every profile at once. Do not hand-polish individual
profiles.

### The three layers (clean boundaries)

| Layer | Owns | Files |
|---|---|---|
| **Workbook / runtime data** | structured facts: evidence tier, safety flags, dosing, effects, interactions | `data-sources/*.xlsx` → `public/data/**` (generated; never hand-edit) |
| **Editorial verdict overlay** | curated *judgement*: recommendation, confidence, best/not-ideal framing, safety/evidence notes, better alternative, comparison routing, bottom line | `config/profile-verdicts.ts` (opt-in, keyed by slug) |
| **Rendering** | how the decision surface looks and derives intent-nav from data | `lib/profile-decision.ts` + `components/editorial/ProfileDecisionPanel.tsx`, mounted in both `[slug]/page.tsx` templates |

This preserves the workbook source-of-truth philosophy: the overlay **never
overrides facts** — it only adds the editorial layer that data alone can't
express. `lib/profile-decision.ts` surfaces only reliably-clean data and derives
intent-based "continue reading" routes; it never invents facts (runtime fields
like `primary_effects` are noisy — e.g. a compound may list "GABA" — so the
derived surface stays conservative).

### What a profile communicates (before deep science)

Hero (name, summary, evidence badge, **visible safety summary**, key uses) →
**ProfileDecisionPanel**: a full Scientific Verdict when the slug is curated,
plus intent-based *Continue reading* routing for every profile → then the
existing deep sections (quick stats, evidence, mechanisms, interactions, safety
detail, compare). Progressive disclosure: practical/decision on top, science below.

### How to upgrade a profile

- **To add a full verdict:** add one entry to `config/profile-verdicts.ts`
  (`recommendation`, optional `confidence`, `bestFor`, `notIdealFor`, `onset`,
  `evaluationWindow`, optional `safetyNote` / `evidenceNote`, optional
  `evidenceConfidence`, `bottomLine`, optional `betterAlternative`, optional
  `comparisons`). No template edits. The panel renders it. `comparisons[]`
  renders a **"Compare before choosing"** block — only list routes that exist;
  each `when` names the reader it's for.
- **To explain the evidence grade** (highest-value profiles): add an
  `evidenceConfidence` object (`grade`, `whyNotHigher[]`, `whyNotLower?[]`,
  `practicalTakeaway`). The panel renders the shared `EvidenceConfidence`
  explainer. Never fabricate the reasons — see
  [`evidence-and-claim-discipline.md`](./evidence-and-claim-discipline.md).
- **To place the profile in the decision graph:** add `primaryGuide`
  (`{ label, href }`) — the single safest "start here" guide for the profile's
  primary goal. The panel renders it as a prominent **"Start here"** step, giving
  the flow *problem → hub → start-here guide → verdict → compare → alternative →
  continue*. Route it to a real guide in the profile's primary cluster.
- **Key by the record slug the live page uses, not the common name.** A few
  botanicals (kava, passionflower) are indexed under a herb page with a
  *botanical* record slug (`piper-methysticum`, `passiflora-incarnata`) while the
  common-name compound page is a noindex canonical redirect. Key the overlay by
  the botanical slug; alias the common slug at the bottom of the file.
- **To improve every profile at once:** edit `ProfileDecisionPanel` /
  `buildProfileDecision`.
- **To fix a fact:** edit the workbook and run `npm run data:build` — never edit
  `public/data` JSON by hand.
- **Guardrails** (all run in `check:fast`): `validate:profile-verdicts` fails if
  any keyed profile or linked route — `betterAlternative`, `comparisons`, **and
  `primaryGuide`** (every `href:` in the overlay is checked) — does not resolve.
  `validate:claim-discipline` fails on banned overclaim phrasing.
  `validate:safety-visibility` fails if a high-risk profile (kava, ashwagandha,
  melatonin, magnesium, magnesium-glycinate, caffeine, rhodiola) is missing a
  required caution.

### Discovery layer & the decision graph

The curated overlay is not just per-page judgement — together the 18 entries
form a **decision graph** across the money clusters. Each profile declares its
place in the reader's journey:

| Overlay field | Graph role |
|---|---|
| `primaryGuide` | the safe **entry point** — problem → hub → *this guide* |
| `bestFor` / `notIdealFor` | **fit** — is this the reader's problem, and when is it not? |
| `evidenceConfidence` | **trust** — how far the evidence actually goes |
| `comparisons[]` | **branch** — the decision to make before committing |
| `betterAlternative` | **redirect** — a clearly better fit for a nearby need |
| continue-reading (derived) | **exit** — the goal hub + browse index |

**Discovery-first hubs** (`/guides/{sleep,anxiety,focus}/`) are the top of the
graph: a `DecisionRouter` "Start here" (problem → guide), `GuideCardGrid` best-first
and comparison sections, and a secondary full library. A hub that is still a flat
directory should be upgraded to this shape (reference: the sleep and focus hubs).
The graph rule for adding links: **route, compare, or stop** — send the reader to
the one best next step, surface a comparison only when it helps them *choose*, and
otherwise stop rather than dumping generic "related" links.

### Migration strategy & extensibility

Curate verdict overlays for the highest-traffic profiles first (sleep/anxiety/
focus cluster); the long tail keeps the derived surface until curated. Future
extensions (e.g. deriving `bestFor` from cleaned workbook fields, or a
`ComparisonVerdict` auto-surfaced from `comparisonBySlug`) slot into
`buildProfileDecision` without touching the templates.

### Reference impl
`config/profile-verdicts.ts` — 18 curated money-cluster profiles across
sleep / stress / anxiety / focus (ashwagandha, rhodiola, saffron, l-theanine,
kava, lavender, lemon-balm, passionflower, chamomile, magnesium,
magnesium-glycinate, melatonin, glycine, valerian, caffeine, bacopa, l-tyrosine,
creatine) — plus `lib/profile-decision.ts`,
`components/editorial/ProfileDecisionPanel.tsx`, mounted in
`app/herbs/[slug]/page.tsx` and `app/compounds/[slug]/page.tsx`. Guarded by
`scripts/ci/validate-profile-verdicts.mjs`.

---

## Acceptance checklist for any new/edited page

1. It maps to exactly one page product above.
2. It answers that product's "must answer" questions and defers the rest via links.
3. It uses the blueprint's required components.
4. Every internal link resolves to a real route.
5. `typecheck`, `lint`, `build`, and (for articles) `validate:article-quality` pass.
6. Mobile-first, light+dark, no color-only meaning, semantic headings.
