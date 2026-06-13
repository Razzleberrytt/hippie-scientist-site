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
    title: 'Motivation Signaling',
    body: 'Motivation-related neurochemistry commonly intersects with reward systems, behavioral reinforcement, stress adaptation, novelty processing, emotional regulation, and cognition continuity.',
  },
  {
    title: 'Stress and Productivity',
    body: 'Chronic stress burden may influence attention systems, cognitive endurance, nervous-system arousal, sleep continuity, emotional resilience, and mental fatigue recovery.',
  },
  {
    title: 'Calm Focus Systems',
    body: 'Educational focus discussions often involve balancing stimulation, recovery continuity, emotional regulation, sleep architecture, behavioral structure, and nervous-system resilience.',
  },
]

const related = [
  {
    href: '/education/dopamine',
    title: 'Dopamine Pathway',
  },
  {
    href: '/goals/focus',
    title: 'Non-Stimulant Focus',
  },
  {
    href: '/education/what-is-a-nootropic',
    title: 'What Is a Nootropic?',
  },
  {
    href: '/goals/focus',
    title: 'Non-Sedating Calm',
  },
]

export default function FocusMotivationPage() {
  return (
    <main className="container-page py-10 space-y-12">
      <AuthorityJsonLd
        title="How Focus and Motivation Work"
        description="Educational exploration of focus neurochemistry, motivation signaling, cognition systems, calm productivity, and stress-aware neuropharmacology."
        url="https://thehippiescientist.net/education/how-focus-and-motivation-work"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/education' },
          { label: 'How Focus and Motivation Work' },
        ]}
      />

      <section className="space-y-6 max-w-4xl">
        <div className="space-y-3">
          <p className="eyebrow-label">Educational Supernode</p>

          <h1 className="text-5xl font-bold tracking-tight text-ink">
            How Focus and Motivation Work
          </h1>
        </div>

        <p className="text-xl leading-9 text-[#46574d]">
          Focus and motivation involve interconnected neurochemical, behavioral, psychological, and environmental systems associated with cognition continuity, behavioral drive, emotional regulation, stress adaptation, attention regulation, and nervous-system balance.
        </p>

        <p className="text-base leading-8 text-[#5c6b63]">
          Educational cognition discussions commonly intersect with dopaminergic signaling, stress-response continuity, sleep architecture, emotional resilience, recovery systems, novelty processing, behavioral reinforcement, and calm-focus neuropharmacology.
        </p>
      </section>

      <MisconceptionCallout
        myth="Motivation is only about dopamine"
        reality="Focus and motivation involve interacting systems related to sleep continuity, stress burden, emotional regulation, behavioral habits, environmental structure, nervous-system resilience, reward processing, and cognition quality. Simplistic “dopamine optimization” narratives may overlook substantial biological and psychological complexity."
      />

      <EvidenceSummaryCard
        title="Focus, cognition, and motivation systems"
        evidenceLevel="Strong"
        humanEvidence="Human research demonstrates relationships between sleep quality, stress burden, emotional resilience, cognition continuity, behavioral structure, and productivity outcomes."
        mechanisticEvidence="Mechanistic evidence suggests focus and motivation involve interacting dopaminergic, stress-response, arousal, and executive-function systems."
        safetyProfile="Chronic overstimulation, sleep disruption, excessive stimulant exposure, burnout, and unmanaged stress burden may negatively affect cognition systems and emotional resilience."
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
        Persistent cognitive impairment, severe burnout symptoms, chronic sleep disruption, emotional distress, or significant attention-related difficulties should be approached seriously. Educational content is not a substitute for individualized medical or mental-health care.
      </SafetyNotice>

      <ResearchLimitations
        limitations={[
          'Focus and motivation systems remain biologically complex and incompletely understood.',
          'Short-term productivity changes may not reflect long-term cognitive health.',
          'Individual responses to stimulants or nootropics may vary substantially.',
          'Online “dopamine optimization” discussions often exaggerate mechanistic certainty.',
        ]}
      />

      <section className="space-y-5">
        <div className="space-y-2">
          <p className="eyebrow-label">Continue Exploring</p>

          <h2 className="text-3xl font-semibold tracking-tight text-ink">
            Related cognition and productivity systems
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
            title: 'PubMed Cognition Research',
            href: 'https://pubmed.ncbi.nlm.nih.gov/',
            source: 'NIH / PubMed',
          },
        ]}
      />
    </main>
  )
}
