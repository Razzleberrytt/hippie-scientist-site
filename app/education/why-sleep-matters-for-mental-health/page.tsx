import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import EvidenceSection from '@/components/evidence/EvidenceSection'
import ReferencedStudies from '@/components/evidence/ReferencedStudies'
import SafetyNotice from '@/components/evidence/SafetyNotice'

const relatedSystems = [
  {
    href: '/education/how-sleep-affects-neurochemistry',
    title: 'Sleep Neurochemistry',
  },
  {
    href: '/education/how-emotional-regulation-works',
    title: 'Emotional Regulation',
  },
  {
    href: '/education/how-stress-affects-the-brain',
    title: 'Stress and the Brain',
  },
  {
    href: '/goals/sleep',
    title: 'Sleep Support',
  },
]

export default function SleepMentalHealthPage() {
  return (
    <main className="container-page py-10 space-y-12">
      <AuthorityJsonLd
        title="Why Sleep Matters for Mental Health"
        description="Educational exploration of sleep continuity, emotional regulation, cognition recovery, stress systems, and mental-health-related neurochemistry."
        url="https://thehippiescientist.net/education/why-sleep-matters-for-mental-health"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/education' },
          { label: 'Why Sleep Matters for Mental Health' },
        ]}
      />

      <section className="space-y-6 max-w-4xl">
        <div className="space-y-3">
          <p className="eyebrow-label">Sleep and Recovery Education</p>

          <h1 className="text-5xl font-bold tracking-tight text-ink">
            Why Sleep Matters for Mental Health
          </h1>
        </div>

        <p className="text-xl leading-9 text-[#46574d]">
          Sleep continuity is closely associated with emotional regulation, cognition recovery, stress adaptation, nervous-system restoration, and mental-health-related neurochemistry.
        </p>

        <p className="text-base leading-8 text-[#5c6b63]">
          Educational sleep discussions commonly intersect with mood systems, stress signaling, recovery biology, fatigue regulation, and nervous-system resilience.
        </p>
      </section>

      <EvidenceSection
        title="Sleep and emotional regulation"
        evidenceLevel="Strong"
        summary="Sleep disruption may influence emotional processing, stress tolerance, cognition continuity, recovery systems, and subjective well-being."
        limitations="Sleep-related neurochemistry is complex and influenced by environmental, psychological, behavioral, and physiological variables."
      />

      <SafetyNotice>
        Persistent sleep disruption, severe emotional distress, or significant mental-health symptoms should be approached seriously. Educational content is not a substitute for individualized medical or mental-health care.
      </SafetyNotice>

      <section className="space-y-5">
        <div className="space-y-2">
          <p className="eyebrow-label">Related Educational Systems</p>

          <h2 className="text-3xl font-semibold tracking-tight text-ink">
            Continue exploring recovery neurochemistry
          </h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {relatedSystems.map((system) => (
            <Link
              key={system.href}
              href={system.href}
              className="card-premium p-6 transition hover:-translate-y-0.5"
            >
              <div className="space-y-3">
                <h3 className="text-2xl font-semibold tracking-tight text-ink">
                  {system.title}
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
