import { SeoEntryPage, generateSeoEntryMetadata } from '../../../seo-entry-pages'

const CANONICAL_PATH = '/guides/best/supplements-for-fat-loss/'
const route = 'best-supplements-for-fat-loss'

export const metadata = generateSeoEntryMetadata(route, CANONICAL_PATH)

export default function Page(){
  return <SeoEntryPage route={route} canonicalPath={CANONICAL_PATH} />
}
