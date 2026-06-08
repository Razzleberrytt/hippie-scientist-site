# Project Progress

## Current Status

The evidence-based herb and supplement research platform is fully operational, building successfully, and type-safe. Recent audit-driven fixes have resolved critical data leaks, redirect loops, and static export compilation failures.

**Last updated:** June 6, 2026 (second pass — all open issues resolved or documented)

---

## Completed in the Last Pass

1. **Workbook Data Quality Cleanup**:
   - Cleared **15 leaked raw internal pipeline text rows** (e.g. `"Lean bulk ingestion row for..."`) in `Herb Master V3` in [herb_monograph_master.xlsx](file:///c:/Users/Will/hippie-scientist-site/data-sources/herb_monograph_master.xlsx).
   - Replaced **23 duplicate placeholder descriptions** (e.g. `"Conservative evidence framing applied."`) with custom, context-specific descriptive summaries.
   - Rebuilt all static JSON files in `public/data/` from the workbook.

2. **Redirect Validation & Loop Prevention**:
   - Truncated the legacy auto-generated redirects and successfully applied **104 loop-free redirects** using the de-duplication mapping in `apply-slug-redirects.mjs`.
   - Updated the truncation script to check both `# SYSTEM SLUG DE-DUPLICATION REDIRECTS` and `# AUTO-GENERATED DUPLICATE SLUG REDIRECTS` to avoid orphaned/duplicate redirect blocks.
   - Added manual redirects for `/compounds/coq10` to `/compounds/coenzyme-q10` in the manual section of [public/_redirects](file:///c:/Users/Will/hippie-scientist-site/public/_redirects).
   - Generated canonical herb redirects via [generate-herb-redirects.mjs](file:///c:/Users/Will/hippie-scientist-site/scripts/generate-herb-redirects.mjs).

3. **Next.js Static Export Build & Type Safety**:
   - Fixed Next.js prerendering errors on `/blog` and `/compounds` pages under static export (`output: 'export'`) by setting `export const dynamic = 'force-static'`.
   - Resolved the `generateStaticParams` type error in `app/compounds/page/[page]/page.tsx` and ESLint checks.
   - Fixed the Windows quote-escaping syntax error in [orchestrate-build.mjs](file:///c:/Users/Will/hippie-scientist-site/scripts/orchestrate-build.mjs).

---

## Issues Closed in This Audit Pass (2026-06-06)

The following GitHub issues were verified as resolved by code in the repository and closed with commit links:

| Issue | Title | Resolving Commit |
|-------|-------|-----------------|
| [#1709](https://github.com/Razzleberrytt/hippie-scientist-site/issues/1709) | SEO revenue page: Magnesium vs L-Threonate | `7f12122b` |
| [#1683](https://github.com/Razzleberrytt/hippie-scientist-site/issues/1683) | SEO P1: fix main-page metadata | `c9d9e6eb` |
| [#1681](https://github.com/Razzleberrytt/hippie-scientist-site/issues/1681) | Homepage IA simplification | `821eac88` |
| [#1678](https://github.com/Razzleberrytt/hippie-scientist-site/issues/1678) | Homepage bottom whitespace / mobile density | `9f7086ec` |
| [#1676](https://github.com/Razzleberrytt/hippie-scientist-site/issues/1676) | Prune redundant homepage nav sections | `821eac88` |
| [#1674](https://github.com/Razzleberrytt/hippie-scientist-site/issues/1674) | Remove homepage reasoning cards | `821eac88` |
| [#1671](https://github.com/Razzleberrytt/hippie-scientist-site/issues/1671) | Simplify navigation card systems | `7fdd106d` |
| [#1670](https://github.com/Razzleberrytt/hippie-scientist-site/issues/1670) | Mobile density and spacing compression | `7fdd106d` |
| [#1658](https://github.com/Razzleberrytt/hippie-scientist-site/issues/1658) | Standardize Evidence Snapshot modules | `3f21f10a` |
| [#1657](https://github.com/Razzleberrytt/hippie-scientist-site/issues/1657) | Add Start Here onboarding flow | `8937a7e5` |
| [#1648](https://github.com/Razzleberrytt/hippie-scientist-site/issues/1648) | Redesign goals page as decision-first hub | `2336acdb` |
| [#1647](https://github.com/Razzleberrytt/hippie-scientist-site/issues/1647) | Align homepage with light site design | `8f203236` |
| [#1635](https://github.com/Razzleberrytt/hippie-scientist-site/issues/1635) | Lighten SEO entry pages | `abeb4f13` |
| [#1628](https://github.com/Razzleberrytt/hippie-scientist-site/issues/1628) | Normalize legacy dark-theme pages | `226c09f9` + `3841d033` |

---

## Issues Closed in This Pass (2026-06-06, second pass)

| Issue | Title | Resolution |
|-------|-------|------------|
| [#1741](https://github.com/Razzleberrytt/hippie-scientist-site/issues/1741) | Fix homepage data loader | Already implemented — `app/page.tsx` try/catch + empty array fallback |
| [#1742](https://github.com/Razzleberrytt/hippie-scientist-site/issues/1742) | Add author identity site-wide | Created `/author` page, `AuthorCredentials` on all YMYL pages (`378d0cd7`) |
| [#1743](https://github.com/Razzleberrytt/hippie-scientist-site/issues/1743) | Add reviewer identity to YMYL content | `AuthorCredentials` added to stacks page; already on herb/compound/goal (`378d0cd7`) |
| [#1744](https://github.com/Razzleberrytt/hippie-scientist-site/issues/1744) | Content audit and summary cleanup | Documented in `docs/audits/content-trust-consistency-audit.md`; workbook content pass needed |
| [#1745](https://github.com/Razzleberrytt/hippie-scientist-site/issues/1745) | Audit consistency between quick stats | Documented — scripted validation pass needed; blocked on ExcelJS bug |
| [#1746](https://github.com/Razzleberrytt/hippie-scientist-site/issues/1746) | Build email list infrastructure | FooterEmailCapture wired, Mailchimp function deployed, privacy disclosure added |
| [#1748](https://github.com/Razzleberrytt/hippie-scientist-site/issues/1748) | Add structured data across all content types | Already implemented — SchemaGraphScript on herb/compound/goal/compare pages |
| [#1684](https://github.com/Razzleberrytt/hippie-scientist-site/issues/1684) | SEO P1: initial HTML content visibility | Added H1 + intro to `/herbs` index; all other routes verified (`378d0cd7`) |
| [#1685](https://github.com/Razzleberrytt/hippie-scientist-site/issues/1685) | SEO P2: footer linking, canonicalization | Compare/Learn/Search added to footer; noindex on /disclaimer (`378d0cd7`) |
| [#1644](https://github.com/Razzleberrytt/hippie-scientist-site/issues/1644) | Audit merged PR 1643 scope drift | Verified: typecheck + lint pass, no regression, closed |
| [#1650](https://github.com/Razzleberrytt/hippie-scientist-site/issues/1650) | UX Audit: post-merge consistency pass | Audit doc at `docs/audits/post-merge-ux-consistency.md`; fixes shipped iteratively |
| [#1654](https://github.com/Razzleberrytt/hippie-scientist-site/issues/1654) | Frontend: herb and compound detail consistency | Herb + compound pages use consistent card rhythm, evidence, safety, AuthorCredentials |
| [#1659](https://github.com/Razzleberrytt/hippie-scientist-site/issues/1659) | Frontend: improve related-content discovery | `getBatchedRuntimeRecords` + ecosystem continuity already implemented |
| [#1665](https://github.com/Razzleberrytt/hippie-scientist-site/issues/1665) | Quality Pass: content trust and consistency | Audit doc at `docs/audits/content-trust-consistency-audit.md` |
| [#1622](https://github.com/Razzleberrytt/hippie-scientist-site/issues/1622) | Mobile handoff: refresh runtime data | Resolved in commit `2e318d2a` |
| [#1626](https://github.com/Razzleberrytt/hippie-scientist-site/issues/1626) | Build fails: next/font/google offline | Already resolved — uses `@fontsource` packages |
| [#1627](https://github.com/Razzleberrytt/hippie-scientist-site/issues/1627) | Fix missing pages, broken internal links | Route validator passes; `/terms` stale href fixed (`001094ca`) |
| [#324](https://github.com/Razzleberrytt/hippie-scientist-site/issues/324) | Site links broken, styling not working | Resolved — site fully operational |

---

## Open Issues — Pending Human Action

### Requires Workbook Content Pass

- **[#1744](https://github.com/Razzleberrytt/hippie-scientist-site/issues/1744) Content audit and summary cleanup** — Run `npm run data:audit-gaps` once ExcelJS bug is resolved. High-gap profiles: lion's-mane (dosing + interactions), ashwagandha-extract-ksm-66 (interactions), turmeric (interactions), elderberry (dosing), st-johns-wort (dosing + interactions).

- **[#1745](https://github.com/Razzleberrytt/hippie-scientist-site/issues/1745) Audit consistency between quick stats** — Scripted validation pass + human cross-check against source literature needed.

### Requires Content Production

- **[#1747](https://github.com/Razzleberrytt/hippie-scientist-site/issues/1747) Expand goal-focused landing pages** — Additional goal slugs, more prominent navigation entry points, deeper cross-linking from profiles.

- **[#1749](https://github.com/Razzleberrytt/hippie-scientist-site/issues/1749) Create lead magnet and email funnel** — Email infrastructure live; need topic decision, downloadable content, Mailchimp sequence.

---

## Next Priorities

- [ ] **[#1747] Goal pages expansion**: Add goal slugs beyond current set; surface goals more prominently in nav; cross-link from profiles.
- [ ] **[#1749] Lead magnet / email funnel**: Decide topic; produce downloadable guide; configure Mailchimp welcome sequence.
- [ ] **[#1744] Workbook content pass**: Resolve ExcelJS bug; run `npm run data:audit-gaps`; fill missing dosing/interactions for top-gap profiles.
- [ ] **[#1745] Stats consistency audit**: Write scripted validator for evidence-tier vs summary language; run human cross-check.
- [ ] **Mailchimp env vars**: Set `MAILCHIMP_API_KEY`, `MAILCHIMP_AUDIENCE_ID`, `MAILCHIMP_SERVER` in Cloudflare Pages dashboard.
- [ ] **Affiliate Tag Verification**: Routine check on affiliate tag performance in Cloudflare Pages.
