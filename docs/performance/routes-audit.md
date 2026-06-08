# Route Analysis & Optimization Audit

**Report Generated:** 2026-06-03T18:30:08.120Z
**Environment:** Static Export (`output: 'export'`)

## Executive Summary

- **Total Estimated Routes:** 302
- **Estimated Build Size:** 2.0MB
- **Route Families:** 6
- **Content Duplicates Identified:** 3
- **Optimization Opportunities:** 3

## Route Breakdown by Family

| Family | Pattern | Type | Est. Count | Size/Each | Total | Build Cost |
|--------|---------|------|-----------|-----------|-------|------------|
| Blog Posts | `app/blog/[slug]` | Dynamic | 80 | 2.5KB | 0.2MB | **Low** ✓ |
| Sleep Pages | `app/sleep/[...slug]` | Dynamic | 200 | 6KB | 1.2MB | **Medium** |
| Guides | `app/guides/[slug]` | Dynamic | 12 | 6KB | 0.1MB | **Low** ✓ |
| Static Pages | `app/[page]` | Static | 10 | 4KB | 0.0MB | **Low** ✓ |
| Shared | Layouts, components | - | 1 | 500KB | 0.5MB | **Fixed** |

**Total Estimated Build Output:** 2.0MB

## Route Families Analysis

### Largest Route Family: Sleep Pages (200 routes)

**Cost Per Route:** 6KB (medium)
**Total Size:** 1.2MB
**Build Impact:** High (~59.6% of total)

**Breakdown:**
- Sleep science topics: ~150 pages
- Sleep-related guides: ~30 pages
- Sleep research summaries: ~20 pages

**Optimization Opportunities:**
1. ✓ **Consolidate related topics** - Combine similar sleep science pages
2. ✓ **Extract common content** - Move duplicate sections to shared components
3. ✓ **Lazy load research details** - Load full research data on-demand (not pre-rendered)

### Second Largest: Blog Posts (80 routes)

**Cost Per Route:** 2.5KB (low)
**Total Size:** 0.2MB
**Build Impact:** Efficient (~9.9% of total)

**Status:** ✓ Already optimized - blog posts are minimal

### Guides (12 routes)

**Cost Per Route:** 6KB (medium)
**Total Size:** 0.1MB
**Build Impact:** Low (~3.6% of total)

**Status:** ✓ Reasonable count and size

## Content Duplication Risk Analysis

The following patterns appear in multiple locations:

### High Risk (Recommend Immediate Action)

| Pattern | Instances | Pages | Risk Level | Recommendation |
|---------|-----------|-------|-----------|-----------------|
| Sleep science overview | 3 | Sleep homepage, Sleep intro page, Sleep search results intro | **High** | Consolidate or use single source of truth |

**Action:** Move `Sleep science overview` to a shared component and link instead.

### Medium Risk (Optimize if Time Permits)

| Pattern | Instances | Pages | Risk Level | Recommendation |
|---------|-----------|-------|-----------|-----------------|
| Substance use harm reduction intro | 2 | Main guides page, Kratom guide intro | **Medium** | Link instead of duplicate |
| Recovery resources list | 2 | Resources page, End of guides | **Medium** | Externalize to shared component |

## Route Deduplication Opportunities

### Safe Optimizations (No Breaking Changes)

1. **Consolidate Sleep Overview Content** (Safe ✓)
   - Current: 3 separate pages with identical intro
   - Proposed: Single `sleep/overview` with links
   - Savings: ~15-20KB
   - Risk: **Low** - just reorganizing existing content

2. **Extract Harm Reduction Intro** (Safe ✓)
   - Current: Duplicated in guides and main pages
   - Proposed: Shared component with prop variants
   - Savings: ~5KB
   - Risk: **Low** - component-based approach

3. **Move Resources List to Component** (Safe ✓)
   - Current: Duplicated at end of multiple pages
   - Proposed: Shared `<ResourcesList />` component
   - Savings: ~10KB
   - Risk: **Low** - zero behavior change

### Risky Optimizations (Review Carefully)

❌ **Removing Guide Variants**
- Current: Separate guides for each substance (kratom, magnesium, glycine)
- Risk: **High** - These have distinct content and should remain separate
- Recommendation: Keep as-is

❌ **Consolidating Sleep Pages by Topic**
- Current: One page per sleep topic
- Risk: **High** - Each deserves its own comprehensive treatment
- Recommendation: Keep as-is

## Static Export Compliance

✅ **All routes compatible with static export:**
- No dynamic server-side routing
- No API routes (N/A in static export)
- No stream responses required
- No on-demand ISR

## Performance Impact by Route Family

| Operation | Blog (80) | Sleep (200) | Guides (12) |
|-----------|---|---|---|
| Pre-build (data load) | <1s | ~2-3s | <1s |
| Route generation | ~1-2s | ~3-5s ⚠️ | <1s |
| HTML rendering | ~3-5s | ~10-15s ⚠️ | ~2-3s |
| Asset processing | ~2-3s | ~5-8s | ~1-2s |
| Total | ~7-11s | ~20-31s ⚠️ | ~4-7s |

**⚠️ Sleep pages are the build bottleneck** - largest route family with medium cost-per-route

## Recommendations (Ranked by Impact)

### Tier 1: High Impact, Low Effort

1. **Extract duplicate sleep overview** (Save ~15KB)
   - Consolidate into single `sleep/introduction` page
   - Create component for embedded sections
   - Estimated time: 30 minutes

2. **Move resources list to component** (Save ~10KB)
   - Extract `<ResourcesList />` component
   - Use on multiple pages via import
   - Estimated time: 15 minutes

### Tier 2: Medium Impact, Medium Effort

3. **Optimize sleep page structure** (Save ~5-10% build time)
   - Reduce duplicate metadata
   - Consolidate related sleep science pages
   - Estimated time: 2 hours

4. **Lazy-load heavy content** (Save ~20KB memory)
   - Move detailed research data to JSON files
   - Load on demand rather than embed
   - Estimated time: 3 hours

### Tier 3: Lower Priority

5. **Standardize guide templates** (Save ~5KB)
   - Ensure all guides use same structure
   - Reduce markup variation
   - Estimated time: 1 hour

## What NOT to Change

❌ **Do NOT consolidate guides**
- Each guide (kratom, magnesium, glycine, 7-OH) is distinct
- Worth separate pages for SEO and comprehensiveness
- Current structure is optimal

❌ **Do NOT merge blog post categories**
- Blog posts are already minimal (2.5KB each)
- Adding categories would increase complexity
- Current approach is efficient

## Build Cost Summary

| Area | Current | Optimized | Savings | Effort |
|------|---------|-----------|---------|--------|
| Total Size | 2.0MB | 1.9MB | ~30KB | Low |
| Build Time | ~75-90s | ~70-85s | ~5s | Low |
| Memory Usage | ~500MB | ~480MB | ~20MB | Medium |

## Static Export Notes

This analysis is based on static export constraints:
- All pages pre-rendered at build time
- No dynamic page generation
- No server-side request handling
- Route count directly affects build time and output size

The current route structure is **well-balanced** for static export.

## Next Steps

1. ✅ Phase 1: Build Profiling
2. ✅ Phase 2: Caching
3. ✅ Phase 3: Pipeline Splitting
4. ⏳ **Phase 4: Route Analysis** (THIS REPORT)
5. ⏳ Phase 5: Bundle Optimization
6. ⏳ Phase 6: Deployment Cleanup
7. ⏳ Phase 7: Final Performance Report

---

**Generated by:** `scripts/analyze-routes.mjs`
**Last Updated:** June 2026
