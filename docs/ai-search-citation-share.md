# AI Searchability & Citation-Share Roadmap

Purpose: make The Hippie Scientist easier for AI search engines, answer engines, and citation systems to understand, quote, and cite without weakening editorial quality or creating fake authority signals.

## Current baseline

- Canonical host is `https://thehippiescientist.net`, not the `www` host.
- `app/robots.ts` allows public crawling and blocks internal/API/draft/temp routes.
- `app/sitemap.ts` emits canonical, indexable routes and avoids generated compare pages that are not actually built.
- `components/References.tsx` renders visible reference lists with stable `#ref-N` anchors.
- `components/seo/AuthorityJsonLd.tsx` and `src/lib/schema-graph.ts` already provide JSON-LD patterns for WebPage, Article, MedicalWebPage, FAQPage, BreadcrumbList, ItemList, author, publisher, reviewedBy, dateReviewed, and dateModified signals where used.

## Bing AI Performance model

Bing Webmaster Tools' AI Performance reporting changes the optimization target from only ranking/clicks to citation participation. Treat the report as a feedback loop for:

- `Total citations`: how often site content is cited in Microsoft AI experiences.
- `Average cited pages`: whether AI systems are using one isolated URL or multiple supporting pages from the site.
- `Citation timeline`: whether citation activity improves after content refreshes and URL submissions.
- `Grounding queries`: the phrases that caused Bing/Copilot-style systems to retrieve and cite site content.
- `Page-level citation activity`: which exact URLs earn citations and which important pages are missing.

Optimization implication: every important page should be answerable at the passage level, canonical at the URL level, supported at the cluster level, and safe to cite at the claim level.

## Bing-informed KPI definitions

Track these internally when reviewing Bing AI Performance data:

| KPI | What it means | How to improve it |
| --- | --- | --- |
| Citation frequency | How often the site is cited in AI answers | Strengthen exact-answer passages, schema, references, and topical authority |
| Cited-page breadth | How many different canonical pages receive citations | Build clusters around goals, comparisons, safety, and product quality |
| Grounding-query coverage | Whether reported grounding queries have a strong matching page | Map each query to a canonical page and add a visible answer block if weak |
| Citation share by page | Which URLs are carrying AI visibility | Upgrade pages already earning citations first, then close gaps |
| Citation freshness | Whether citation activity responds to updates | Add dateModified/dateReviewed where accurate and submit updated URLs through Bing/IndexNow |

## Priority 1: Make the site easy for AI crawlers to understand

- Add and maintain `/llms.txt` as a human-readable AI discovery file.
- Keep `/llms.txt` focused on canonical URLs, preferred citation targets, and safety/medical-advice boundaries.
- Do not expose internal JSON endpoints, dashboards, draft routes, preview routes, or temporary tooling.
- Keep canonical URLs consistent with sitemap output and redirects.
- Keep compare URLs canonical under `/guides/compare/*`; do not recreate duplicate `/compare/*` indexable pages.

Acceptance checks:

- `/llms.txt` exists in the static export.
- `/llms.txt` points to canonical, live URLs only.
- No noncanonical `/compare/*` URL is listed when the canonical page lives at `/guides/compare/*`.
- The file includes guidance for query-to-page citation matching.

## Priority 2: Make pages quoteable and citation-ready

For flagship pages and pages with search traction, add a consistent citation-ready block near the top:

- `Quick answer`
- `Best fit`
- `Evidence level`
- `Safety note`
- `What this page is not claiming`
- `References` link jump

The goal is not more words. The goal is making the answer extractable without losing nuance.

Recommended component name:

- `components/seo/CitationReadySummary.tsx`

Suggested props:

```ts
type CitationReadySummaryProps = {
  answer: string
  bestFor?: string[]
  evidenceLevel?: string
  safetyNote?: string
  notClaiming?: string
  referencesHref?: string
}
```

## Priority 3: Upgrade references from visible list to structured citation signals

Current `References` output is useful, but it can become more machine-readable.

Improve `components/References.tsx` carefully:

- Keep the visible ordered list.
- Keep stable `id="ref-N"` anchors.
- Add `aria-label="References"` to the section.
- Add `itemScope` / `itemType="https://schema.org/CreativeWork"` where safe.
- Add `rel="noopener noreferrer nofollow"` only if the editorial policy wants nofollow; otherwise keep current outbound citation links clean.
- Support optional fields in refs later:
  - `title`
  - `authors`
  - `journal`
  - `year`
  - `pmid`
  - `doi`

Do not invent citation metadata. Only use fields already known from source content or workbook data.

## Priority 4: Improve article JSON-LD for cite-worthy pages

For high-value guide and compare pages, prefer schema that includes:

- `@type`: `Article` or `MedicalWebPage` + `WebPage` where medically adjacent
- `headline`
- `description`
- `url`
- `mainEntityOfPage`
- `author`
- `publisher`
- `dateModified`
- `dateReviewed` when true
- `about`
- `citation` only when citation URLs/metadata are real
- `breadcrumb`
- FAQ schema only when the FAQ is visible on the page

Do not add fake Review or AggregateRating schema.

## Priority 5: Build a citation-share audit script

Add a script that reports whether indexable pages have the minimum citation-readiness features.

Suggested script:

- `scripts/ci/audit-ai-citation-readiness.mjs`

Checks:

- Page has indexable metadata/canonical.
- Page is in sitemap if indexable.
- Page has an H1.
- Page has a quick-answer or summary block.
- Page has visible references when making evidence claims.
- Page links to methodology/disclaimer/safety context where appropriate.
- Page has JSON-LD.
- Page avoids fake ratings/reviews.
- Page has canonical internal links to relevant hubs.
- Page includes Bing-relevant answer structure: direct answer, comparison, safety, evidence, and next-step context.

Suggested npm script:

```json
"audit:ai-citations": "node scripts/ci/audit-ai-citation-readiness.mjs"
```

## Priority 6: Add a Bing AI Performance workflow

When Bing Webmaster Tools shows AI Performance data, use this loop:

1. Export or record the top grounding queries.
2. Group queries by intent: comparison, goal, safety, dosing, product quality, specific herb/compound.
3. Map every query to one canonical URL.
4. For each high-value query with no clear target page, create or upgrade one page — do not scatter answers across many weak pages.
5. For each cited page, inspect whether the cited passage is safe, nuanced, and directly quotable.
6. Add internal links from the cited page to its support cluster so AI systems can cite multiple pages when useful.
7. Refresh `dateModified` only when meaningful editorial changes were made.
8. Submit changed canonical URLs through Bing URL Submission/IndexNow.
9. Recheck total citations, average cited pages, grounding queries, and page-level citation activity after Bing refreshes.

## Priority 7: Roll out by page type, not randomly

Order of operations:

1. Compare pages with Semrush/GSC/Bing grounding-query traction.
2. Goal hubs: sleep, stress, anxiety, focus.
3. Money guides and best-supplement pages.
4. Herb/compound profiles that already pass indexability gates.
5. Lower-priority long-tail pages only after the system is stable.

## Flagship implementation target

Start with:

- `/guides/compare/melatonin-vs-magnesium/`

Why:

- It has clear search intent.
- It has visible references.
- It has comparison structure.
- Semrush already flagged content/semantic improvements.
- Bing AI Performance can evaluate whether the page earns citations for grounding queries like `melatonin vs magnesium`, `magnesium glycinate vs melatonin`, `can you take magnesium and melatonin together`, and `melatonin side effects vs magnesium side effects`.
- It can become the template for future compare pages.

## Codex implementation prompt

```text
You are working in Razzleberrytt/hippie-scientist-site.

Goal: optimize AI searchability and citation share using Bing Webmaster Tools AI Performance concepts: total citations, average cited pages, grounding queries, citation timeline, and page-level citation activity.

Implement an AI-citation-readiness pass with these constraints:

1. Preserve canonical route policy.
   - Do not create duplicate indexable /compare/* pages.
   - Use /guides/compare/* as canonical for built compare pages.
   - Add redirects only when needed; do not split citation signals.

2. Keep /public/llms.txt accurate.
   - Ensure it is included in static export.
   - Ensure all listed URLs are canonical and public.
   - Do not list internal JSON/data/dashboard/preview routes.
   - Keep the AI citation and Bing grounding-query guidance aligned with real canonical pages.

3. Create a reusable CitationReadySummary component.
   - Location: components/seo/CitationReadySummary.tsx
   - Props: answer, bestFor, evidenceLevel, safetyNote, notClaiming, referencesHref.
   - Render readable, scannable text for humans.
   - Do not use hidden text.
   - The block should be extractable as a safe AI answer passage.

4. Upgrade the melatonin vs magnesium page first.
   - File: app/guides/compare/melatonin-vs-magnesium/page.tsx
   - Add the CitationReadySummary near the top after the intro.
   - Include a concise answer, best-fit bullets, evidence level, safety note, and references jump.
   - Add direct subheadings that match likely Bing grounding queries:
     - Melatonin vs magnesium: quick answer
     - Magnesium glycinate vs melatonin: the core difference
     - Can you take magnesium and melatonin together?
     - Side effects: melatonin vs magnesium
     - Which is better for staying asleep?
   - Keep the content natural; do not keyword-stuff.
   - Keep existing references visible.
   - Add links to /guides/sleep/, /safety-checker/, /info/dosing/, and relevant compound pages.

5. Improve References component accessibility and citation readiness.
   - File: components/References.tsx
   - Keep existing visual behavior.
   - Add aria-label and stable anchor behavior.
   - Add machine-readable structure only for fields that already exist.
   - Do not invent citation metadata.

6. Improve structured data for cite-worthy pages.
   - For compare detail pages, support real citation URLs in JSON-LD when refs are passed.
   - Do not add fake AggregateRating, Review, or medical claims.
   - FAQ schema only if the questions and answers are visibly rendered on the page.

7. Add a lightweight audit script.
   - File: scripts/ci/audit-ai-citation-readiness.mjs
   - It should scan built app guide/compare pages and report missing quick answer/citation summary/references/schema/internal-link signals.
   - Add Bing-specific checks: likely grounding-query headings, citation target links, and no noncanonical /compare/* links.
   - Make it advisory first; do not fail CI yet.
   - Add npm script: audit:ai-citations.

8. Validation:
   npm run typecheck
   npm run lint
   npm run build

Report files changed, exact URLs improved, Bing AI Performance metrics targeted, and any skipped SEO suggestions such as fake AggregateRating schema.
```

## Do not do

- Do not add fake aggregate ratings.
- Do not add hidden keyword text.
- Do not cite studies that are not actually referenced.
- Do not list noncanonical redirected URLs in `/llms.txt`.
- Do not expose private/internal/generated data routes as citation targets.
- Do not chase every grounding query with a new thin page; strengthen canonical pages and clusters first.
