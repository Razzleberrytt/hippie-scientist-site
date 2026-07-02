import { SeoEntryPage, generateSeoEntryMetadata } from '../../../seo-entry-pages'

const CANONICAL_PATH = '/guides/focus/best-supplements-for-focus/'
const route = 'best-supplements-for-focus'

export const metadata = generateSeoEntryMetadata(route, CANONICAL_PATH)

export default function Page(){
  return <SeoEntryPage route={route} canonicalPath={CANONICAL_PATH} />
}
