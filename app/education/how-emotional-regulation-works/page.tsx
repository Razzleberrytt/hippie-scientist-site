import type { Metadata } from 'next'
import { buildPageMetadata } from '../../../src/lib/seo'
import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import EvidenceSummaryCard from '@/components/evidence/EvidenceSummaryCard'
import MisconceptionCallout from '@/components/evidence/MisconceptionCallout'
import ResearchLimitations from '@/components/evidence/ResearchLimitations'
import ReferencedStudies from '@/components/evidence/ReferencedStudies'
import SafetyNotice from '@/components/evidence/SafetyNotice'
export const metadata: Metadata = buildPageMetadata({
  title: "How Emotional Regulation Works",
  description: "Educational exploration of emotional regulation neurochemistry, stress signaling, mood systems, recovery continuity, and nervous-system balance.",
  path: "/education/how-emotional-regulation-works/",
})


const systems = [
  {
    title: 'Mood and Neurochemistry',
    body: 'Emotional regulation involves interacting signaling systems associated with mood continuity, stress adaptation, cognition pathways, emotional processing, nervous-system resilience, and recovery-oriented neuropharmacology.',
  },
  {
    title: 'Stress and Emotional Processing',
    body: 'Chronic stress burden may influence emotional resilience, sleep continuity, inflammatory signaling, cognition quality, nervous-system arousal, and fatigue recovery systems.',
  },
  {
    title: 'Recovery and Nervous-System Balance',
    body: 'Emotional regulation discussions often intersect with calming neurochemistry, sleep architecture, behavioral regulation, social support systems, environmental context, and recovery biology.',
  },
]

const related = [
  {
    href: '/education/serotonin',
    title: 'Serotonin Pathway',
  },
  {
    href: '/education/gaba',
    title: 'GABA Pathway',
  },
  {
    href: '/goals/stress',
    title: 'Stress Regulation',
  },
  {
    href: '/education/what-is-anxiety-neurochemistry',
    title: 'Anxiety Neurochemistry',
  },
]

export default function EmotionalRegulationPage() {
  return (
    <main className="container-page py-10 space-y-12">
      <AuthorityJsonLd
        title="How Emotional Regulation Works"
        description="Educational exploration of emotional regulation neurochemistry, stress signaling, mood systems, recovery continuity, and nervous-system balance."
        url="https://thehippiescientist.net/education/how-emotional-regulation-works"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/education' },
          { label: 'How Emotional Regulation Works' },
        ]}
      />

      <section className="space-y-6 max-w-4xl">
        <div className="space-y-3">
          <p className="eyebrow-label">Educational Supernode</p>

          <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">
            How Emotional Regulation Works
          </h1>
        </div>

        <p className="text-xl leading-9 text-[#46574d]">
          Emotional regulation involves interconnected neurochemical, behavioral, psychological, and environmental systems associated with mood continuity, stress adaptation, cognition, nervous-system resilience, emotional processing, and recovery signaling.
        </p>

        <p className="text-base leading-8 text-[#5c6b63]">
          Educational emotional-regulation discussions commonly intersect with serotonergic signaling, calming neurochemistry, stress biology, inflammatory systems, sleep continuity, trauma history, behavioral coping strategies, and social/environmental context.
        </p>
      </section>

      <MisconceptionCallout
        myth="Emotional regulation is controlled by a single neurotransmitter"
        reality="Emotional regulation involves interacting biological, psychological, behavioral, social, and environmental systems. Sleep quality, stress burden, trauma exposure, social support, cognition patterns, inflammatory signaling, and nervous-system resilience may all influence emotional processing."
      />

      <EvidenceSummaryCard
        title="Emotional regulation and systems biology"
        evidenceLevel="Strong"
        humanEvidence="Human research demonstrates strong relationships between stress burden, sleep continuity, emotional resilience, cognition quality, social support, and psychological well-being."
        mechanisticEvidence="Mechanistic evidence suggests emotional regulation involves interacting serotonergic, GABAergic, hormonal, inflammatory, and stress-response systems."
        safetyProfile="Psychoactive substances, chronic sleep disruption, severe stress burden, or maladaptive coping behaviors may negatively influence emotional regulation systems."
      />

      <section className="grid gap-6 lg:grid-cols-3">
        {systems.map((system) => (
          <div key={system.title} className="card-premium p-6 space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-ink">
              {system.title}
            </h2>

            <p className="text-sm leading-7 text-[#46574d]">
              {system.body}
            </p>
          </div>
        ))}
      </section>

      <SafetyNotice>
        Severe emotional distress, persistent mental-health symptoms, trauma-related symptoms, or self-harm thoughts should be approached seriously. Educational content is not a substitute for individualized medical or mental-health care.
      </SafetyNotice>

      <ResearchLimitations
        limitations={[
          'Emotional regulation systems remain biologically complex and incompletely understood.',
          'Subjective emotional experiences are difficult to standardize scientifically.',
          'Environmental and social influences may strongly affect emotional resilience.',
          'Single-neurotransmitter explanations may oversimplify emotional neurobiology.',
        ]}
      />

      <section className="space-y-5">
        <div className="space-y-2">
          <p className="eyebrow-label">Continue Exploring</p>

          <h2 className="text-3xl font-semibold tracking-tight text-ink">
            Related mood and stress systems
          </h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {related.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="card-premium p-6 transition motion-safe:hover:-translate-y-0.5"
            >
              <div className="space-y-3">
                <p className="eyebrow-label">Related Educational System</p>

                <h3 className="text-2xl font-semibold tracking-tight text-ink">
                  {item.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <ReferencedStudies
        studies={[
          {
            title: 'National Institute of Mental Health',
            href: 'https://www.nimh.nih.gov/',
            source: 'NIMH',
          },
          {
            title: 'PubMed Emotional Regulation Research',
            href: 'https://pubmed.ncbi.nlm.nih.gov/',
            source: 'NIH / PubMed',
          },
        ]}
      />
    </main>
  )
}
