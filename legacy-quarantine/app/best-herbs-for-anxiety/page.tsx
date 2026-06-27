import { SeoEntryPage, generateSeoEntryMetadata } from '../seo-entry-pages'

const route = 'best-herbs-for-anxiety'

export const metadata = generateSeoEntryMetadata(route)

export default function Page(){
  return <SeoEntryPage route={route} />
}
