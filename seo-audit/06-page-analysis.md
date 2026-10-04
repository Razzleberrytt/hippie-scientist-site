# Skill #6: Page-Level Analysis — Crawled Page Deep Dive

**Date**: 2026-07-03  
**Source**: Site Audit crawl 2 (Jun 28), 2,503 pages

## 404 Pages (22 total)

All follow the same pattern — herb species pages under `/herbs/`:

| URL | Issue |
|-----|-------|
| /herbs/ganoderma-lucidum/ | 404 — 0 byte response |
| /herbs/angelica-sinensis/ | 404 — 0 byte response |
| /herbs/hericium-erinaceus/ | 404 — 0 byte response |
| /herbs/piper-methysticum/ | 404 — 0 byte response |
| /herbs/passiflora-incarnata/ | 404 — 0 byte response |

All NOT in sitemap, NOT HTML, depth=1. Appear to be broken herb species slugs.

## Critical: Canonical → 404 Chain

`/compounds/kava/` → canonical points to `/herbs/piper-methysticum/` → **which is a 404 page**

## External URLs in Crawl (Wasting Budget)

- pubmed.ncbi.nlm.nih.gov URLs crawled as internal pages
- amazon.com affiliate links (tag=razzleberry02-20) crawled as internal pages
- These inflate crawl counts and waste crawl budget

## Pages Not in Sitemap (746 total, Sample)

| URL | Title |
|-----|-------|
| /compounds/dim/ | Diindolylmethane: Effects, Dose and Safety |
| /compounds/wogonin/ | Wogonin: Effects, Dose and Safety |
| /compare/acerola-vs-astragalus/ | Acerola vs Astragalus: Comparison |
| /evidence-report/ | The State of Supplement Evidence 2026 |

## H1 Issues

- `/compare/acerola-vs-astragalus/` — H1: "AcerolavsAstragalus" (missing spaces)
- `/compare/acerola-vs-cat-s-claw/` — H1: "AcerolavsCat's Claw" (missing space)

## Priority Actions

1. Fix canonical → 404 chain: /compounds/kava/ → /herbs/piper-methysticum/ (dead)
2. Fix 22 herb species 404s: redirect to compound equivalents or remove links
3. Exclude external URLs from crawl: amazon/pubmed links shouldn't be crawled as internal
4. Fix H1 formatting: "AcerolavsAstragalus" → "Acerola vs Astragalus"
5. Add 746 missing pages to sitemap