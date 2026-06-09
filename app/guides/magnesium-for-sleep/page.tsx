import { SeoEntryPage, generateSeoEntryMetadata } from '../../seo-entry-pages'

const route = 'guides/magnesium-for-sleep'

export const metadata = generateSeoEntryMetadata(route)

export default function MagnesiumForSleepGuidePage() {
  return <SeoEntryPage route={route} />
}
