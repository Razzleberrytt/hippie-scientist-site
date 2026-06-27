# Shared decision primitives pass

This pass stabilizes the decision-engine UI shared by the herb and compound libraries without changing workbook/runtime generation or route contracts.

## Standardized evidence semantics

Use the following evidence labels across scan cards, profile badges, and snapshot summaries:

- **Strong evidence** — stronger human or clinical signals are present.
- **Moderate evidence** — useful evidence exists but remains bounded by limitations.
- **Limited evidence** — direct support is incomplete or lower confidence.
- **Mixed evidence** — profile signals conflict or remain inconsistent.
- **Preliminary evidence** — mechanistic, preclinical, animal, cell, in-vitro, early, or exploratory signals.
- **Traditional use** — historical or ethnobotanical framing without implying modern efficacy.
- **Insufficient evidence** — no meaningful support is surfaced by the profile data.
- **Needs review** — source fields are unknown, draft-like, or not ready to classify.

Avoid synonym drift such as “theoretical,” “emerging research,” “low evidence,” or unlabeled raw workbook tiers on user-facing decision cards. If a source value is ambiguous, normalize downward rather than upward.

## Standardized safety semantics

Use restrained safety labels that preserve uncertainty:

- **Generally well tolerated** — only when the source text suggests low concern, food-like use, or well-tolerated framing.
- **Use caution** — the default when notes exist but do not cleanly indicate low concern.
- **Interaction risk** — medication, polypharmacy, anticoagulant, CNS depressant, SSRI/MAOI, or similar interaction signals.
- **Needs review** — missing, unknown, or draft-like safety status.
- **Limited safety data** — sparse safety data or explicit low-data framing.

Avoid absolute safety language. Do not convert contraindication language into deterministic medical advice; keep it as cautious review framing.

## Shared hierarchy rules

Herb and compound decision cards should keep the same scan order:

1. **Primary** — title, short summary, and best-for context.
2. **Secondary** — evidence, safety, and timing metrics.
3. **Tertiary** — mechanism hints and supporting metadata.
4. **CTA** — one consistent full-width card action placed after the scan content.

The profile snapshot pattern should also start with practical fit, then evidence, then safety, then timing/mechanism context. Safety and evidence should remain visible without turning the card into badge soup.

## Mobile rhythm rules

- Keep search inputs and CTA buttons at a minimum comfortable tap height.
- Stack empty-state actions vertically on narrow screens, then wrap horizontally on larger screens.
- Use small, consistent gaps between decision metrics; avoid dense multi-row badge clusters.
- Let metric values wrap to two lines instead of truncating critical safety/evidence language.
- Preserve a single card CTA at the bottom so mobile users do not hunt for the next action.

## Empty-state philosophy

Empty states should be calm, explanatory, and recovery-oriented:

- State what happened in plain language.
- Explain that conservative evidence/safety handling may reduce matches.
- Show the current scan when filters are active.
- Provide clear recovery actions such as reset, browse the paired library, search, or goals.

Avoid dead-end empty shells or language that implies the database is broken.

## Abstraction constraints

This is not a full design-system migration. Reuse is intentionally small and localized:

- Use `lib/decision-primitives.ts` for label normalization and tone classes.
- Use `components/ui/DecisionPrimitives.tsx` for repeated library-card, filter, metric, and empty-state UI.
- Keep entity-specific extraction logic inside the herb and compound index clients because source fields still differ.
- Do not centralize workbook/runtime generation or introduce new generic component trees for unrelated pages.

## Reuse philosophy

Centralize stable semantics; localize unstable data extraction. The shared layer should make herbs and compounds feel like one product system while leaving each library free to map its own source fields conservatively.
