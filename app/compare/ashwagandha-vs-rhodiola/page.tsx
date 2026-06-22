import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { buildPageMetadata } from '@/src/lib/seo'
import { getItemBySlug, buildFAQs } from '@/lib/compare'

// Page components
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'

// Comparison components
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

const canonicalUrl = 'https://thehippiescientist.net/compare/ashwagandha-vs-rhodiola'

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: 'Ashwagandha vs Rhodiola: Complete Comparison | The Hippie Scientist',
    description: 'Compare ashwagandha and rhodiola for stress, energy, focus, dosing, safety, and which supplement better fits your goal.',
    path: '/compare/ashwagandha-vs-rhodiola/',
  }),
  alternates: { canonical: canonicalUrl },
}

export default function AshwagandhaVsRhodiolaPage() {
  const item1 = getItemBySlug('ashwagandha')
  const item2 = getItemBySlug('rhodiola')

  if (!item1 || !item2) {
    notFound()
  }

  const isHR = item1.isHarmReduction || item2.isHarmReduction
  const faqs = buildFAQs(item1, item2)

  return (
    <div className="container-page py-10 space-y-12">
      <CompareSchema item1={item1} item2={item2} slug="ashwagandha-vs-rhodiola" faqs={faqs} />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Compare', href: '/compare' },
          { label: 'Ashwagandha vs Rhodiola' },
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
