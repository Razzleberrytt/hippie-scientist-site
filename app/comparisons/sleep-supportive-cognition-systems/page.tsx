import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import EvidenceSummaryCard from '@/components/evidence/EvidenceSummaryCard'
import HumanVsMechanisticEvidence from '@/components/evidence/HumanVsMechanisticEvidence'
import TranslationalLimitationsCard from '@/components/evidence/TranslationalLimitationsCard'
import SafetyNotice from '@/components/evidence/SafetyNotice'

const systems = [
  {
    title: 'Sleep Continuity',
    body: 'Sleep-supportive cognition systems may emphasize recovery continuity, emotional regulation, stress resilience, nervous-system restoration, and sustainable cognition stability.',
  },
  {
    title: 'Recovery-Oriented Neurobiology',
    body: 'Recovery biology, autonomic balance, attentional resilience, emotional stability, and reduced hyperarousal burden may influence cognition sustainability over time.',
  },
  {
    title: 'Contextual Balance',
    body: 'Human experiences may vary substantially depending on stress physiology, environmental context, sleep quality, emotional regulation, recovery systems, and nervous-system sensitivity.',
  },
]

const faqs = [
  {
    question: 'Why is sleep important for cognition?',
    answer: 'Sleep continuity may support attentional stability, emotional regulation, stress resilience, recovery biology, and nervous-system restoration.',
  },
  {
    question: 'Can hyperarousal disrupt cognition?',
    answer: 'Chronic hyperarousal, emotional overload, stress accumulation, and sleep disruption may negatively influence cognition continuity and recovery systems.',
  },
  {
    question: 'Why do sleep-related responses vary?',
    answer: 'Human experiences may differ because of contextual neurobiology, stress physiology, medications, recovery continuity, emotional regulation, and biological variability.',
  },
]

const relatedSystems = [
  { href: '/education/why-sleep-changes-emotional-regulation', title: 'Sleep and Emotional Regulation' },
  { href: '/protocols/burnout-recovery', title: 'Burnout Recovery' },
  { href: '/protocols/overstimulation-recovery', title: 'Overstimulation Recovery' },
  { href: '/education/why-fatigue-is-biologically-complex', title: 'Fatigue Complexity' },
]

export default function SleepSupportiveCognitionSystemsPage() {
  return (
    <main className="container-page py-10 space-y-12">
      <AuthorityJsonLd
        title="Sleep-Supportive Cognition Systems"
        description="Educational comparison of sleep continuity, recovery-oriented neurobiology, stress resilience, and sustainable cognition systems."
        url="https://thehippiescientist.net/comparisons/sleep-supportive-cognition-systems"
        type="Article"
      />
      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Comparisons', href: '/comparisons' },
          { label: 'Sleep-Supportive Cognition Systems' },
        ]}
      />
      <section className="space-y-6 max-w-4xl">
        <div className="space-y-3">
          <p className="eyebrow-label">Recovery-Oriented Neuroscience</p>
          <h1 className="text-5xl font-bold tracking-tight text-ink">Sleep-Supportive Cognition Systems</h1>
        </div>
        <p className="text-xl leading-9 text-[#46574d]">
          Sustainable cognition may depend heavily on recovery continuity, sleep stability, emotional regulation, stress resilience, and nervous-system restoration rather than continual stimulation intensity.
        </p>
      </section>
      <EvidenceSummaryCard
        title="Sleep continuity and cognition sustainability"
        evidenceLevel="Moderate"
        humanEvidence="Human research increasingly investigates relationships between sleep continuity, attentional resilience, emotional regulation, stress physiology, and sustainable cognition systems."
        mechanisticEvidence="Mechanistic models commonly involve autonomic regulation, emotional salience pathways, stress-response systems, inflammatory signaling, and recovery-oriented neurobiology."
        safetyProfile="Chronic sleep disruption, emotional overload, hyperarousal, stress accumulation, and nervous-system strain may negatively influence cognition continuity and recovery systems."
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
      <section className="space-y-6">
        <div className="space-y-2">
          <p className="eyebrow-label">Educational FAQ</p>
          <h2 className="text-3xl font-semibold tracking-tight text-ink">Common sleep-supportive cognition questions</h2>
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
        Persistent sleep disruption, severe exhaustion, major cognition difficulties, or significant emotional distress should be evaluated appropriately. Educational content is not a substitute for individualized medical guidance.
      </SafetyNotice>
      <section className="space-y-5">
        <div className="space-y-2">
          <p className="eyebrow-label">Related Educational Systems</p>
          <h2 className="text-3xl font-semibold tracking-tight text-ink">Continue exploring recovery-oriented neuroscience</h2>
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
