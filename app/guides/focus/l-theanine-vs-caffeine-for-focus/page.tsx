import FocusAdhdArticlePage, { focusAdhdMetadata } from '@/components/articles/FocusAdhdArticlePage'

const SLUG = 'l-theanine-vs-caffeine-for-focus'
const BASE_PATH = '/guides/focus'

export const metadata = focusAdhdMetadata(SLUG, BASE_PATH)

export default function Page() {
  return <FocusAdhdArticlePage slug={SLUG} basePath={BASE_PATH} />
}
