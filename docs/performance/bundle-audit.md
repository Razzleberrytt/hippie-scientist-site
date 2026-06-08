# Bundle Size Analysis & Optimization Audit

**Report Generated:** 2026-06-03T18:30:27.834Z
**Framework:** Next.js 15 with `output: 'export'`
**Build Target:** Static HTML/CSS/JS

## Executive Summary

- **Large Packages Identified:** 7
- **Largest Package:** next (2000KB)
- **Total Client Dependencies:** 47
- **Estimated Client Bundle:** ~800-1000KB (unminified)
- **Estimated Minified Bundle:** ~250-350KB

## Top 10 Largest Dependencies

| Rank | Package | Size (KB) | Version | Bundle Impact | Status |
|------|---------|-----------|---------|---|---|
| 1 | `next` | 2000 | ^15.5.18 | **High** ⚠️ | Optimized ✓ |,| 2 | `lucide-react` | 200 | ^1.14.0 | **High** ⚠️ | Check |,| 3 | `react-dom` | 135 | ^18.3.0 | **High** ⚠️ | Optimized ✓ |,| 4 | `tailwindcss` | 80 | 4.3.0 | Medium | Check |,| 5 | `fuse.js` | 65 | ^7.1.0 | Medium | Review |,| 6 | `framer-motion` | 45 | ^12.38.0 | Medium | Good |,| 7 | `react` | 42 | ^18.3.0 | Medium | Optimized ✓ |

## Package Analysis

### 🔴 High-Impact Packages

#### 1. plotly.js-dist (3100KB)

**Status:** Largest package, high priority for optimization

**Current Usage:**
- Sleep science data visualization
- Interactive charts and graphs
- Data exploration features

**Bundle Impact:**
- Unminified: ~3100KB
- Minified: ~900KB (only 30% of total bundle)
- Gzipped: ~200-250KB

**Optimization Options:**

Option A: **Dynamic Import (Recommended)** ✓
- Load Plotly only when chart component mounts
- Saves ~200-250KB from initial page load
- Chart pages pay the cost (lazy-loaded)
- Difficulty: **Easy**
- Estimated savings: **200KB** initial bundle

```typescript
// Before: Always loaded
import Plot from 'react-plotly.js'

// After: Loaded on-demand
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false })
```

Option B: **Lightweight Alternative**
- Replace with Recharts (~45KB) for basic charts
- Loss of advanced Plotly features
- Difficulty: **Medium** (requires chart refactoring)
- Estimated savings: **200KB** total

Option C: **Hybrid Approach**
- Recharts for common visualizations
- Plotly for advanced/interactive only (lazy-loaded)
- Difficulty: **Hard** (requires redesign)
- Estimated savings: **250KB**

**Recommendation:** Implement Option A (dynamic import) as Phase 5.1
- Easiest implementation
- Significant immediate gains
- Maintains all functionality
- No user-facing changes

---

#### 2. react-dom (135KB)

**Status:** Framework dependency, required for all React apps

**Current Usage:**
- All React component rendering
- Event handling
- DOM manipulation

**Optimization:** Cannot be removed (framework requirement)

**Mitigation:**
- Already tree-shaken by Next.js
- Minified efficiently
- No action needed ✓

---

#### 3. next (2000KB)

**Status:** Mostly build-time, not in client bundle

**Current Usage:**
- Build-time only (static export)
- Some next/image utilities (minimal)

**Optimization:** Already optimized for static export
- No server runtime included
- Client utilities only (~20KB)
- No action needed ✓

---

### 🟡 Medium-Impact Packages

#### framer-motion (45KB)

**Current Usage:** Animation library for UI transitions

**Optimization Options:**
1. ✓ Already reasonable size
2. Conditionally load animations on powerful devices
3. Use CSS animations for simple cases

**Recommendation:** Keep as-is (good ROI)

#### fuse.js (65KB)

**Current Usage:** Fuzzy search for content

**Optimization Options:**
1. ✓ Already reasonable size
2. Load only on search page/modal
3. Disable search on low-power devices

**Current Implementation:**
- Always imported?
- Used globally?

**Recommendation:** Audit usage, may already be optimized

#### lucide-react (200KB)

**Current Usage:** Icon library

**Optimization Options:**
1. ✓ Tree-shaking enabled
2. Only use icons you actually need
3. Import specific icons, not whole lib

**Recommendation:**
- Verify only used icons are imported
- Check for icon duplication
- Estimated savings: 50-100KB

---

## JSON Data Imports

Large static data loaded at build time:


| File | Size (KB) | Used Where | Optimization |
|------|-----------|-----------|---|
| `/canonical-mechanisms.json` | 49.3 | Analyzed | Lazy-load if possible |
| `/compound-index.json` | 571.3 | Analyzed | Lazy-load if possible |
| `/compounds-summary.json` | 459.5 | Analyzed | Lazy-load if possible |
| `/compounds.json` | 1824.0 | Analyzed | Lazy-load if possible |
| `/compounds_combined_updated.json` | 324.4 | Analyzed | Lazy-load if possible |
| `/evidence-engine/anxiety.json` | 16.7 | Analyzed | Lazy-load if possible |
| `/evidence-engine/focus.json` | 16.4 | Analyzed | Lazy-load if possible |
| `/evidence-engine/sleep.json` | 11.4 | Analyzed | Lazy-load if possible |
| `/evidence-engine/stress.json` | 14.4 | Analyzed | Lazy-load if possible |
| `/Full79.json` | 208.5 | Analyzed | Lazy-load if possible |

**Recommendation:** Audit whether all data needs to be in initial load
- Move detailed data to separate JSON files
- Load on-demand for specific pages
- Estimated savings: **50-100KB** from initial bundle


## Code Splitting Opportunities

### Current Setup
- Next.js automatic route-based code splitting ✓
- Component-level splitting: Limited
- Dynamic imports: Not widely used

### Recommended Optimizations

#### 1. Plotly Dynamic Import (Highest Priority)
- Pages: Sleep science visualization pages
- Estimated savings: **200KB** initial
- Implementation time: **30 minutes**
- Risk: **Low** (common pattern)

```typescript
// pages/sleep/visualization.tsx
const PlotlyChart = dynamic(
  () => import('react-plotly.js'),
  { ssr: false, loading: () => <ChartPlaceholder /> }
)

export default function SleepVisualization() {
  return <PlotlyChart data={data} />
}
```

#### 2. Modal Content Splitting
- Split content for modals/dialogs
- Lazy-load when modal opens
- Estimated savings: **50KB**
- Implementation time: **1 hour**
- Risk: **Low**

#### 3. Heavy Component Splitting
- Large landing page sections
- Guides with many sub-sections
- Estimated savings: **30-50KB**
- Implementation time: **2 hours**
- Risk: **Low**

## Bundle Analysis by Purpose

### Critical Path (Always Loaded)
- React + Next.js utilities: ~150KB
- Styling (Tailwind): ~30KB
- UI components: ~100KB
- **Total Critical:** ~280KB

### Secondary (Most Pages)
- Framer Motion: ~45KB
- Navigation/layout: ~50KB
- **Total Secondary:** ~95KB

### Feature-Specific (Lazy)
- Plotly: ~900KB ← **Can be lazy-loaded**
- Fuse.js search: ~65KB ← **Can be lazy-loaded**
- **Total Lazy:** ~965KB

## Optimization Roadmap

### Phase 5.1 (Plotly Dynamic Import)
**Priority:** HIGH
**Effort:** EASY
**Impact:** 200KB initial bundle
**Time:** 30-60 minutes

- [ ] Add dynamic import for Plotly
- [ ] Create loading placeholder
- [ ] Test on chart pages
- [ ] Measure bundle size improvement

### Phase 5.2 (Fuse.js Search Optimization)
**Priority:** MEDIUM
**Effort:** MEDIUM
**Impact:** 60KB if used on single page
**Time:** 1-2 hours

- [ ] Audit where search is used
- [ ] Lazy-load if single page
- [ ] Test performance
- [ ] Measure improvement

### Phase 5.3 (Icon Library Cleanup)
**Priority:** MEDIUM
**Effort:** EASY
**Impact:** 50-100KB
**Time:** 1 hour

- [ ] Audit icon imports
- [ ] Remove unused icons
- [ ] Use individual imports
- [ ] Verify tree-shaking

### Phase 5.4 (General Code Splitting)
**Priority:** LOW
**Effort:** MEDIUM
**Impact:** 30-50KB
**Time:** 2-3 hours

- [ ] Identify heavy components
- [ ] Add dynamic imports
- [ ] Create loading states
- [ ] Test performance

## Performance Targets

| Target | Current | Goal | Status |
|--------|---------|------|--------|
| Initial Bundle | ~300KB | <250KB | ⏳ Achievable |
| Full Bundle | ~1MB+ | <800KB | ⏳ Achievable |
| Largest JS File | ~400KB | <200KB | ⏳ With lazy-loading |
| FCP Impact | Medium | Low | ⏳ With splitting |

## Static Export Constraints

✅ **All optimizations are compatible with static export:**
- Dynamic imports work fine in static builds
- Code splitting creates multiple JS files
- No server runtime required
- Assets cached by browser

## Measurement Plan

Before implementing optimizations, measure baseline:

```bash
# Build production bundle
npm run build:deploy

# Analyze with Next.js analyzer
npx @next/bundle-analyzer

# Check bundle size
du -sh out/ .next/

# Measure page load times
npx lighthouse https://localhost/sleep
```

## What NOT to Change

❌ **Keep react and react-dom**
- Required framework dependencies
- Already optimized by Next.js
- No replacement available

❌ **Keep next framework**
- Core to static export
- Already minimal for static builds
- No replacement needed

❌ **Don't remove useful features**
- Plotly for visualizations (make lazy instead)
- Fuse.js for search (make lazy instead)
- Framer Motion for UX (minimal size)

## Recommendations Summary

### High Impact
1. **Plotly dynamic import** → 200KB savings
2. **Icon cleanup** → 50-100KB savings
3. **Fuse.js lazy-load** → 50-65KB savings

### Medium Impact
4. **Component code splitting** → 30-50KB savings
5. **Data lazy-loading** → 20-50KB savings

**Total Potential Savings:** 350-465KB (~50% reduction in non-critical code)

## Next Steps

1. ✅ Phase 1: Build Profiling
2. ✅ Phase 2: Caching
3. ✅ Phase 3: Pipeline Splitting
4. ⏳ Phase 4: Route Analysis
5. ⏳ **Phase 5: Bundle Optimization** (THIS REPORT)
6. ⏳ Phase 6: Deployment Cleanup
7. ⏳ Phase 7: Final Performance Report

---

**Generated by:** `scripts/analyze-bundle.mjs`
**Last Updated:** June 2026

---

Generated by: `scripts/analyze-bundle.mjs`
**Last Updated:** June 2026
