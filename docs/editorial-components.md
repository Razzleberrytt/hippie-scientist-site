# Editorial Components

Reusable building blocks for The Hippie Scientist's **decision-first** editorial
system. Prefer these over one-off markup so every guide hub and article page
stays visually consistent and behaves like a field guide (help the reader decide
what to do next), not an encyclopedia.

All components use the existing design language (brand emerald, `text-ink` /
`text-muted` tokens, rounded cards) and are theme-aware (light + dark). They are
server components — safe for static export, no client JS.

> To **operate** the system (add a profile, upgrade a hub/article, add a
> comparison, what to run before merging), see
> [`editorial-operating-system-handoff.md`](./editorial-operating-system-handoff.md).

---

## Article-body components (MDX)

These are registered in [`mdx-components.tsx`](../mdx-components.tsx), so any
`.md`/`.mdx` article can use them inline with **no import**.

> **Location:** the editorial component system lives in `components/editorial/`.
> The guide-hub primitives live in `components/guides/`. All are registered in
> [`mdx-components.tsx`](../mdx-components.tsx) where they're usable in articles.

### `<ScientificVerdictCard>` — the signature decision module

`components/editorial/ScientificVerdictCard.tsx` (also exported/registered as
`ScientificVerdict` for backward compatibility)

The recognizable module every major article/herb/compound/comparison page should
**open** with. It answers, before any biochemistry: would we recommend this, for
whom, for what use, how confident are we, how fast does it work, and when to
choose something else.

```mdx
<ScientificVerdict
  recommendation="Yes"          {/* Yes | Maybe | No | Situation-dependent */}
  bestFor="Racing thoughts at bedtime|Caffeine jitters|Mild situational anxiety"
  notFor="Severe insomnia|Panic attacks|Chronic stress alone"
  confidence="Moderate"
  onset="30–40 minutes"
  evaluationWindow="Same day to 2 weeks"
>
L-theanine is a strong first choice for calm focus and caffeine jitters, but not
the best primary tool for chronic stress or severe anxiety.
</ScientificVerdict>
```

- `bestFor` / `notFor` accept a **pipe-delimited string** (MDX-friendly) or a
  real array (`.tsx`).
- The bottom line is the component's **children** (or a `bottomLine` prop).
- The recommendation badge is color-coded: Yes = emerald, Maybe = amber,
  No = rose, Situation-dependent = sky.
- **Placement:** put it at the very top of the article body (it replaces the old
  "> **The bottom line:**" blockquote). Its root is a `<section>` so
  `ContentCards` treats it as the first section and does not double-wrap it.
- **Voice:** be honest — use `No` / `Situation-dependent` and a real "Not ideal
  for" list when the evidence warrants. That honesty is the brand.

Live example: [`content/articles/magnesium-glycinate.md`](../content/articles/magnesium-glycinate.md).

### `<DecisionMatrix>` — "Should you use it?" fit-by-situation

`components/editorial/DecisionMatrix.tsx`

Rows of situation → labeled fit (**Good fit / Maybe / Poor fit / Avoid**, never
color alone) → guidance → optional route. Place it near the top as the
"Should you use it?" section. `items` is a JS expression:

```mdx
<DecisionMatrix title="Should you use L-theanine?" items={[
  { situation: 'Racing thoughts before bed', fit: 'good',
    guidance: 'May quiet mental chatter without sedation.',
    href: '/guides/sleep/l-theanine-for-sleep/', hrefLabel: 'L-theanine for sleep' },
  { situation: 'Severe panic attacks', fit: 'poor',
    guidance: 'A mild supplement is unlikely to be enough.' },
]} />
```

### `<RealityCheck>` — expectation vs reality

`components/editorial/RealityCheck.tsx`. Two columns:
`expectations={[…]}` (struck through) vs `reality={[…]}`, with optional
`bottomLine`. Defuses hype.

### `<EvidenceConfidence>` — explain the grade in plain English

`components/editorial/EvidenceConfidence.tsx`.
`grade`, `whyNotHigher={[…]}`, `whyNotLower={[…]}`, `practicalTakeaway`.
Use instead of leaving "Moderate" unexplained.

### `<CommonMistakes>` — prevent misuse

`components/editorial/CommonMistakes.tsx`.
`items={[{ mistake, whyItMatters, betterApproach? }]}`.

### `<BetterAlternatives>` — route elsewhere when appropriate

`components/editorial/BetterAlternatives.tsx`.
`alternatives={[{ condition, recommendation, reason, href? }]}`. Trust-building.

### `<WhereNext>` — intent-based journey nav (replaces "Related Articles")

`components/editorial/WhereNext.tsx`.
`paths={[{ ifYouWant, goTo, href, reason? }]}`.

### `<EditorialNote variant>` — short editor's aside

`components/editorial/EditorialNote.tsx`.
`variant`: `default | caution | positive | neutral`. Use sparingly.

> **Architecture note:** editorial components render self-contained `.not-prose`
> blocks. `ContentCards` (the article-body post-processor) explicitly skips any
> `.not-prose` subtree, so their internal headings are never re-grouped or
> re-parented. Keep the `.not-prose` root class on any new editorial component.

### Other registered MDX components

Already available in article bodies (see `mdx-components.tsx`):
`CollapsibleDetails`, `CollapsibleWarning`, `CollapsibleSection`,
`StudyDesignSnapshot`, `EvidenceSummaryCard`, `ResearchLimitations`,
`MisconceptionCallout`, `SafetyNotice`, `ComparisonTable`, `EvidenceNote`.

### Inline citations + trust strip (article template)

Not components you place, but conventions the article template
(`app/articles/[slug]/page.tsx`) provides automatically:

- **Trust strip** in the header: author · explicit `lastReviewed` date · live
  "N cited sources" count · Evidence standards link. Add `lastReviewed`,
  `reviewedBy`, `reviewerCredential` in frontmatter when true — never fabricate a
  reviewer.
- **Anchored references:** each frontmatter reference renders with
  `id="ref-<pmid>"`. Deep-link a numeric claim to its source inline:
  `... reduced sleep onset ~17 min ([Abbasi 2012](#ref-22163214))`.

---

## Guide hub components

`components/guides/*` — for the goal hubs (`/guides/sleep`, `/guides/anxiety`,
`/guides/stress`, `/guides/focus`). A hub should route the reader by their
problem, not list files.

### `<DecisionRouter items={...} />` — "what's your problem?" routing

`components/guides/DecisionRouter.tsx`

The signature hub module: a grid of "If your problem is X → start with Y" cards.
This is what makes a hub behave like an editor.

```tsx
import { DecisionRouter, type IntentRoute } from '@/components/guides/DecisionRouter'

const START_HERE: IntentRoute[] = [
  { problem: 'Racing thoughts at bedtime', why: 'A calming amino acid…',
    cta: 'L-Theanine for Sleep', href: '/guides/sleep/l-theanine-for-sleep/' },
  // …
]

<DecisionRouter items={START_HERE} />
```

Every `href` must be a **real, existing route** — each card is a promise the
destination answers that specific problem.

### `<GuideCardGrid cards={...} />` — standard two-up card grid

`components/guides/GuideCardGrid.tsx`

For the "best first reads" and "comparisons" sections. Each card is a title +
short editorial reason to read it (not a generic blurb).

```tsx
import { GuideCardGrid, type GuideCard } from '@/components/guides/GuideCardGrid'

const BEST_FIRST: GuideCard[] = [
  { href: '/guides/sleep/magnesium-for-sleep/', title: 'Magnesium for Sleep',
    desc: 'The best-evidenced, lowest-risk first pick for most people.' },
]

<GuideCardGrid cards={BEST_FIRST} />
```

### `<HubSectionHeading eyebrow title sub />` — section header

`components/guides/HubSectionHeading.tsx`

Eyebrow + title (+ optional sub) that separates hub sections ("Start here",
"Comparisons", "Full library"). Use it for every hub section so spacing and type
scale stay uniform.

Reference implementations: [`app/guides/sleep/page.tsx`](../app/guides/sleep/page.tsx)
and [`app/guides/focus/page.tsx`](../app/guides/focus/page.tsx) — both follow the
decision-first hub shape (Start here → Best first → Comparisons → cluster
crossover → editorial note → full library).

---

## Profile decision surface (herb & compound engine)

### `<ProfileDecisionPanel>` — the shared decision surface for ~850 profiles

`components/editorial/ProfileDecisionPanel.tsx`

Rendered once by each of the herb and compound templates, so improving it
improves every profile at once. It composes three parts from
`buildProfileDecision(record, kind)` (see `lib/profile-decision.ts`):

1. **Scientific verdict** — a full `<ScientificVerdictCard>` when the slug has a
   curated overlay in `config/profile-verdicts.ts` (recommendation, confidence,
   best/not-ideal, onset, evaluation window, safety/evidence notes, better
   alternative, bottom line).
2. **Evidence confidence** — when the overlay carries an `evidenceConfidence`
   object, a shared `<EvidenceConfidence>` explainer (grade → why not higher →
   why not lower → practical takeaway).
3. **Start here** — when the overlay carries `primaryGuide` (`{ label, href }`),
   a prominent link to the safe entry-point guide for the profile's primary goal.
   This is the profile's node in the decision graph.
4. **Compare before choosing** — an amber routing block rendered from the
   overlay's `comparisons[]` (`label` + `href` + a `when` that names the reader
   the comparison is for). Only surfaces routes that exist.
5. **Continue reading** — intent-based routing derived from the record's own
   keyword corpus (sleep / anxiety / focus hubs + a browse-index exit). Present
   for *every* profile, curated or not.

Full flow: verdict → evidence confidence → **start here** → compare → continue.

Curated profiles live in `config/profile-verdicts.ts` (18 money-cluster herbs &
compounds as of Pass 5). Adding an entry upgrades a profile from the derived
surface to a full verdict with **zero template changes**. Routes are guarded by
`npm run validate:profile-verdicts` (part of `check:fast`).

---

## How to apply this to the next hub / article

1. **Hubs** (anxiety, stress, focus): copy the section skeleton from the sleep
   hub — hero → `DecisionRouter` (Start here) → `GuideCardGrid` (best first) →
   `GuideCardGrid` (comparisons) → editorial note → full library. Swap in that
   goal's real routes.
2. **Articles**: open with `<ScientificVerdict>`, keep the deeper science lower
   and collapsible, and inline-cite numeric claims to `#ref-<pmid>` anchors.
3. Never invent routes or medical claims; verify every `href` exists first.
4. Follow [`evidence-and-claim-discipline.md`](./evidence-and-claim-discipline.md)
   for how to phrase evidence, safety, and recommendations — and run
   `npm run validate:claim-discipline` before shipping.
