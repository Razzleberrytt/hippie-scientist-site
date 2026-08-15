import FocusAdhdArticlePage from '@/components/articles/FocusAdhdArticlePage'
import { buildPageMetadata } from '@/src/lib/seo'

const SLUG = 'melatonin-for-adhd-sleep'

export const metadata = buildPageMetadata({
  title: 'Melatonin for ADHD Sleep: Does It Help & Is It Safe?',
  description:
    'What ADHD sleep studies show about melatonin for sleep onset, timing, and dose context, including children, side effects, long-term uncertainty, and safety.',
  path: `/guides/adhd/${SLUG}/`,
  openGraphType: 'article',
})

export default function Page() {
  return <FocusAdhdArticlePage slug={SLUG} />
}
