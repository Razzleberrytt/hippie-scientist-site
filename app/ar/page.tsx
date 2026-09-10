import LocalizedCorePage from '@/components/localization/LocalizedCorePage'
import { ARABIC_PAGES, ARABIC_UI, buildArabicPageMetadata } from '@/lib/global-language-content'

const page = ARABIC_PAGES.home
export const metadata = buildArabicPageMetadata(page)

export default function ArabicHomePage() {
  return <LocalizedCorePage page={page} ui={ARABIC_UI} lang='ar' />
}
