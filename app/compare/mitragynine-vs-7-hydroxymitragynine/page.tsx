import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { buildPageMetadata } from '@/src/lib/seo'
import { getItemBySlug, buildFAQs } from '@/lib/compare'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import CompareHero from '@/components/compare/CompareHero'
import CompareSummaryTable from '@/components/compare/CompareSummaryTable'
import CompareDecisionSection from '@/components/compare/CompareDecisionSection'
import CompareGoalSection from '@/components/compare/CompareGoalSection'
import CompareMechanisms from '@/components/compare/CompareMechanisms'
import CompareDosing from '@/components/compare/CompareDosing'
import CompareSafety from '@/components/compare/CompareSafety'
import CompareAffiliate from '@/components/compare/CompareAffiliate'
import CompareFAQ from '@/components/compare/CompareFAQ'
import CompareSchema from '@/components/compare/CompareSchema'

const SLUG = 'mitragynine-vs-7-hydroxymitragynine'

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: 'Mitragynine vs 7-Hydroxymitragynine: Complete Comparison | The Hippie Scientist',
    description: 'Compare mitragynine and 7-hydroxymitragynine: potency, metabolism, respiratory risk, dependence liability, and concentrated-product concerns.',
    path: `/compare/${SLUG}/`,
  }),
  alternates: { canonical: `https://thehippiescientist.net/compare/${SLUG}` },
}

export default function MitragynineVs7Hydroxymitragynine() {
  const item1 = getItemBySlug('mitragynine')
  const item2 = getItemBySlug('7-hydroxymitragynine')
  if (!item1 || !item2) { notFound() }
  const isHR = item1.isHarmReduction || item2.isHarmReduction
  const faqs = buildFAQs(item1, item2)
  return (
    <div className="container-page py-10 space-y-12">
      <CompareSchema item1={item1} item2={item2} slug={SLUG} faqs={faqs} />
      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Compare', href: '/compare' },
          { label: 'Mitragynine vs 7-Hydroxymitragynine' },
        ]}
      />
      <CompareHero item1={item1} item2={item2} />
      <CompareSummaryTable item1={item1} item2={item2} />
      <CompareGoalSection item1={item1} item2={item2} />
      <CompareDecisionSection item1={item1} item2={item2} />
      <CompareMechanisms item1={item1} item2={item2} />
      <CompareDosing item1={item1} item2={item2} />
      <CompareSafety item1={item1} item2={item2} />
      {!isHR && <CompareAffiliate item1={item1} item2={item2} isHR={isHR} />}
      <CompareFAQ faqs={faqs} />
    </div>
  )
}
