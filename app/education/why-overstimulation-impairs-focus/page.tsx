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
  title: "Why Overstimulation Impairs Focus",
  description: "Educational exploration of overstimulation, hyperarousal, attentional fragmentation, stress physiology, and sustainable cognition systems.",
  path: "/education/why-overstimulation-impairs-focus/",
})


const mechanisms = [
  {
    title: 'Attentional Fragmentation',
    body: 'Excessive stimulation may increase distractibility, attentional instability, emotional reactivity, cognition fragmentation, and nervous-system overload depending on context and individual variability.',
  },
  {
    title: 'Stress and Hyperarousal',
    body: 'Stress physiology, emotional intensity, hypervigilance, sleep disruption, and autonomic dysregulation may impair sustainable cognition continuity and recovery-oriented attentional systems.',
  },
  {
    title: 'Recovery-Oriented Cognition',
    body: 'Sustainable focus may depend on sleep continuity, emotional regulation, stress resilience, recovery biology, and nervous-system stability rather than chronic stimulation intensity.',
  },
]

const faqs = [
  {
    question: 'Why can too much stimulation worsen focus?',
    answer: 'Excessive stimulation may contribute to attentional fragmentation, emotional reactivity, hyperarousal, stress burden, and nervous-system instability that reduce sustainable cognition continuity.',
  },
  {
    question: 'Is productivity the same as cognition quality?',
    answer: 'Not necessarily. Increased activity or motivational intensity does not always translate into stable attention, emotional regulation, recovery continuity, or sustainable cognition quality.',
  },
  {
    question: 'Why does stress affect attention?',
    answer: 'Stress physiology may influence emotional salience, sleep continuity, autonomic regulation, cognition flexibility, attentional filtering, and nervous-system resilience.',
  },
]

const relatedSystems = [
  { href: '/compare/rhodiola-vs-ashwagandha', title: 'Rhodiola vs Ashwagandha' },
  { href: '/goals/focus', title: 'Non-Stimulant Focus' },
  { href: '/education/how-focus-and-motivation-work', title: 'Focus and Motivation' },
  { href: '/education/why-burnout-affects-cognition', title: 'Burnout and Cognition' },
]

export default function WhyOverstimulationImpairsFocusPage() {
  return (
    <div className="container-page py-10 space-y-12">
      <AuthorityJsonLd
        title="Why Overstimulation Impairs Focus"
        description="Educational exploration of overstimulation, hyperarousal, attentional fragmentation, stress physiology, and sustainable cognition systems."
        url="https://thehippiescientist.net/education/why-overstimulation-impairs-focus"
        type="Article"
      />
      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/education' },
          { label: 'Why Overstimulation Impairs Focus' },
        ]}
      />
      <section className="space-y-6 max-w-4xl">
        <div className="space-y-3">
          <p className="eyebrow-label">Sustainable Cognition Systems</p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">Why Overstimulation Impairs Focus</h1>
        </div>
        <p className="text-xl leading-9 text-[#46574d]">
          Sustainable cognition continuity may involve substantially more than increasing stimulation intensity. Hyperarousal, emotional reactivity, stress physiology, sleep disruption, and nervous-system overload may impair attentional stability and recovery-oriented cognition systems.
        </p>
        <p className="text-base leading-8 text-[#5c6b63]">
          Educational neuroscience discussions frequently oversimplify focus into dopamine activation or productivity intensity. In reality, sustainable attentional systems commonly involve emotional regulation, sleep continuity, recovery biology, autonomic stability, and contextual neurobiology.
        </p>
      </section>
      <EvidenceSummaryCard
        title="Overstimulation and cognition continuity"
        evidenceLevel="Moderate"
        humanEvidence="Human cognition research increasingly investigates relationships between stress physiology, hyperarousal, sleep continuity, emotional regulation, attentional systems, and cognitive sustainability."
        mechanisticEvidence="Mechanistic models commonly involve dopaminergic signaling, glutamatergic activity, stress-response systems, autonomic regulation, emotional salience pathways, and attentional neurobiology."
        safetyProfile="Chronic overstimulation, emotional exhaustion, sleep disruption, burnout physiology, nervous-system overload, and stress dysregulation may negatively influence cognition continuity."
      />
      <section className="grid gap-6 lg:grid-cols-3">
        {mechanisms.map((mechanism) => (
          <div key={mechanism.title} className="card-premium p-6 space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-ink">{mechanism.title}</h2>
            <p className="text-sm leading-7 text-[#46574d]">{mechanism.body}</p>
          </div>
        ))}
      </section>
      <HumanVsMechanisticEvidence />
      <TranslationalLimitationsCard />
      <section className="space-y-6">
        <div className="space-y-2">
          <p className="eyebrow-label">Educational FAQ</p>
          <h2 className="text-3xl font-semibold tracking-tight text-ink">Common overstimulation questions</h2>
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
        Persistent attention difficulties, severe exhaustion, emotional distress, sleep disruption, or significant wellness concerns should be evaluated appropriately. Educational content is not a substitute for individualized guidance.
      </SafetyNotice>
      <section className="space-y-5">
        <div className="space-y-2">
          <p className="eyebrow-label">Related Educational Systems</p>
          <h2 className="text-3xl font-semibold tracking-tight text-ink">Continue exploring sustainable cognition systems</h2>
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
