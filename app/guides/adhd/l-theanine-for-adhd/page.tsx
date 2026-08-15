import FocusAdhdArticlePage from '@/components/articles/FocusAdhdArticlePage'
import { buildPageMetadata } from '@/src/lib/seo'

const SLUG = 'l-theanine-for-adhd'

export const metadata = buildPageMetadata({
  title: 'L-Theanine for ADHD: Does It Help Focus or Sleep?',
  description:
    '2026 evidence review of L-theanine for ADHD, including the new 21-adolescent crossover vs methylphenidate, older pediatric trials, sleep evidence, dose limits, and medication-safety gaps.',
  path: `/guides/adhd/${SLUG}/`,
  openGraphType: 'article',
})

export default function Page() {
  return <FocusAdhdArticlePage slug={SLUG} />
}
