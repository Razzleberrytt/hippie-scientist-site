import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import EvidenceSummaryCard from '@/components/evidence/EvidenceSummaryCard'
import MisconceptionCallout from '@/components/evidence/MisconceptionCallout'
import ResearchLimitations from '@/components/evidence/ResearchLimitations'
import ReferencedStudies from '@/components/evidence/ReferencedStudies'
import SafetyNotice from '@/components/evidence/SafetyNotice'

const mechanisms = [
  {
    title: 'Stress Signaling',
    body: 'Stress-response systems involve interconnected neurochemical, hormonal, inflammatory, and autonomic signaling associated with vigilance, emotional processing, adaptation, threat perception, nervous-system arousal, and physiological recovery.',
  },
  {
    title: 'Sleep and Recovery',
    body: 'Chronic stress burden may influence sleep architecture, cortisol signaling, emotional regulation, cognition continuity, nervous-system restoration, fatigue recovery, and restorative neurobiology.',
  },
  {
    title: 'Focus and Cognition',
    body: 'Stress overload may intersect with executive-function systems, concentration continuity, cognitive fatigue, motivational signaling, emotional resilience, attentional filtering, and burnout neurobiology.',
  },
]

const related = [
  {
    href: '/protocols/stress-regulation',
    title: 'Stress Regulation',
  },
  {
    href: '/protocols/burnout-recovery',
    title: 'Burnout Recovery',
  },
  {
    href: '/education/what-is-neuroinflammation',
    title: 'Neuroinflammation',
  },
  {
    href: '/education/what-are-adaptogens',
    title: 'Adaptogens',
  },
]

export default function StressBrainEducationPage() {
  return (
    <main className="container-page py-10 space-y-12">
      <AuthorityJsonLd
        title="How Stress Affects the Brain"
        description="Educational exploration of stress neurochemistry, emotional regulation, nervous-system signaling, sleep continuity, and recovery-oriented neuropharmacology."
        url="https://thehippiescientist.net/education/how-stress-affects-the-brain"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/education' },
          { label: 'How Stress Affects the Brain' },
        ]}
      />

      <section className="space-y-6 max-w-4xl">
        <div className="space-y-3">
          <p className="eyebrow-label">Educational Supernode</p>

          <h1 className="text-5xl font-bold tracking-tight text-ink">
            How Stress Affects the Brain
          </h1>
        </div>

        <p className="text-xl leading-9 text-[#46574d]">
          Stress-related neurobiology involves interconnected signaling systems associated with emotional regulation, vigilance, cognition continuity, inflammatory signaling, nervous-system activation, hormonal adaptation, sleep recovery, and physiological resilience.
        </p>

        <p className="text-base leading-8 text-[#5c6b63]">
          Educational stress-neurochemistry discussions commonly intersect with cortisol signaling, stress-response continuity, sleep disruption, emotional-processing systems, fatigue biology, burnout neurochemistry, inflammatory pathways, and recovery-oriented neuropharmacology.
        </p>
      </section>

      <MisconceptionCallout
        myth="Stress is purely psychological and does not affect biology"
        reality="Chronic stress burden may influence hormonal signaling, inflammatory biology, sleep architecture, emotional regulation, cognition continuity, cardiovascular stress systems, nervous-system arousal, and recovery-oriented neurobiology."
      />

      <EvidenceSummaryCard
        title="Stress neurobiology and nervous-system regulation"
        evidenceLevel="Strong"
        humanEvidence="Human research strongly associates chronic stress burden with sleep disruption, emotional dysregulation, cognition impairment, fatigue systems, and physiological stress responses."
        mechanisticEvidence="Mechanistic evidence suggests stress-response systems involve interacting hormonal, inflammatory, autonomic, emotional-processing, and neurochemical signaling pathways."
        safetyProfile="Persistent stress overload, chronic sleep disruption, burnout, emotional exhaustion, and prolonged nervous-system arousal may negatively affect mental and physical health outcomes."
      />

      <section className="grid gap-6 lg:grid-cols-3">
        {mechanisms.map((mechanism) => (
          <div key={mechanism.title} className="card-premium p-6 space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-ink">
              {mechanism.title}
            </h2>

            <p className="text-sm leading-7 text-[#46574d]">
              {mechanism.body}
            </p>
          </div>
        ))}
      </section>

      <SafetyNotice>
        Persistent severe stress, panic symptoms, emotional exhaustion, trauma-related symptoms, chronic insomnia, or significant mental-health distress should be approached seriously. Educational content is not a substitute for individualized medical or mental-health care.
      </SafetyNotice>

      <ResearchLimitations
        limitations={[
          'Stress neurobiology remains biologically complex and incompletely understood.',
          'Individual stress responses may vary substantially across environments and genetics.',
          'Subjective emotional experiences are difficult to standardize scientifically.',
          'Single-neurotransmitter explanations may oversimplify stress physiology.',
        ]}
      />

      <section className="space-y-5">
        <div className="space-y-2">
          <p className="eyebrow-label">Continue Exploring</p>

          <h2 className="text-3xl font-semibold tracking-tight text-ink">
            Related recovery and stress systems
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
            title: 'PubMed Stress Research',
            href: 'https://pubmed.ncbi.nlm.nih.gov/',
            source: 'NIH / PubMed',
          },
        ]}
      />
    </main>
  )
}
