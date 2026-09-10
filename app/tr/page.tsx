import LocalizedCorePage from '@/components/localization/LocalizedCorePage'
import { TURKISH_PAGES, TURKISH_UI, buildTurkishPageMetadata } from '@/lib/zh-tr-language-content'

const page = TURKISH_PAGES.home
export const metadata = buildTurkishPageMetadata(page)

export default function TurkishHomePage() {
  return <LocalizedCorePage page={page} ui={TURKISH_UI} lang='tr' />
}
