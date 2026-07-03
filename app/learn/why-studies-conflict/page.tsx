import type { Metadata } from 'next'
import { buildPageMetadata } from '../../../src/lib/seo'
import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import EducationPageLayout from '@/components/layouts/EducationPageLayout'
import EvidenceSummaryCard from '@/components/evidence/EvidenceSummaryCard'
import HumanVsMechanisticEvidence from '@/components/evidence/HumanVsMechanisticEvidence'
import TranslationalLimitationsCard from '@/components/evidence/TranslationalLimitationsCard'
import SafetyNotice from '@/components/evidence/SafetyNotice'
import References from '@/components/References'
export const metadata: Metadata = buildPageMetadata({
  title: "Why Studies Conflict",
  description: "Educational exploration of scientific uncertainty, human variability, study design differences, and biological complexity in neuroscience and health research.",
  path: "/learn/why-studies-conflict/",
})


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
  { href: '/learn/why-individual-variability-matters', title: 'Individual Variability' },
  { href: '/learn/why-online-supplement-claims-spread', title: 'Mechanistic Hype and Claims' },
  { href: '/learn/why-human-trials-matter', title: 'Human vs Mechanistic Evidence' },
  { href: '/learn/why-studies-conflict', title: 'Translational Limitations' },
]

const WHY_STUDIES_CONFLICT_REFS = [
  { n: 1, text: 'Ioannidis JPA. (2005). Why most published research findings are false. PLoS Med, 2(8): e124.', url: 'https://pubmed.ncbi.nlm.nih.gov/16060722/' },
]

export default function WhyStudiesConflictPage() {
  return (
    <>
      <AuthorityJsonLd
        title="Why Studies Conflict"
        description="Educational exploration of scientific uncertainty, human variability, study design differences, and biological complexity in neuroscience and health research."
        url="https://thehippiescientist.net/learn/why-studies-conflict"
        type="Article"
        faqItems={faqs}
      />
      <EducationPageLayout
        title="Why Studies Conflict"
        description="Scientific disagreement does not necessarily mean research is meaningless. Human variability, study design differences, biological complexity, contextual neurobiology, and evolving evidence systems may all contribute to mixed or conflicting findings."
      >
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
            <p className="text-sm leading-7 text-muted">{system.body}</p>
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
              <p className="text-sm leading-7 text-muted">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>
      <SafetyNotice>
        Educational content discussing scientific uncertainty is not a substitute for individualized medical guidance or clinical evaluation.
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
      </EducationPageLayout>
    </>
  )
}
