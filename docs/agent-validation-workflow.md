# Agent Validation Workflow Guidelines

To maintain development speed and avoid long waiting times during coding loops, use this tiered validation system.

## Validation Tiers

Choose the appropriate command based on your modifications:

### 1. Content-Only Edits
Use this for edits to Markdown files (articles, blog posts) or workbook/JSON data files.
```bash
npm run validate:content
```
- **Runs**: Node version check, article quality check, fast linting of touched files, data validity checks, and fast typechecking.
- **Bypasses**: Full static Next.js compilation and page indexing.
- **Timing**: Under 15 seconds.

### 2. Component, Layout, and Library Edits
Use this for UI adjustments, component additions, or changes to logic libraries under `src/`, `lib/`, or `components/`.
```bash
npm run validate:code
```
- **Runs**: Node check, full TypeScript compiler check (`tsc --noEmit`), and full ESLint scan.
- **Bypasses**: Full static Next.js compilation and Pagefind indexing.
- **Timing**: Under 40 seconds.

### 3. Structural, Route, Sitemap, Schema, or Pre-Merge Verification
Use this only when introducing new routes, custom sitemaps, changing database schemas, or when preparing to open a PR or deploy.
```bash
npm run validate:release
```
- **Runs**: Full static Next.js compilation, full Pagefind indexing, and exhaustive post-build validation tests (e.g. structured data audit, internal link checking, duplicate metadata scans, FAQ taxonomy leak checks).
- **Timing**: 3+ minutes.

---

## Best Practices

1. **Avoid repetitive full builds**: Do not run `npm run build` or `npm run validate:release` repeatedly while making exploratory edits.
2. **Validate early with fast tiers**: Use `npm run validate:content` or `npm run validate:code` to catch syntax, compiler, or structural data issues first.
3. **Run full build once stable**: Only compile the full static export once your changes have stabilized and you are ready for a PR check.
4. **CI Enforcement**: GitHub Actions and Cloudflare Page deployment pipelines will always execute the full release validation path (`npm run check:full`), guaranteeing 100% deployment safety.
