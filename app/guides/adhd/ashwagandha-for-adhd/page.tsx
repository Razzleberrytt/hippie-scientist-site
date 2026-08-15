import FocusAdhdArticlePage from '@/components/articles/FocusAdhdArticlePage'
import { buildPageMetadata } from '@/src/lib/seo'

const SLUG = 'ashwagandha-for-adhd'

export const metadata = buildPageMetadata({
  title: 'Ashwagandha for ADHD: 2026 Evidence, Liver Risk & Safety',
  description:
    'Ashwagandha ADHD evidence is preliminary. Review the pediatric preprint, non-ADHD cognition data, stress/sleep evidence, liver-injury reports, thyroid cautions, and medication limits.',
  path: `/guides/adhd/${SLUG}/`,
  openGraphType: 'article',
})

export default function Page() {
  return <FocusAdhdArticlePage slug={SLUG} />
}
