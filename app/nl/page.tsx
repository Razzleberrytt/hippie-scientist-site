import LocalizedCorePage from '@/components/localization/LocalizedCorePage'
import { DUTCH_PAGES, DUTCH_UI, buildDutchPageMetadata } from '@/src/lib/expanded-language-content'

const page = DUTCH_PAGES.home
export const metadata = buildDutchPageMetadata(page)

export default function DutchHomePage() {
  return <LocalizedCorePage page={page} ui={DUTCH_UI} lang='nl' />
}
