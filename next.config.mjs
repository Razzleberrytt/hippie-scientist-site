/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/natural-anxiolytics-beyond-ashwagandha',
        destination: '/guides/natural-anxiolytics-beyond-ashwagandha',
        permanent: true,
      },
      {
        source: '/psychedelic-adjacent-herbs',
        destination: '/guides/psychedelic-adjacent-herbs',
        permanent: true,
      },
      {
        source: '/sleep-herbs-vs-melatonin',
        destination: '/guides/sleep-herbs-vs-melatonin',
        permanent: true,
      },
    ]
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

export default nextConfig
