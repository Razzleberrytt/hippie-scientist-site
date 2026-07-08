import FocusAdhdArticlePage, { focusAdhdMetadata } from '@/components/articles/FocusAdhdArticlePage'
import { BestAdhdSupplementsSeoAppendix } from '@/components/articles/AdhdSeoIdeaAppendix'

const SLUG = 'best-supplements-for-adhd'

export const metadata = focusAdhdMetadata(SLUG)

export default function Page() {
  return (
    <>
      <FocusAdhdArticlePage slug={SLUG} />
      <BestAdhdSupplementsSeoAppendix />
    </>
  )
}
