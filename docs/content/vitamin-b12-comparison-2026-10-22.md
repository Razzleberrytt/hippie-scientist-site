# Vitamin B12 comparison — B12-COMPARE-001

Owner-directed scope: #6670 comment 6280536899, reconfirmed directly October 22.
Starting main: a115b205e. Status: in progress; one unmerged PR for human review.

Reuse: psyllium page/content layout, ResponsiveTable, AuthorityJsonLd,
AuthorityBreadcrumbs, AffiliateDisclosure and LegacyGuideFAQ. No schema/database,
workbook or pipeline change is needed. Existing B12 ingredient profiles serve
monograph intent; the new guide owns form/route buying comparison intent.

Product inspection: all three B12 catalog entries are search-only, with no
verified ASIN. Four form searches will be labeled explicitly; injections are not
sold or linked. Do not reuse the catalog's unsupported methyl “bypasses conversion”
ranking rationale.

## Source verification

All 16 included PMIDs were fetched from NCBI PubMed E-utilities XML before
inclusion. PMID, title, abstract, population, comparator, outcome, dose and
limitations were checked. The [verification manifest](vitamin-b12-pubmed-verification-2026-10-22.json)
retains identities, URLs and abstract SHA-256 hashes without republishing abstracts.
UNI-PHARMA supply/no-company-role disclosures were also checked in PMC7912007;
Merck Sharp & Dohme support is in the metformin trial's PubMed conflict statement.
Funding details remain unresolved for some older reports; no independent
scientific review or publication approval is implied.

| PMID | Page role |
|---|---|
| 25820384 | Four-form processing and no established coenzyme superiority |
| 29543316 | Oral versus injection review; low-certainty serum endpoints |
| 14616423 | Small sublingual versus swallowed comparison |
| 29499976 | Vegan/vegetarian marginal deficiency, 50 mcg/day vs 2,000 mcg/week |
| 15911731 | Older adults with mild deficiency; dose-response biomarkers |
| 33513879 | Selected metformin/neuropathy trial, positive and null endpoints |
| 20488910 | Randomized metformin deficiency-risk evidence |
| 24327038 | PPI/H2 association; no preventive B12 dose trial |
| 28829668 | VITAL supplemental B6/B12 lung-cancer signal, men/smoking boundaries |
| 11282797 | ATBC null serum-B12 finding; not randomized B12 supplementation |
| 30499135 | Pooled serum and genetic lung-cancer analyses; exposure boundaries |
| 28594082 | Five acneiform cases; incidence and exact dose unknown |
| 18606874 | Clinical diagnosis, intrinsic factor and long-term replacement principles |
| 24942828 | Diagnostic/folate guidance; historical guideline boundary |
| 33809274 | Null cognition/mood evidence in adults without overt deficiency |
| 32819927 | OB12: short-term non-inferiority does not establish one-year equivalence |

NIH ODS B12 and folate professional fact sheets were also checked for current
upper-limit and folate-masking explanations, and linked adjacent to those warnings.
This is a selected review, not an exhaustive systematic review.

## Acceptance evidence

- Focused Vitest: 2 files / 6 tests passed (B12 + psyllium). Twelve FAQ answers
  are each 40–60 words and exactly match FAQPage structured data.
- `node scripts/ci/validate-doc-links.mjs`: PASS, 402 Markdown files.
- `npm run check:fast`, production build, output verification and responsive/theme
  browser proof: in progress; no completion claimed yet.
- No verified B12 ASIN: four labeled searches (cyanocobalamin, methylcobalamin,
  oral hydroxocobalamin, adenosylcobalamin), central `AFFILIATE_TAGS.amazon`.
- Scope: new page/content, route-specific tests, comparison-hub discovery link,
  this verification record and authoritative ticket status. No unrelated pages.
- Unverified: actual seller/stock/price/batch purity, clinical or human approval,
  deployment, indexing, traffic, AI citations and revenue. Opportunity range in
  the owner request is not measured capture or a forecast.

