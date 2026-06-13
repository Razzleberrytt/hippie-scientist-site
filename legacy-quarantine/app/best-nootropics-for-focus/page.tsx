import { SeoEntryPage, generateSeoEntryMetadata } from '../seo-entry-pages'

const route = 'best-nootropics-for-focus'

export const metadata = generateSeoEntryMetadata(route)

export default function Page(){
  return <SeoEntryPage route={route} />
}
