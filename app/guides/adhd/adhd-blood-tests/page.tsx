import FocusAdhdArticlePage from '@/components/articles/FocusAdhdArticlePage'
import { buildPageMetadata } from '@/src/lib/seo'

const SLUG = 'adhd-blood-tests'

export const metadata = buildPageMetadata({
  title: 'ADHD Blood Tests: Which Labs Are Actually Useful?',
  description:
    'No blood test diagnoses ADHD. See when clinicians may consider ferritin and iron, vitamin D, B12, thyroid, or other labs to investigate symptoms and possible deficiencies.',
  path: `/guides/adhd/${SLUG}/`,
  openGraphType: 'article',
})

export default function Page() {
  return <FocusAdhdArticlePage slug={SLUG} />
}
