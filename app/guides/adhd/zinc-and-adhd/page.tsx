import FocusAdhdArticlePage from '@/components/articles/FocusAdhdArticlePage'
import { buildPageMetadata } from '@/src/lib/seo'

const SLUG = 'zinc-and-adhd'

export const metadata = buildPageMetadata({
  title: 'Zinc for ADHD: 2026 Evidence, Deficiency & Safety',
  description:
    '2026 review of zinc for ADHD: new zinc-status data, randomized trials, stimulant-adjunct evidence, serum-test limits, elemental-vs-salt dosing, copper risk, and medication interactions.',
  path: `/guides/adhd/${SLUG}/`,
  openGraphType: 'article',
})

export default function Page() {
  return <FocusAdhdArticlePage slug={SLUG} />
}
