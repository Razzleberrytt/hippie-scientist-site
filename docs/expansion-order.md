# Expansion Order

> **Mission 007 — The Magnificent 10** · execution sequence
> Companion to [`magnificent-10.md`](./magnificent-10.md).
>
> **Scope rules (enforced):** This document *sequences* expansion of the 10 already-existing
> priority pages. It does **not** create content, redesign, create pages, or build systems.
>
> Generated: 2026-06-16 · Branch: `claude/magnificent-10-ranking-r81dnf`

---

## Ordering Principle

The build order is **not** a straight copy of the priority ranking. It optimizes for two things
the ranking alone doesn't capture:

1. **Pattern reuse.** The first page built establishes the reusable `ItemList` + `FAQPage`
   schema block, the affiliate-card convention (`AFFILIATE_TAGS.amazon` only), and the citation
   style. Every later page replicates it, so per-page cost falls across the sequence.
2. **Lowest-cost-to-elite first within a wave.** Pages that already ship a schema/FAQ base or a
   strong word-count base are sequenced earlier so wins land sooner.

Result: highest-ROI money pages lead (build the pattern), authority hubs follow (apply it to
link magnets), then the remaining cluster guides close it out.

---

## Recommended Sequence

| Order | Page | Rank | Wave | Why here |
|:---:|------|:---:|:---:|------|
| 1 | `/best-supplements-for-sleep` | 1 | A | Top score; build the schema/affiliate/FAQ pattern here. |
| 2 | `/articles/best-supplements-for-adhd` | 2 | A | Largest cluster; reuse the pattern immediately. |
| 3 | `/articles/best-magnesium-supplement-for-adhd` | 6 | A | Strongest existing base (1,852 w, 10 FAQ, schema) — fastest money-page win. |
| 4 | `/best-supplements-for-stress` | 3 | A | Stress anchor; feeds the ashwagandha hub built next. |
| 5 | `/best-supplements-for-focus` | 5 | A | Focus anchor; feeds the lion's mane hub. |
| 6 | `/herbs/ashwagandha` | 4 | B | Highest-authority hub; apply the pattern to the top link magnet. |
| 7 | `/herbs/lions-mane` | 7 | B | Authority hub; receives equity from the focus page (order 5). |
| 8 | `/herbs/turmeric` | 8 | B | Authority hub; spans joint/inflammation/gut clusters. |
| 9 | `/guides/adhd-supplements` | 10 | C | Already ships `FAQPage`/schema — lowest-cost guide lift. |
| 10 | `/guides/best-herbs-for-anxiety` | 9 | C | Closes anxiety-cluster coverage; funnels to hubs already built. |

---

## Waves

**Wave A — Money pages (orders 1–5).** Build the reusable schema/affiliate/citation pattern on
the five commercial landing/article pages with the highest monetization fit. These establish the
funnel destinations everything else links into.

**Wave B — Authority hubs (orders 6–8).** Apply the established pattern to the three herb hubs —
the highest-authority, highest-link-equity assets. Sequenced after the money pages that link
*down* into them, so internal-link targets exist before the hubs are expanded.

**Wave C — Cluster guides (orders 9–10).** Finish with the two discovery guides. `adhd-supplements`
goes first (schema base already present → cheapest), then `best-herbs-for-anxiety` to complete
anxiety coverage, funneling into the ashwagandha and other hubs already built in Wave B.

---

## Dependency Notes

- **Internal-link direction:** Wave A pages should link *down* into Wave B hubs; Wave B/C pages
  should funnel *up* into the Wave A money pages. Building money pages first means link targets
  exist before the linking pages are written.
- **No merges or redirects.** The excluded near-duplicates
  (`/guides/best-supplements-for-sleep`, `/best-magnesium-supplements-for-adhd`) are **not**
  retired here — they simply fall outside the priority tier. Route changes are out of scope.
- **Re-measure between waves.** After each wave, re-run the scoreboard signal pass (word count,
  links, citations, FAQ/schema) to confirm target states before starting the next wave.

> **Reminder:** this document *sequences existing pages*. No content, pages, or systems are
> created here per Mission 007 rules.
