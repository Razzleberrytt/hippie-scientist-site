# Build Pipeline - Quick Reference

## TL;DR

```bash
# Deploy (fast! ~45-60s)
npm run build:deploy

# Verify everything (parallel, ~15-20s)
npm run build:qa

# Both together (typical: ~75s)
npm run build:deploy && npm run build:qa
```

---

## Commands at a Glance

| Command | Purpose | Time | Use When |
|---------|---------|------|----------|
| `npm run build:deploy` | Production build | 45-60s | Deploying to Cloudflare Pages |
| `npm run build:qa` | Verify everything | 15-20s | Before committing / CI validation |
| `npm run cache:status` | Show cache state | <1s | Debugging build speed issues |
| `npm run cache:clear` | Clear cache | <1s | Force full rebuild |
| `npm run profile:build` | Performance analysis | 2-3 min | Identifying bottlenecks |

---

## Common Workflows

### Local Development Loop

```bash
# Make changes to blog
git commit blog changes

# Quick deploy test
npm run build:deploy              # 45-60s

# Before pushing, full QA
npm run build:qa                  # 15-20s

# Push to production
git push
```

### CI/CD Pipeline

```bash
# In CI script:
npm run cache:clear               # Start fresh in CI
npm run build:deploy              # Fast production build
npm run build:qa                  # Verify everything

# Deploy if all pass
```

### Debugging Build Speed

```bash
# Check cache
npm run cache:status

# If slow without recent changes:
npm run cache:clear
npm run build:deploy              # Force full rebuild, check time

# If still slow:
npm run profile:build             # See which step takes longest
```

---

## Performance at a Glance

```
First Run (Cold Cache):
  npm run build:deploy → 45-60s

Subsequent Runs (Warm Cache):
  npm run build:deploy → 15-25s (if inputs unchanged)

Only Blog Changed:
  npm run build:deploy → 20-25s (data steps cached)

Full QA Checks:
  npm run build:qa → 15-20s (parallel)

Combined Full Build:
  npm run build:deploy && npm run build:qa → ~75s
```

---

## Troubleshooting

### Build is slow despite cache

```bash
npm run cache:clear
npm run build:deploy
```

### QA checks failing

```bash
# Ensure build completed
npm run build:deploy

# Then run QA
npm run build:qa
```

### Out of memory during QA

Edit `scripts/build-qa.mjs`, change `maxConcurrency` from 8 to 4:

```javascript
const maxConcurrency = 4  // Was 8
```

### Need old full build behavior

```bash
npm run build:deploy && npm run build:qa
```

---

## When to Use Each Command

### Use `npm run build:deploy`

✅ Before deploying to Cloudflare Pages  
✅ Quick validation of data changes  
✅ Testing site generation  
✅ Fast CI/CD deployments  

### Use `npm run build:qa`

✅ Pre-commit validation  
✅ Comprehensive testing  
✅ Before merging to main  
✅ Post-deployment verification  

### Use `npm run cache:clear`

✅ CI/CD environments (start fresh)  
✅ Suspected cache corruption  
✅ After major refactoring  
✅ Troubleshooting "impossible" build issues  

### Use `npm run profile:build`

✅ Investigating slow builds  
✅ Analyzing time distribution  
✅ Finding optimization opportunities  
✅ After major changes to code  

---

## Time Expectations

| Scenario | Time | Notes |
|----------|------|-------|
| First deploy | 45-60s | Cold cache, all steps run |
| Second deploy (no changes) | 15-25s | Cache hit on data steps |
| QA checks | 15-20s | Parallel execution |
| Blog only changes | 20-25s | Data steps cached |
| Full build + QA | ~75s | Typical full validation |
| Profiling | 2-3 min | Measures all steps |

---

## Environment Variables

Control cache behavior:

```bash
# Force full rebuild (ignore cache)
CLEAR_CACHE=true npm run build:deploy

# Disable caching entirely
USE_CACHE=false npm run build:deploy
```

---

## For CI/CD Integration

Add to your CI script:

```bash
#!/bin/bash
set -e

# Build production version
npm run cache:clear
npm run build:deploy

# Comprehensive verification
npm run build:qa

# Deploy (if using Cloudflare Pages)
# wrangler pages deploy out/
```

---

## Migration from Old Build

**Old command:**
```bash
npm run build
```

**New command (same behavior, faster):**
```bash
npm run build:deploy && npm run build:qa
```

---

## Key Improvements Over Old Build

| Aspect | Old | New | Benefit |
|--------|-----|-----|---------|
| Deploy time | 150-180s | 45-60s | 67% faster |
| Blocked by QA | Yes ❌ | No ✅ | Deploy immediately |
| Caching | None | SHA-256 hashing | 85% faster on unchanged code |
| QA time | 120s sequential | 15-20s parallel | 85% faster |
| Static export preserved | ✅ | ✅ | No compromises |

---

## What Changed Under the Hood

```
Data Sources (unchanged):
  - Workbook (Excel files)
  - Blog posts (Markdown)
  - Code (TypeScript/React)

Build Process (reorganized):
  - OLD: All steps in one npm run build
  - NEW: Split into build:deploy + build:qa
  - Added: Input hashing for caching
  - Added: Parallel QA execution

Output (unchanged):
  - Static HTML/CSS/JS
  - public/data/ artifacts
  - out/ directory for deployment
```

---

## Next Steps

1. Run `npm run build:deploy` to test new pipeline
2. Run `npm run build:qa` to verify everything
3. Check `npm run cache:status` to see caching in action
4. Review `docs/performance/BUILD-PIPELINE.md` for details

---

## Need Help?

See the full guide: `docs/performance/BUILD-PIPELINE.md`  
See implementation details: `docs/performance/IMPLEMENTATION-SUMMARY.md`

---

**Last Updated:** June 2026
