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
  title: "Why Online Supplement Claims Spread",
  description: "Educational exploration of mechanistic hype, simplified neuroscience, contextual variability, and scientific uncertainty in supplement discourse.",
  path: "/learn/why-online-supplement-claims-spread/",
})


const systems = [
  {
    title: 'Simplified Neuroscience',
    body: 'Online supplement narratives frequently oversimplify neurobiology into deterministic neurotransmitter explanations, rapid optimization claims, or highly simplified cognition models.',
  },
  {
    title: 'Mechanistic Hype',
    body: 'Mechanistic evidence may sometimes be interpreted too aggressively despite important differences between isolated pathways, animal research, laboratory findings, and real-world human experiences.',
  },
  {
    title: 'Contextual Variability',
    body: 'Human responses may vary substantially depending on stress physiology, recovery biology, sleep continuity, emotional regulation, environment, medications, health status, and nervous-system sensitivity.',
  },
]

const faqs = [
  {
    question: 'Why do online supplement claims often sound certain?',
    answer: 'Simplified certainty may spread more easily online than nuanced scientific interpretation. Biological systems are highly variable and many mechanisms remain incompletely understood.',
  },
  {
    question: 'What is mechanistic hype?',
    answer: 'Mechanistic hype commonly occurs when early-stage findings, isolated pathways, or theoretical mechanisms are interpreted as if they guarantee strong real-world human outcomes.',
  },
  {
    question: 'Why do scientific studies sometimes conflict?',
    answer: 'Differences in study design, populations, recovery systems, sleep continuity, health context, dosing systems, and individual variability may contribute to mixed findings.',
  },
]

const relatedSystems = [
  { href: '/learn/why-individual-variability-matters', title: 'Individual Variability' },
  { href: '/learn/why-human-trials-matter', title: 'Human vs Mechanistic Evidence' },
  { href: '/learn/why-studies-conflict', title: 'Translational Limitations' },
  { href: '/learn/why-neuroscience-is-difficult', title: 'Why Neuroscience Is Complicated' },
]

const WHY_ONLINE_SUPPLEMENT_CLAIMS_SPREAD_REFS = [
  { n: 1, text: 'Vosoughi S, et al. (2018). The spread of true and false news online. Science, 359(6380): 1146-1151.', url: 'https://pubmed.ncbi.nlm.nih.gov/29590045/' },
]

export default function WhyOnlineSupplementClaimsSpreadPage() {
  return (
    <div className="container-page py-10 space-y-12">
      <AuthorityJsonLd
        title="Why Online Supplement Claims Spread"
        description="Educational exploration of mechanistic hype, simplified neuroscience, contextual variability, and scientific uncertainty in supplement discourse."
        url="https://thehippiescientist.net/learn/why-online-supplement-claims-spread"
        type="Article"
      />
      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/learn' },
          { label: 'Why Online Supplement Claims Spread' },
        ]}
      />
      <section className="space-y-6 max-w-4xl">
        <div className="space-y-3">
          <p className="eyebrow-label">Scientific Literacy Systems</p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">Why Online Supplement Claims Spread</h1>
        </div>
        <p className="text-xl leading-9 text-muted">
          Online supplement discussions frequently simplify highly complex biological systems into deterministic optimization narratives. Mechanistic hype, contextual variability, scientific uncertainty, emotional marketing, and simplified neuroscience may all influence how supplement claims spread online.
        </p>
      </section>
      <EvidenceSummaryCard
        title="Mechanistic hype and scientific uncertainty"
        evidenceLevel="Strong"
        humanEvidence="Human research frequently demonstrates variability across stress physiology, sleep continuity, recovery systems, environmental context, and cognition experiences that may not align with simplified online narratives."
        mechanisticEvidence="Mechanistic findings may provide valuable biological insights while still having important translational limitations between laboratory systems and real-world human outcomes."
        safetyProfile="Overconfident health claims, oversimplified neuroscience, exaggerated optimization narratives, and deterministic interpretations may create unrealistic expectations or misunderstanding."
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
          <h2 className="text-3xl font-semibold tracking-tight text-ink">Common supplement-information questions</h2>
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
        Health claims online may oversimplify complex biological systems. Educational content is not a substitute for individualized medical guidance or clinical evaluation.
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
    </div>
  )
}
