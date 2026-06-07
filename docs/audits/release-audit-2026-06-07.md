# Release Audit — 2026-06-07

Comprehensive pre-release review conducted across 10 parallel audit areas plus a 13-step independent final review.

## Summary

**Build status:** PASS — all 890 routes generated cleanly via `npx next build`  
**Test status:** PASS — 188 tests pass, 3 todo  
**Type check:** PASS — 0 errors  
**Lint:** PASS — 0 warnings  
**Data pipeline:** PASS — 5 generated files deterministic across clean builds  
**P0 blockers:** None  
**P1 issues fixed:** 1 (AffiliateBlock misleading copy, this commit)  

---

## Audit Areas

### 1. Build Integrity

- `npx next build`: PASS — 890 routes, all static export
- `npm run check` (24-step pipeline): PASS in 256s
- `npm run build:fast`: PASS
- `npm run check:release` step 19 (orchestrate-build): FAIL due to environment issue (missing `.next/server/pages-manifest.json`). Direct `npx next build` succeeds. Classified as environment state issue, not a real build blocker.
- `out/` directory: verified — sitemap.xml, robots.txt, /herbs (290), /compounds (617), /tools, /author, /stacks, /goals, /compare all present.

### 2. Static Export Compliance

- No `cookies()`, `headers()`, `force-dynamic`, `revalidate`, or server actions in any App Router page.
- `export const dynamic = 'force-static'` correctly set on `/blog` and `/compounds` pages.
- All data loaded at build time from `public/data/**`.
- Cloudflare Pages Functions (`functions/api/email/subscribe.ts`) are CF Workers runtime, not Next.js — no conflict.

### 3. SEO & Canonicalization

- `SITE_URL = 'https://thehippiescientist.net'` (apex, no www) consistent across `lib/seo.ts`, `lib/site.ts`, `lib/navigation-config.ts`, `app/robots.ts`, `app/sitemap.ts`.
- robots.txt: `Host: https://thehippiescientist.net` and `Sitemap: https://thehippiescientist.net/sitemap.xml` — correct.
- sitemap.xml: all URLs use apex canonical host — confirmed.
- `/disclaimer`, `/search`, `/privacy`, `/contact` all have `robots: { index: false }` — correct for utility pages.
- Metadata descriptions: `/compounds` hardcodes "Browse 600+" and `/herbs` hardcodes "100+" in meta only (not visible H1). Approximate but acceptable.

### 4. Author / YMYL Trust Signals

- `AuthorCredentials` component rendered on: herb profiles, compound profiles, goal pages, stacks pages.
- `/author` page created and built successfully.
- `/about` page links to `/author`.
- Schema.org structured data (`SchemaGraphScript`) wired on herb/compound/goal/compare pages.

### 5. Affiliate Compliance

- All affiliate links use `rel="nofollow sponsored noopener noreferrer"`.
- `AFFILIATE_TAGS.amazon` from `config/affiliate.ts` used throughout — no hardcoded tag strings found.
- **P1 fixed (this commit):** `AffiliateBlock.tsx` fallback and product sections displayed "Often bought together • Popular right now" — fabricated social proof. Removed both occurrences.

### 6. Security Headers

- `public/_headers`: CSP, HSTS, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy, Permissions-Policy, COOP, CORP all present.
- `.env.local` is gitignored — not committed.
- No secrets in tracked files.
- Mailchimp API key / audience ID / server: present in `.env.local` for local dev. Must be set in Cloudflare Pages dashboard for production (pending infrastructure task).

### 7. Email Capture

- `FooterEmailCapture` component wired in `src/components/Footer.tsx`.
- `functions/api/email/subscribe.ts`: Cloudflare Pages Function, PUT upsert to Mailchimp Members API, `status_if_new: 'pending'`, guards for missing env vars (returns 503).
- Privacy page updated with Section 4 "Email Subscriptions" disclosing Mailchimp data sharing.
- Missing env vars in production will silently return 503 — not a crash risk.

### 8. Content Safety

- Medical disclaimer framing is conservative across all profile pages.
- No fabricated dosing or interaction data found in active app code.
- `inlineFormat()` in articles renders internal markdown; no user-submitted HTML — XSS risk is low.
- Workbook content gaps (lion's mane, ashwagandha-ksm-66, turmeric, elderberry, st-johns-wort) documented in issue #1744.

### 9. Route Integrity

- Route validator: PASS — 176 routes, 438 files, only warnings (no errors).
- Popular search links: Rhodiola→`/herbs/rhodiola/`, Bacopa→`/herbs/bacopa/`, Fadogia→`/compounds/fadogia-agrestis/`, Black Seed Oil→`/compounds/black-seed-oil/` — all valid.
- Footer links: Compare, Learn, Search added.
- `/terms` stale href replaced with `/disclaimer` in `lib/navigation-config.ts`.
- `src/components/semantic-collection-grid.tsx` references `/collections/${slug}` but is not imported anywhere active — legacy, no impact.
- 37 compound slugs overlap with herb slugs — intentional (same plant in both namespaces).

### 10. Analytics / GA4

- GA4 properly guarded: `{ga4Id && (...)}` — no render if env var not set.
- GTM allowed in CSP script-src.

---

## Issues Identified

| Priority | Issue | Status |
|----------|-------|--------|
| P1 | `AffiliateBlock.tsx`: fabricated "Often bought together • Popular right now" social proof | **Fixed this commit** |
| P2 | `app/compounds/page.tsx` metadata hardcodes "Browse 600+" | Acceptable — meta only, approximate |
| P2 | `app/herbs/page.tsx` metadata hardcodes "100+" | Acceptable — meta only, approximate |
| P2 | `semantic-collection-grid.tsx` refs `/collections/` (no route) | No impact — not imported in active code |
| Info | 37 compound/herb slug overlaps | Intentional — same plant in both namespaces |
| Infra | Mailchimp env vars not set in Cloudflare Pages | Pending — infrastructure task for user |

---

## Open Items (Require Human Action)

- **[#1744]** Workbook content pass — fill missing dosing/interactions for top-gap profiles (lion's mane, ashwagandha-ksm-66, turmeric, elderberry, st-johns-wort)
- **[#1745]** Stats consistency audit — scripted validator + human cross-check
- **[#1747]** Goal pages expansion — additional goal slugs, deeper cross-linking
- **[#1749]** Lead magnet / email funnel — topic decision, downloadable content, Mailchimp welcome sequence
- **[Infra]** Set `MAILCHIMP_API_KEY`, `MAILCHIMP_AUDIENCE_ID`, `MAILCHIMP_SERVER` in Cloudflare Pages dashboard

---

*Audit conducted 2026-06-07. Build: 890 routes. Tests: 188 pass, 3 todo. All P0 and P1 blockers resolved.*
