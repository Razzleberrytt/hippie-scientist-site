import SpanishCorePage from '@/components/localization/SpanishCorePage'
import { buildSpanishPageMetadata, SPANISH_PAGES } from '@/src/lib/spanish-content'

const page = SPANISH_PAGES.safety

export const metadata = buildSpanishPageMetadata(page)

export default function SpanishSafetyPage() {
  return <SpanishCorePage page={page} />
}
