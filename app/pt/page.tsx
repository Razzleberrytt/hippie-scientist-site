import LocalizedCorePage from '@/components/localization/LocalizedCorePage'
import {
  PORTUGUESE_PAGES,
  PORTUGUESE_UI,
  buildPortuguesePageMetadata,
} from '@/src/lib/portuguese-content'

const page = PORTUGUESE_PAGES.home

export const metadata = buildPortuguesePageMetadata(page)

export default function PortugueseHomePage() {
  return <LocalizedCorePage page={page} ui={PORTUGUESE_UI} lang='pt-BR' />
}
