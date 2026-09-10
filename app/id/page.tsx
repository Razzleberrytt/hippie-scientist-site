import LocalizedCorePage from '@/components/localization/LocalizedCorePage'
import { INDONESIAN_PAGES, INDONESIAN_UI, buildIndonesianPageMetadata } from '@/lib/hi-id-language-content'

const page = INDONESIAN_PAGES.home
export const metadata = buildIndonesianPageMetadata(page)

export default function IndonesianHomePage() {
  return <LocalizedCorePage page={page} ui={INDONESIAN_UI} lang='id' />
}
