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
  title: "Why Set and Setting Matter",
  description: "Educational exploration of set and setting, contextual neurobiology, emotional regulation, environmental influence, and subjective experiences.",
  path: "/education/why-set-and-setting-matter/",
})


const systems = [
  {
    title: 'Psychological Context',
    body: 'Emotional state, expectations, stress physiology, attentional focus, prior experiences, and psychological context may substantially influence subjective cognition and altered-state experiences.',
  },
  {
    title: 'Environmental Context',
    body: 'Social environment, sensory intensity, stress burden, perceived safety, emotional atmosphere, and contextual framing may influence nervous-system responses and cognition continuity.',
  },
  {
    title: 'Contextual Neurobiology',
    body: 'Human experiences may emerge from interactions between biology, emotion, perception, environmental context, stress systems, and recovery-oriented neurobiology rather than isolated mechanisms alone.',
  },
]

const faqs = [
  {
    question: 'What are set and setting?',
    answer: 'Set commonly refers to mindset, emotional state, expectations, and psychological context, while setting refers to social and environmental conditions surrounding an experience.',
  },
  {
    question: 'Why does context influence experiences?',
    answer: 'Stress physiology, emotional regulation, attentional systems, perception processes, environmental cues, and contextual neurobiology may all influence subjective experiences.',
  },
  {
    question: 'Why can the same experience affect people differently?',
    answer: 'Human experiences may vary substantially depending on emotional state, recovery biology, sleep continuity, stress burden, nervous-system sensitivity, prior experiences, and environmental context.',
  },
]

const relatedSystems = [
  { href: '/education/placebo-and-context-effects', title: 'Placebo and Context Effects' },
  { href: '/education/why-individual-variability-matters', title: 'Individual Variability' },
  { href: '/education/why-neuroscience-is-difficult', title: 'Why Neuroscience Is Difficult' },
  { href: '/education/understanding-altered-states', title: 'Understanding Altered States' },
]

export default function WhySetAndSettingMatterPage() {
  return (
    <div className="container-page py-10 space-y-12">
      <AuthorityJsonLd
        title="Why Set and Setting Matter"
        description="Educational exploration of set and setting, contextual neurobiology, emotional regulation, environmental influence, and subjective experiences."
        url="https://thehippiescientist.net/education/why-set-and-setting-matter"
        type="Article"
        faqItems={faqs}
      />
      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/education' },
          { label: 'Why Set and Setting Matter' },
        ]}
      />

      <section className="space-y-6 max-w-4xl">
        <div className="space-y-3">
          <p className="eyebrow-label">Contextual Neurobiology</p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">Why Set and Setting Matter</h1>
        </div>

        <p className="text-xl leading-9 text-muted">
          Human experiences are influenced by substantially more than isolated biological mechanisms. Emotional state, environmental context, stress physiology, expectations, attentional systems, and nervous-system sensitivity may all shape subjective cognition and altered-state experiences.
        </p>
      </section>

      <EvidenceSummaryCard
        title="Contextual neurobiology and subjective experiences"
        evidenceLevel="Moderate"
        humanEvidence="Human research increasingly investigates relationships between emotional regulation, environmental context, stress physiology, expectation systems, attentional processing, and subjective experiences."
        mechanisticEvidence="Mechanistic models commonly involve emotional salience pathways, autonomic regulation, attentional neurobiology, stress-response systems, and perception-related processing systems."
        safetyProfile="Stress overload, emotionally destabilizing environments, sleep disruption, and severe nervous-system strain may negatively influence emotional regulation and cognition stability."
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
          <h2 className="text-3xl font-semibold tracking-tight text-ink">Common set and setting questions</h2>
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
        Significant emotional distress, panic symptoms, severe sleep disruption, or major cognition instability should be evaluated appropriately. Educational content is not a substitute for individualized medical guidance.
      </SafetyNotice>

      <section className="space-y-5">
        <div className="space-y-2">
          <p className="eyebrow-label">Related Educational Systems</p>
          <h2 className="text-3xl font-semibold tracking-tight text-ink">Continue exploring contextual neuroscience</h2>
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
    </div>
  )
}
