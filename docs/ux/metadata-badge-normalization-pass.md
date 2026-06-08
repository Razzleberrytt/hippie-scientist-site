# Metadata + Badge Normalization Pass

## Scope

Targeted consistency pass across:

- `/herbs`
- `/compounds`
- `/search`
- shared decision cards
- shared metadata primitives
- shared evidence/safety badges

This pass intentionally avoided:

- workbook/runtime generation changes
- package or dependency changes
- ranking/search logic changes
- layout redesigns
- architecture rewrites
- new medical or dosage claims

---

# Goals

## Reduce visual fragmentation

Multiple badge systems, metadata rhythms, and micro-label styles had started diverging across:

- search cards
- herbs cards
- compounds cards
- evidence labels
- safety labels
- featured/status pills
- mechanism chips
- metric rows

The goal was systemic cohesion without redesigning the existing UI direction.

---

# Badge + Chip Consistency Strategy

## Shared primitive normalization

Introduced small shared utility class exports in:

- `lib/decision-primitives.ts`

Added shared primitives for:

- status badges
- metadata chips
- metric shells
- metadata clusters
- micro-label typography

This keeps future badge/chip surfaces aligned without introducing a large design-token system.

## Standardized behaviors

Normalized:

- vertical padding
- badge height rhythm
- line-height
- border radius
- uppercase tracking
- wrap behavior
- spacing cadence
- inline alignment

## Typography adjustments

Reduced aggressive uppercase spacing.

Moved toward:

- `tracking-[0.08em]`
- `tracking-[0.1em]`

Avoided:

- extreme tracking
- tiny micro-labels
- visually noisy metadata

---

# Metadata Rhythm Decisions

## Metadata rows

Metadata clusters now consistently use:

- wrapped flex rows
- calmer spacing rhythm
- shared gap cadence
- stable mobile wrapping

## Metric cards

Evidence, safety, and timing metrics now share:

- identical shell spacing
- identical label typography
- identical vertical rhythm
- consistent wrapping behavior

## Mechanism chips

Mechanism chips were normalized to:

- shared chip sizing
- shared line-height
- shared wrap behavior
- calmer foreground contrast

---

# Wrapping Safeguards

The pass added safeguards against:

- chip clipping
- inconsistent multi-line wrapping
- edge collisions on narrow mobile widths
- horizontal scrolling caused by metadata pills

Shared primitives now prefer:

- `max-w-full`
- `break-words`
- wrapped flex containers
- `leading-snug`

instead of rigid single-line assumptions.

---

# Non-Goals

This pass did NOT:

- redesign the visual language
- introduce a new component architecture
- replace Tailwind structure
- modify runtime data
- modify workbook parsing
- alter evidence semantics
- change search ordering
- change information hierarchy

---

# Validation Status

Validation execution was requested by task requirements.

This connector environment does not provide executable repository runtime access for:

- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`
- Playwright execution

Therefore validation could not be honestly executed from this environment.

No validation success is claimed in this document.

Recommended local validation:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Optional mobile verification:

```bash
npx playwright screenshot --viewport-size=390,844 http://127.0.0.1:3000/search artifacts/search-mobile-normalization.png
```
