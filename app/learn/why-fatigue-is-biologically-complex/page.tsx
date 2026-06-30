import type { Metadata } from 'next'
import { buildPageMetadata } from '../../../src/lib/seo'
import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import EvidenceSummaryCard from '@/components/evidence/EvidenceSummaryCard'
import HumanVsMechanisticEvidence from '@/components/evidence/HumanVsMechanisticEvidence'
import TranslationalLimitationsCard from '@/components/evidence/TranslationalLimitationsCard'
import SafetyNotice from '@/components/evidence/SafetyNotice'
export const metadata: Metadata = buildPageMetadata({
  title: "Why Fatigue Is Biologically Complex",
  description: "Educational exploration of fatigue systems, recovery biology, stress physiology, burnout-oriented neurobiology, and cognition sustainability.",
  path: "/learn/why-fatigue-is-biologically-complex/",
})


const systems = [
  {
    title: 'Recovery Systems',
    body: 'Fatigue may involve disrupted recovery continuity, sleep architecture changes, stress overload, emotional exhaustion, nervous-system strain, and cognition instability.',
  },
  {
    title: 'Stress Physiology',
    body: 'Stress-response systems, emotional regulation, autonomic balance, burnout-oriented exhaustion, and recovery-system burden may all influence fatigue experiences.',
  },
  {
    title: 'Contextual Neurobiology',
    body: 'Fatigue experiences may vary substantially depending on sleep continuity, psychological stress, emotional intensity, physical recovery, environment, and individual variability.',
  },
]

const faqs = [
  {
    question: 'Why is fatigue more than sleepiness?',
    answer: 'Fatigue may involve stress physiology, emotional exhaustion, recovery disruption, cognition instability, nervous-system strain, and burnout-oriented neurobiology rather than only reduced alertness.',
  },
  {
    question: 'How does stress affect fatigue?',
    answer: 'Stress physiology may influence sleep continuity, emotional regulation, autonomic balance, cognition resilience, recovery systems, and nervous-system stability.',
  },
  {
    question: 'Why can cognition decline during exhaustion?',
    answer: 'Recovery disruption, attentional fatigue, stress overload, emotional strain, sleep instability, and nervous-system burden may negatively influence cognition continuity.',
  },
]

const relatedSystems = [
  { href: '/learn/how-the-brain-recovers-from-fatigue', title: 'Fatigue Recovery' },
  { href: '/learn/why-burnout-affects-cognition', title: 'Burnout and Cognition' },
  { href: '/guides/anxiety', title: 'Burnout Recovery' },
  { href: '/learn/how-sleep-affects-neurochemistry', title: 'Sleep and Neurochemistry' },
]

export default function WhyFatigueIsBiologicallyComplexPage() {
  return (
    <div className="container-page py-10 space-y-12">
      <AuthorityJsonLd
        title="Why Fatigue Is Biologically Complex"
        description="Educational exploration of fatigue systems, recovery biology, stress physiology, burnout-oriented neurobiology, and cognition sustainability."
        url="https://thehippiescientist.net/learn/why-fatigue-is-biologically-complex"
        type="Article"
        faqItems={faqs}
      />
      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/learn' },
          { label: 'Why Fatigue Is Biologically Complex' },
        ]}
      />
      <section className="space-y-6 max-w-4xl">
        <div className="space-y-3">
          <p className="eyebrow-label">Recovery-Oriented Neuroscience</p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">Why Fatigue Is Biologically Complex</h1>
        </div>
        <p className="text-xl leading-9 text-muted">
          Fatigue may involve substantially more than low energy or reduced motivation. Recovery biology, stress physiology, emotional regulation, sleep continuity, nervous-system strain, and burnout-oriented neurobiology may all influence fatigue systems and cognition sustainability.
        </p>
      </section>
      <EvidenceSummaryCard
        title="Fatigue and recovery systems"
        evidenceLevel="Moderate"
        humanEvidence="Human research increasingly investigates relationships between stress physiology, sleep continuity, emotional regulation, cognition fatigue, recovery biology, and nervous-system resilience."
        mechanisticEvidence="Mechanistic models commonly involve inflammatory signaling, autonomic regulation, stress-response pathways, emotional salience systems, and recovery-oriented neurobiology."
        safetyProfile="Persistent exhaustion, severe sleep disruption, emotional distress, cognition difficulties, chronic stress burden, and nervous-system overload may negatively influence recovery continuity."
      />
      <section className="grid gap-6 lg:grid-cols-3">
        {systems.map((system) => (
          <div key={system.title} className="card-premium p-6 space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-ink">{system.title}</h2>
            <p className="text-sm leading-7 text-muted">{system.body}</p>
          </div>
        ))}
      </section>
      <HumanVsMechanisticEvidence />
      <TranslationalLimitationsCard />
      <section className="space-y-6">
        <div className="space-y-2">
          <p className="eyebrow-label">Educational FAQ</p>
          <h2 className="text-3xl font-semibold tracking-tight text-ink">Common fatigue questions</h2>
        </div>
        <div className="grid gap-5">
          {faqs.map((faq) => (
            <div key={faq.question} className="card-premium p-6 space-y-3">
              <h3 className="text-xl font-semibold tracking-tight text-ink">{faq.question}</h3>
              <p className="text-sm leading-7 text-muted">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>
      <SafetyNotice>
        Persistent exhaustion, severe fatigue, significant cognitive decline, emotional distress, or ongoing sleep disruption should be evaluated appropriately. Educational content is not a substitute for individualized guidance.
      </SafetyNotice>
      <section className="space-y-5">
        <div className="space-y-2">
          <p className="eyebrow-label">Related Educational Systems</p>
          <h2 className="text-3xl font-semibold tracking-tight text-ink">Continue exploring recovery-oriented neuroscience</h2>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {relatedSystems.map((system) => (
            <Link key={system.href} href={system.href} className="card-premium p-6 transition motion-safe:hover:-translate-y-0.5">
              <div className="space-y-3">
                <p className="eyebrow-label">Related System</p>
                <h3 className="text-2xl font-semibold tracking-tight text-ink">{system.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
