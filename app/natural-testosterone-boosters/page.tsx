import { SeoEntryPage, generateSeoEntryMetadata } from '../seo-entry-pages'

const route = 'natural-testosterone-boosters'

export const metadata = generateSeoEntryMetadata(route)

export default function Page(){
  return <SeoEntryPage route={route} />
}
