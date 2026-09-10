import LocalizedCorePage from '@/components/localization/LocalizedCorePage'
import { RUSSIAN_PAGES, RUSSIAN_UI, buildRussianPageMetadata } from '@/lib/global-language-content'

const page = RUSSIAN_PAGES.home
export const metadata = buildRussianPageMetadata(page)

export default function RussianHomePage() {
  return <LocalizedCorePage page={page} ui={RUSSIAN_UI} lang='ru' />
}
