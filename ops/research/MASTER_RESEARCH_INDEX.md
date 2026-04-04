# MASTER_RESEARCH_INDEX

This index defines the canonical research corpus under `ops/research/` after deduplication.

## 1) Canonical herb shard files

| Filename | Lane/type | Scope covered | Recommended use | Caveats |
|---|---|---|---|---|
| `ops/research/herbs-g-i.md` | Herb shard | Herb records with slugs in G–I | Direct Codex apply | Markdown canonical retained over overlapping PDF copy for the same shard. |
| `ops/research/herbs-j-m.md` | Herb shard | Herb/ingredient records with slugs in J–M | Direct Codex apply | Includes some non-botanical ingredients in-shard; preserve existing record-type distinctions during apply. |
| `ops/research/herbs-n-r.md` | Herb shard | Herb/ingredient records with slugs in N–R | Direct Codex apply | Contains both botanicals and nutrient/compound-style records; verify destination record type before writing. |
| `ops/research/herbs-s-v.md` | Herb shard | Herb/ingredient records with slugs in S–V | Direct Codex apply | Contains safety-heavy entries (e.g., interaction-rich rows); keep Tier-1 citation discipline when applying. |
| `ops/research/herbs-w-z.md` | Herb shard | Herb records with slugs in W–Z | Cautious apply | File notes explicit possible omissions when internal slug list differs; reconcile against dataset slug inventory before direct writes. |

## 2) Canonical compound/nutrient files

| Filename | Lane/type | Scope covered | Recommended use | Caveats |
|---|---|---|---|---|
| `ops/research/compound-research.pdf` | Compound / nutrient lane | Compound/nutrient-focused research corpus (includes L-tryptophan, magnesium, melatonin, omega-3/fatty-acid context) | Cautious apply | PDF-only canonical for this lane in current corpus; parse carefully and avoid auto-applying without field-level verification. |

## 3) Canonical mixed/special-case files

| Filename | Lane/type | Scope covered | Recommended use | Caveats |
|---|---|---|---|---|
| `ops/research/Deep Research Report.pdf` | Mixed special-cases lane | Mixed leftovers/special-cases (includes items like acetylcholine, fatty acids, *Peganum harmala*, *Sceletium tortuosum*) | Cautious apply | Mixed lane intentionally kept separate from alphabet herb shards and compound core lane. |

## 4) Meta files (audit / executive summary)

No standalone audit PDF or executive-summary/matching-status PDF is present in `ops/research/` at dedupe time.

- Expected-by-name examples referenced in planning (`hippie-scientist-audit-Apr427.pdf`, `Executive Summary.pdf`) were not found in this directory.
- If these files are later added, keep them in this section as **meta-only** (not for direct JSON writing).

## 5) Archived or removed duplicates

Archived duplicate/superseded files were moved to `ops/research/archive/`.

| Old filename | Canonical replacement | Reason |
|---|---|---|
| `ops/research/archive/The Hippie Scientist herb shard research for G, H, I.pdf` | `ops/research/herbs-g-i.md` | Overlapping same shard content; markdown retained as canonical readable/editable version. |
| `ops/research/archive/Project_ The Hippie Scientist — Herb Detail Records for Slugs W–Z.pdf` | `ops/research/herbs-w-z.md` | Overlapping same shard content; markdown retained as canonical. |
| `ops/research/archive/herb-research-0.pdf` | `ops/research/herbs-w-z.md` | Duplicate W–Z PDF copy (superseded by markdown canonical). |
| `ops/research/archive/l-tryptophan.pdf` | `ops/research/compound-research.pdf` | Substantively duplicate compound/nutrient PDF lane copy. |
| `ops/research/archive/Ugh` | _none_ | Non-descriptive stray artifact; archived to keep root corpus canonical and clean. |

## 6) Recommended usage notes

- **Direct Codex apply**
  - `herbs-g-i.md`, `herbs-j-m.md`, `herbs-n-r.md`, `herbs-s-v.md`
  - Use for record-level updates with normal lane-safe field verification.
- **Cautious apply**
  - `herbs-w-z.md`, `compound-research.pdf`, `Deep Research Report.pdf`
  - Reconcile slug/record-type fit before writing; these files include mixed assumptions or PDF-only structure.
- **Meta-only / not for direct JSON writing**
  - Any audit or executive-summary/matching-status file when present.
  - None currently present in `ops/research/` after this pass.
