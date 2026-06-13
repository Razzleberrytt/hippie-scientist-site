import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import EvidenceSummaryCard from '@/components/evidence/EvidenceSummaryCard'
import MisconceptionCallout from '@/components/evidence/MisconceptionCallout'
import ResearchLimitations from '@/components/evidence/ResearchLimitations'
import ReferencedStudies from '@/components/evidence/ReferencedStudies'
import SafetyNotice from '@/components/evidence/SafetyNotice'

const sections = [
  {
    title: 'Recovery Continuity',
    body: 'Sleep continuity is associated with nervous-system restoration, emotional regulation, cognition recovery, hormonal regulation, fatigue systems, immune signaling, and physiological recovery processes.',
  },
  {
    title: 'Dream Architecture',
    body: 'REM systems, dream vividness, memory consolidation, emotional processing, cholinergic signaling, and sensory integration may all intersect with sleep-oriented neuropharmacology.',
  },
  {
    title: 'Stress and Sleep',
    body: 'Chronic stress burden may influence sleep architecture, emotional-processing continuity, nervous-system arousal, cortisol signaling, fatigue recovery, and restorative sleep quality.',
  },
]

const related = [
  {
    href: '/education/cholinergic-system',
    title: 'Cholinergic System',
  },
  {
    href: '/education/gaba',
    title: 'GABA Pathway',
  },
  {
    href: '/goals/sleep',
    title: 'Sleep Support',
  },
  {
    href: '/psychoactive/dream-herbs',
    title: 'Dream Herbs',
  },
]

export default function SleepNeurochemistryPage() {
  return (
    <main className="container-page py-10 space-y-12">
      <AuthorityJsonLd
        title="How Sleep Affects Neurochemistry"
        description="Educational exploration of sleep neurochemistry, REM systems, recovery continuity, nervous-system restoration, and dream-related signaling."
        url="https://thehippiescientist.net/education/how-sleep-affects-neurochemistry"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/education' },
          { label: 'How Sleep Affects Neurochemistry' },
        ]}
      />

      <section className="space-y-6 max-w-4xl">
        <div className="space-y-3">
          <p className="eyebrow-label">Educational Supernode</p>

          <h1 className="text-5xl font-bold tracking-tight text-ink">
            How Sleep Affects Neurochemistry
          </h1>
        </div>

        <p className="text-xl leading-9 text-[#46574d]">
          Sleep-related neurochemistry involves interconnected systems associated with nervous-system restoration, cognition recovery, emotional regulation, hormonal signaling, REM architecture, memory consolidation, and dream-state processing.
        </p>

        <p className="text-base leading-8 text-[#5c6b63]">
          Educational sleep-neurochemistry discussions commonly intersect with GABAergic systems, cholinergic signaling, stress-response continuity, fatigue recovery, inflammatory biology, emotional resilience, and dream-related neuropharmacology.
        </p>
      </section>

      <MisconceptionCallout
        myth="Sleep is simply passive rest for the brain"
        reality="Sleep involves active biological processes associated with memory consolidation, emotional processing, nervous-system restoration, hormonal regulation, metabolic recovery, immune signaling, and cognition continuity."
      />

      <EvidenceSummaryCard
        title="Sleep neurochemistry and recovery systems"
        evidenceLevel="Strong"
        humanEvidence="Human research strongly associates sleep continuity with emotional regulation, cognition quality, stress resilience, recovery biology, and overall mental and physical health."
        mechanisticEvidence="Mechanistic evidence suggests sleep involves interacting GABAergic, cholinergic, hormonal, inflammatory, circadian, and stress-response systems."
        safetyProfile="Chronic sleep disruption may negatively influence cognition continuity, emotional resilience, stress tolerance, immune signaling, and recovery-oriented neurobiology."
      />

      <section className="grid gap-6 lg:grid-cols-3">
        {sections.map((section) => (
          <div key={section.title} className="card-premium p-6 space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-ink">
              {section.title}
            </h2>

            <p className="text-sm leading-7 text-[#46574d]">
              {section.body}
            </p>
          </div>
        ))}
      </section>

      <SafetyNotice>
        Persistent insomnia, severe fatigue, chronic sleep disruption, or significant mental-health symptoms associated with sleep disturbance should be approached seriously. Educational content is not a substitute for individualized medical care.
      </SafetyNotice>

      <ResearchLimitations
        limitations={[
          'Sleep neurobiology remains incompletely understood.',
          'Dream-state neurochemistry is difficult to study directly.',
          'Individual sleep needs and responses may vary substantially.',
          'Short-term sleep interventions may not reflect long-term outcomes.',
        ]}
      />

      <section className="space-y-5">
        <div className="space-y-2">
          <p className="eyebrow-label">Continue Exploring</p>

          <h2 className="text-3xl font-semibold tracking-tight text-ink">
            Related sleep and recovery systems
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
            title: 'PubMed Sleep Research',
            href: 'https://pubmed.ncbi.nlm.nih.gov/',
            source: 'NIH / PubMed',
          },
        ]}
      />
    </main>
  )
}
