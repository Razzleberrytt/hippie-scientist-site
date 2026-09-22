import bundleAnalyzer from '@next/bundle-analyzer'
import { withContentCollections } from '@content-collections/next'

// Security headers are managed at the CDN/edge layer rather than here.
// Rationale: this project uses `output: 'export'` (fully static), which means
// Next.js's `headers()` config function is unsupported and ignored. All
// production security headers (CSP, HSTS, X-Frame-Options, COOP, CORP, etc.)
// are defined in `public/_headers` (Cloudflare Pages format) and validated in
// CI by `scripts/ci/validate-security-headers.mjs`. See ARCHITECTURE_OVERVIEW.md §6.

const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })

// Public GitHub-hosted ubuntu runners provide 4 vCPUs / 16 GB. Use the whole
// runner for static generation in CI, while keeping the conservative 2-worker
// ceiling on Cloudflare and local/unknown build hosts.
const staticGenerationCpus = process.env.GITHUB_ACTIONS === 'true' ? 4 : 2
// Next 15 defaults to 8 pages per static-generation worker. The measured GitHub
// build is dominated by 1,570-page static generation, so trial a bounded 12-page
// concurrency only on the known 4-vCPU/16-GB hosted runner. Other hosts retain
// Next's default 8-page setting.
const staticGenerationMaxConcurrency = process.env.GITHUB_ACTIONS === 'true' ? 12 : 8
// GitHub CI already runs the dedicated `npm run typecheck` gate in parallel with
// the production build lane. Avoid paying Next's duplicate ~30s typecheck on the
// build critical path there; Cloudflare/local builds keep Next typechecking on.
const skipNextBuildTypecheck = process.env.GITHUB_ACTIONS === 'true'

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: skipNextBuildTypecheck,
  },
  output: 'export',
  trailingSlash: true,
  // Skip ESLint during `next build`. Linting ~1.4k files inside the production
  // build duplicates the dedicated `npm run lint` / `check` / `check:full` gates
  // and adds tens of seconds to every build. Lint stays enforced in those gates.
  // TypeScript checking is intentionally left ON (no `typescript.ignoreBuildErrors`)
  // so the build still fails on real type errors.
  eslint: {
    ignoreDuringBuilds: true,
  },
  // outputFileTracingRoot: helps Next.js file tracing in git worktrees and certain monorepo setups.
  // Silences "Lockfile ... " or workspace-related tracing warnings without changing behavior.
  // See plan for 2026-06-05 Phase 2 note.
  outputFileTracingRoot: process.cwd(),
  experimental: {
    // Inline the generated CSS into the initial HTML so first-load visitors do
    // not wait on render-blocking stylesheet requests before the first paint.
    // This is particularly useful here because the site is a static export and
    // the global Tailwind/CSS surface is shared across the initial route shell.
    // Navigation loads can still use normal stylesheet links to avoid repeatedly
    // duplicating cached CSS.
    inlineCss: true,
    // GitHub CI has a known 4-core/16-GB runner; other build hosts stay at 2
    // workers to preserve the existing memory-safety envelope.
    cpus: staticGenerationCpus,
    staticGenerationMaxConcurrency,
  },
  images: {
    // Static export cannot use Next's *runtime* optimizer, but it can use a
    // build-time one. `unoptimized: true` disabled the pipeline outright, so
    // `next/image` emitted no `srcset` and no modern format and every image
    // shipped as its full-size original — the Ashwagandha hero was a 263KB JPEG
    // carrying `priority`, which preloaded and took critical-path bandwidth
    // from the render-blocking CSS.
    //
    // The custom loader resolves each requested width to a WebP variant that
    // `scripts/optimize-images.mjs` pre-rendered at build time, and falls back
    // to the original for anything it has no variant for (remote Amazon images,
    // SVGs, encode failures). No runtime service is involved, so this stays
    // compatible with `output: 'export'`.
    loader: 'custom',
    loaderFile: './lib/cloudflare-image-loader.ts',
    remotePatterns: [
      { protocol: 'https', hostname: '**.media-amazon.com' },
      { protocol: 'https', hostname: '**.ssl-images-amazon.com' },
      { protocol: 'https', hostname: 'm.media-amazon.com' },
      { protocol: 'https', hostname: 'images-na.ssl-images-amazon.com' },
      { protocol: 'https', hostname: 'images.amazon.com' },
    ],
  },
  webpack: (config, { webpack }) => {
    const buildDate = new Date().toISOString().split('T')[0]
    const buildTime = new Date().toISOString()
    const rawHash = process.env.COMMIT_HASH || process.env.CF_PAGES_COMMIT_SHA || process.env.NEXT_PUBLIC_COMMIT_SHA
    const commitHash = rawHash && rawHash !== 'unknown' && rawHash !== 'local' ? rawHash.slice(0, 7) : 'local'
    const appVersion = process.env.APP_VERSION || '1.0.0'

    config.plugins.push(
      new webpack.DefinePlugin({
        __BUILD_DATE__: JSON.stringify(buildDate),
        __BUILD_TIME__: JSON.stringify(buildTime),
        __COMMIT_HASH__: JSON.stringify(commitHash),
        __APP_VERSION__: JSON.stringify(appVersion),
      })
    )

    return config
  },
}

export default withContentCollections(withBundleAnalyzer(nextConfig))
