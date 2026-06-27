import { SeoEntryPage, generateSeoEntryMetadata } from '../seo-entry-pages'

const route = 'herbs-for-sleep'

export const metadata = generateSeoEntryMetadata(route)

export default function Page(){
  return <SeoEntryPage route={route} />
}
