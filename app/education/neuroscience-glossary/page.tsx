import type { Metadata } from 'next'
import { buildPageMetadata } from '../../../src/lib/seo'
import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import SafetyNotice from '@/components/evidence/SafetyNotice'
export const metadata: Metadata = buildPageMetadata({
  title: "Neuroscience Glossary",
  description: "Educational glossary exploring contextual neurobiology, recovery continuity, emotional salience, attentional resilience, and sustainable cognition systems.",
  path: "/education/neuroscience-glossary/",
})


const glossaryTerms = [
  {
    term: 'Contextual Neurobiology',
    definition:
      'A framework recognizing that cognition and emotional experiences may emerge from interactions between biology, stress physiology, emotional regulation, environmental context, recovery systems, and human variability.',
  },
  {
    term: 'Recovery Continuity',
    definition:
      'The ongoing biological and psychological processes supporting nervous-system restoration, sleep stability, emotional regulation, and sustainable cognition over time.',
  },
  {
    term: 'Hyperarousal',
    definition:
      'A state of elevated nervous-system activation that may involve emotional intensity, attentional fragmentation, stress overload, sleep disruption, and reduced cognition stability.',
  },
  {
    term: 'Emotional Salience',
    definition:
      'The degree to which emotional stimuli capture attention, influence perception, and shape subjective experiences.',
  },
  {
    term: 'Attentional Continuity',
    definition:
      'The ability to maintain relatively stable attention without excessive fragmentation, emotional overload, or hyperstimulation.',
  },
  {
    term: 'Sustainable Cognition',
    definition:
      'A recovery-oriented approach emphasizing long-term cognition resilience, emotional stability, nervous-system balance, and realistic pacing rather than continual overstimulation.',
  },
]

const relatedSystems = [
  {
    href: '/education/scientific-but-human-neuroscience',
    title: 'Scientific But Human Neuroscience',
  },
  {
    href: '/education/cognitive-resilience-systems',
    title: 'Cognitive Resilience Systems',
  },
  {
    href: '/education/why-neuroscience-is-difficult',
    title: 'Why Neuroscience Is Difficult',
  },
  {
    href: '/education/stress-and-cognition-continuity',
    title: 'Stress and Cognition Continuity',
  },
]

export default function NeuroscienceGlossaryPage() {
  return (
    <main className="container-page py-10 space-y-12">
      <AuthorityJsonLd
        title="Neuroscience Glossary"
        description="Educational glossary exploring contextual neurobiology, recovery continuity, emotional salience, attentional resilience, and sustainable cognition systems."
        url="https://thehippiescientist.net/education/neuroscience-glossary"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/education' },
          { label: 'Neuroscience Glossary' },
        ]}
      />

      <section className="space-y-6 max-w-5xl">
        <div className="space-y-3">
          <p className="eyebrow-label">Scientific Literacy Infrastructure</p>
          <h1 className="text-5xl font-bold tracking-tight text-ink">Neuroscience Glossary</h1>
        </div>

        <p className="text-xl leading-9 text-[#46574d]">
          Neuroscience terminology is often oversimplified online. This glossary provides a more contextual and recovery-oriented framework for understanding cognition, stress physiology, emotional regulation, attentional systems, and sustainable neuroscience concepts.
        </p>
      </section>

      <section className="grid gap-5">
        {glossaryTerms.map((item) => (
          <div key={item.term} className="card-premium p-6 space-y-3">
            <h2 className="text-2xl font-semibold tracking-tight text-ink">{item.term}</h2>
            <p className="text-sm leading-7 text-[#46574d]">{item.definition}</p>
          </div>
        ))}
      </section>

      <SafetyNotice>
        Educational neuroscience terminology is intended for scientific literacy and contextual understanding. Content is not a substitute for individualized medical guidance.
      </SafetyNotice>

      <section className="space-y-5">
        <div className="space-y-2">
          <p className="eyebrow-label">Connected Educational Systems</p>
          <h2 className="text-3xl font-semibold tracking-tight text-ink">Continue exploring neuroscience systems</h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {relatedSystems.map((system) => (
            <Link
              key={system.href}
              href={system.href}
              className="card-premium p-6 transition motion-safe:hover:-translate-y-0.5"
            >
              <div className="space-y-3">
                <p className="eyebrow-label">Related System</p>
                <h3 className="text-2xl font-semibold tracking-tight text-ink">{system.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
