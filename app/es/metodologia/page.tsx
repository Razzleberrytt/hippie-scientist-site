import SpanishCorePage from '@/components/localization/SpanishCorePage'
import { buildSpanishPageMetadata, SPANISH_PAGES } from '@/src/lib/spanish-content'

const page = SPANISH_PAGES.methodology

export const metadata = buildSpanishPageMetadata(page)

export default function SpanishMethodologyPage() {
  return <SpanishCorePage page={page} />
}
