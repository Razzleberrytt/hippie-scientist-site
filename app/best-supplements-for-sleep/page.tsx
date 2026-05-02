import { SeoEntryPage, generateSeoEntryMetadata } from '../seo-entry-pages'

export const metadata = generateSeoEntryMetadata('best-supplements-for-sleep')

export default function Page(){
  return <SeoEntryPage route="best-supplements-for-sleep" />
}
