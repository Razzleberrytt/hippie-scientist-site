import { SeoEntryPage, generateSeoEntryMetadata } from '../seo-entry-pages'

const route = 'best-adaptogens-for-stress'

export const metadata = generateSeoEntryMetadata(route)

export default function Page(){
  return <SeoEntryPage route={route} />
}
