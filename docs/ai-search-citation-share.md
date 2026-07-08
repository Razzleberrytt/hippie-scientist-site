# AI Searchability & Citation-Share Roadmap

Purpose: make The Hippie Scientist easier for AI search engines, answer engines, and citation systems to understand, quote, and cite without weakening editorial quality or creating fake authority signals.

## Current baseline

- Canonical host is `https://thehippiescientist.net`, not the `www` host.
- `app/robots.ts` allows public crawling and blocks internal/API/draft/temp routes.
- `app/sitemap.ts` emits canonical, indexable routes and avoids generated compare pages that are not actually built.
- `components/References.tsx` renders visible reference lists with stable `#ref-N` anchors.
- `components/seo/AuthorityJsonLd.tsx` and `src/lib/schema-graph.ts` already provide JSON-LD patterns for WebPage, Article, MedicalWebPage, FAQPage, BreadcrumbList, ItemList, author, publisher, reviewedBy, dateReviewed, and dateModified signals where used.

## Priority 1: Make the site easy for AI crawlers to understand

- Add and maintain `/llms.txt` as a human-readable AI discovery file.
- Keep `/llms.txt` focused on canonical URLs, preferred citation targets, and safety/medical-advice boundaries.
- Do not expose internal JSON endpoints, dashboards, draft routes, preview routes, or temporary tooling.
- Keep canonical URLs consistent with sitemap output and redirects.

Acceptance checks:

- `/llms.txt` exists in the static export.
- `/llms.txt` points to canonical, live URLs only.
- No noncanonical `/compare/*` URL is listed when the canonical page lives at `/guides/compare/*`.

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

Suggested npm script:

```json
"audit:ai-citations": "node scripts/ci/audit-ai-citation-readiness.mjs"
```

## Priority 6: Roll out by page type, not randomly

Order of operations:

1. Compare pages with Semrush/GSC traction.
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
- It can become the template for future compare pages.

## Codex implementation prompt

```text
You are working in Razzleberrytt/hippie-scientist-site.

Goal: improve AI searchability and citation share without creating fake SEO signals.

Implement an AI-citation-readiness pass with these constraints:

1. Preserve canonical route policy.
   - Do not create duplicate indexable /compare/* pages.
   - Use /guides/compare/* as canonical for built compare pages.

2. Keep /public/llms.txt accurate.
   - Ensure it is included in static export.
   - Ensure all listed URLs are canonical and public.
   - Do not list internal JSON/data/dashboard/preview routes.

3. Create a reusable CitationReadySummary component.
   - Location: components/seo/CitationReadySummary.tsx
   - Props: answer, bestFor, evidenceLevel, safetyNote, notClaiming, referencesHref.
   - Render readable, scannable text for humans.
   - Do not use hidden text.

4. Upgrade the melatonin vs magnesium page first.
   - File: app/guides/compare/melatonin-vs-magnesium/page.tsx
   - Add the CitationReadySummary near the top after the intro.
   - Include a concise answer, best-fit bullets, evidence level, safety note, and references jump.
   - Keep the content natural; do not keyword-stuff.
   - Keep existing references visible.

5. Improve References component accessibility and citation readiness.
   - File: components/References.tsx
   - Keep existing visual behavior.
   - Add aria-label and stable anchor behavior.
   - Do not invent citation metadata.

6. Add a lightweight audit script.
   - File: scripts/ci/audit-ai-citation-readiness.mjs
   - It should scan built app guide/compare pages and report missing quick answer/citation summary/references/schema signals.
   - Make it advisory first; do not fail CI yet.
   - Add npm script: audit:ai-citations.

7. Validation:
   npm run typecheck
   npm run lint
   npm run build

Report files changed, exact URLs improved, and any skipped SEO suggestions such as fake AggregateRating schema.
```

## Do not do

- Do not add fake aggregate ratings.
- Do not add hidden keyword text.
- Do not cite studies that are not actually referenced.
- Do not list noncanonical redirected URLs in `/llms.txt`.
- Do not expose private/internal/generated data routes as citation targets.
