import type { Metadata } from 'next'
import { buildPageMetadata } from '../../../src/lib/seo'
import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import EvidenceSummaryCard from '@/components/evidence/EvidenceSummaryCard'
import HumanVsMechanisticEvidence from '@/components/evidence/HumanVsMechanisticEvidence'
import TranslationalLimitationsCard from '@/components/evidence/TranslationalLimitationsCard'
import SafetyNotice from '@/components/evidence/SafetyNotice'
import References from '@/components/References'
export const metadata: Metadata = buildPageMetadata({
  title: "Emotional Amplification Systems",
  description: "Educational exploration of emotional salience, contextual neurobiology, stress physiology, perception systems, and subjective emotional experiences.",
  path: "/learn/emotional-amplification-systems/",
})


const systems = [
  {
    title: 'Emotional Salience',
    body: 'Emotional amplification systems may involve heightened emotional salience, attentional intensity, stress physiology, perception changes, and nervous-system sensitivity depending on context and individual variability.',
  },
  {
    title: 'Stress and Context',
    body: 'Sleep continuity, emotional regulation, environmental context, recovery biology, hyperarousal burden, and stress accumulation may all influence emotional intensity and cognition continuity.',
  },
  {
    title: 'Contextual Neurobiology',
    body: 'Subjective experiences may emerge from interactions between biology, perception, emotion, environmental cues, attentional systems, and contextual neurobiology rather than isolated pathways alone.',
  },
]

const faqs = [
  {
    question: 'What are emotional amplification systems?',
    answer: 'Emotional amplification systems commonly refer to experiences involving increased emotional intensity, heightened salience, stronger perception of internal states, and greater attentional focus on emotional stimuli.',
  },
  {
    question: 'Why can stress increase emotional intensity?',
    answer: 'Stress physiology may influence emotional salience systems, attentional processing, sleep continuity, nervous-system sensitivity, and contextual neurobiology.',
  },
  {
    question: 'Why do emotionally intense experiences vary between people?',
    answer: 'Human experiences may differ because of recovery systems, emotional regulation, stress burden, environmental context, nervous-system sensitivity, sleep continuity, and prior experiences.',
  },
]

const relatedSystems = [
  { href: '/learn/why-set-and-setting-matter', title: 'Why Set and Setting Matter' },
  { href: '/learn/placebo-and-context-effects', title: 'Placebo and Context Effects' },
  { href: '/learn/why-individual-variability-matters', title: 'Individual Variability' },
  { href: '/learn/why-neuroscience-is-difficult', title: 'Why Neuroscience Is Difficult' },
]

const EMOTIONAL_AMPLIFICATION_SYSTEMS_REFS = [
  { n: 1, text: 'McEwen BS. (2017). Neurobiological and systemic effects of chronic stress. Chronic Stress, 1: 2470547017692328.', url: 'https://pubmed.ncbi.nlm.nih.gov/28856337/' },
  { n: 2, text: 'Sapolsky RM. (2015). Stress and the brain: individual variability. Mol Psychiatry, 20(11): 1331-1338.', url: 'https://pubmed.ncbi.nlm.nih.gov/25917366/' },
]

export default function EmotionalAmplificationSystemsPage() {
  return (
    <div className="container-page py-10 space-y-12">
      <AuthorityJsonLd
        title="Emotional Amplification Systems"
        description="Educational exploration of emotional salience, contextual neurobiology, stress physiology, perception systems, and subjective emotional experiences."
        url="https://thehippiescientist.net/learn/emotional-amplification-systems"
        type="Article"
      />
      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/learn' },
          { label: 'Emotional Amplification Systems' },
        ]}
      />

      <section className="space-y-6 max-w-4xl">
        <div className="space-y-3">
          <p className="eyebrow-label">Contextual Neurobiology</p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">Emotional Amplification Systems</h1>
        </div>

        <p className="text-xl leading-9 text-muted">
          Human emotional experiences may involve substantially more than isolated neurotransmitter activity. Emotional salience systems, stress physiology, perception processes, environmental context, attentional focus, and nervous-system sensitivity may all influence emotional intensity and subjective experiences.
        </p>
      </section>

      <EvidenceSummaryCard
        title="Emotional salience and contextual neurobiology"
        evidenceLevel="Moderate"
        humanEvidence="Human research increasingly investigates relationships between emotional salience, stress physiology, attentional processing, contextual framing, emotional regulation, and subjective experiences."
        mechanisticEvidence="Mechanistic models commonly involve emotional salience pathways, autonomic regulation, attentional neurobiology, stress-response systems, and perception-related processing systems."
        safetyProfile="Chronic stress overload, severe emotional destabilization, major sleep disruption, and nervous-system strain may negatively influence emotional regulation and cognition continuity."
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
          <h2 className="text-3xl font-semibold tracking-tight text-ink">Common emotional amplification questions</h2>
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
