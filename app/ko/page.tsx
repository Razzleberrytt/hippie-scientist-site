import LocalizedCorePage from '@/components/localization/LocalizedCorePage'
import { KOREAN_PAGES, KOREAN_UI, buildKoreanPageMetadata } from '@/src/lib/asian-language-content'

const page = KOREAN_PAGES.home
export const metadata = buildKoreanPageMetadata(page)

export default function KoreanHomePage() {
  return <LocalizedCorePage page={page} ui={KOREAN_UI} lang='ko' />
}
