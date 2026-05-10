import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import EvidenceSummaryCard from '@/components/evidence/EvidenceSummaryCard'
import HumanVsMechanisticEvidence from '@/components/evidence/HumanVsMechanisticEvidence'
import TranslationalLimitationsCard from '@/components/evidence/TranslationalLimitationsCard'
import SafetyNotice from '@/components/evidence/SafetyNotice'
import RuntimeOrchestratedDiscovery from '@/components/runtime/runtime-orchestrated-discovery'

const comparisonRecord = {
  title: 'Stimulating vs Sedating Compounds',
  summary:
    'Educational comparison of stimulating and sedating systems exploring hyperarousal, calm attentional continuity, recovery biology, emotional regulation, sleep continuity, and contextual neurobiology.',
  effects: ['calm cognition', 'stimulation systems', 'recovery continuity'],
  mechanisms: ['arousal regulation', 'stress physiology', 'attentional neurobiology'],
  categories: ['focus', 'recovery', 'cognition'],
}

const systems = [
  {
    title: 'Stimulating Systems',
    body: 'Stimulating compounds may increase arousal intensity, motivational activation, alertness, emotional reactivity, attentional drive, or hyperarousal depending on context and individual variability.',
  },
  {
    title: 'Sedating Systems',
    body: 'Sedating or calming systems may support emotional regulation, stress reduction, sleep continuity, nervous-system downregulation, and calm attentional continuity depending on dosage and context.',
  },
  {
    title: 'Contextual Balance',
    body: 'Human experiences may vary substantially depending on stress physiology, sleep continuity, recovery biology, emotional regulation, environmental context, and nervous-system sensitivity.',
  },
]

const faqs = [
  {
    question: 'Are stimulating compounds always better for focus?',
    answer: 'Not necessarily. Excessive stimulation may contribute to hyperarousal, attentional fragmentation, emotional reactivity, sleep disruption, and reduced cognition sustainability.',
  },
  {
    question: 'Can calming systems support cognition?',
    answer: 'Calm-focus systems may support attentional continuity, stress resilience, emotional regulation, and nervous-system stability depending on context and individual variability.',
  },
  {
    question: 'Why do responses vary between people?',
    answer: 'Human experiences may differ because of sleep continuity, recovery systems, stress physiology, emotional regulation, medications, environment, and contextual neurobiology.',
  },
]

const relatedSystems = [
  { href: '/comparisons/calm-focus-vs-stimulation', title: 'Calm Focus vs Stimulation' },
  { href: '/education/why-overstimulation-impairs-focus', title: 'Overstimulation and Focus' },
  { href: '/protocols/overstimulation-recovery', title: 'Overstimulation Recovery' },
  { href: '/education/why-individual-variability-matters', title: 'Individual Variability' },
]

export default function StimulatingVsSedatingCompoundsPage() {
  return (
    <main className="container-page py-10 space-y-12">
      <AuthorityJsonLd
        title="Stimulating vs Sedating Compounds"
        description="Educational comparison of stimulating and sedating systems, calm focus, hyperarousal, recovery continuity, and contextual neurobiology."
        url="https://thehippiescientist.net/comparisons/stimulating-vs-sedating-compounds"
        type="Article"
      />
      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Comparisons', href: '/comparisons' },
          { label: 'Stimulating vs Sedating Compounds' },
        ]}
      />
      <section className="space-y-6 max-w-4xl">
        <div className="space-y-3">
          <p className="eyebrow-label">Contextual Neurobiology</p>
          <h1 className="text-5xl font-bold tracking-tight text-ink">Stimulating vs Sedating Compounds</h1>
        </div>
        <p className="text-xl leading-9 text-[#46574d]">
          Stimulating and sedating systems are not inherently good or bad. Human responses may depend on stress physiology, sleep continuity, emotional regulation, recovery biology, environmental context, nervous-system sensitivity, and cognition sustainability.
        </p>
      </section>
      <EvidenceSummaryCard
        title="Stimulation, calming systems, and cognition continuity"
        evidenceLevel="Moderate"
        humanEvidence="Human research increasingly investigates relationships between arousal regulation, emotional resilience, sleep continuity, attentional systems, stress physiology, and cognition sustainability."
        mechanisticEvidence="Mechanistic models commonly involve stress-response systems, autonomic regulation, emotional salience pathways, attentional neurobiology, and arousal modulation systems."
        safetyProfile="Excessive stimulation, emotional overload, chronic sleep disruption, hyperarousal, severe sedation, and nervous-system instability may negatively influence cognition continuity and recovery systems."
      />
      <section className="grid gap-6 lg:grid-cols-3">
        {systems.map((system) => (
          <div key={system.title} className="card-premium p-6 space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-ink">{system.title}</h2>
            <p className="text-sm leading-7 text-[#46574d]">{system.body}</p>
          </div>
        ))}
      </section>
      <HumanVsMechanisticEvidence />
      <TranslationalLimitationsCard />

      <RuntimeOrchestratedDiscovery
        record={comparisonRecord}
        title="Explore stimulation and recovery systems"
      />

      <section className="space-y-6">
        <div className="space-y-2">
          <p className="eyebrow-label">Educational FAQ</p>
          <h2 className="text-3xl font-semibold tracking-tight text-ink">Common stimulation and calming-system questions</h2>
        </div>
        <div className="grid gap-5">
          {faqs.map((faq) => (
            <div key={faq.question} className="card-premium p-6 space-y-3">
              <h3 className="text-xl font-semibold tracking-tight text-ink">{faq.question}</h3>
              <p className="text-sm leading-7 text-[#46574d]">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>
      <SafetyNotice>
        Significant sleep disruption, emotional distress, severe hyperarousal, or major cognition difficulties should be evaluated appropriately. Educational content is not a substitute for individualized medical guidance.
      </SafetyNotice>
      <section className="space-y-5">
        <div className="space-y-2">
          <p className="eyebrow-label">Related Educational Systems</p>
          <h2 className="text-3xl font-semibold tracking-tight text-ink">Continue exploring contextual neurobiology</h2>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {relatedSystems.map((system) => (
            <Link key={system.href} href={system.href} className="card-premium p-6 transition hover:-translate-y-0.5">
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
