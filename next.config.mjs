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
      { source: '/compounds/coq10', destination: '/compounds/coenzyme-q10', permanent: true },
      { source: '/compounds/coenzyme-q10-ubiquinol', destination: '/compounds/coenzyme-q10', permanent: true },
      { source: '/compounds/theanine', destination: '/compounds/l-theanine', permanent: true },
      { source: '/compounds/l-theanine-sleep', destination: '/compounds/l-theanine', permanent: true },
      { source: '/compounds/methyleugenol', destination: '/compounds/methyl-eugenol', permanent: true },
      { source: '/compounds/bcaas', destination: '/compounds/bcaa', permanent: true },
      { source: '/compounds/green-tea-egcg-isolated', destination: '/compounds/green-tea-extract', permanent: true },
      { source: '/compounds/green-tea-extract-egcg', destination: '/compounds/green-tea-extract', permanent: true },
      { source: '/compounds/probiotic-multistrain', destination: '/compounds/probiotics', permanent: true },
      { source: '/compounds/probiotic-strain-bifidobacterium', destination: '/compounds/probiotics', permanent: true },
      { source: '/compounds/probiotic-strain-lactobacillus', destination: '/compounds/probiotics', permanent: true },
      { source: '/compounds/probiotics-bifidobacterium', destination: '/compounds/probiotics', permanent: true },
      { source: '/compounds/probiotics-lactobacillus', destination: '/compounds/probiotics', permanent: true },
      { source: '/compounds/taurine-blend', destination: '/compounds/taurine', permanent: true },
      { source: '/compounds/taurine-sleep', destination: '/compounds/taurine', permanent: true },
      { source: '/compounds/glycine-sleep', destination: '/compounds/glycine', permanent: true },
      { source: '/compounds/inositol-sleep', destination: '/compounds/inositol', permanent: true },
      { source: '/compounds/ashwagandha-extract-ksm-66', destination: '/herbs/ashwagandha', permanent: true },
      { source: '/compounds/ashwagandha-root-extract', destination: '/herbs/ashwagandha', permanent: true },
      { source: '/compounds/garlic', destination: '/herbs/garlic', permanent: true },
      { source: '/compounds/garlic-extract', destination: '/herbs/garlic', permanent: true },
      { source: '/compounds/garlic-aged-extract', destination: '/herbs/garlic', permanent: true },
      { source: '/compounds/aged-garlic-extract', destination: '/herbs/garlic', permanent: true },
      { source: '/herbs/allium-sativum', destination: '/herbs/garlic', permanent: true },
      { source: '/compounds/ginger', destination: '/herbs/ginger', permanent: true },
      { source: '/compounds/gingerol', destination: '/herbs/ginger', permanent: true },
      { source: '/compounds/gingerols', destination: '/herbs/ginger', permanent: true },
      { source: '/compounds/valerian', destination: '/herbs/valerian', permanent: true },
      { source: '/compounds/valerian-extract-standardized', destination: '/herbs/valerian', permanent: true },
      { source: '/compounds/valerian-root-extract', destination: '/herbs/valerian', permanent: true },
      { source: '/herbs/valeriana-officinalis', destination: '/herbs/valerian', permanent: true },
      { source: '/compounds/lions-mane', destination: '/herbs/lions-mane', permanent: true },
      { source: '/herbs/hericium-erinaceus', destination: '/herbs/lions-mane', permanent: true },
      { source: '/compounds/passionflower', destination: '/herbs/passionflower', permanent: true },
      { source: '/compounds/passionflower-extract', destination: '/herbs/passionflower', permanent: true },
      { source: '/compounds/passionflower-extract-standardized', destination: '/herbs/passionflower', permanent: true },
      { source: '/herbs/passiflora-incarnata', destination: '/herbs/passionflower', permanent: true },
      { source: '/compounds/kava', destination: '/herbs/kava', permanent: true },
      { source: '/compounds/kavalactones', destination: '/herbs/kava', permanent: true },
      { source: '/herbs/piper-methysticum', destination: '/herbs/kava', permanent: true },
      { source: '/compounds/reishi', destination: '/herbs/reishi', permanent: true },
      { source: '/herbs/ganoderma-lucidum', destination: '/herbs/reishi', permanent: true },
      { source: '/compounds/maca', destination: '/herbs/maca', permanent: true },
      { source: '/compounds/maca-root-extract', destination: '/herbs/maca', permanent: true },
      { source: '/compounds/elderberry', destination: '/herbs/elderberry', permanent: true },
      { source: '/compounds/resveratrol', destination: '/herbs/resveratrol', permanent: true },
      { source: '/compounds/trans-resveratrol', destination: '/herbs/resveratrol', permanent: true },
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
