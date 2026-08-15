import FocusAdhdArticlePage from '@/components/articles/FocusAdhdArticlePage'
import { buildPageMetadata } from '@/src/lib/seo'

const SLUG = 'zinc-and-adhd'

export const metadata = buildPageMetadata({
  title: 'Zinc for ADHD: Does It Help? Evidence & Safety',
  description:
    'Does zinc help ADHD? Review human trials, who may benefit most when zinc is low, studied dose context, stimulant-combination evidence, side effects, and copper risk.',
  path: `/guides/adhd/${SLUG}/`,
  openGraphType: 'article',
})

export default function Page() {
  return <FocusAdhdArticlePage slug={SLUG} />
}
