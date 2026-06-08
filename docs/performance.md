# Performance & Bundle Budgets

This document records performance targets and guidance for the static export site.

## Bundle Size Targets (guidance, not yet enforced in CI)
- First Load JS (shared + page): target under 150KB where feasible for main routes (homepage, libraries, profiles).
- Use `npm run analyze` or `npm run build:analyze` to inspect (enables @next/bundle-analyzer only when ANALYZE=true).
- Avoid pulling large runtime deps (e.g. openai) into client bundles — they belong in devDependencies or scripts/agent only.

## LCP / Core Web Vitals Targets
- LCP < 2.5s on mobile (lab data).
- Use unoptimized images (required for `output: 'export'`) but always provide explicit `width`/`height`, `loading="lazy"`, `decoding="async"`, `alt`, and `sizes` to prevent CLS and improve LCP.
- Prefer next/image (with unoptimized) or well-attributed <img> for CLS prevention.
- No server-side image optimization; assets should be pre-sized or use remote patterns for CDNs (e.g. Amazon).

## Image Strategy
- `images.unoptimized: true` in next.config.mjs (non-negotiable for static export + Cloudflare Pages).
- For remote images (affiliate/product): use next/image + unoptimized + isOptimizableRemoteImage guard.
- Local/semantic images: referenced via registry (webp fallbacks planned but currently static assets).
- Improvements: always include dimensions and modern loading attrs. For future: add build-time sharp step to generate responsive variants if more local images added.

## Dependency Hygiene
- openai: only for build/agent/scripts; guarded against client imports via validate-direct-dependencies.
- framer-motion: removed (low usage, only in legacy/quarantined src/ and one unused GlassCard; replaced with CSS transitions in GlassCard).
- lucide-react: upgraded to current; imports are named (tree-shakeable).
- react-countup: not a direct dependency (custom hook in legacy src/); no action needed.
- Run `npm ci` after changes; validate with `npm run check`.

## Running Analyzer
- `npm run analyze` or `npm run build:analyze`
- Sets ANALYZE=true to enable bundle visualizer (opens report, does not affect normal `npm run build`).

## Related
- See docs/performance/bundle-audit.md , client-bundle-analysis.md etc for historical data.
- Targets may be tightened later with CI budgets once stable.

Last updated: 2026
