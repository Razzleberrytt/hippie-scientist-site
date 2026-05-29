import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import EvidenceSummaryCard from '@/components/evidence/EvidenceSummaryCard'
import HumanVsMechanisticEvidence from '@/components/evidence/HumanVsMechanisticEvidence'
import TranslationalLimitationsCard from '@/components/evidence/TranslationalLimitationsCard'
import SafetyNotice from '@/components/evidence/SafetyNotice'

const systems = [
  {
    title: 'Contextual Neurobiology',
    body: 'Human experiences may be influenced by expectations, emotional state, stress physiology, environmental context, nervous-system sensitivity, and prior experiences in addition to direct biological mechanisms.',
  },
  {
    title: 'Expectation Effects',
    body: 'Beliefs, anticipation, attention, emotional salience, and contextual framing may influence subjective cognition experiences, emotional responses, and symptom perception.',
  },
  {
    title: 'Scientific Complexity',
    body: 'Placebo and context effects do not necessarily imply experiences are imaginary. Neuroscience increasingly recognizes that perception, emotion, cognition, and physiology interact continuously.',
  },
]

const faqs = [
  {
    question: 'What are placebo and context effects?',
    answer: 'Placebo and context effects refer to ways expectations, emotional state, environment, stress physiology, attention, and contextual framing may influence human experiences and subjective outcomes.',
  },
  {
    question: 'Do placebo effects mean experiences are fake?',
    answer: 'Not necessarily. Human experiences may involve real interactions between emotional processing, stress physiology, perception systems, cognition, and contextual neurobiology.',
  },
  {
    question: 'Why are context effects important in neuroscience?',
    answer: 'Environmental context, emotional regulation, stress burden, sleep continuity, prior experiences, and attentional systems may all influence cognition and subjective experiences.',
  },
]

const relatedSystems = [
  { href: '/education/why-neuroscience-is-difficult', title: 'Why Neuroscience Is Difficult' },
  { href: '/education/why-studies-conflict', title: 'Why Studies Conflict' },
  { href: '/education/why-individual-variability-matters', title: 'Individual Variability' },
  { href: '/education/why-online-supplement-claims-spread', title: 'Mechanistic Hype and Claims' },
]

export default function PlaceboAndContextEffectsPage() {
  return (
    <main className="container-page py-10 space-y-12">
      <AuthorityJsonLd
        title="Placebo and Context Effects"
        description="Educational exploration of placebo effects, contextual neurobiology, expectation systems, and scientific complexity in neuroscience and health research."
        url="https://thehippiescientist.net/education/placebo-and-context-effects"
        type="Article"
      />
      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/education' },
          { label: 'Placebo and Context Effects' },
        ]}
      />
      <section className="space-y-6 max-w-4xl">
        <div className="space-y-3">
          <p className="eyebrow-label">Scientific Literacy Systems</p>
          <h1 className="text-5xl font-bold tracking-tight text-ink">Placebo and Context Effects</h1>
        </div>
        <p className="text-xl leading-9 text-[#46574d]">
          Human experiences are shaped by substantially more than isolated biological mechanisms. Expectations, emotional regulation, stress physiology, environmental context, attentional systems, and contextual neurobiology may all influence subjective cognition and wellness experiences.
        </p>
      </section>
      <EvidenceSummaryCard
        title="Contextual neurobiology and expectation systems"
        evidenceLevel="Strong"
        humanEvidence="Human research increasingly investigates relationships between expectation systems, emotional regulation, stress physiology, contextual framing, attentional processes, and subjective experiences."
        mechanisticEvidence="Mechanistic models commonly involve emotional salience pathways, autonomic regulation, stress-response systems, attentional neurobiology, and perception-related processing systems."
        safetyProfile="Oversimplified interpretation of placebo effects may create misunderstanding about contextual neurobiology, scientific uncertainty, and human variability."
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
          <h2 className="text-3xl font-semibold tracking-tight text-ink">Common placebo and context questions</h2>
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
        Educational content discussing placebo and context effects is not a substitute for individualized medical guidance or clinical evaluation.
      </SafetyNotice>
      <section className="space-y-5">
        <div className="space-y-2">
          <p className="eyebrow-label">Related Educational Systems</p>
          <h2 className="text-3xl font-semibold tracking-tight text-ink">Continue exploring scientific literacy systems</h2>
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
