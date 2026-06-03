import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import EvidenceSummaryCard from '@/components/evidence/EvidenceSummaryCard'
import HumanVsMechanisticEvidence from '@/components/evidence/HumanVsMechanisticEvidence'
import TranslationalLimitationsCard from '@/components/evidence/TranslationalLimitationsCard'
import SafetyNotice from '@/components/evidence/SafetyNotice'

const systems = [
  {
    title: 'Hyperarousal',
    body: 'Chronic stimulation burden, stress activation, emotional intensity, attentional fragmentation, and nervous-system overload may contribute to cognition instability and recovery disruption.',
  },
  {
    title: 'Recovery Continuity',
    body: 'Sleep continuity, recovery biology, emotional regulation, stress reduction, and sustainable cognition stabilization may support nervous-system resilience after overstimulation.',
  },
  {
    title: 'Nervous-System Downregulation',
    body: 'Calm-focus systems, restoration-oriented routines, reduced stimulation burden, and recovery-oriented neuroscience may support attention stability and resilience continuity.',
  },
]

const faqs = [
  {
    question: 'Why can overstimulation impair focus?',
    answer: 'Overstimulation may increase attentional fragmentation, emotional reactivity, hyperarousal, stress burden, and nervous-system instability that reduce sustainable cognition continuity.',
  },
  {
    question: 'Why can hyperarousal increase fatigue?',
    answer: 'Persistent activation may strain recovery systems, disrupt sleep continuity, increase emotional intensity, and contribute to nervous-system exhaustion.',
  },
  {
    question: 'Why can stress overload affect cognition?',
    answer: 'Stress overload may influence attentional filtering, emotional regulation, sleep continuity, cognition flexibility, and nervous-system resilience.',
  },
  {
    question: 'Why is recovery important for attention stability?',
    answer: 'Recovery continuity may support emotional stability, nervous-system regulation, attentional resilience, stress reduction, and sustainable cognition systems.',
  },
]

const relatedSystems = [
  { href: '/education/why-overstimulation-impairs-focus', title: 'Overstimulation and Focus' },
  { href: '/education/why-burnout-affects-cognition', title: 'Burnout and Cognition' },
  { href: '/education/why-sleep-changes-emotional-regulation', title: 'Sleep and Emotional Regulation' },
  { href: '/protocols/burnout-recovery', title: 'Burnout Recovery' },
  { href: '/protocols/non-stimulant-focus', title: 'Non-Stimulant Focus' },
]

export default function OverstimulationRecoveryPage() {
  return (
    <main className="container-page py-10 space-y-12">
      <AuthorityJsonLd
        title="Overstimulation Recovery Systems"
        description="Educational exploration of overstimulation recovery, hyperarousal, nervous-system downregulation, recovery continuity, and sustainable cognition stabilization."
        url="https://www.thehippiescientist.net/protocols/overstimulation-recovery"
        type="Article"
      />
      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Protocols', href: '/protocols' },
          { label: 'Overstimulation Recovery Systems' },
        ]}
      />
      <section className="space-y-6 max-w-4xl">
        <div className="space-y-3">
          <p className="eyebrow-label">Recovery-Oriented Protocol Systems</p>
          <h1 className="text-5xl font-bold tracking-tight text-ink">Overstimulation Recovery Systems</h1>
        </div>
        <p className="text-xl leading-9 text-[#46574d]">
          Overstimulation recovery may involve substantially more than reducing activity for a short period. Hyperarousal, attentional overload, emotional intensity, sleep disruption, stress accumulation, and nervous-system strain may all influence cognition stability and recovery continuity.
        </p>
      </section>
      <EvidenceSummaryCard
        title="Overstimulation recovery and cognition stability"
        evidenceLevel="Moderate"
        humanEvidence="Human cognition research increasingly investigates relationships between stress physiology, sleep continuity, emotional regulation, attentional fatigue, and recovery-oriented cognition systems."
        mechanisticEvidence="Mechanistic models commonly involve stress-response systems, autonomic regulation, arousal modulation, emotional salience pathways, and recovery-oriented neurobiology."
        safetyProfile="Persistent hyperarousal, chronic sleep disruption, severe exhaustion, emotional distress, and nervous-system strain may negatively influence recovery continuity and cognition stability."
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
          <h2 className="text-3xl font-semibold tracking-tight text-ink">Common overstimulation recovery questions</h2>
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
        Persistent hyperarousal, severe exhaustion, major sleep disruption, panic symptoms, or significant emotional distress should be evaluated appropriately. Educational content is not a substitute for individualized medical guidance.
      </SafetyNotice>
      <section className="space-y-5">
        <div className="space-y-2">
          <p className="eyebrow-label">Related Educational Systems</p>
          <h2 className="text-3xl font-semibold tracking-tight text-ink">Continue exploring recovery-oriented cognition</h2>
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
