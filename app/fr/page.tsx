import LocalizedCorePage from '@/components/localization/LocalizedCorePage'
import { FRENCH_PAGES, FRENCH_UI, buildFrenchPageMetadata } from '@/lib/french-content'

const page = FRENCH_PAGES.home
export const metadata = buildFrenchPageMetadata(page)

export default function FrenchHomePage() {
  return <LocalizedCorePage page={page} ui={FRENCH_UI} lang='fr' />
}
