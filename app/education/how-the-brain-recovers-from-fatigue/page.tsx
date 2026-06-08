import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import EvidenceSummaryCard from '@/components/evidence/EvidenceSummaryCard'
import MisconceptionCallout from '@/components/evidence/MisconceptionCallout'
import ResearchLimitations from '@/components/evidence/ResearchLimitations'
import ReferencedStudies from '@/components/evidence/ReferencedStudies'
import SafetyNotice from '@/components/evidence/SafetyNotice'

const systems = [
  {
    title: 'Recovery Neurochemistry',
    body: 'Fatigue recovery may involve interconnected systems associated with stress-response regulation, sleep continuity, hormonal signaling, cognition recovery, emotional resilience, immune signaling, and nervous-system restoration.',
  },
  {
    title: 'Sleep and Restoration',
    body: 'Sleep continuity and nervous-system downregulation are strongly associated with memory consolidation, metabolic restoration, emotional regulation, stress recovery, and restorative neurobiology.',
  },
  {
    title: 'Stress Burden and Exhaustion',
    body: 'Chronic stress signaling may intersect with motivational systems, cognition continuity, inflammatory biology, emotional processing, nervous-system strain, burnout, and fatigue persistence.',
  },
]

const related = [
  {
    href: '/protocols/burnout-recovery',
    title: 'Burnout Recovery',
  },
  {
    href: '/education/what-is-neuroinflammation',
    title: 'Neuroinflammation',
  },
  {
    href: '/education/how-sleep-affects-neurochemistry',
    title: 'Sleep Neurochemistry',
  },
  {
    href: '/education/how-stress-affects-the-brain',
    title: 'Stress and the Brain',
  },
]

export default function FatigueRecoveryPage() {
  return (
    <main className="container-page py-10 space-y-12">
      <AuthorityJsonLd
        title="How the Brain Recovers From Fatigue"
        description="Educational exploration of fatigue recovery, nervous-system restoration, stress signaling, sleep continuity, and recovery-oriented neuropharmacology."
        url="https://thehippiescientist.net/education/how-the-brain-recovers-from-fatigue"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/education' },
          { label: 'How the Brain Recovers From Fatigue' },
        ]}
      />

      <section className="space-y-6 max-w-4xl">
        <div className="space-y-3">
          <p className="eyebrow-label">Educational Supernode</p>

          <h1 className="text-5xl font-bold tracking-tight text-ink">
            How the Brain Recovers From Fatigue
          </h1>
        </div>

        <p className="text-xl leading-9 text-[#46574d]">
          Fatigue recovery involves interconnected neurochemical, hormonal, behavioral, and physiological systems associated with stress adaptation, sleep continuity, cognition recovery, emotional regulation, metabolic restoration, and nervous-system resilience.
        </p>

        <p className="text-base leading-8 text-[#5c6b63]">
          Educational fatigue-recovery discussions commonly intersect with sleep architecture, inflammatory biology, stress-response burden, burnout systems, recovery signaling, nervous-system downregulation, and recovery-oriented neuropharmacology.
        </p>
      </section>

      <MisconceptionCallout
        myth="Fatigue is always caused by lack of motivation or willpower"
        reality="Fatigue may involve interacting biological, psychological, behavioral, environmental, sleep-related, inflammatory, hormonal, and stress-response systems. Chronic exhaustion and burnout are often substantially more complex than simple motivation deficits."
      />

      <EvidenceSummaryCard
        title="Fatigue recovery and nervous-system restoration"
        evidenceLevel="Strong"
        humanEvidence="Human research strongly associates sleep continuity, stress recovery, emotional resilience, and metabolic restoration with cognition quality and fatigue recovery outcomes."
        mechanisticEvidence="Mechanistic evidence suggests fatigue recovery involves interacting stress-response, inflammatory, hormonal, circadian, and nervous-system regulation systems."
        safetyProfile="Chronic sleep disruption, severe stress burden, burnout, excessive stimulant use, and persistent emotional distress may negatively affect recovery-oriented neurobiology."
      />

      <section className="grid gap-6 lg:grid-cols-3">
        {systems.map((system) => (
          <div key={system.title} className="card-premium p-6 space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-ink">
              {system.title}
            </h2>

            <p className="text-sm leading-7 text-[#46574d]">
              {system.body}
            </p>
          </div>
        ))}
      </section>

      <SafetyNotice>
        Persistent severe fatigue, unexplained exhaustion, chronic sleep disruption, or major cognitive decline should be approached seriously. Educational content is not a substitute for individualized medical evaluation.
      </SafetyNotice>

      <ResearchLimitations
        limitations={[
          'Fatigue recovery systems remain biologically complex and incompletely understood.',
          'Burnout and chronic exhaustion may involve multiple overlapping mechanisms.',
          'Subjective fatigue is difficult to standardize scientifically.',
          'Individual recovery patterns may vary substantially.',
        ]}
      />

      <section className="space-y-5">
        <div className="space-y-2">
          <p className="eyebrow-label">Continue Exploring</p>

          <h2 className="text-3xl font-semibold tracking-tight text-ink">
            Related recovery systems
          </h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {related.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="card-premium p-6 transition hover:-translate-y-0.5"
            >
              <div className="space-y-3">
                <p className="eyebrow-label">Related Educational System</p>

                <h3 className="text-2xl font-semibold tracking-tight text-ink">
                  {item.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <ReferencedStudies
        studies={[
          {
            title: 'National Institute of Mental Health',
            href: 'https://www.nimh.nih.gov/',
            source: 'NIMH',
          },
          {
            title: 'PubMed Fatigue Research',
            href: 'https://pubmed.ncbi.nlm.nih.gov/',
            source: 'NIH / PubMed',
          },
        ]}
      />
    </main>
  )
}
