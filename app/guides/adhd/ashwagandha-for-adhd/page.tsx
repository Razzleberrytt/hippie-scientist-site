import FocusAdhdArticlePage from '@/components/articles/FocusAdhdArticlePage'
import { buildPageMetadata } from '@/src/lib/seo'

const SLUG = 'ashwagandha-for-adhd'

export const metadata = buildPageMetadata({
  title: 'Ashwagandha for ADHD: Does It Help Focus or Stress?',
  description:
    'Direct ADHD evidence is limited. See what human research shows for stress, sleep, and cognition, plus extract context, side effects, interactions, and realistic limits.',
  path: `/guides/adhd/${SLUG}/`,
  openGraphType: 'article',
})

export default function Page() {
  return <FocusAdhdArticlePage slug={SLUG} />
}
