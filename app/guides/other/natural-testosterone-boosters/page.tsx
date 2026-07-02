import { SeoEntryPage, generateSeoEntryMetadata } from '../../../seo-entry-pages'

const route = 'natural-testosterone-boosters'
const CANONICAL_PATH = '/guides/other/natural-testosterone-boosters/'

export const metadata = generateSeoEntryMetadata(route, CANONICAL_PATH)

export default function Page() {
  return <SeoEntryPage route={route} canonicalPath={CANONICAL_PATH} />
}
