import type { Metadata } from 'next'
import { buildPageMetadata } from '../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import EvidenceSection from '@/components/evidence/EvidenceSection'
import ResearchLimitations from '@/components/evidence/ResearchLimitations'
export const metadata: Metadata = buildPageMetadata({
  title: "Understanding Placebo and Expectancy",
  description: "Educational exploration of placebo effects, expectancy systems, perception, neurochemistry, and scientific interpretation.",
  path: "/education/understanding-placebo-and-expectancy/",
})


export default function PlaceboExpectancyPage() {
  return (
    <div className="container-page py-10 space-y-12">
      <AuthorityJsonLd
        title="Understanding Placebo and Expectancy"
        description="Educational exploration of placebo effects, expectancy systems, perception, neurochemistry, and scientific interpretation."
        url="https://thehippiescientist.net/education/understanding-placebo-and-expectancy"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/education' },
          { label: 'Placebo and Expectancy' },
        ]}
      />

      <section className="space-y-6 max-w-4xl">
        <div className="space-y-3">
          <p className="eyebrow-label">Scientific Interpretation</p>

          <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">
            Understanding Placebo and Expectancy
          </h1>
        </div>

        <p className="text-xl leading-9 text-[#46574d]">
          Placebo and expectancy systems may influence perception, symptom interpretation, emotional processing, subjective experience, and reported outcomes within scientific studies.
        </p>

        <p className="text-base leading-8 text-[#5c6b63]">
          Educational neuropharmacology interpretation should consider expectancy effects, confirmation bias, reporting limitations, and subjective variability when evaluating claims.
        </p>
      </section>

      <EvidenceSection
        title="Why placebo controls matter"
        evidenceLevel="Strong"
        summary="Placebo-controlled studies may help distinguish between measurable intervention-related effects and expectancy-driven subjective interpretation."
        limitations="Placebo systems themselves are complex and may still influence outcome interpretation in multiple ways."
      />

      <EvidenceSection
        title="Subjective psychoactive experiences"
        evidenceLevel="Moderate"
        summary="Subjective psychoactive experiences may be influenced by mindset, environmental context, expectations, emotional state, and prior experiences."
        limitations="Subjective reports may vary significantly across individuals and contexts."
      />

      <ResearchLimitations
        limitations={[
          'Subjective outcomes may be difficult to standardize.',
          'Expectation effects may influence self-reported outcomes.',
          'Psychoactive experiences can vary substantially across environments and individuals.',
          'Small studies may overestimate effect size reliability.',
        ]}
      />
    </div>
  )
}
