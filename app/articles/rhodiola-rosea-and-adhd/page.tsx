import FocusAdhdArticlePage, { focusAdhdMetadata } from '@/components/articles/FocusAdhdArticlePage'

const SLUG = 'rhodiola-rosea-and-adhd' as const

export const metadata = focusAdhdMetadata(SLUG)

export default function Page() {
  return <FocusAdhdArticlePage slug={SLUG} />
}
