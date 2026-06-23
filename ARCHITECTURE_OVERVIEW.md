# Architecture Overview — The Hippie Scientist

_Generated: 2026-06-23 | Engineer: Maintenance Pipeline Audit_

---

## 1. Stack Summary

| Layer | Technology | Notes |
|-------|------------|-------|
| Framework | Next.js 15 (App Router) | Static export (`output: 'export'`) |
| Deployment | Cloudflare Pages | `out/` directory, CDN-first |
| Styling | Tailwind CSS v4 | CSS custom properties in `globals.css`; no `tailwind.config.js` |
| State | Zustand 5 | Client-side only (static export constraint) |
| Search | Fuse.js 7 + Pagefind | Client-side fuzzy + index-based |
| Testing | Vitest 4 + Testing Library | jsdom, OXC transpiler, 50% parallel |
| Accessibility | axe-core 4.11.3 + jsx-a11y | ESLint strict mode on active paths |
| Data | ExcelJS (workbook → JSON) | `data-sources/herb_monograph_master.xlsx` |
| AI Enrichment | OpenAI API | Agent patch system under `agent/` |
| Edge Workers | Wrangler 4 | Cloudflare deployment tooling |

---

## 2. Repository Layout

```
hippie-scientist-site/
├── app/                     # Next.js App Router (41 route directories)
│   ├── herbs/[slug]/        # Botanical monograph depth pages
│   ├── compounds/[slug]/    # Compound detail pages
│   ├── goals/[goal]/        # Goal-cluster discovery pages
│   ├── stacks/[slug]/       # Supplement stack pages
│   ├── compare/             # Herb comparison engine
│   ├── articles/            # Long-form articles
│   ├── __tests__/           # Vitest integration + a11y tests (13 files)
│   ├── sitemap.ts           # Dynamic sitemap (716 lines, 1000+ entries)
│   └── robots.ts            # Dynamic robots.txt
├── components/              # Shared React components (20 subdirectories)
│   ├── ui/                  # Primitive UI components
│   ├── seo/                 # JSON-LD, schema, OG components
│   ├── evidence/            # EvidenceMatrix, EvidenceMeter
│   └── ...                  # Domain-specific component groups
├── lib/                     # Active business logic (100+ files)
│   ├── schema.ts            # Schema.org node builders
│   ├── metadata-engine.ts   # Unified metadata generation
│   ├── evidence*.ts         # Evidence scoring & stratification
│   └── runtime/             # Data loading abstractions
├── src/                     # Partially-legacy client lib + components
│   ├── lib/                 # Runtime data loaders, SEO helpers
│   └── components/          # Herb/compound profile components
├── scripts/                 # Build tooling (200+ files)
│   ├── ci/                  # CI validators (20+ scripts)
│   ├── data/                # Data pipeline (workbook → JSON)
│   └── audit/               # Content and SEO auditors
├── agent/                   # AI enrichment pipeline
│   ├── agents/              # Individual enrichment agents
│   ├── patches/             # Generated patch files
│   └── orchestrator/        # Batch runner
├── data-sources/            # Source of truth (xlsx workbook)
├── public/
│   ├── data/                # Generated runtime JSON (disposable)
│   ├── _headers             # Cloudflare Pages security headers (authoritative)
│   ├── _redirects           # 21KB redirect rules
│   ├── robots.txt           # Static fallback (superseded by app/robots.ts)
│   └── manifest.json        # PWA manifest
└── .github/workflows/       # 18 GitHub Actions workflows
```

---

## 3. Data Pipeline

```
data-sources/herb_monograph_master.xlsx
         │
         ▼
scripts/data/build-runtime-from-workbook.mjs
         │
         ├─► public/data/herbs.json          (1.05 MB)
         ├─► public/data/compounds.json      (2.38 MB)
         ├─► public/data/herbs-detail/       (per-herb JSON)
         ├─► public/data/compounds-detail/   (per-compound JSON)
         ├─► public/data/search-index.json
         ├─► public/data/herb-compound-map.json
         ├─► public/data/stacks.json
         ├─► public/data/goal-pages.json
         └─► public/data/runtime-manifests/route-manifest.json
```

**Contract:** Workbook is the source of truth. `public/data/**` is disposable and regenerated on every `npm run data:build`. Direct edits to JSON survive only until the next regeneration; persist changes in the workbook.

---

## 4. Routing & Content Architecture

### Two-Layer Model

**Discovery layer** — broad search intent, funnels to depth:
- `/goals/:slug` — goal clusters (sleep, focus, anxiety, etc.)
- `/best-supplements-for-*` — SEO entry pages (seo-entry-pages.tsx, 50KB)
- `/natural-anxiolytics-beyond-ashwagandha`, `/sleep-herbs-vs-melatonin` — editorial hubs

**Depth layer** — authoritative, research-backed profiles:
- `/herbs/:slug` — botanical monographs (primary content type)
- `/compounds/:slug` — compound profiles (500+ pages)
- `/stacks/:slug` — curated supplement combinations
- `/compare/:slug` — head-to-head comparisons

### Stable Route Contracts

These are indexed and linked widely; never rename without a redirect in `public/_redirects`:

| Route | Description |
|-------|-------------|
| `/herbs/:slug` | Botanical monographs |
| `/compounds/:slug` | Compound profiles |
| `/goals/:slug` | Goal clusters |
| `/stacks/:slug` | Stack pages |
| `/compare/:slug` | Comparison pages |

---

## 5. SEO & Structured Data

### Existing JSON-LD Coverage

| Schema Type | Used On | Status |
|------------|---------|--------|
| WebSite | Homepage | ✅ |
| Organization | Global layout | ✅ |
| BreadcrumbList | All pages (client-side) | ✅ |
| MedicalWebPage + Article | Herb/compound profiles | ✅ |
| Article | Herb profiles (via SchemaGenerator) | ✅ → being upgraded to ScholarlyArticle |
| FAQPage | FAQ pages + accordions | ✅ |
| DietarySupplement + WebPage | Monetized zones | ✅ |
| Person | Author pages | ✅ |

### Sitemap

Dynamic `app/sitemap.ts` generates 1000+ entries across all route families with correct priority tiers (1.0 homepage → 0.6 compare), `lastmod` dates sourced from content fields, and deprecated slug exclusion.

### robots.txt

Dynamic `app/robots.ts` — allows all user agents on `/`, blocks `/api/`, `/admin/`, `/data/`, `/preview/`, and internal paths.

---

## 6. Security & Headers

**Authoritative source:** `public/_headers` (Cloudflare Pages format)

| Header | Value | Status |
|--------|-------|--------|
| `Content-Security-Policy` | default-src self; script/style unsafe-inline; Amazon CDN img | ✅ |
| `Strict-Transport-Security` | max-age=31536000; includeSubDomains; preload | ✅ |
| `X-Frame-Options` | DENY | ✅ |
| `X-Content-Type-Options` | nosniff | ✅ |
| `Referrer-Policy` | strict-origin-when-cross-origin | ✅ |
| `Permissions-Policy` | camera/mic/geo/payment/usb all blocked | ✅ |
| `Cross-Origin-Opener-Policy` | same-origin | ✅ |
| `Cross-Origin-Resource-Policy` | same-origin | ✅ |

**Note:** `next.config.mjs` does not define `headers()` — under `output: 'export'`, Next.js ignores that function (and would emit a build warning). CDN-level headers via `public/_headers` are the correct pattern for Cloudflare Pages deployments.

**CI validation:** `scripts/ci/validate-security-headers.mjs` runs on every push.

---

## 7. Accessibility Infrastructure

| Tool | Status | Coverage |
|------|--------|---------|
| `axe-core` (v4.11.3) | ✅ installed | Component-level test suite in `app/__tests__/a11y.test.tsx` |
| `eslint-plugin-jsx-a11y` | ✅ strict mode | Active production paths: `app/**`, `components/**`, `lib/**` |
| Skip link | ✅ | `<a href="#main-content" className="sr-only">` in layout |
| `<main id="main-content">` | ✅ | Single landmark per WCAG |
| Dark mode | ✅ | `DarkModeProvider` + `DarkModeToggle` |
| **CI enforcement** | ⚠️ GAP | Vitest a11y tests exist but are NOT run in `ci.yml` → **Fixed in this pipeline** |

---

## 8. Performance Budgets

| Metric | Budget | Tracked By |
|--------|--------|-----------|
| Main JS bundle | ≤ 350 KB | `report-performance-budget.mjs` |
| Search index | ≤ 1.0 MB | `report-performance-budget.mjs` |
| Total search payload | ≤ 2.0 MB | `report-performance-budget.mjs` |
| Largest JSON file | ≤ 2.5 MB | `report-performance-budget.mjs` |
| Lighthouse Performance | ≥ 80 | **New: lighthouse.yml** |
| Lighthouse Accessibility | ≥ 90 | **New: lighthouse.yml** |
| Lighthouse SEO | ≥ 90 | **New: lighthouse.yml** |

---

## 9. CI/CD Pipeline

### Workflow Inventory (18 workflows)

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `ci.yml` | push/PR | Quality gate: lint → typecheck → build → verify → security audit |
| `deploy.yml` | CI success | Cloudflare Pages deploy |
| `check.yml` | manual/schedule | Full health check (`check:full`) |
| `lighthouse.yml` | **NEW** push/PR | Lighthouse performance + a11y scoring |
| `linkchecker.yml` | **NEW** weekly cron | External link health validation |
| `deep-enrichment.yml` | manual | AI agent enrichment run |
| `review-patches.yml` | manual | Agent patch review |
| `refresh-runtime-data.yml` | manual | Workbook → JSON regeneration |
| `seo-assets.yml` | manual | SEO asset generation |
| `sitemap-seo.yml` | manual | Sitemap validation |

---

## 10. Identified Gaps → Remediation Status

| Gap | Severity | Status |
|-----|----------|--------|
| No Lighthouse CI workflow | High | ✅ **Fixed** — `.github/workflows/lighthouse.yml` |
| Vitest/a11y tests not in CI | High | ✅ **Fixed** — added test step to `ci.yml` |
| No link checker | Medium | ✅ **Fixed** — `.github/workflows/linkchecker.yml` + `scripts/check-links.mjs` |
| Herb schema uses Article not ScholarlyArticle | Medium | ✅ **Fixed** — `src/lib/schema-injector.ts` upgraded |
| `next.config.mjs` has no security header documentation | Low | ✅ **Documented** — comment added to config |
| `public/_headers` has no COOP/CORP on sub-paths | Low | Tracked — defer to next security review |
