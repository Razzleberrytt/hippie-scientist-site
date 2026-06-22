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

const SLUG = 'magnesium-glycinate-vs-l-threonate-for-sleep'

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: 'Magnesium Glycinate vs L-Threonate for Sleep | The Hippie Scientist',
    description: 'Compare magnesium glycinate and magnesium L-threonate for sleep, calm support, cognition, bioavailability, and which form fits your routine.',
    path: `/compare/${SLUG}/`,
  }),
  alternates: { canonical: `https://thehippiescientist.net/compare/${SLUG}` },
}

export default function MagnesiumGlycinateVsLThreonatePage() {
  // URL uses 'l-threonate-for-sleep' but the data slug is 'magnesium-threonate'
  const item1 = getItemBySlug('magnesium-glycinate')
  const item2 = getItemBySlug('magnesium-threonate')
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
          { label: 'Magnesium Glycinate vs L-Threonate' },
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
