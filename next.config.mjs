import bundleAnalyzer from '@next/bundle-analyzer'
import { withContentCollections } from '@content-collections/next'

// Security headers are managed at the CDN/edge layer rather than here.
// Rationale: this project uses `output: 'export'` (fully static), which means
// Next.js's `headers()` config function is unsupported and ignored. All
// production security headers (CSP, HSTS, X-Frame-Options, COOP, CORP, etc.)
// are defined in `public/_headers` (Cloudflare Pages format) and validated in
// CI by `scripts/ci/validate-security-headers.mjs`. See ARCHITECTURE_OVERVIEW.md §6.

const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
  // outputFileTracingRoot: helps Next.js file tracing in git worktrees and certain monorepo setups.
  // Silences "Lockfile ... " or workspace-related tracing warnings without changing behavior.
  // See plan for 2026-06-05 Phase 2 note.
  outputFileTracingRoot: process.cwd(),
  experimental: {
    // Limit static-generation workers to 2 to avoid OOM on memory-constrained build hosts.
    cpus: 2,
  },
  images: {
    loader: 'custom',
    loaderFile: './src/lib/cloudflare-image-loader.ts',
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
