import { SeoEntryPage, generateSeoEntryMetadata } from '../../../seo-entry-pages'

const CANONICAL_PATH = '/guides/best/supplements-for-gut-health/'
const route = 'best-supplements-for-gut-health'

export const metadata = generateSeoEntryMetadata(route, CANONICAL_PATH)

export default function Page(){
  return <SeoEntryPage route={route} canonicalPath={CANONICAL_PATH} />
}
