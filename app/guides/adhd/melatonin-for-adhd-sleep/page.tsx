import FocusAdhdArticlePage from '@/components/articles/FocusAdhdArticlePage'
import { buildPageMetadata } from '@/src/lib/seo'

const SLUG = 'melatonin-for-adhd-sleep'

export const metadata = buildPageMetadata({
  title: 'Melatonin for ADHD Sleep: Does It Help & Is It Safe?',
  description:
    'Research-grade review of melatonin for ADHD sleep: pediatric and adult trials, circadian timing, stimulant-treated data, long-term uncertainty, label accuracy, and child-safety risks.',
  path: `/guides/adhd/${SLUG}/`,
  openGraphType: 'article',
})

export default function Page() {
  return <FocusAdhdArticlePage slug={SLUG} />
}
