# Editorial Operating System — Handoff & Operating Manual

The 8-pass Editorial Operating System is complete. This is the practical manual
for operating it — for future AI agents (Claude, Codex) and human editors. It
tells you what the system is, how to use it, what to run, and what never to do.

After this pass, the work shifts from **building the system** to **using it**.

---

## 1. What the Editorial Operating System is

A layered system that turns ~850 encyclopedia pages into a **decision-first,
evidence-disciplined** publication. Its core idea: separate **facts** (workbook),
**judgement** (editorial overlay), **presentation** (components), and
**guardrails** (validators) — so improving one layer improves the whole site
without breaking the others.

Reader journey the system creates:

> problem → goal hub → start-here guide → profile verdict → evidence confidence →
> compare → better alternative → safe next step

---

## 2. Page product types

| Type | Route | Shape |
|---|---|---|
| **Goal hub** | `/guides/{sleep,anxiety,focus}/` | Decision-first: `DecisionRouter` "Start here" → best-first → comparisons → crossover → full library |
| **Profile** (engine-rendered) | `/herbs/:slug`, `/compounds/:slug` | Hero → `ProfileDecisionPanel` → deep sections. ~850 pages, two templates |
| **Comparison** | `/guides/compare/:slug` | `ComparisonVerdict`: choose A / choose B / use both / avoid |
| **Article** | `/articles/:slug` (MDX) | Opens with `ScientificVerdict`; science lower, collapsible; inline PMID citations |

See `docs/canonical-page-operating-system.md` for the full blueprint per type.

---

## 3. Reusable components

Editorial (`components/editorial/`, registered in `mdx-components.tsx` — usable in
any MDX with no import):

- `ScientificVerdictCard` (a.k.a. `ScientificVerdict`) — the signature verdict module
- `EvidenceConfidence` — grade → why not higher → why not lower → practical takeaway
- `ComparisonVerdict` — choose A / B / both / avoid
- `DecisionMatrix`, `RealityCheck`, `CommonMistakes`, `BetterAlternatives`,
  `WhereNext`, `EditorialNote`
- `ProfileDecisionPanel` — the shared profile decision surface (not for MDX)

Hub primitives (`components/guides/`): `DecisionRouter`, `GuideCardGrid`,
`HubSectionHeading`.

Full reference: `docs/editorial-components.md`.

---

## 4. The profile verdict overlay system

`config/profile-verdicts.ts` is an **opt-in editorial layer keyed by slug**. It
never overrides workbook facts. A profile with no entry still renders a derived
decision surface; adding an entry upgrades it to a full verdict with **zero
template changes**.

Overlay fields:

| Field | Purpose |
|---|---|
| `recommendation` | Yes / Maybe / No / Situation-dependent |
| `confidence` | one-line confidence read |
| `bestFor` / `notIdealFor` | who it fits / who it doesn't |
| `onset` / `evaluationWindow` | practical timing |
| `safetyNote` | short safety flag (required for high-risk topics) |
| `evidenceNote` | one line on the evidence base |
| `evidenceConfidence` | structured `{ grade, whyNotHigher[], whyNotLower?[], practicalTakeaway }` |
| `primaryGuide` | `{ label, href }` — the decision-graph "start here" entry point |
| `betterAlternative` | `{ label, href, reason? }` — a clearly better fit nearby |
| `comparisons[]` | `{ label, href, when }` — surface only real, useful comparisons |

Rendering order in `ProfileDecisionPanel`:
verdict → evidence confidence → **start here** → compare → continue reading.

Currently curated: **18 money-cluster profiles** (sleep, stress, anxiety, focus).

---

## 5. The decision graph

The 18 curated overlays together form a decision graph. Each field is a graph role:

| Field | Graph role |
|---|---|
| `primaryGuide` | entry point (problem → hub → this guide) |
| `bestFor` / `notIdealFor` | fit |
| `evidenceConfidence` | trust |
| `comparisons[]` | branch (decide before committing) |
| `betterAlternative` | redirect (better fit nearby) |
| continue-reading (derived in `lib/profile-decision.ts`) | exit (hub + browse index) |

**Linking rule: route, compare, or stop.** Send the reader to the one best next
step; surface a comparison only when it helps them *choose*; otherwise stop. Do
not dump generic "related" links.

Every graph link is guarded — see §7.

---

## 6. Evidence & trust rules (summary)

- An evidence grade is a **conclusion** from six dimensions (human evidence,
  study quality, consistency, practical relevance, safety confidence,
  fit-to-use-case) — not a decorative badge.
- Use calibrated language ("may help", "evidence suggests"); never banned
  overclaims ("cures", "guaranteed", "treats anxiety", "completely safe", "no
  side effects", …).
- Soften a recommendation when evidence is thinner than the claim.
- High-risk topics must surface cautions visibly.

Full rulebook with good/bad examples: `docs/evidence-and-claim-discipline.md`.

---

## 7. The safety & guardrail validators

| Command | Guards | Mode |
|---|---|---|
| `validate:profile-verdicts` | every keyed slug + **every `href`** (`primaryGuide`, `betterAlternative`, `comparisons`) resolves | hard fail |
| `validate:claim-discipline` | curated overlay has no banned overclaim phrasing (article prose = warn-only) | hard fail (overlay) |
| `validate:safety-visibility` | 7 high-risk overlays + 3 high-risk articles carry required cautions | hard fail |
| `validate:evidence-language` | workbook `public/data` summaries (placeholder / disease-claim / tier alignment) | hard fail |
| `validate:article-quality` | article structure / entity integrity | hard fail |
| `validate:internal-links` | links resolve to an emitted page **or a `_redirects` rule (incl. `/*` wildcards)** | hard fail |

The first three run inside `npm run check` (`check:fast`) and the release gate.

---

## 8. How to add a curated profile

1. Confirm the slug exists (`public/data/herbs.json` / `compounds.json`).
2. **Key by the record slug the live page uses.** For botanicals indexed under a
   herb page with a botanical record slug (e.g. kava → `piper-methysticum`,
   passionflower → `passiflora-incarnata`), key the botanical slug and alias the
   common slug at the bottom of `config/profile-verdicts.ts`.
3. Add the overlay entry (see §4). Verify every `href` is a real route.
4. Add `safetyNote` + required cautions for any high-risk topic; if it's a new
   high-risk slug, add it to `validate-safety-visibility.mjs`.
5. Run `npm run validate:profile-verdicts && npm run validate:claim-discipline && npm run validate:safety-visibility`.
6. Build and confirm the profile renders the panel; confirm the page is **not**
   `noindex` (check `indexability_status` in the workbook — a governance-noindex
   profile delivers user value but limited SEO value).

---

## 9. How to upgrade a hub

Copy the shape from `app/guides/sleep/page.tsx` or `app/guides/focus/page.tsx`:
hero → `DecisionRouter` (Start here) → `GuideCardGrid` (best first) →
`GuideCardGrid` (comparisons) → cluster crossover → editorial note → full library.
Every `href` must be a real route (the internal-link validator will catch misses).
Do not redesign; match the existing shape.

---

## 10. How to upgrade an article

Open with `<ScientificVerdict>`; add `<EvidenceConfidence>` after the evidence
section; keep deep science lower and collapsible; inline-cite numeric claims to
`#ref-<pmid>` anchors; add a visible safety block for high-risk topics
(`SafetyNotice`, `CollapsibleWarning`, or a `safetyNote`). Do not bloat.

---

## 11. How to add a comparison

- Canonical route is **`/guides/compare/:slug`** — never bare `/compare/…`.
  (A `/compare/* → /guides/compare/:splat` redirect exists as a safety net, and
  the internal-link validator honors it, but emit canonical links at the source.)
- Only link a comparison that is actually built — gate candidate slugs through
  `isBuiltComparisonSlug()` in `lib/comparison-utils.ts`.
- Use `ComparisonVerdict` and make a specific choice; don't pretend two options
  are equal when one fits a different problem.

---

## 12. What future AI agents must NEVER do

- Never hand-edit `public/data/**` or `data/articles/articles.json` — regenerate
  from the workbook (`npm run data:build`).
- Never let the overlay override a workbook fact (evidence tier, safety flag).
- Never fabricate evidence, routes, citations, or a credentialed reviewer.
- Never use banned overclaim language or make medical/diagnostic/prescribing
  claims, or tell readers to start/stop a prescribed medication.
- Never emit bare `/compare/…` links.
- Never flip a workbook `indexability_status` from code to "fix" SEO.
- Never redesign the site or start a Pass 9. The system is built — operate it.

---

## 13. Commands to run before merging

```bash
npm run typecheck
npm run lint
npm run validate:article-quality
npm run validate:claim-discipline
npm run validate:profile-verdicts
npm run validate:safety-visibility
npm run validate:evidence-language
npm run build          # or build:app for a faster app-only check
node scripts/ci/validate-internal-links.mjs   # after a build
```

`npm run check` bundles the fast gate; `npm run check:full` is the release gate.

---

## 14. Known limitations after Pass 8

- **Governance-noindex curated profiles.** `lavender`, `lemon-balm`, `chamomile`
  (workbook `NOINDEX`) and `creatine` (`NEEDS_REVIEW`) render full verdicts but
  their pages are `noindex` — user value, limited SEO value until the workbook
  grounds/reviews them. `kava` is fine: its canonical (`piper-methysticum`,
  `PUBLISH`) carries the verdict.
- **Internal-link baseline.** After wildcard-aware validation the true baseline
  under a partial `build:app` is ~260 (down from ~3.7k). The remainder are
  pre-existing: phantom dynamic `/guides/compare/X-vs-Y` links (unbuilt combos),
  and `build:app` partial-emission artifacts (e.g. `/compounds/dmt`, `/pagefind/`,
  some `/info/`, `/evidence/`). None originate from the editorial decision
  modules. A full `npm run build` emits more of these; assess there.
- **Article claim-discipline is warn-only** (long-form prose legitimately quotes
  bad claims as examples); the curated overlay is the hard gate.
- **robots.txt Content-Signal** was a Cloudflare-edge injection (not in the repo);
  disable it in the Cloudflare dashboard, not in code.

---

## 15. The first operating task

**Curate the next batch of profile overlays** — extend `config/profile-verdicts.ts`
from 18 toward the next 10 highest-traffic profiles (e.g. 5-HTP, GABA, lion's
mane, citicoline, tongkat ali, NAC…), following §8. Each new overlay is a small,
guarded, high-leverage improvement — exactly the kind of work the system was built
to make safe and repeatable.

(Alternatives: upgrade the next hub/broad guide index to decision-first per §9, or
after deployment, monitor Search Console and request a recrawl of the money
clusters.)
