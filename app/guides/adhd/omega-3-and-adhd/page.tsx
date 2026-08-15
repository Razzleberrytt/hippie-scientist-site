import FocusAdhdArticlePage from '@/components/articles/FocusAdhdArticlePage'
import { Omega3AdhdSeoAppendix } from '@/components/articles/AdhdSeoIdeaAppendix'
import { buildPageMetadata } from '@/src/lib/seo'

const SLUG = 'omega-3-and-adhd'

export const metadata = buildPageMetadata({
  title: 'Omega-3 for ADHD: 2026 Evidence, EPA vs DHA & Safety',
  description:
    '2026 omega-3 ADHD evidence: conflicting meta-analyses, baseline EPA/DHA status, EPA-vs-DHA claims, study-dose limits, fish-oil quality, and safety.',
  path: `/guides/adhd/${SLUG}/`,
  openGraphType: 'article',
})

export default function Page() {
  return (
    <>
      <FocusAdhdArticlePage slug={SLUG} />
      <Omega3AdhdSeoAppendix />
    </>
  )
}
