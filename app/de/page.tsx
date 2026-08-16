import LocalizedCorePage from '@/components/localization/LocalizedCorePage'
import { GERMAN_PAGES, GERMAN_UI, buildGermanPageMetadata } from '@/src/lib/german-content'

const page = GERMAN_PAGES.home
export const metadata = buildGermanPageMetadata(page)

export default function GermanHomePage() {
  return <LocalizedCorePage page={page} ui={GERMAN_UI} lang='de' />
}
