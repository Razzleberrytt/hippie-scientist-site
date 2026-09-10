import LocalizedCorePage from '@/components/localization/LocalizedCorePage'
import { THAI_PAGES, THAI_UI, buildThaiPageMetadata } from '@/lib/global-language-content'

const page = THAI_PAGES.home
export const metadata = buildThaiPageMetadata(page)

export default function ThaiHomePage() {
  return <LocalizedCorePage page={page} ui={THAI_UI} lang='th' />
}
