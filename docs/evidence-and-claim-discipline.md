# Evidence, Trust & Claim Discipline

How The Hippie Scientist talks about evidence, safety, and uncertainty. This is
the standard for **every** article, profile, guide, comparison, hub, and curated
overlay — and the rulebook any future AI agent (Claude, Codex) or human editor
must follow before publishing a claim.

The brand advantage is **calibrated honesty**: we tell readers when something is
useful, limited, risky, or not worth their time. A page that oversells is off-brand,
even if every sentence is technically defensible.

> The goal is not to be timid. It is to make claims with the right amount of
> **confidence, context, and caution**.

---

## 1. The Evidence Confidence Framework

An evidence grade is a **conclusion**, not a decorative badge. Before writing
"Evidence: Moderate," reason through six dimensions:

1. **Human evidence** — human trials / observational / reviews, or mostly
   animal & cell data?
2. **Study quality** — randomized, placebo-controlled, blinded, adequately
   powered, replicated, independent?
3. **Consistency** — do results point the same direction?
4. **Practical relevance** — does the measured outcome matter to the reader?
5. **Safety confidence** — how well understood are risks, interactions, and
   long-term use?
6. **Fit-to-use-case** — does the evidence support *this* use, or only a
   related one?

Grades we use: **High · Moderate-high · Moderate · Limited · Preliminary ·
Insufficient**.

---

## 2. The Required Evidence Language Pattern

Important pages explain a grade with this structure (rendered by the
[`EvidenceConfidence`](../components/editorial/EvidenceConfidence.tsx) component):

```
Evidence confidence: <grade>

Why not higher:
- Reason 1
- Reason 2

Why not lower:
- Reason 1
- Reason 2

Practical takeaway:
What the reader should do with this evidence level.
```

**In MDX articles** — use the component directly (registered globally, no import):

```mdx
<EvidenceConfidence
  grade="Moderate"
  whyNotHigher={['Most trials are small', 'Long-term data is limited', 'Outcomes vary by dose']}
  whyNotLower={['Multiple human trials exist', 'Findings are directionally consistent', 'Short-term safety is favorable']}
  practicalTakeaway="Reasonable to consider for mild situational use, not a replacement for medical care."
/>
```

**In curated profiles** — add the `evidenceConfidence` object to the overlay
entry in [`config/profile-verdicts.ts`](../config/profile-verdicts.ts); the
[`ProfileDecisionPanel`](../components/editorial/ProfileDecisionPanel.tsx)
renders it automatically. **Never fabricate the reasons** — they must reflect
what the profile/article already supports.

---

## 3. Claim Discipline Rules

### Banned — dangerous overclaiming

Never write these (outside of negated / quoted-as-bad-example contexts):

- `cures`, `cure-all`, `proven cure`, `proven to cure/fix/treat`
- `guaranteed`, `miracle`
- `eliminates anxiety / stress / insomnia`
- `treats anxiety / insomnia / depression` (as a product claim)
- `safe for everyone`, `works for everyone`
- `completely / totally / perfectly / 100% safe`
- `no side effects`, `no risk`, `risk-free`

### Preferred — calibrated language

- may help · may support · evidence suggests · appears more useful for
- is a better fit when · is not a substitute for medical care
- discuss with a clinician if

### Good vs bad claims

| ❌ Bad | ✅ Good |
|---|---|
| "Ashwagandha treats anxiety." | "Ashwagandha may ease chronic stress over several weeks; it is not a treatment for a diagnosed anxiety disorder." |
| "Melatonin cures insomnia." | "Melatonin helps most with circadian timing (jet lag); its effect on ordinary insomnia is small." |
| "Kava is completely safe with noble cultivars." | "Noble cultivars lower the liver-safety risk, but rare reactions mean occasional, monitored use is the ceiling." |
| "Magnesium guarantees better sleep." | "Magnesium is a low-risk option that may support sleep, with the clearest benefit when intake is low." |

---

## 4. When is a recommendation too strong?

Soften if **any** is true:

- The recommendation is `Yes` but evidence is `Limited`/`Preliminary` → use
  `Maybe` or `Situation-dependent`.
- The `bestFor` list leads with a use the evidence only *emerging*-ly supports
  → lead with the well-supported use instead.
- There is a meaningful safety, interaction, or population caveat with no
  `safetyNote` → add one.
- The `bottomLine` reads like marketing ("the best," "a must-have") rather than
  a practical read → rewrite around who it fits and who it doesn't.

If evidence is genuinely unclear, **say so** — "the evidence is mixed" is a
feature, not a failure.

---

## 5. Safety Visibility Rules

High-risk or high-interaction topics must surface key cautions **visibly** (near
the top, or in a `safetyNote` / `SafetyNotice` / `CollapsibleWarning`), not
buried. Minimums:

| Topic | Must visibly mention |
|---|---|
| **Kava** | Liver-safety concern; avoid with alcohol / sedatives / hepatotoxic meds; occasional, sourced use only |
| **Ashwagandha** | Pregnancy, thyroid disease, sedatives; rare liver-injury reports; discuss with a clinician |
| **Melatonin** | Timing signal ≠ sedative; dose lower than most OTC products; children / ongoing use → clinician |
| **Magnesium** | Kidney-impairment caution; loose stools at high doses |
| **Caffeine** | Anxiety amplification, sleep disruption, stimulant stacking, BP sensitivity |
| **Rhodiola** | Can be over-stimulating / disrupt sleep; bipolar-spectrum caution |

Apply only where relevant — do not paste boilerplate onto low-risk profiles.

**Machine-enforced.** For curated profiles, these minimums are checked by
`npm run validate:safety-visibility` (`scripts/ci/validate-safety-visibility.mjs`,
in `check:fast`): each high-risk profile's overlay block must contain the required
caution phrasings (in `safetyNote`, `notIdealFor`, `bottomLine`, or the
`evidenceConfidence` takeaway). Adding a high-risk profile without its cautions
fails the build. To extend coverage, add the slug and its requirement groups to
that script.

---

## 6. Comparison Page Trust Rules

Comparison pages must **make a clear choice** without oversimplifying:

- `Choose A if…` / `Choose B if…` are **specific** to a reader's situation.
- `Use both if…` is **cautious**, never automatic.
- `Avoid / ask a clinician if…` appears when relevant (e.g. red-flag symptoms).
- Evidence-strength differences are explicit; don't pretend two options are
  equal when one clearly fits a different problem.

Reference implementation: [`magnesium-vs-melatonin`](../app/guides/sleep/magnesium-vs-melatonin/page.tsx)
via [`ComparisonVerdict`](../components/editorial/ComparisonVerdict.tsx).

---

## 7. Source-of-Truth Boundary

| Layer | Owns | Where |
|---|---|---|
| Workbook / runtime data | structured **facts** (evidence tier, safety flags, dosing) | `data-sources/*.xlsx` → `public/data/**` (generated; never hand-edit) |
| Editorial overlays | **judgement & guidance** (recommendation, confidence, safety/evidence notes) | `config/profile-verdicts.ts`, article MDX |
| Templates / components | **presentation** | `components/**`, `app/**` |
| Validation | **guardrails** | `scripts/ci/**` |

The overlay expresses judgement; it **never overrides workbook facts**. To fix a
fact, edit the workbook and run `npm run data:build`.

---

## 8. Validators (guardrails)

| Command | Scope | Mode |
|---|---|---|
| `npm run validate:evidence-language` | workbook `public/data` summaries — placeholder & disease-claim/tier alignment | hard fail (critical) |
| `npm run validate:claim-discipline` | **curated overlay** (`config/profile-verdicts.ts`) hard fail; **article prose** warn-only with negation/citation filtering | mixed |
| `npm run validate:profile-verdicts` | overlay keyed slugs + all linked routes (`betterAlternative`, `comparisons`, `primaryGuide`) resolve | hard fail |
| `npm run validate:safety-visibility` | high-risk curated profiles carry required cautions | hard fail |
| `npm run validate:article-quality` | article structure/entity integrity | hard fail |

`validate:claim-discipline` and `validate:profile-verdicts` run inside
`npm run check` (`check:fast`) and the release gate. Article prose is warn-only
by design: long-form content legitimately quotes bad claims as examples and
negates claims, so failing on it would be false-positive chaos — the curated
overlay, which is small and fully authored, is the hard gate.

---

## 9. Checklist for future agents / editors

Before publishing any evidence or safety claim:

- [ ] Grade reflects the six framework dimensions, not vibes.
- [ ] No banned overclaim phrasing (`npm run validate:claim-discipline`).
- [ ] Recommendation strength matches evidence strength.
- [ ] A real "not ideal for" / who-it's-wrong-for is present.
- [ ] `safetyNote` present for any meaningful risk/interaction/population.
- [ ] High-risk topics surface cautions visibly.
- [ ] Comparisons make a specific, non-oversimplified choice.
- [ ] Facts come from the workbook; judgement from the overlay.
