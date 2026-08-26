import LocalizedCorePage from '@/components/localization/LocalizedCorePage'
import { ITALIAN_PAGES, ITALIAN_UI, buildItalianPageMetadata } from '@/src/lib/expanded-language-content'

const page = ITALIAN_PAGES.home
export const metadata = buildItalianPageMetadata(page)

export default function ItalianHomePage() {
  return <LocalizedCorePage page={page} ui={ITALIAN_UI} lang='it' />
}
