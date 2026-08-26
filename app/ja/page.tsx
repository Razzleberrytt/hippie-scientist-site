import LocalizedCorePage from '@/components/localization/LocalizedCorePage'
import { JAPANESE_PAGES, JAPANESE_UI, buildJapanesePageMetadata } from '@/src/lib/asian-language-content'

const page = JAPANESE_PAGES.home
export const metadata = buildJapanesePageMetadata(page)

export default function JapaneseHomePage() {
  return <LocalizedCorePage page={page} ui={JAPANESE_UI} lang='ja' />
}
