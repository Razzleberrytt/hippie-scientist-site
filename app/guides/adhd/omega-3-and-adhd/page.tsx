import FocusAdhdArticlePage from '@/components/articles/FocusAdhdArticlePage'
import { Omega3AdhdSeoAppendix } from '@/components/articles/AdhdSeoIdeaAppendix'
import { buildPageMetadata } from '@/src/lib/seo'

const SLUG = 'omega-3-and-adhd'

export const metadata = buildPageMetadata({
  title: 'Omega-3 for ADHD: EPA vs DHA, Evidence & Dose',
  description:
    'Does omega-3 help ADHD? See what human trials show, whether higher-EPA formulas matter, studied dose ranges, side effects, and fish-oil quality checks.',
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
