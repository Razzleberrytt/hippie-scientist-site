# Search Console Coverage Diagnosis — 2026-06-17

Source: Google Search Console "Page indexing" exports for `thehippiescientist.net`
(coverage summary, sitemap-scoped coverage, and two issue drilldowns — "Discovered –
currently not indexed" and "Not found (404)").

This document records the diagnosis, the root cause of the largest issue cluster, the code
hardening shipped alongside it, and the operator action items that must be done in GSC /
Cloudflare (they cannot be fixed in the repo).

---

## 1. Headline

The site is **not** being deindexed. The "All known pages" property holds steady at
**~1,050 indexed**. The problem is **crawl-budget waste**: a large backlog of `404` and
`redirect` URLs is consuming Googlebot's attention so that legitimate, in-sitemap pages sit
"Discovered – currently not indexed" and never get fetched.

| Reason | Pages | Read |
|---|---|---|
| **Not found (404)** | **1,806** | Historical phantom `/compare/*` URLs (see §3). Self-healing. |
| Page with redirect | 678 | Intentional 301s being re-crawled. Wasted budget, not errors. |
| Excluded by `noindex` | 186 | Audit intent; mostly deliberate. |
| **Discovered – not indexed** | **188** | Real pages, **never crawled** (last-crawled epoch `1969-12-31`). |
| Crawled – not indexed | 43 | Thin/low-authority; quality threshold. |
| Redirect error | 15 | Broken redirect chains — worth a spot check. |

The causal chain: **1,806 (404) + 678 (redirect) ≈ 2,484 junk fetch targets** crowd out the
**188** legitimate pages. Clearing the junk is the lever that gets the 188 crawled and indexed.

---

## 2. Canonicalization (verified clean)

Everything resolves to non-www `https://thehippiescientist.net`:

- `src/lib/site.ts` strips `www.` if it appears in `NEXT_PUBLIC_SITE_URL`.
- `app/sitemap.ts`, `app/robots.ts`, and all canonical tags emit non-www.
- Trailing slash is enforced (`next.config.mjs` `trailingSlash: true`).

⚠️ **Operator action — verify in GSC, not in repo:** the sitemap was submitted to GSC as
`https://www.thehippiescientist.net/sitemap.xml` (the **www** host) while content
canonicalizes to **non-www**, and there is no www→non-www redirect in `public/_redirects`.
Confirm the Cloudflare custom-domain setup 301-redirects `www` → apex, and that the GSC
property / submitted sitemap uses the non-www host (or a Domain property). A host split here
manufactures duplicate URLs.

---

## 3. Root cause of the 1,806 `404`s — and why it is self-healing

**99% of the sampled 404s are `/compare/*` URLs** that look combinatorial and invalid:

```
/compare/garcinia-indica-vs-nf-b-inhibition      (herb vs a mechanism)
/compare/citicoline-vs-neuroprotective-activity  (compound vs an activity)
/compare/cordyceps-vs-bicarbonate                (arbitrary pair)
/compare/alpha-gpc                               (no "-vs-" at all)
```

Under static export, the only `/compare/*` pages that exist are the ~79 returned by
`generateStaticParams` in `app/compare/[slug]/page.tsx` (`generatedComparisons` +
`supplementComparisons` + an adjacent-pair list + the hand-authored `app/compare/*`
directories). Any other `/compare/*` slug is a hard 404.

Several internal-link generators historically emitted `/compare/{slug}-vs-{signal}` pairs
where `signal` is a **mechanism / pathway / effect** (e.g. "NF-κB inhibition" →
`nf-b-inhibition`) — these are not comparison pages, so every one 404s. The signature in the
404 export (`-vs-{mechanism}`) matches `lib/semantic/buildComparisonRecommendations.ts`
exactly.

### Ground truth: the live build is already clean

A full `next build` was run and the emitted HTML was crawled:

- **37** unique `/compare/*` links appear across the entire site; **all 37 resolve to a built
  page** (the single exception, `/compare/ashwagandha-vs-rhodiola-for-stress`, is a `301`
  redirect source, not a 404).
- **Zero** of the GSC phantom patterns (`-vs-nf-b-inhibition`, `-vs-neuroprotective-activity`,
  bare `/compare/alpha-gpc`, etc.) appear in any built page.

So the **current deployment does not emit these links**. The 1,806 are historical artifacts
from a previous site version; Google re-validates known 404s for weeks/months, which is why
the count is still drifting up (1,655 → 1,806) as it works through its own discovery backlog.
**They will fall out of the index on their own** as Google re-crawls and confirms the 404.
The correct response is `404` (not a mass 301 to unrelated pages, which Google treats as
soft-404/manipulation).

---

## 4. Hardening shipped (so it cannot recur)

The dead generators that produced the phantoms still exist and could be reactivated by a
refactor. They are now gated through a single source of truth.

- `lib/comparison-utils.ts` — added `isBuiltComparisonSlug(slug)`, the one guard every
  dynamic `/compare/...` generator must pass a candidate through.
- `lib/semantic/buildComparisonRecommendations.ts` — drops `{slug}-vs-{signal}` links unless
  the slug is built (kills the exact pattern in the 404 export).
- `lib/semantic-runtime.ts` `getComparisonCandidates` — validates each pair via
  `getValidComparisonSlug`; emits only built comparisons.
- `lib/conversion-aware-layouts.ts` `buildCompareCTA` — falls back to the `/compare` hub when
  a topic has no built comparison page.
- `lib/semantic-internal-linking.ts` — drops `compare`-type suggestions whose page is not built.
- `components/authority/ComparisonRecommendations.tsx` — render-time guard filters any raw
  `/compare/*` href that is not built (defense in depth).
- `app/__tests__/compare-link-integrity.test.ts` — regression test feeding each generator the
  shapes that historically leaked phantoms and asserting nothing unbuilt escapes.

These are additive guards on code paths that are not currently rendered, so live behavior is
unchanged; the build remains green and still emits zero phantom compare links.

---

## 5. Sitemap & redirect hygiene (verified)

- `app/sitemap.ts` already excludes redirect sources (`readRedirectSources`), `noindex`
  routes (`shouldIndexRoute`), and includes only **built** compare slugs — it is **not** a
  source of the phantom 404s.
- Minor: `public/_redirects` lists `/compare/ashwagandha-vs-rhodiola-for-stress` twice
  (a benign duplicate). Left as-is; harmless under Cloudflare first-match semantics.

---

## 6. The 188 "Discovered – currently not indexed"

These are real, in-sitemap pages (`/articles/*`, `/herbs/*`, `/compare/*`, `/guides/*`,
`/learn/*`, plus index/utility pages) that have **never been crawled**. This is crawl-budget +
authority, not a sitemap bug (verified: all are emitted by `app/sitemap.ts`). Levers, in order:

1. **Clear the junk** (§3/§4) so Googlebot stops spending budget on 404/redirect URLs.
2. **Internal linking** — per `expansionblueprint.md` §11, link these pages from higher-authority
   money/hub pages so they accrue PageRank and crawl priority.
3. **Request indexing / re-submit sitemap** in GSC for the highest-value pages.

---

## 7. Operator checklist (cannot be done in-repo)

- [ ] Confirm Cloudflare 301-redirects `www.thehippiescientist.net` → apex.
- [ ] Confirm the GSC property + submitted sitemap use the **non-www** host (or a Domain property).
- [ ] In GSC, **Validate Fix** on "Not found (404)" and "Page with redirect" once this deploy is live.
- [ ] Spot-check the 15 "Redirect error" URLs for broken 301 chains in `public/_redirects`.
- [ ] Re-submit `sitemap.xml`; request indexing for top "Discovered – not indexed" pages.
- [ ] Monitor: the 404 count should plateau then fall over the following weeks.
