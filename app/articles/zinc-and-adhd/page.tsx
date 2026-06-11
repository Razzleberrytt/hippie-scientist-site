import FocusAdhdArticlePage, { focusAdhdMetadata } from '@/components/articles/FocusAdhdArticlePage'

const SLUG = 'zinc-and-adhd'

export const metadata = focusAdhdMetadata(SLUG)

export default function Page() {
  return <FocusAdhdArticlePage slug={SLUG} />
}
