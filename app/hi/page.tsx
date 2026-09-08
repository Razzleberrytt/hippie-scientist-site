import LocalizedCorePage from '@/components/localization/LocalizedCorePage'
import { HINDI_PAGES, HINDI_UI, buildHindiPageMetadata } from '@/lib/hi-id-language-content'

const page = HINDI_PAGES.home
export const metadata = buildHindiPageMetadata(page)

export default function HindiHomePage() {
  return <LocalizedCorePage page={page} ui={HINDI_UI} lang='hi' />
}
