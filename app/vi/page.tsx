import LocalizedCorePage from '@/components/localization/LocalizedCorePage'
import { VIETNAMESE_PAGES, VIETNAMESE_UI, buildVietnamesePageMetadata } from '@/lib/global-language-content'

const page = VIETNAMESE_PAGES.home
export const metadata = buildVietnamesePageMetadata(page)

export default function VietnameseHomePage() {
  return <LocalizedCorePage page={page} ui={VIETNAMESE_UI} lang='vi' />
}
