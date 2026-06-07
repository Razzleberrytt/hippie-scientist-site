# Project Progress

## Current Status

The evidence-based herb and supplement research platform is fully operational, building successfully, and type-safe. Recent audit-driven fixes have resolved critical data leaks, redirect loops, and static export compilation failures.

**Last updated:** June 6, 2026

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

## Open Issues — Current Status (2026-06-06)

### P0 Critical (created 2026-06-05 — not yet started)

- **[#1741](https://github.com/Razzleberrytt/hippie-scientist-site/issues/1741) Fix homepage data loader** — No defensive error boundaries or fallbacks for missing/empty herb/compound index files have been added yet. Homepage currently crashes on missing data rather than failing gracefully. Requires adding error boundaries around data-dependent sections in `app/page.tsx` / `components/homepage-v2.tsx`.

- **[#1742](https://github.com/Razzleberrytt/hippie-scientist-site/issues/1742) Add author identity site-wide** — No author profile page exists and no author attribution is displayed on herb, compound, stack, goal, or article pages. `app/about/page.tsx` covers site identity but not per-content author metadata. Requires author page + structured data updates across all content types.

- **[#1743](https://github.com/Razzleberrytt/hippie-scientist-site/issues/1743) Add reviewer identity to YMYL content** — No reviewer field in the content model and no reviewer display on any YMYL pages. Requires workbook schema extension + renderer updates for herb, compound, stack, and goal pages.

- **[#1744](https://github.com/Razzleberrytt/hippie-scientist-site/issues/1744) Content audit and summary cleanup** — Herb/compound/stack/goal/article content has not been audited for incomplete summaries or remaining placeholder text since the last workbook cleanup. Requires a systematic review pass.

- **[#1745](https://github.com/Razzleberrytt/hippie-scientist-site/issues/1745) Audit consistency between quick stats and summaries** — Quick stats (evidence score, safety level) and narrative summaries have not been cross-validated for internal consistency across all profiles. Likely requires a scripted comparison against workbook values.

- **[#1746](https://github.com/Razzleberrytt/hippie-scientist-site/issues/1746) Build email list infrastructure** — `components/monetization/FooterEmailCapture.tsx` exists as an untracked file (visible in `git status`) but is not committed, wired into the footer, or connected to any email provider. Provider integration, site-wide form placement, subscriber storage, and privacy/disclosure page updates are all pending.

### P1 (created 2026-06-05 — not yet started)

- **[#1747](https://github.com/Razzleberrytt/hippie-scientist-site/issues/1747) Expand goal-focused landing pages** — Current `/goals` pages exist but the goal ecosystem has not been expanded with additional goal-specific landing pages. Navigation has not been updated to surface them more prominently. Cross-linking from herb/compound profiles is minimal.

- **[#1748](https://github.com/Razzleberrytt/hippie-scientist-site/issues/1748) Add structured data across all content types** — Articles now have JSON-LD + breadcrumb structured data (added in `821eac88`). However, WebPage, Article, and FAQ schema are not yet systematically applied across herb, compound, stack, and goal pages. Rich result validation has not been run.

- **[#1749](https://github.com/Razzleberrytt/hippie-scientist-site/issues/1749) Create lead magnet and email funnel** — Blocked on #1746 (email infrastructure). No downloadable educational resource exists, no download workflow, and no follow-up email sequence has been planned.

### Older Open Issues (from May 2026 — partially addressed, verification pending)

- **[#1644](https://github.com/Razzleberrytt/hippie-scientist-site/issues/1644) Audit merged PR 1643 scope drift** — The audit was flagged: PR 1643 included editorial governance docs, a package script, and the editorial workbook validator beyond its stated scope. Follow-up verification (`npm run validate:editorial-workbook`, check package.json fast scripts) has not been formally documented as complete. Risk assessed as low-to-moderate; no rollback was triggered. Recommend closing once verification commands are re-run and confirmed passing.

- **[#1650](https://github.com/Razzleberrytt/hippie-scientist-site/issues/1650) UX Audit: post-merge consistency pass** — A systematic audit report has not been produced for the listed scope (homepage, goals, compare, herbs, compounds, learn, SEO entry pages, individual herb/compound pages). Many individual items flagged in this audit have since been fixed by subsequent PRs, but a formal consolidated report documenting resolved vs. remaining issues has not been filed. Recommend producing a brief audit summary or closing as superseded by the completed frontend pass issues.

- **[#1654](https://github.com/Razzleberrytt/hippie-scientist-site/issues/1654) Herb and compound detail consistency** — The herb detail page (`app/herbs/[slug]/page.tsx`) now uses design-system classes (`text-ink`, `text-muted`) and has `reviewed_date` metadata. Related content (via `getBatchedRuntimeRecords`) is wired in. However, a formal verification pass comparing herb and compound detail pages for consistent card rhythm, above-the-fold scanability, and safety/uncertainty visibility has not been documented as complete.

- **[#1659](https://github.com/Razzleberrytt/hippie-scientist-site/issues/1659) Improve related-content discovery system** — Related herb links are implemented in `app/herbs/[slug]/page.tsx` via `getBatchedRuntimeRecords`. Related content on compound pages and cross-linking to Learn articles and goal pages is less comprehensive. No explicit "related comparisons" or "synergistic compounds" surface exists as a reusable component across all content types.

- **[#1665](https://github.com/Razzleberrytt/hippie-scientist-site/issues/1665) Quality Pass: content trust and consistency audit** — The documentation-only audit report (`docs/audits/content-trust-consistency-audit.md`) has not been produced. This is a prerequisite for several downstream content-quality fixes. Evidence language, safety framing, and dosage overconfidence have not been systematically inventoried.

- **[#1684](https://github.com/Razzleberrytt/hippie-scientist-site/issues/1684) SEO P1: improve initial HTML content visibility** — `/compounds` and `/blog` were rebuilt as server components (commit `5647ef65`). The `/herbs` index, `/compare`, `/search`, `/privacy`, and `/contact` routes have not been verified for server-rendered H1 and introductory paragraph in initial HTML. Spinner-only initial states on these routes have not been audited post-rebuild.

- **[#1685](https://github.com/Razzleberrytt/hippie-scientist-site/issues/1685) SEO P2: canonicalization, footer linking, utility-page indexing** — Canonical URL handling was fixed (115 www → apex domain references resolved in `8c89a56e`). However, the footer (`src/components/Footer.tsx`) still does not include Compare, Learn, or Search links as required by the acceptance criteria. Weak H1s on About and Disclaimer pages and robots/noindex handling for `/search`, `/privacy`, `/contact`, `/disclaimer` also need verification.

---

## Ongoing Work & Next Priorities

- [ ] **[#1746] Email list infrastructure**: Commit and wire `FooterEmailCapture.tsx`; connect to email provider; update privacy/disclosure pages.
- [ ] **[#1742] Author identity**: Create author profile page; add attribution display and structured data across content types.
- [ ] **[#1741] Homepage data loader**: Add error boundaries/fallbacks to `components/homepage-v2.tsx` for missing data files.
- [ ] **[#1685] Footer links**: Add Compare, Learn, Search to `src/components/Footer.tsx` explore section.
- [ ] **[#1748] Structured data**: Extend JSON-LD to herb, compound, stack, and goal pages; run rich result validation.
- [ ] **Affiliate Tag Verification**: Perform a routine check on custom affiliate tag performance in Cloudflare Pages.
- [ ] **Sourcing & Buying Criteria expansion**: Standardize and expand criteria across less common herbs in the workbook.
- [ ] **Deployment Verification**: Verify automated CDN deployment pipeline on Cloudflare Pages.
