import LocalizedCorePage from '@/components/localization/LocalizedCorePage'
import { POLISH_PAGES, POLISH_UI, buildPolishPageMetadata } from '@/src/lib/expanded-language-content'

const page = POLISH_PAGES.home
export const metadata = buildPolishPageMetadata(page)

export default function PolishHomePage() {
  return <LocalizedCorePage page={page} ui={POLISH_UI} lang='pl' />
}
