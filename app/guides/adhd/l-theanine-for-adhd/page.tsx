import FocusAdhdArticlePage from '@/components/articles/FocusAdhdArticlePage'
import { buildPageMetadata } from '@/src/lib/seo'

const SLUG = 'l-theanine-for-adhd'

export const metadata = buildPageMetadata({
  title: 'L-Theanine for ADHD: Does It Help Focus or Sleep?',
  description:
    'What human studies actually show about L-theanine for ADHD, attention, and sleep, plus dose limits, stimulant interactions, side effects, and who should be cautious.',
  path: `/guides/adhd/${SLUG}/`,
  openGraphType: 'article',
})

export default function Page() {
  return <FocusAdhdArticlePage slug={SLUG} />
}
