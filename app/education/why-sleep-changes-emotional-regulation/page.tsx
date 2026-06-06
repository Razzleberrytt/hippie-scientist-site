import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import EvidenceSummaryCard from '@/components/evidence/EvidenceSummaryCard'
import HumanVsMechanisticEvidence from '@/components/evidence/HumanVsMechanisticEvidence'
import TranslationalLimitationsCard from '@/components/evidence/TranslationalLimitationsCard'
import SafetyNotice from '@/components/evidence/SafetyNotice'

const systems = [
  {
    title: 'Emotional Processing',
    body: 'Sleep continuity may influence emotional processing, stress resilience, cognition flexibility, emotional intensity, and attentional regulation systems.',
  },
  {
    title: 'Stress Reactivity',
    body: 'Sleep disruption may amplify stress sensitivity, emotional reactivity, nervous-system strain, and recovery-system instability depending on context and individual variability.',
  },
  {
    title: 'Recovery Biology',
    body: 'Recovery-oriented neuroscience increasingly emphasizes sleep architecture, nervous-system restoration, emotional regulation, and fatigue recovery continuity.',
  },
]

const faqs = [
  {
    question: 'Why does poor sleep increase emotional reactivity?',
    answer: 'Sleep disruption may influence stress physiology, emotional salience systems, attentional flexibility, recovery continuity, and nervous-system regulation.',
  },
  {
    question: 'How does sleep affect stress resilience?',
    answer: 'Sleep continuity may support emotional regulation, cognition flexibility, autonomic stability, recovery biology, and nervous-system resilience.',
  },
  {
    question: 'Why do emotions feel stronger during exhaustion?',
    answer: 'Fatigue systems, stress overload, recovery disruption, and emotional-processing changes may contribute to increased emotional intensity during exhaustion.',
  },
]

const relatedSystems = [
  { href: '/education/how-sleep-affects-neurochemistry', title: 'Sleep and Neurochemistry' },
  { href: '/education/why-burnout-affects-cognition', title: 'Burnout and Cognition' },
  { href: '/education/how-emotional-regulation-works', title: 'Emotional Regulation' },
  { href: '/protocols/burnout-recovery', title: 'Burnout Recovery' },
]

export default function WhySleepChangesEmotionalRegulationPage() {
  return (
    <main className="container-page py-10 space-y-12">
      <AuthorityJsonLd
        title="Why Sleep Changes Emotional Regulation"
        description="Educational exploration of sleep continuity, emotional regulation, stress resilience, recovery biology, and nervous-system restoration."
        url="https://thehippiescientist.net/education/why-sleep-changes-emotional-regulation"
        type="Article"
      />
      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/education' },
          { label: 'Why Sleep Changes Emotional Regulation' },
        ]}
      />
      <section className="space-y-6 max-w-4xl">
        <div className="space-y-3">
          <p className="eyebrow-label">Recovery-Oriented Neuroscience</p>
          <h1 className="text-5xl font-bold tracking-tight text-ink">Why Sleep Changes Emotional Regulation</h1>
        </div>
        <p className="text-xl leading-9 text-[#46574d]">
          Emotional regulation may involve substantially more than mindset or willpower. Sleep continuity, stress physiology, nervous-system restoration, emotional processing, and recovery biology may all influence emotional resilience and cognition stability.
        </p>
      </section>
      <EvidenceSummaryCard
        title="Sleep and emotional regulation systems"
        evidenceLevel="Moderate"
        humanEvidence="Human research increasingly investigates relationships between sleep continuity, stress resilience, emotional regulation, attentional flexibility, and cognition sustainability."
        mechanisticEvidence="Mechanistic models commonly involve autonomic regulation, emotional salience systems, stress-response pathways, inflammatory signaling, and recovery-oriented neurobiology."
        safetyProfile="Chronic sleep disruption, stress overload, emotional exhaustion, nervous-system strain, and recovery instability may negatively influence emotional regulation systems."
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
          <h2 className="text-3xl font-semibold tracking-tight text-ink">Common sleep and emotional regulation questions</h2>
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
        Persistent emotional distress, severe sleep disruption, panic symptoms, cognitive difficulties, or significant wellness concerns should be evaluated appropriately. Educational content is not a substitute for individualized guidance.
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
