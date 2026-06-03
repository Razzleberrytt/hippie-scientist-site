import { SeoEntryPage, generateSeoEntryMetadata } from '../seo-entry-pages'

const route = 'best-supplements-for-blood-pressure'

export const metadata = generateSeoEntryMetadata(route)

export default function Page(){
  return <SeoEntryPage route={route} />
}
