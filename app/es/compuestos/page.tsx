import SpanishCorePage from '@/components/localization/SpanishCorePage'
import { buildSpanishPageMetadata, SPANISH_PAGES } from '@/src/lib/spanish-content'

const page = SPANISH_PAGES.compounds

export const metadata = buildSpanishPageMetadata(page)

export default function SpanishCompoundsPage() {
  return <SpanishCorePage page={page} />
}
