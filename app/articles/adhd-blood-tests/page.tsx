import FocusAdhdArticlePage, { focusAdhdMetadata } from '@/components/articles/FocusAdhdArticlePage'

const SLUG = 'adhd-blood-tests'

export const metadata = focusAdhdMetadata(SLUG)

export default function Page() {
  return <FocusAdhdArticlePage slug={SLUG} />
}
