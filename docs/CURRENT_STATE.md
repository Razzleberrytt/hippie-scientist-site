# Current State

**Status:** Authoritative description of the present implementation
**Evidence cutoff:** 2026-08-21
**Labels:** **Verified** = reproduced from code, generated data, CI, GitHub, or live output; **Inferred** = supported but not directly measured; **Unknown** = access or evidence unavailable; **Recommended** = proposed next action, not current behavior.

## Executive summary

**Verified:** The Hippie Scientist is a deployed, statically exported Next.js content and decision-support site with herb and compound monographs, guides, comparisons, learning pages, active legacy article and goal surfaces, evidence citations, safety fields, affiliate links, email-capture code, and consent-gated analytics instrumentation. Its latest inspected deployment succeeded, core sampled pages were server-rendered and self-canonical, and sampled affiliate disclosures preceded commercial links.

**Verified:** The repository does not currently demonstrate a complete measured growth loop. Search, engagement, affiliate-click, revenue, and email performance exports were unavailable. At the inspected main commit, deployment passed while schema/media governance, site health, and Lighthouse workflows failed. The reset's local validation cleared the cluster-member site-health defect, while schema policy still reports 38 identity violations and the prior Lighthouse failure remains unresolved. Evidence-governance rules also demote most generated profiles from indexing; sampled flagship ashwagandha and L-theanine profiles were live but `noindex, follow`.

**Inferred:** The immediate constraint is not a lack of pages or architecture. It is reliable measurement plus recovery of trustworthy, indexable, high-intent pages under the existing evidence rules.

## Product

### User-facing product and problems addressed

**Verified:** The current product provides:

- herb profiles at `/herbs/:slug` and compound profiles at `/compounds/:slug`;
- discovery guides under `/guides/*`, including ADHD, anxiety, sleep, focus, herb, comparison, and best-of clusters;
- education and trust pages under `/learn/*`, `/info/*`, and `/evidence/*`;
- active `/articles/*` and `/goals/*` pages, even though repository guidance describes these as legacy compatibility surfaces;
- search, related-content links, citations, evidence summaries, safety context, comparison tables, decision aids, affiliate offers, disclosures, and newsletter forms where a template supplies them.

**Verified:** Live checks of the homepage, indexes, representative herb/compound pages, a sleep guide, a comparison, a goal page, an article, the affiliate disclosure, and newsletter pages returned HTTP 200 with a single H1, self-canonical URL, meaningful HTML text, and JSON-LD. This was a sampled check, not full-site certification.

### Evidence, citations, and safety

**Verified:** Current generated profile JSON contains 359 claim-map records across 187 profiles. The citation export contains 849 studies in JSON, BibTeX, and RIS forms. The workbook safety audit read 293 herb and 588 compound rows; all rows had safety context, while 293 herb and 306 compound rows had structured flags or contraindication data. The audit also reported 51 deliberate abstentions where flags were left blank pending evidence.

**Verified:** The build applies production publication invariants and uses `noindex` as a governance hold when evidence, summary, or safety contracts are not met. The fresh 2026-08-21 local production export built 847 profile pages: 68 `index,follow` and 779 `noindex` (61 indexable herbs and 7 indexable compounds). Its sitemap exposed 63 herb and 7 compound detail URLs. Those numbers are not interchangeable: one is emitted page policy and one is sitemap membership.

**Verified:** A separate evidence-engine data surface for sleep, stress, focus, and anxiety currently validates zero claims and zero safety notes. It exists but is not a populated evidence source.

### Conversion and revenue

**Verified:** Affiliate configuration is centralized in `config/affiliate.ts`, supports an environment override, and currently falls back to the Amazon tag `razzleberry02-20`. A source audit found 276 configured affiliate destinations: 30 explicit ASIN links and 246 Amazon search-result fallbacks. Sampled live links carried the configured tag and `sponsored nofollow` treatment.

**Verified:** Global click instrumentation captures affiliate impressions/clicks and sends governed revenue events after consent. Newsletter UI and Cloudflare Pages Functions for Mailchimp subscription and Turnstile/rate-limit protection exist.

**Unknown:** Production GA4/Ahrefs configuration, event receipt, Amazon Associates results, Mailchimp delivery, conversion rates, and revenue were not available. No GA/Ahrefs build variable was visible in inspected repository variables, and no analytics export was provided. This is not proof that external production configuration is absent.

### Current differentiators and limitations

**Verified differentiators:** structured monograph data, claim/source mapping, safety contracts, publication demotion rather than silent overclaiming, comparison/guide clusters, exportable citations, and evidence-first decision-page standards.

**Verified limitations:** most profiles are withheld from indexing; several current release gates fail; key generated manifests disagree; commercial measurement is unverified; most configured product links are generic searches; and duplicate/thin intent surfaces remain.

## Technical

### Framework, runtime, and deployment

**Verified:** The site uses Next.js 15.5.22, React 18.3, TypeScript 5.8, Vitest 4.1, and Node 20–24 (`.nvmrc` is 22). `next.config.mjs` sets `output: 'export'`, trailing slashes, and unoptimized images. Cloudflare Pages deploys the `out/` directory.

**Verified:** Next.js API routes, middleware, server actions, runtime revalidation, and other server-only Next features cannot run in this export. Separate Cloudflare Pages Functions provide `/api/subscribe`, `/api/subscribe-safety`, and selected legacy-route handling at the edge.

### Repository and data architecture

**Verified:** Active implementation is centered on `app/`, root `components/`, `lib/`, `config/`, selected `src/` modules, `content/`, `scripts/`, and `public/data/`. `tsconfig.json` explicitly excludes substantial older `src/pages`, `src/app`, component, and library surfaces; their presence does not prove they are active.

**Verified:** The primary structured source is `data-sources/herb_monograph_master.xlsx`. `npm run data:build` validates and generates publish artifacts in `public/data/`. Current generated arrays hold 291 herbs and 565 compounds (856 records); the workbook audit observes 881 rows before generation normalization/deduplication.

**Verified:** Content Collections compiles Markdown/MDX sources. The `content/` tree has 67 files: 40 Markdown, 21 MDX, and 6 TypeScript/config files. Counts by current source grouping include 36 article sources, 11 older blog sources, 3 comparison sources, 9 guide sources, and one learn source. Many App Router guide pages are implemented directly rather than represented by those source counts.

**Verified:** Workbook parsing emits an ExcelJS namespace warning and then uses a normalized/streaming fallback successfully. This is an operational fragility, not a demonstrated data-loss failure.

### Build, tests, and CI/CD

**Verified:** `package.json` exposes 204 scripts spanning data generation, validation, SEO, evidence, safety, revenue, performance, and deployment checks. The repository contains 40 GitHub workflow files. The deployment workflow runs tests, data CI, static export, lint/type checks, source guards, trust audits, output verification, affiliate-tag auditing, Cloudflare deployment, and IndexNow submission.

**Verified:** At commit `24e50c56c` on 2026-08-21, Deploy and core CI workflows succeeded, while Schema and Media Governance, Site Health Check, and Lighthouse failed. During this reset, a fresh local production build and full output verification passed, and the strict cluster-member trust audit cleared the site-health runtime mismatch. Full schema policy still fails with 38 first-party identity issues; Lighthouse was not rerun locally. Production deployment is functioning, but the quality system is not fully green.

### SEO implementation

**Verified:** Metadata, canonicals, robots directives, sitemap generation, redirects, JSON-LD, and internal-link auditing are implemented. The inspected live sitemap contained 486 canonical apex URLs; a 20-URL sample returned 200. A current redirect validation reported 1,398 rules with no chains or missing exported targets.

**Verified:** Live `robots.txt` advertised only the main sitemap, while current source code advertises the main and localized sitemaps. This may be deployment timing or cache drift; cause is unknown.

**Verified:** A source content audit found four duplicate-intent route pairs, 55 pages below its 500-word heuristic, one definite source orphan, 32 orphan-undeterminable pages, 11 internal links through redirects, no broken links, and no hardcoded affiliate tags. Thinness is a diagnostic, not proof a page is low quality.

### Analytics and operational dependencies

**Verified:** Analytics loading is consent-gated and controlled by `NEXT_PUBLIC_GA4_ID` and/or an Ahrefs key. Affiliate and funnel events are instrumented in code.

**Unknown:** Whether those identifiers are set in the production build and whether events reach a reporting property. Search Console service-account credentials were unavailable; repository scripts could not fetch a baseline. Cloudflare environment values, analytics-property access, Amazon reports, Mailchimp reports, and a reliable revenue baseline were unavailable.

## Content inventory

Counts below use explicit definitions because source files, generated records, built routes, sitemap membership, and indexed URLs are different populations.

| Content type | Verified count | How determined | Important boundary |
|---|---:|---|---|
| Herb records | 291 generated; 293 workbook rows | `public/data` arrays and `npm run audit:safety` | Not the number indexed; live sitemap had 63 herb detail URLs |
| Compound records | 565 generated; 588 workbook rows | `public/data` arrays and safety audit | Not the number indexed; live sitemap had 7 compound detail URLs |
| Built profile routes | 847 in inspected CI build | Production build log | 773 were `noindex` in that run |
| Articles | 46 live sitemap URLs; 36 current article source files | Live sitemap family count and `content/` inventory | Includes an active legacy route family; source and route counts differ |
| Guides | 169 live sitemap URLs | Live sitemap family count | Includes hubs and comparison/best-of pages |
| Comparisons | 40 source pages identified by internal-link audit | `npm run audit:links` | Audit scope; comparison intent also exists outside one directory |
| Goal pages | 17 live sitemap URLs | Live sitemap family count | Active despite legacy designation in project guidance |
| Category hubs | 12 guide cluster hubs plus `/guides/` | `app/guides/*/page.tsx` inventory | Defined here as direct guide-cluster index pages |
| Learn pages | 75 live sitemap URLs | Live sitemap family count | Includes educational and utility content |
| Evidence claim records | 359 across 187 profiles | Generated detail JSON claim maps | Other evidence text is not included |
| Citation records | 849 | `public/data/exports/citations.json`, `.bib`, and `.ris` | Exported study records, not unique claims |
| Localized sitemap URLs | 48 (12 each for de/es/fr/pt) | Live localized sitemap inventory | Live robots discovery of these sitemaps was not confirmed |
| Total live main-sitemap URLs | 486 | Live `sitemap.xml`, 2026-08-21 | Sitemap membership is not Google index coverage |

**Unknown:** Google-indexed page count, pages with impressions, pages with clicks, and unique canonical content-type totals across all route aliases require Search Console and an agreed canonical taxonomy.

## Verified problems and risks

| Issue | Evidence | Likely impact | Confidence | Blocks | Recommended next action |
|---|---|---|---|---|---|
| The growth loop is not measurably closed | Analytics/event code exists, but GA4, GSC, affiliate, revenue, and Mailchimp reports/configuration were unavailable | Page and revenue priorities cannot be selected from outcomes; conversion failures may be invisible | High for missing baseline; Medium for production configuration inference | Measurement, revenue, agent execution | Execute `REV-001`, then import a fixed-period baseline |
| Most generated profiles are not indexable | Fresh local output reported 779/847 profiles `noindex`; live ashwagandha and L-theanine pages were `noindex`; local/live sitemap exposed 70 profile detail URLs | Large depth layer cannot acquire organic traffic; flagships cannot support decision journeys | High | Indexing, traffic, revenue | Reconcile final manifests and repair reviewed evidence roles; never bypass the gate |
| Current quality workflows are not all green | Full local schema policy still reports 38 blocking identity issues; prior Lighthouse workflow failed performance thresholds. The cluster-member runtime mismatch was fixed and strict-audited locally | Lower release confidence, structured-data inconsistency, and slower UX | High | Users, indexing, agent execution | Execute SEO-003 and PERF-001; confirm CI after merge |
| Generated publication truth is inconsistent across phases/artifacts | `publication-index.json`, publication manifest, build logs, invariant reports, and sitemap counts disagree; deterministic phases produced different eligible totals | Agents can optimize against stale counts; indexability regressions are harder to detect | High | Indexing, measurement, safety, agent execution | Produce one post-invariant manifest and assert parity with robots and sitemap |
| Duplicate intent and weak source pages remain | Content audit found four duplicate route pairs, 55 thin pages, one definite orphan, and 11 redirect-hop links | Split signals, confusing journeys, wasted crawl/internal-link equity | High for audit findings; Medium for business impact | Indexing, users | Resolve owner/redirect decisions route by route, starting with exact duplicates |
| Commercial inventory is mostly generic Amazon searches | 246 of 276 configured affiliate destinations are search fallbacks | Lower relevance and conversion; product availability and destination quality are uncertain | High | Revenue, user trust | Validate only the selected flagship page after measurement identifies it |
| Documentation and backlog control had fragmented | 321 docs files; stale control documents; a corrupt compressed 1,000-ticket seed; a separate 375-ticket ops backlog; old master backlog claimed completed infrastructure | Agents can select obsolete or contradictory work and overstate completion | High | Agent execution | Use the eight authoritative control docs; classify old systems as legacy |
| Live robots and current source disagree on localized sitemap declarations | Live response listed only main sitemap; `app/robots.ts` lists main and localized sitemaps | Localized discovery may be weaker or deployment may not match source | Medium | Indexing | Verify after the next production deploy and check CDN cache/source parity |
| Performance budget is failing on representative pages | Latest Lighthouse workflow failed CLS, LCP, and TBT assertions while accessibility passed | Search/user experience and conversion may suffer | High | Users, revenue | Address measured templates after measurement and indexability P0s |
| Open change queue is large and overlapping | 45 open PRs and 35 open issues at audit time, including overlapping performance and evidence-governance work | Merge drift, duplicate work, stale assumptions | High | Agent execution | Triage by current sprint and close/supersede duplicates with evidence |
| Workbook reader relies on fallback behavior | ExcelJS full read warns/fails on namespace metadata; normalized streaming fallback completes | Future library/input changes could break publishing unexpectedly | Medium | Agent execution, publishing | Add a fixture regression test before changing workbook tooling |

## Inferences, unknowns, and recommendations

### Inferred

- The site has more content supply than validated demand and conversion evidence.
- The evidence-governance system is correctly conservative in intent but operationally difficult to observe and reconcile.
- Fixing measurement and recovering a small set of qualified, evidence-complete pages should create more value than broad content production.

### Unknown

- Search impressions, clicks, CTR, average position, and actual Google index coverage.
- Sessions, engagement, scroll depth, return visits, and decision-page engagement.
- Affiliate clicks received by analytics, Amazon orders/revenue, RPM, and page-level conversion.
- Email delivery and signup conversion.
- The highest-potential commercial landing page based on real demand.
- Production environment values not exposed through repository/GitHub inspection.

### Recommended

Execute [CURRENT_SPRINT.md](CURRENT_SPRINT.md) in priority order. First verify production measurement, then reconcile post-build publication truth, use a 28-day baseline to select one flagship decision page, and upgrade only that measured journey while current evidence/safety gates remain mandatory.
