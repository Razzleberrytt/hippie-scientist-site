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

1. **Avoid repetitive full builds**: Do not run `npm run build` or `npm run validate:release` after every exploratory edit.
2. **Batch related work, not unrelated tickets**: Keep one scoped ticket/branch, make the related UI/content-hierarchy edits together, and use the fast tier while the batch is still moving. Do not use batching to mix unrelated tickets or bypass scientific, safety, security, accessibility, canonical-data, or route-governance gates.
3. **Fail deterministic contracts first**: Proven bounded hub changes should run source-reading and source↔postbuild copy contracts before broad lint/test/build work. If the diff leaves the explicit allowlist, CI fails closed to the exhaustive path.
4. **Run exhaustive release validation once the batch is stable**: The exact PR head still receives the authoritative production build/output/SEO gate at the merge boundary. Release-sensitive ambiguity never inherits a fast path merely because an earlier commit qualified.
5. **Reuse exact-head build artifacts**: Build-dependent consumers should use the hash-bound governed static export produced by authoritative CI when available. Missing, stale, mismatched, fork, or otherwise untrusted artifacts fall back to a complete build.
6. **P0 visual proof remains mandatory when triggered**: Same-repository PRs consume the governed CI export instead of compiling the same exact head again; fork/Dependabot or artifact-verification failure uses the self-built fallback.
