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
  title: "Why Neuroscience Is Difficult",
  description: "Educational exploration of biological complexity, contextual neurobiology, human variability, and scientific limitations in neuroscience research.",
  path: "/education/why-neuroscience-is-difficult/",
})


const systems = [
  {
    title: 'Interconnected Biology',
    body: 'Neuroscience involves highly interconnected systems including stress physiology, emotional regulation, sleep continuity, autonomic balance, cognition flexibility, inflammatory signaling, and environmental context.',
  },
  {
    title: 'Human Variability',
    body: 'Human experiences may vary substantially depending on nervous-system sensitivity, medications, recovery biology, sleep quality, emotional state, stress burden, and contextual neurobiology.',
  },
  {
    title: 'Scientific Limitations',
    body: 'Mechanistic findings, animal research, isolated pathways, and laboratory systems may not always translate cleanly into predictable real-world human experiences or consistent cognition outcomes.',
  },
]

const faqs = [
  {
    question: 'Why is neuroscience so complicated?',
    answer: 'Neuroscience involves highly interconnected biological systems influenced by stress physiology, emotional regulation, sleep continuity, environmental context, recovery biology, and human variability.',
  },
  {
    question: 'Why are brain-related claims often oversimplified?',
    answer: 'Simplified explanations spread easily online, but real neurobiology often involves complex interacting systems rather than isolated neurotransmitter effects or deterministic mechanisms.',
  },
  {
    question: 'Why are human experiences difficult to predict?',
    answer: 'Human experiences may differ substantially because of contextual neurobiology, recovery systems, stress burden, emotional regulation, sleep continuity, medications, and biological variability.',
  },
]

const relatedSystems = [
  { href: '/education/why-studies-conflict', title: 'Why Studies Conflict' },
  { href: '/education/why-individual-variability-matters', title: 'Individual Variability' },
  { href: '/education/why-online-supplement-claims-spread', title: 'Mechanistic Hype and Claims' },
  { href: '/education/why-studies-conflict', title: 'Translational Limitations' },
]

export default function WhyNeuroscienceIsDifficultPage() {
  return (
    <main className="container-page py-10 space-y-12">
      <AuthorityJsonLd
        title="Why Neuroscience Is Difficult"
        description="Educational exploration of biological complexity, contextual neurobiology, human variability, and scientific limitations in neuroscience research."
        url="https://thehippiescientist.net/education/why-neuroscience-is-difficult"
        type="Article"
      />
      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/education' },
          { label: 'Why Neuroscience Is Difficult' },
        ]}
      />
      <section className="space-y-6 max-w-4xl">
        <div className="space-y-3">
          <p className="eyebrow-label">Scientific Literacy Systems</p>
          <h1 className="text-5xl font-bold tracking-tight text-ink">Why Neuroscience Is Difficult</h1>
        </div>
        <p className="text-xl leading-9 text-[#46574d]">
          Neuroscience is extraordinarily complex because the brain interacts continuously with stress physiology, emotional regulation, sleep continuity, recovery biology, environmental context, nervous-system sensitivity, and countless interconnected biological systems.
        </p>
      </section>
      <EvidenceSummaryCard
        title="Biological complexity and contextual neurobiology"
        evidenceLevel="Strong"
        humanEvidence="Human research frequently demonstrates variability across stress physiology, recovery systems, sleep continuity, emotional regulation, and cognition experiences that influence neuroscience outcomes."
        mechanisticEvidence="Mechanistic findings may provide important biological insight while still having substantial limitations in predicting real-world human cognition, emotional experiences, or population-level outcomes."
        safetyProfile="Oversimplified neuroscience explanations may create unrealistic expectations or misunderstanding about biological complexity and human variability."
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
          <h2 className="text-3xl font-semibold tracking-tight text-ink">Common neuroscience questions</h2>
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
        Educational neuroscience content is not a substitute for individualized medical guidance, clinical evaluation, or mental-health support.
      </SafetyNotice>
      <section className="space-y-5">
        <div className="space-y-2">
          <p className="eyebrow-label">Related Educational Systems</p>
          <h2 className="text-3xl font-semibold tracking-tight text-ink">Continue exploring scientific literacy systems</h2>
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
    </main>
  )
}
