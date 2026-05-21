import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import EvidenceSummaryCard from '@/components/evidence/EvidenceSummaryCard'
import HumanVsMechanisticEvidence from '@/components/evidence/HumanVsMechanisticEvidence'
import TranslationalLimitationsCard from '@/components/evidence/TranslationalLimitationsCard'
import SafetyNotice from '@/components/evidence/SafetyNotice'

const systems = [
  {
    title: 'Human Variability',
    body: 'Human studies may produce different outcomes because stress physiology, sleep continuity, medications, health status, emotional regulation, environmental context, and nervous-system sensitivity vary substantially between populations.',
  },
  {
    title: 'Study Design Differences',
    body: 'Differences in dosage systems, sample sizes, duration, measurement methods, participant selection, and study quality may influence scientific outcomes and interpretation.',
  },
  {
    title: 'Biological Complexity',
    body: 'Neurobiology and physiology are highly interconnected systems. Isolated mechanisms may not translate cleanly into predictable real-world human experiences or consistent outcomes.',
  },
]

const faqs = [
  {
    question: 'Why do scientific studies sometimes disagree?',
    answer: 'Differences in populations, methodologies, sleep continuity, stress burden, environmental context, dosing systems, and biological variability may contribute to conflicting outcomes.',
  },
  {
    question: 'Does conflicting evidence mean research is useless?',
    answer: 'Not necessarily. Scientific interpretation often involves gradually refining understanding across multiple studies, limitations, contexts, and evolving evidence systems.',
  },
  {
    question: 'Why are human outcomes difficult to predict?',
    answer: 'Human biology is highly variable and influenced by recovery systems, emotional regulation, stress physiology, environmental context, and complex interacting biological pathways.',
  },
]

const relatedSystems = [
  { href: '/education/why-individual-variability-matters', title: 'Individual Variability' },
  { href: '/education/why-online-supplement-claims-spread', title: 'Mechanistic Hype and Claims' },
  { href: '/education/why-human-trials-matter', title: 'Human vs Mechanistic Evidence' },
  { href: '/education/why-studies-conflict', title: 'Translational Limitations' },
]

export default function WhyStudiesConflictPage() {
  return (
    <main className="container-page py-10 space-y-12">
      <AuthorityJsonLd
        title="Why Studies Conflict"
        description="Educational exploration of scientific uncertainty, human variability, study design differences, and biological complexity in neuroscience and health research."
        url="https://thehippiescientist.net/education/why-studies-conflict"
        type="Article"
      />
      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/education' },
          { label: 'Why Studies Conflict' },
        ]}
      />
      <section className="space-y-6 max-w-4xl">
        <div className="space-y-3">
          <p className="eyebrow-label">Scientific Literacy Systems</p>
          <h1 className="text-5xl font-bold tracking-tight text-ink">Why Studies Conflict</h1>
        </div>
        <p className="text-xl leading-9 text-[#46574d]">
          Scientific disagreement does not necessarily mean research is meaningless. Human variability, study design differences, biological complexity, contextual neurobiology, and evolving evidence systems may all contribute to mixed or conflicting findings.
        </p>
      </section>
      <EvidenceSummaryCard
        title="Scientific uncertainty and biological complexity"
        evidenceLevel="Strong"
        humanEvidence="Human research frequently demonstrates variability across stress physiology, recovery systems, sleep continuity, environmental context, and cognition experiences that may influence outcomes between studies."
        mechanisticEvidence="Mechanistic findings may provide important biological insight while still having limitations in predicting real-world human experiences or population-level outcomes."
        safetyProfile="Overconfident interpretation of isolated studies may oversimplify complex biological systems and scientific uncertainty."
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
          <h2 className="text-3xl font-semibold tracking-tight text-ink">Common scientific-literacy questions</h2>
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
        Educational content discussing scientific uncertainty is not a substitute for individualized medical guidance or evidence-aware clinical evaluation.
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
