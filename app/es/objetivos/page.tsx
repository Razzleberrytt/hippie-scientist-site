import SpanishCorePage from '@/components/localization/SpanishCorePage'
import { buildSpanishPageMetadata, SPANISH_PAGES } from '@/src/lib/spanish-content'

const page = SPANISH_PAGES.goals

export const metadata = buildSpanishPageMetadata(page)

export default function SpanishGoalsPage() {
  return <SpanishCorePage page={page} />
}
