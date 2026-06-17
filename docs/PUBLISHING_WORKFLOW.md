# Publishing Workflow

> How to go from idea to live page. One-page reference.

---

## Quick Start

```
npm run create:page
```

The generator prompts for type → title → slug → description and writes the scaffolded `page.tsx`.  
Fill in the TODO sections, validate, commit, push — done.

---

## Full Workflow Diagram

```
idea
  │
  ▼
npm run create:page
  │
  ├── Type?  ─────────────────────────────────────────────────────────────────
  │            article    →   app/articles/<slug>/page.tsx
  │            guide      →   app/guides/<slug>/page.tsx
  │            compare    →   app/compare/<slug>/page.tsx
  │
  ├── Title   (free text)
  │
  ├── Slug    (lowercase, hyphens; auto-suggested from title)
  │            └─ generator aborts if slug already exists
  │
  └── Description  (1–2 sentence meta description)
         │
         ▼
    page.tsx scaffold created with:
      - metadata export (buildPageMetadata)
      - breadcrumb + article JSON-LD
      - FAQ JSON-LD
      - H1, intro, evidence, safety, FAQ, related sections
      - TODO comments marking every section to fill in
         │
         ▼
    Fill in content
      - Replace all TODO comments
      - Add EvidenceSummaryCard values
      - Add FAQs (2–6 Q&A pairs)
      - Add related links
      - Wire affiliate links via AFFILIATE_TAGS.amazon if needed
         │
         ▼
    Validate
      npm run lint && npm run typecheck
         │
         ▼
    Build
      npm run build
         │
         ├── Build passes?
         │     YES → continue
         │     NO  → fix errors, re-run build
         │
         ▼
    Commit
      git add app/<type>/<slug>/page.tsx
      git commit -m "content(<type>): add <slug> page"
         │
         ▼
    Push
      git push origin <branch>
         │
         ▼
    PR + merge → Cloudflare Pages deploys automatically
         │
         ▼
    LIVE
```

---

## Type Decision Guide

| If you're writing… | Use |
|--------------------|-----|
| "What is X?", "X for Y condition", research deep-dive | `article` |
| "Best X for Y", roundup, how-to guide, buyer guide | `guide` |
| "X vs Y", head-to-head ingredient comparison | `compare` |
| New herb or compound profile | Edit workbook → `npm run data:build` (not this generator) |

---

## Validation Checklist

Before committing:

- [ ] All TODO comments replaced with real content
- [ ] Title is specific and includes the primary keyword
- [ ] Description is 120–160 characters, unique, includes primary keyword
- [ ] H1 matches or closely mirrors the `<title>`
- [ ] FAQs have real questions and hedged, balanced answers (no clinical claims)
- [ ] EvidenceSummaryCard fields filled in accurately
- [ ] `AFFILIATE_TAGS.amazon` used (not hardcoded strings) if affiliate links present
- [ ] No `force-dynamic`, `revalidate`, `cookies()`, `headers()` (breaks static export)
- [ ] `npm run lint` passes (zero warnings)
- [ ] `npm run typecheck` passes
- [ ] `npm run build` passes

---

## Slug Rules

- Lowercase letters, numbers, and hyphens only
- No leading or trailing hyphens
- Must be unique in the route namespace (generator checks automatically)
- Once live: stable forever — add redirect to `public/_redirects` before renaming
- Compare slugs: use `-vs-` separator (e.g. `rhodiola-vs-ashwagandha`)

---

## File Locations

| Type | Output path |
|------|-------------|
| article | `app/articles/<slug>/page.tsx` |
| guide | `app/guides/<slug>/page.tsx` |
| compare | `app/compare/<slug>/page.tsx` |

---

## For Herb / Compound / Stack Content

The generator does **not** handle these — they are workbook-owned:

```
Edit data-sources/herb_monograph_master.xlsx
  → npm run data:build
  → npm run data:validate
  → commit public/data changes
```

See `docs/workbook-only-data-contract.md` for the full workbook edit policy.

---

## See Also

- `docs/MASTER_CONTENT_MAP.md` — route ownership and full slug inventory
- `docs/workbook-only-data-contract.md` — herb/compound data pipeline rules
- `config/affiliate.ts` — affiliate tag constants
- `scripts/create-content-page.mjs` — the generator source
