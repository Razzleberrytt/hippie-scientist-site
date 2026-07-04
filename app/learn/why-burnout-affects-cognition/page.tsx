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
  title: "Why Burnout Affects Cognition",
  description: "Educational exploration of burnout, stress exhaustion, recovery biology, attentional fatigue, and sustainable cognition systems.",
  path: "/learn/why-burnout-affects-cognition/",
})


const systems = [
  {
    title: 'Stress Exhaustion',
    body: 'Chronic stress burden, emotional exhaustion, sleep disruption, and recovery-system strain may impair attentional continuity, motivation systems, cognition flexibility, and emotional regulation.',
  },
  {
    title: 'Recovery Disruption',
    body: 'Burnout-oriented fatigue systems may involve disrupted recovery biology, nervous-system overload, emotional fatigue, and reduced resilience capacity.',
  },
  {
    title: 'Sustainable Cognition',
    body: 'Long-term cognition continuity may depend on sleep quality, emotional regulation, recovery-oriented routines, stress reduction, and nervous-system resilience rather than continual stimulation.',
  },
]

const relatedSystems = [
  { href: '/guides/anxiety', title: 'Burnout Recovery' },
  { href: '/learn/how-the-brain-recovers-from-fatigue', title: 'Fatigue Recovery' },
  { href: '/learn/how-sleep-affects-neurochemistry', title: 'Sleep and Neurochemistry' },
  { href: '/learn/why-fatigue-is-biologically-complex', title: 'Fatigue Complexity' },
]

const WHY_BURNOUT_AFFECTS_COGNITION_REFS = [
  { n: 1, text: 'McEwen BS. (2017). Neurobiological and systemic effects of chronic stress. Chronic Stress, 1: 2470547017692328.', url: 'https://pubmed.ncbi.nlm.nih.gov/28856337/' },
  { n: 2, text: 'Sapolsky RM. (2015). Stress and the brain: individual variability. Mol Psychiatry, 20(11): 1331-1338.', url: 'https://pubmed.ncbi.nlm.nih.gov/25917366/' },
]

export default function WhyBurnoutAffectsCognitionPage() {
  return (
    <div className="container-page py-10 space-y-12">
      <AuthorityJsonLd
        title="Why Burnout Affects Cognition"
        description="Educational exploration of burnout, stress exhaustion, recovery biology, attentional fatigue, and sustainable cognition systems."
        url="https://thehippiescientist.net/learn/why-burnout-affects-cognition"
        type="Article"
      />
      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/learn' },
          { label: 'Why Burnout Affects Cognition' },
        ]}
      />
      <section className="space-y-6 max-w-4xl">
        <div className="space-y-3">
          <p className="eyebrow-label">Recovery-Oriented Neuroscience</p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">Why Burnout Affects Cognition</h1>
        </div>
        <p className="text-xl leading-9 text-muted">
          Burnout-related cognition changes may involve substantially more than low motivation. Stress physiology, emotional exhaustion, sleep disruption, recovery-system strain, and nervous-system overload may all influence cognition continuity and attentional resilience.
        </p>
      </section>
      <EvidenceSummaryCard
        title="Burnout and cognition systems"
        evidenceLevel="Moderate"
        humanEvidence="Human research increasingly investigates relationships between chronic stress, emotional exhaustion, sleep continuity, attentional fatigue, emotional regulation, and cognition sustainability."
        mechanisticEvidence="Mechanistic models commonly involve stress-response systems, autonomic regulation, inflammatory signaling, emotional salience pathways, and recovery-oriented neurobiology."
        safetyProfile="Persistent exhaustion, emotional distress, severe sleep disruption, cognitive decline, and chronic stress burden may negatively influence nervous-system resilience and recovery continuity."
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
      <SafetyNotice>
        Persistent exhaustion, emotional distress, cognitive difficulties, severe sleep disruption, or significant wellness concerns should be evaluated appropriately. Educational content is not a substitute for individualized guidance.
      </SafetyNotice>
      <section className="space-y-5">
        <div className="space-y-2">
          <p className="eyebrow-label">Related Educational Systems</p>
          <h2 className="text-3xl font-semibold tracking-tight text-ink">Continue exploring recovery-oriented cognition</h2>
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
      <References refs={WHY_BURNOUT_AFFECTS_COGNITION_REFS} />
    </div>
  )
}
