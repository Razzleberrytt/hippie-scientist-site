import LocalizedCorePage from '@/components/localization/LocalizedCorePage'
import { CHINESE_PAGES, CHINESE_UI, buildChinesePageMetadata } from '@/lib/zh-tr-language-content'

const page = CHINESE_PAGES.home
export const metadata = buildChinesePageMetadata(page)

export default function ChineseHomePage() {
  return <LocalizedCorePage page={page} ui={CHINESE_UI} lang='zh' />
}
