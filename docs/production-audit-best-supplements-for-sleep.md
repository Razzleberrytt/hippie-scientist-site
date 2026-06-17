# Production Audit — `guides/best-supplements-for-sleep`

**File audited:** `app/guides/best-supplements-for-sleep/page.tsx`
**Audit date:** 2026-06-16
**Auditor:** Antigravity (AI Production Audit)
**Mission:** 009.5

---

## Summary

| Category | Issues Found | Highest Severity |
|---|---|---|
| Citation Accuracy | 1 | Medium |
| Dosage Accuracy | 3 | Medium |
| Safety Statements | 2 | Medium |
| Internal Links | 2 | Critical |
| Duplicate Content Risk | 1 | Medium |
| Search Intent Coverage | 1 | Low |
| EEAT Compliance | 2 | Medium |
| Schema Validity | 1 | Medium |

**Total issues: 13**

---

## 1. Citation Accuracy

### Issue CA-1 — No inline citations or source attribution on any claim
**Severity:** Medium
**Explanation:** The page makes graded evidence claims (e.g., "A for jet lag and delayed sleep phase", "B – consistent benefit in older adults") but provides zero inline references or links to primary literature, systematic reviews, or the site's own sourced compound/herb profile data. Google's Quality Rater Guidelines explicitly look for corroborating evidence on health claims.
**Suggested correction:** Add a "Evidence drawn from compound profiles" callout with links to the PubMed-backed compound profiles (`/compounds/melatonin`, `/herbs/ashwagandha`, etc.) that already carry citation data. This aligns with the approach used in the passionflower guide page.

---

## 2. Dosage Accuracy

### Issue DA-1 — Valerian dose standardization percentage not corroborated by site data
**Severity:** Medium
**Explanation:** The page states `300–600 mg of standardized extract (0.8% valerenic acid)`. The site's internal data (`herbs-detail/valerian.json`, `herbs-detail/valeriana-officinalis.json`) does not specify a valerenic acid standardization percentage. The 0.8% figure is a commonly cited industry standard but the site data does not corroborate it. A discrepancy will exist if the herb profile is updated from a different source.
**Suggested correction:** Either verify this figure against a cited study and link to the `herbs/valerian` profile, or soften to "standardized extract" without specifying the valerenic acid percentage until confirmed.

### Issue DA-2 — Ashwagandha standardization claim conflates KSM-66 and Sensoril specs
**Severity:** Medium
**Explanation:** The page states `standardized extract (≥5% withanolides)`. KSM-66 is standardized to a minimum of 5% withanolides; Sensoril uses a different standardization marker (typically 10% withanolides). The page's evidence description calls out KSM-66 by name, making the ≥5% figure accurate for that extract specifically. Grouping them together may mislead users comparing KSM-66 vs. Sensoril products.
**Suggested correction:** Clarify with a parenthetical: `(KSM-66 standard; Sensoril uses a different marker)`.

### Issue DA-3 — Melatonin upper dose of 3–5 mg contradicts the "Common mistakes" section
**Severity:** Medium
**Explanation:** The dose card states `up to 3–5 mg for general onset`. The page's own "Common mistakes" section states `0.5 mg is often as effective as 10 mg for circadian support`. Published systematic reviews consistently find doses >1–3 mg provide no proportionally greater benefit and increase next-day grogginess risk. The internal inconsistency is visible to the reader.
**Suggested correction:** Cap the dose card upper range at `up to 3 mg` and note that doses above 1 mg show diminishing returns. This resolves the contradiction without removing clinically useful context.

---

## 3. Safety Statements

### Issue SS-1 — Ashwagandha thyroid warning is vague
**Severity:** Medium
**Explanation:** The safety note states `avoid in thyroid conditions without supervision`. Ashwagandha is documented to increase T3/T4 levels in some studies and can interact with levothyroxine dosing. The phrasing "thyroid conditions" does not distinguish between hypothyroid and hyperthyroid cases, and "without supervision" underspecifies the risk for users on thyroid medication.
**Suggested correction:** Update to: `Caution in thyroid disorders — may alter thyroid hormone levels (T3/T4); those on thyroid medication should consult a clinician before use.`

### Issue SS-2 — Valerian safety note omits pregnancy and pediatric contraindication
**Severity:** Medium
**Explanation:** The valerian safety note covers sedative/alcohol interaction but omits pregnancy risk. Valerian is classified as "likely unsafe" in pregnancy per Natural Medicines and is not recommended for children. The page's audience will include pregnant users searching for natural sleep aids.
**Suggested correction:** Append to the valerian safety note: `Not recommended during pregnancy or for children.`

---

## 4. Internal Links

### Issue IL-1 — `/herbs/passionflower` resolves to a 404 on static export (CRITICAL)
**Severity:** Critical
**Explanation:** Line 80 in `SLEEP_SUPPLEMENTS` sets the Passionflower `href` to `/herbs/passionflower`. The actual herb slug in `public/data/herbs-summary.json` and `herbs-detail/` is `passiflora-incarnata`. No `passionflower.json` exists in `herbs-detail/` and no `app/herbs/passionflower/` route exists. On a static export this will produce a 404. A dedicated guide page does exist at `app/guides/passionflower/page.tsx`.
**Suggested correction:** Change `SLEEP_SUPPLEMENTS[5].href` on line 80 from `/herbs/passionflower` to `/guides/passionflower`.

### Issue IL-2 — `/guides/sleep-herbs-vs-melatonin` sends users to the discovery-layer stub instead of the full compare page
**Severity:** Medium
**Explanation:** Line 263 links to `/guides/sleep-herbs-vs-melatonin`. The canonical, fully-built version of this content lives at `/compare/sleep-herbs-vs-melatonin` (`app/compare/sleep-herbs-vs-melatonin/page.tsx`) with richer content and proper canonical metadata. The `guides/sleep-herbs-vs-melatonin` page is a discovery-layer stub that internally links *to* the compare page — sending readers on an unnecessary two-hop journey. Other pages on the site (articles, learn pages, compare index) consistently link to the `/compare/` URL.
**Suggested correction:** Change line 263 to `href="/compare/sleep-herbs-vs-melatonin"`.

---

## 5. Duplicate Content Risk

### Issue DC-1 — Near-duplicate intent with `/best-supplements-for-sleep` SEO entry page
**Severity:** Medium
**Explanation:** Two live URLs share identical primary intent (`best supplements for sleep`):
1. `/best-supplements-for-sleep` — the SEO entry page (thin, gateway format)
2. `/guides/best-supplements-for-sleep` — this expanded guide (the richer page)

Both target the same head keyword and list overlapping supplements. The entry page (`/best-supplements-for-sleep`) does not declare a `rel=canonical` pointing to this guide. The `seo-entry-pages.tsx` entry for `best-supplements-for-sleep` has no `canonicalOverride` field. Google may consolidate authority on the thinner page.
**Suggested correction:** Add a canonical override in the SEO entry page config pointing to `/guides/best-supplements-for-sleep`, **or** add a prominent "Full evidence guide →" link on the entry page pointing here. Either approach signals hierarchy to crawlers.

---

## 6. Search Intent Coverage

### Issue SI-1 — "How long does it take to work?" intent not addressed
**Severity:** Low
**Explanation:** A high-frequency modifying query around sleep supplement searches is onset timing. The page covers timing implicitly in dose fields (e.g., "30–60 min before bed") but does not address cumulative-use timing expectations per supplement (except valerian in the "Common mistakes" section). Users may abandon supplements prematurely when they don't work immediately.
**Suggested correction (no new sections):** Append onset-expectation notes to the existing "Typical dose" field per supplement. For example, valerian: `300–600 mg... 30–60 min before bed; allow 2–4 weeks for cumulative effect`. Data-level change only.

---

## 7. EEAT Compliance

### Issue EE-1 — No visible on-page author or reviewer attribution
**Severity:** Medium
**Explanation:** The `StructuredData` component outputs `author: { name: "Will Thomas" }` and `reviewedBy: { name: "Will Thomas" }` in JSON-LD. However, there is **no visible on-page byline or author attribution**. Google's Search Quality Rater Guidelines for YMYL (health) content look for visible evidence of authorship and expertise — schema alone is not sufficient. The schema reviewer and author are the same entity, which is a weak corroboration signal.
**Suggested correction:** Add a minimal byline in or below the hero section: `Reviewed by Will Thomas | Last updated: June 2026`. Link to the existing `/author` page.

### Issue EE-2 — Schema `zone` defaults to `harm-reduction` but page is configured for monetization
**Severity:** Medium
**Explanation:** `StructuredData` is called without a `zone` prop (lines 111–122), defaulting to `zone='harm-reduction'`, which outputs `@type: ['MedicalWebPage', 'Article']`. However, this page appears in the `revenueProductSlugs` config in `seo-entry-pages.tsx` under `'guides/best-supplements-for-sleep': ['magnesium', 'l-theanine']`, indicating commercial intent. If affiliate product cards are added to this page in the future, the `MedicalWebPage` schema type will be inconsistent with the page's commercial nature.
**Suggested correction:** Make the choice explicit. Either pass `zone="monetized"` to align with commercial configuration, or pass `zone="harm-reduction"` and remove the entry from `revenueProductSlugs` if no products will be displayed. Document the decision.

---

## 8. Schema Validity

### Issue SV-1 — `alternates.canonical` uses a relative URL; depends on `metadataBase` being set
**Severity:** Medium
**Explanation:** `alternates: { canonical: '/guides/best-supplements-for-sleep' }` is a relative path. Per the HTML canonical link spec, canonical URLs must be absolute. Next.js resolves relative canonicals correctly **only** if `metadataBase` is declared in the root layout (`app/layout.tsx`). If `metadataBase` is absent or misconfigured, the rendered `<link rel="canonical">` will be a relative URL — technically invalid and potentially ignored by search engines.
**Suggested correction:** Confirm `metadataBase: new URL('https://thehippiescientist.net')` is present in `app/layout.tsx`. If not confirmed, change line 12 to use the full absolute URL: `alternates: { canonical: 'https://thehippiescientist.net/guides/best-supplements-for-sleep' }`.

---

## Verdict

**NOT production ready.**

IL-1 is a hard blocker — the `/herbs/passionflower` link will produce a 404 on static export. All Medium severity items should be resolved before deployment. Low severity items may be deferred to a follow-up content pass.

### Priority fix order

| Priority | Issue ID | Category | Description |
|---|---|---|---|
| 1 | IL-1 | Internal Links | Fix broken `/herbs/passionflower` → `/guides/passionflower` |
| 2 | DA-3 | Dosage | Cap melatonin at 3 mg; resolve contradiction with "Common mistakes" |
| 3 | SS-1 | Safety | Strengthen ashwagandha thyroid safety note |
| 4 | SS-2 | Safety | Add pregnancy/pediatric caution to valerian |
| 5 | EE-1 | EEAT | Add visible on-page author/reviewer byline |
| 6 | IL-2 | Internal Links | Update sleep-herbs link to `/compare/sleep-herbs-vs-melatonin` |
| 7 | DC-1 | Duplicate Content | Establish canonical chain from SEO entry page to this guide |
| 8 | SV-1 | Schema | Verify `metadataBase` in root layout |
| 9 | EE-2 | EEAT | Resolve schema `zone` / monetization configuration intentionality |
| 10 | DA-1 | Dosage | Corroborate valerian 0.8% valerenic acid figure |
| 11 | DA-2 | Dosage | Clarify ashwagandha withanolide% by extract type |
| 12 | CA-1 | Citations | Add citation callout linking to sourced compound profiles |
| 13 | SI-1 | Search Intent | Add onset timing notes to dose fields per supplement |
