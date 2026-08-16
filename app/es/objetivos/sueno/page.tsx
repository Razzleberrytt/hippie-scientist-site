import SpanishCorePage from '@/components/localization/SpanishCorePage'
import { buildSpanishPageMetadata, SPANISH_PAGES } from '@/src/lib/spanish-content'

const page = SPANISH_PAGES.sleep

export const metadata = buildSpanishPageMetadata(page)

export default function SpanishSleepGoalPage() {
  return <SpanishCorePage page={page} />
}
