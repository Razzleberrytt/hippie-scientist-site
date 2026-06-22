import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { buildPageMetadata } from '@/src/lib/seo'
import { getItemBySlug } from '@/lib/compare'

// Page components
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import AffiliateDisclosure from '@/components/AffiliateDisclosure'
import { EnhancedEmailCapture } from '@/components/monetization/EnhancedEmailCapture'
import { RelatedDiscoveryWidget } from '@/components/monetization/RelatedDiscoveryWidget'

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

export const metadata: Metadata = buildPageMetadata({
  title: 'Ashwagandha vs Rhodiola: Complete Comparison | The Hippie Scientist',
  description: 'Compare ashwagandha and rhodiola for stress, energy, focus, dosing, safety, and which supplement better fits your goal.',
  path: '/compare/ashwagandha-vs-rhodiola/',
})

export default async function AshwagandhaVsRhodiolaPage() {
  const item1 = await getItemBySlug('ashwagandha')
  const item2 = await getItemBySlug('rhodiola')

  if (!item1 || !item2) {
    notFound()
  }

  const canonicalUrl = 'https://thehippiescientist.net/compare/ashwagandha-vs-rhodiola'

  return (
    <div className="container-page py-10 space-y-12">
      <CompareSchema
        item1={item1}
        item2={item2}
        title="Ashwagandha vs Rhodiola: Complete Comparison | The Hippie Scientist"
        description="Compare ashwagandha and rhodiola for stress, energy, focus, dosing, safety, and which supplement better fits your goal."
        canonicalUrl={canonicalUrl}
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Compare', href: '/compare' },
          { label: 'Ashwagandha vs Rhodiola' },
        ]}
      />

      {/* Hero Header Section */}
      <CompareHero item1={item1} item2={item2} />

      {/* Quick Summary Reference */}
      <CompareSummaryTable item1={item1} item2={item2} />

      {/* Detailed Goal Breakdown */}
      <CompareGoalSection item1={item1} item2={item2} />

      {/* Decision Guidance */}
      <CompareDecisionSection item1={item1} item2={item2} />

      {/* Mechanism Comparison */}
      <CompareMechanisms item1={item1} item2={item2} />

      {/* Dosing and Standardization */}
      <CompareDosing item1={item1} item2={item2} />

      {/* Safety, Contraindications and Warnings */}
      <CompareSafety item1={item1} item2={item2} />

      {/* Email Capture conversion point */}
      <EnhancedEmailCapture
        headline="Adaptogen comparison + stress-pattern matching"
        description="Get curated ashwagandha vs rhodiola insights, personalized stress-pattern frameworks, and safety context delivered to your inbox."
        benefit1="Wired vs tired: identify your stress pattern and pick the right adaptogen"
        benefit2="Safety deep-dive: pregnancy, thyroid, medication, and autoimmune considerations"
        benefit3="Product quality checks: standardization, plant part, and third-party testing guidance"
        ctaLabel="Join the list"
        location="compare-ashwagandha-vs-rhodiola"
      />

      {/* Related Reading & Discovery */}
      <RelatedDiscoveryWidget
        heading="Explore stress-support depth"
        subheading="Dig deeper into adaptogen stacking, stress patterns, and evidence for both herbs."
        items={[
          {
            type: 'herb',
            label: 'Herb',
            title: 'Ashwagandha',
            description: 'Calming adaptogen for tense, wired stress. Strong evidence for cortisol and anxiety, with meaningful safety caveats.',
            href: '/herbs/ashwagandha',
          },
          {
            type: 'herb',
            label: 'Herb',
            title: 'Rhodiola',
            description: 'Energizing adaptogen for fatigue-linked stress. Evidence for resilience, cognition, and burnout recovery.',
            href: '/herbs/rhodiola',
          },
          {
            type: 'guide',
            label: 'Guide',
            title: 'Stress Patterns',
            description: 'Map your stress as tension, fatigue, rumination, or shutdown to match the right herb and support.',
            href: '/goals/stress',
          },
          {
            type: 'protocol',
            label: 'Protocol',
            title: 'Adaptogens',
            description: 'When and how to safely combine ashwagandha, rhodiola, and other adaptogens for synergy.',
            href: '/education/what-are-adaptogens',
          },
          {
            type: 'guide',
            label: 'Guide',
            title: 'Sleep Spillover',
            description: 'How stress disrupts sleep and which adaptogen supports sleep recovery without overstimulation.',
            href: '/guides/best-natural-sleep-aids-that-work',
          },
          {
            type: 'guide',
            label: 'Guide',
            title: 'Burnout Recovery',
            description: 'When fatigue dominates stress: recognizing burnout and choosing herbs that rebuild resilience.',
            href: '/education/why-burnout-affects-cognition',
          },
        ]}
      />

      {/* Affiliate Product Recommendations */}
      <div className="space-y-4">
        <AffiliateDisclosure />
        <CompareAffiliate item1={item1} item2={item2} />
      </div>

      {/* FAQ Accordion Section */}
      <CompareFAQ item1={item1} item2={item2} />
    </div>
  )
}
