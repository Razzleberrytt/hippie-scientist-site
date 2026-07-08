import FocusAdhdArticlePage, { focusAdhdMetadata } from '@/components/articles/FocusAdhdArticlePage'
import { Omega3AdhdSeoAppendix } from '@/components/articles/AdhdSeoIdeaAppendix'

const SLUG = 'omega-3-and-adhd'

export const metadata = focusAdhdMetadata(SLUG)

export default function Page() {
  return (
    <>
      <FocusAdhdArticlePage slug={SLUG} />
      <Omega3AdhdSeoAppendix />
    </>
  )
}
