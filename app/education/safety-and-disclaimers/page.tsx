import type { Metadata } from 'next'
import { buildPageMetadata } from '../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import SafetyNotice from '@/components/evidence/SafetyNotice'
import ResearchLimitations from '@/components/evidence/ResearchLimitations'
export const metadata: Metadata = buildPageMetadata({
  title: "Safety and Educational Disclaimers",
  description: "Educational overview of safety considerations, psychoactive risks, evidence limitations, and responsible interpretation principles.",
  path: "/education/safety-and-disclaimers/",
})


export default function SafetyAndDisclaimersPage() {
  return (
    <main className="container-page py-10 space-y-12">
      <AuthorityJsonLd
        title="Safety and Educational Disclaimers"
        description="Educational overview of safety considerations, psychoactive risks, evidence limitations, and responsible interpretation principles."
        url="https://thehippiescientist.net/education/safety-and-disclaimers"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/education' },
          { label: 'Safety and Disclaimers' },
        ]}
      />

      <section className="space-y-6 max-w-4xl">
        <div className="space-y-3">
          <p className="eyebrow-label">Educational Safety Framework</p>

          <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">
            Safety and Educational Disclaimers
          </h1>
        </div>

        <p className="text-xl leading-9 text-[#46574d]">
          Educational neuropharmacology, ethnobotanical exploration, psychoactive systems, and recovery-oriented discussions require conservative interpretation, safety awareness, and transparent evidence limitations.
        </p>
      </section>

      <SafetyNotice>
        Educational content on The Hippie Scientist should not be interpreted as medical advice, diagnosis, or treatment guidance. Psychoactive systems, supplements, herbs, and compounds may involve interactions, contraindications, or individual variability.
      </SafetyNotice>

      <SafetyNotice title="Psychoactive and interaction awareness">
        Psychoactive substances may influence mood systems, cardiovascular signaling, cognition, emotional processing, sedation pathways, and medication interactions. Conservative harm-reduction principles and evidence-informed interpretation are important.
      </SafetyNotice>

      <ResearchLimitations
        limitations={[
          'Research quality varies substantially across compounds and herbs.',
          'Long-term human evidence may be limited for some psychoactive systems.',
          'Mechanistic findings do not guarantee clinical outcomes.',
          'Individual responses may vary significantly.',
        ]}
      />
    </main>
  )
}
