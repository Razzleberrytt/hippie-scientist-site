import { SeoEntryPage, generateSeoEntryMetadata } from '../../seo-entry-pages'

const route = 'guides/magnesium-for-sleep'

export const metadata = {
  ...generateSeoEntryMetadata(route),
  robots: { index: true, follow: true },
}

export default function MagnesiumForSleepGuidePage() {
  return <SeoEntryPage route={route} />
}
