import { SeoEntryPage, generateSeoEntryMetadata } from '../../../seo-entry-pages'

const route = 'best-supplements-for-stress'
const CANONICAL_PATH = '/guides/best/supplements-for-stress/'

export const metadata = generateSeoEntryMetadata(route, CANONICAL_PATH)

export default function Page(){
  return <SeoEntryPage route={route} canonicalPath={CANONICAL_PATH} />
}
