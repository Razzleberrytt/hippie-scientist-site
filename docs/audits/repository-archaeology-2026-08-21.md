# Repository Archaeology Evidence Ledger — 2026-08-21

**Status:** Historical audit evidence supporting the 2026-08-21 control reset
**Scope:** Local `main` at `24e50c56c`, GitHub workflow/queue state, generated artifacts, and sampled production output. Counts apply only to the named artifact or command.

## Surfaces inspected

- Root setup/control files, package/Node/TypeScript/Next configuration, environment examples, Cloudflare files, redirects/headers, and recent Git history.
- `docs/` (321-file inventory and thematic scan), `ops/`, `scripts/`, `agent/`, `backlog/`, workflows, `app/`, `src/`, `components/`, `lib/`, `config/`, `content/`, `functions/`, `data-sources/`, and `public/data/`.
- Static export/deploy, workbook/data build, content collections, routes, SEO, structured data, links, evidence/citations, safety, affiliate configuration/events/disclosures, newsletter functions, analytics loading, tests, and CI.
- Recent commits, open GitHub PR/issue/workflow state, repository variable/secret names, and sampled live routes/sitemaps/robots. No form submission, purchase, deployment, or external mutation was performed.

## Reproduced checks

| Check | Result | Interpretation / limitation |
|---|---|---|
| `npm run audit:content` | Exit 0; 188 static pages, four duplicate-intent pairs, one missing metadata source, 55 below the audit's 500-word heuristic, one definite orphan, 32 undeterminable, zero broken links, 11 redirect-hop links, zero hardcoded affiliate tags | Source audit; word count alone is not a quality verdict |
| `npm run audit:links` | Exit 0; 240 indexable herbs, 112 compounds, 188 guides, 40 comparisons, 193 pages, 1,793 suggestions in its scope | Advisory pre-production publication view, not final live indexability |
| `npm run audit:duplicates` | Exit 0; three compound-similarity groups | Low/medium-confidence name similarity; not authority to redirect distinct molecules |
| `npm run audit:safety` | Exit 0; 293 herb + 588 compound workbook rows, all with safety context; structured flags/contraindications on 293 herbs and 306 compounds; 51 deliberate abstentions | Workbook coverage, not proof every rendered claim is complete |
| `npm run seo:audit` | Exit 1 against pre-existing local `out/`; 689 sitemap URLs and 168 noindex generated URLs | Output predated the audit; not current production proof |
| `npm run audit:metadata` | Exit 1 against stale output | Direct HTML/current CI contradicted missing-title claims; stale signal rejected |
| Representative structured-data audit | Exit 0 | Sample does not override the latest full schema-policy failure |
| Representative internal-link audit | Exit 0; 8 sampled pages, no orphan, four weak, seven redirect links in stale output | Latest full CI used broader/current output |
| Live sitemap audit | 486 main-sitemap URLs; 20/20 sample returned 200 and canonical apex | Sitemap membership is not Google index coverage |
| Backlog materialization | Failed because compressed seed is invalid base64/truncated | The purported 1,000-ticket seed is unusable as an execution system |
| Search Console fetch | Blocked on missing `GSC_SERVICE_ACCOUNT_JSON` | Search values remain Unknown |

## Current CI and GitHub evidence

- Latest inspected Deploy and core CI runs succeeded at the head commit.
- Schema and Media Governance failed with 38 blocking first-party identity issues on affected ADHD guides.
- Site Health Check failed after a successful build because turmeric search safety flags disagreed with the resolved runtime contract.
- Lighthouse failed representative CLS, LCP, and TBT assertions; accessibility passed.
- The queue contained 45 open pull requests and 35 open issues. Relevant overlapping work included evidence-role/sitemap recovery and search/image/performance changes.
- Repository configuration exposed an Amazon affiliate-tag variable and Cloudflare/OpenAI secret names. No GA4/GSC variable was visible. External environment values were unavailable, so production configuration remains Unknown.

## Generated data and build evidence

- Generated arrays: 291 herbs and 565 compounds (856 records).
- Detail JSON: 187 profiles with claim maps, 359 claim records; 406 profiles with sources, 1,066 references, 272 approved references, 290 unique source IDs, 810 unique DOIs, and 192 PMIDs.
- Citation exports contain 849 study records in JSON/BibTeX/RIS.
- An inspected production build generated 847 profile routes and reported 773 `noindex`; build phases and stored publication artifacts disagreed on eligibility totals.
- `public/data/source-registry.json` was empty and `publication-index.json` carried an older contradictory snapshot.
- Workbook full parsing emitted an ExcelJS namespace error, then the normalization/streaming fallback completed.

## Sampled live-product evidence

Sampled `/`, herb/compound indexes and flagship profiles, `/guides/`, a sleep guide, a comparison, goal and article indexes/details, affiliate disclosure, and newsletter routes. All returned 200 with one H1, substantial server-rendered text, self-canonical URLs, and JSON-LD.

Ashwagandha and L-theanine profile samples were `noindex, follow`. Sampled commercial pages rendered disclosure before the first Amazon link and links carried the configured tag with sponsored/nofollow treatment. No purchase or subscription was attempted.

## Limitations

- No GSC, GA4/Ahrefs, Amazon Associates, Mailchimp report, Cloudflare environment-value, or historical deployment-analytics access was available.
- Pull requests were inspected selectively by relevance, not line by line across all open changes.
- All documentation paths were inventoried/classified; high-authority and relevant specialist files were read deeply, while dated reports/specifications were assessed through metadata, headings, search, and relevance. This was not a line-by-line editorial review of all 321 files.
- Live checks were sampled and HTML-based, not a full visual/browser/device certification.
- Final local validation for the documentation reset belongs in the task handoff, not this point-in-time ledger.
