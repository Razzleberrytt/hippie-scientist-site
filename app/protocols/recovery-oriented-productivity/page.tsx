import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import EvidenceSummaryCard from '@/components/evidence/EvidenceSummaryCard'
import HumanVsMechanisticEvidence from '@/components/evidence/HumanVsMechanisticEvidence'
import TranslationalLimitationsCard from '@/components/evidence/TranslationalLimitationsCard'
import SafetyNotice from '@/components/evidence/SafetyNotice'

const systems = [
  {
    title: 'Sustainable Performance',
    body: 'Recovery-oriented productivity systems may emphasize sleep continuity, emotional regulation, stress resilience, attentional stability, and nervous-system recovery rather than continual hyperstimulation.',
  },
  {
    title: 'Burnout Prevention',
    body: 'Chronic stress overload, emotional exhaustion, sleep disruption, and attentional fragmentation may negatively influence cognition sustainability and long-term performance continuity.',
  },
  {
    title: 'Recovery Continuity',
    body: 'Recovery biology, nervous-system restoration, emotional stability, sustainable routines, and realistic cognition pacing may support resilience continuity over time.',
  },
]

const faqs = [
  {
    question: 'Why can overstimulation reduce productivity quality?',
    answer: 'Hyperarousal, emotional strain, attentional fragmentation, stress overload, sleep disruption, and nervous-system exhaustion may reduce sustainable cognition continuity.',
  },
  {
    question: 'Why is recovery important for performance?',
    answer: 'Recovery continuity may support cognition flexibility, emotional regulation, stress resilience, attentional stability, and nervous-system restoration.',
  },
  {
    question: 'What is sustainable cognition?',
    answer: 'Sustainable cognition commonly refers to long-term attentional continuity, emotional stability, recovery resilience, and realistic performance systems rather than continual stimulation intensity.',
  },
]

const relatedSystems = [
  { href: '/protocols/burnout-recovery', title: 'Burnout Recovery' },
  { href: '/protocols/overstimulation-recovery', title: 'Overstimulation Recovery' },
  { href: '/education/why-calm-focus-differs-from-stimulation', title: 'Calm Focus and Stimulation' },
  { href: '/education/why-fatigue-is-biologically-complex', title: 'Fatigue Complexity' },
]

export default function RecoveryOrientedProductivityPage() {
  return (
    <main className="container-page py-10 space-y-12">
      <AuthorityJsonLd
        title="Recovery-Oriented Productivity"
        description="Educational exploration of sustainable cognition, recovery continuity, burnout prevention, stress resilience, and nervous-system stabilization."
        url="https://www.thehippiescientist.net/protocols/recovery-oriented-productivity"
        type="Article"
      />
      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Protocols', href: '/protocols' },
          { label: 'Recovery-Oriented Productivity' },
        ]}
      />
      <section className="space-y-6 max-w-4xl">
        <div className="space-y-3">
          <p className="eyebrow-label">Sustainable Cognition Systems</p>
          <h1 className="text-5xl font-bold tracking-tight text-ink">Recovery-Oriented Productivity</h1>
        </div>
        <p className="text-xl leading-9 text-[#46574d]">
          Sustainable productivity may involve substantially more than continual optimization intensity. Recovery continuity, emotional regulation, stress resilience, attentional stability, nervous-system restoration, and realistic cognition pacing may all influence long-term performance systems.
        </p>
      </section>
      <EvidenceSummaryCard
        title="Recovery continuity and sustainable productivity"
        evidenceLevel="Moderate"
        humanEvidence="Human research increasingly investigates relationships between stress physiology, sleep continuity, emotional regulation, attentional fatigue, burnout systems, and cognition sustainability."
        mechanisticEvidence="Mechanistic models commonly involve autonomic regulation, stress-response systems, emotional salience pathways, inflammatory signaling, and recovery-oriented neurobiology."
        safetyProfile="Chronic hyperstimulation, emotional exhaustion, severe stress overload, sleep disruption, and nervous-system strain may negatively influence sustainable cognition continuity."
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
          <h2 className="text-3xl font-semibold tracking-tight text-ink">Common sustainable productivity questions</h2>
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
        Persistent exhaustion, severe emotional distress, chronic sleep disruption, or major cognition difficulties should be evaluated appropriately. Educational content is not a substitute for individualized medical guidance.
      </SafetyNotice>
      <section className="space-y-5">
        <div className="space-y-2">
          <p className="eyebrow-label">Related Educational Systems</p>
          <h2 className="text-3xl font-semibold tracking-tight text-ink">Continue exploring sustainable cognition systems</h2>
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
