import { SeoEntryPage, generateSeoEntryMetadata } from '../seo-entry-pages'

const route = 'best-supplements-for-fat-loss'

export const metadata = generateSeoEntryMetadata(route)

export default function Page(){
  return <SeoEntryPage route={route} />
}
