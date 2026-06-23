# Developer Health Log — The Hippie Scientist

_Canonical log of all maintenance pipeline actions, audit results, and decisions._
_Format: newest entry at top. Never delete entries — mark superseded ones [SUPERSEDED]._

---

## 2026-06-23 — Initial Pipeline Audit & Remediation

**Author:** Maintenance Pipeline (automated)
**Scope:** Full repository audit; Task A (Technical Foundations) implementation

### Audit Findings

#### A. Lighthouse CI — MISSING → FIXED

**Finding:** No Lighthouse CI workflow existed. Performance was tracked only via manual `scripts/report-performance-budget.mjs` which covers bundle sizes but not Core Web Vitals or accessibility scores.

**Action:** Created `.github/workflows/lighthouse.yml` — runs on every push and pull request.
- Builds static export (`npm run build:deploy`)
- Serves `out/` with `npx serve`
- Runs `@lhci/cli@0.14` against homepage, `/herbs/ashwagandha/`, and `/compounds/l-theanine/`
- Enforces thresholds via `.lighthouserc.json`:
  - Performance ≥ 80 (warn)
  - Accessibility ≥ 90 (error — hard fail)
  - Best Practices ≥ 85 (warn)
  - SEO ≥ 90 (warn)

**Created files:**
- `.github/workflows/lighthouse.yml`
- `.lighthouserc.json`

#### B. Accessibility CI Gate — MISSING → FIXED

**Finding:** `axe-core` (v4.11.3) is installed and `app/__tests__/a11y.test.tsx` covers SafetyBadge, DecisionProfileCard, and ProfileEvidenceLens components. However, the CI workflow (`ci.yml`) does NOT run Vitest — meaning all a11y tests are unenforced in the automated pipeline.

**Action:** Added a `Run tests (vitest + a11y gate)` step to `.github/workflows/ci.yml`, placed after lint/typecheck and before the build. This ensures a11y regressions fail CI before expensive build work is wasted.

**Modified files:**
- `.github/workflows/ci.yml` (added vitest step)

#### C. Link Checker — MISSING → FIXED

**Finding:** `scripts/ci/audit-internal-links.mjs` validates internal links during the build, but no external link validator exists. Dead external links represent a silent SEO and UX risk.

**Action:** Created:
- `scripts/check-links.mjs` — Node.js script sampling 20+ critical routes for HTTP 200 status
- `.github/workflows/linkchecker.yml` — weekly cron + manual trigger, using `linkinator` to crawl the live site

**Note:** Rate-limited social platforms (Twitter, Instagram, LinkedIn) are excluded from validation to avoid false positives from bot-blocking.

#### D. ScholarlyArticle JSON-LD for Botanical Monographs — UPGRADED

**Finding:** Herb profile pages (`/herbs/:slug`) use `HerbSchemaGenerator` → `buildHerbArticleSchema()` which emits `@type: 'Article'`. For botanical research pages, `ScholarlyArticle` is semantically more accurate and produces stronger AI-search discovery signals per Schema.org hierarchy.

**Action:** Updated `src/lib/schema-injector.ts`:
- Changed `@type` from `'Article'` to `['ScholarlyArticle', 'Article']`
- Added optional `citations` array parameter (emits `citation` nodes with `@type: 'CreativeWork'`)
- Backward compatible — ScholarlyArticle is a strict subtype of Article; Google Rich Results eligibility unchanged

**Modified files:**
- `src/lib/schema-injector.ts`

#### E. Security Headers Strategy — DOCUMENTED (no code change needed)

**Finding:** The task called for security headers in `next.config.js`. This project uses `output: 'export'` (static export to Cloudflare Pages). Under this mode, `headers()` in `next.config.mjs` is unsupported and would trigger a Next.js build error.

**Decision:** The correct architecture is headers via `public/_headers` (Cloudflare Pages native format). This file is already comprehensive and validated in CI by `scripts/ci/validate-security-headers.mjs`.

**Action:** Added an explanatory comment block to `next.config.mjs` documenting the header strategy and referencing `public/_headers` as the authoritative source.

**No security regression** — all `security-headers.com` standards are met via `public/_headers`.

### Metrics Baseline (pre-pipeline)

| Metric | Baseline | Target |
|--------|----------|--------|
| Lighthouse Performance | Unknown (no CI data) | ≥ 80 |
| Lighthouse Accessibility | Unknown (no CI data) | ≥ 90 |
| Lighthouse SEO | Unknown (no CI data) | ≥ 90 |
| CI a11y test enforcement | ❌ None | ✅ Every push |
| External link validation | ❌ None | Weekly + manual |
| Herb schema type | Article | ScholarlyArticle + Article |

### Files Created/Modified

| File | Action | Purpose |
|------|--------|---------|
| `ARCHITECTURE_OVERVIEW.md` | Created | Repository architecture documentation |
| `DEVELOPER_HEALTH_LOG.md` | Created | This log |
| `.github/workflows/lighthouse.yml` | Created | Lighthouse CI on every push |
| `.lighthouserc.json` | Created | Lighthouse score thresholds |
| `.github/workflows/linkchecker.yml` | Created | Weekly external link health check |
| `scripts/check-links.mjs` | Created | Critical-route HTTP health check script |
| `.github/workflows/ci.yml` | Modified | Added Vitest a11y test enforcement step |
| `src/lib/schema-injector.ts` | Modified | ScholarlyArticle upgrade for herb monographs |
| `next.config.mjs` | Modified | Added security header strategy comment |

---

## Log Template

```
## YYYY-MM-DD — [Action Title]

**Author:** [Person or system]
**Scope:** [Area affected]

### Finding
[What was discovered]

### Decision
[What was chosen and why]

### Action
[What was done]

### Outcome
[Result / metrics change]
```
