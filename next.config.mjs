import createBundleAnalyzer from '@next/bundle-analyzer'

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
  images: {
    // unoptimized: true is REQUIRED for `output: 'export'` (static) + Cloudflare Pages.
    // No Next server image optimizer available. We use explicit width/height/sizes/decoding/lazy
    // + remote CDN images (Amazon) or pre-sized static assets for performance.
    // See docs/performance.md for strategy and bundle guidance.
    unoptimized: true,
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
    const commitHash = process.env.COMMIT_HASH || 'unknown'
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

const withBundleAnalyzer = createBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

export default withBundleAnalyzer(nextConfig)
