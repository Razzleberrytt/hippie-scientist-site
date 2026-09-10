import LocalizedCorePage from '@/components/localization/LocalizedCorePage'
import { SWEDISH_PAGES, SWEDISH_UI, buildSwedishPageMetadata } from '@/lib/global-language-content'

const page = SWEDISH_PAGES.home
export const metadata = buildSwedishPageMetadata(page)

export default function SwedishHomePage() {
  return <LocalizedCorePage page={page} ui={SWEDISH_UI} lang='sv' />
}
