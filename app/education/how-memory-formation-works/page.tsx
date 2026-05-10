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
    title: 'Encoding and Attention',
    body: 'Memory formation commonly intersects with attentional regulation, executive-function systems, emotional salience, sensory integration, cognition continuity, and state-dependent information processing.',
  },
  {
    title: 'Sleep and Consolidation',
    body: 'Sleep architecture, REM continuity, nervous-system restoration, cholinergic signaling, and recovery biology are frequently discussed in relation to memory consolidation systems.',
  },
  {
    title: 'Stress and Recall',
    body: 'Stress burden, emotional intensity, fatigue systems, burnout physiology, and cortisol signaling may influence memory retrieval, concentration continuity, and cognition resilience.',
  },
]

const relatedSystems = [
  {
    href: '/education/how-sleep-affects-neurochemistry',
    title: 'Sleep Neurochemistry',
  },
  {
    href: '/education/how-focus-and-motivation-work',
    title: 'Focus and Motivation',
  },
  {
    href: '/pathways/glutamate',
    title: 'Glutamate Pathway',
  },
  {
    href: '/pathways/cholinergic-system',
    title: 'Cholinergic System',
  },
]

const faqItems = [
  {
    question: 'Is memory formation purely chemical?',
    answer:
      'Memory systems involve interacting neurochemical, emotional, behavioral, sensory, and environmental influences. Sleep continuity, emotional salience, stress physiology, repetition, and attentional state may all influence memory formation.',
  },
  {
    question: 'Why does stress affect memory?',
    answer:
      'Stress physiology may influence attentional continuity, emotional processing, sleep recovery, cortisol signaling, cognition resilience, and retrieval systems associated with memory performance.',
  },
  {
    question: 'Does better focus always improve memory?',
    answer:
      'Attention systems may support memory encoding, but fatigue, stress burden, emotional state, sleep quality, overstimulation, and cognitive overload may still influence recall and consolidation outcomes.',
  },
]

export default function MemoryFormationEducationPage() {
  return (
    <main className="container-page py-10 space-y-12">
      <AuthorityJsonLd
        title="How Memory Formation Works"
        description="Educational exploration of memory formation, cognition continuity, sleep-dependent consolidation, emotional salience, and neuropharmacology."
        url="https://thehippiescientist.net/education/how-memory-formation-works"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/education' },
          { label: 'How Memory Formation Works' },
        ]}
      />

      <section className="space-y-6 max-w-4xl">
        <div className="space-y-3">
          <p className="eyebrow-label">Educational Supernode</p>

          <h1 className="text-5xl font-bold tracking-tight text-ink">
            How Memory Formation Works
          </h1>
        </div>

        <p className="text-xl leading-9 text-[#46574d]">
          Memory formation involves interconnected systems associated with attentional regulation, emotional processing, sensory integration, sleep-dependent consolidation, cognition continuity, neuroplasticity, and nervous-system adaptation.
        </p>

        <p className="text-base leading-8 text-[#5c6b63]">
          Educational memory discussions commonly intersect with glutamatergic signaling, cholinergic systems, emotional salience, stress physiology, sleep architecture, recovery biology, and executive-function continuity.
        </p>
      </section>

      <MisconceptionCallout
        myth="Memory is simply about storing information like a computer"
        reality="Human memory involves dynamic biological processes associated with emotional interpretation, attentional state, sensory integration, stress physiology, sleep continuity, repetition, neuroplasticity, and contextual processing."
      />

      <EvidenceSummaryCard
        title="Memory formation and cognition continuity"
        evidenceLevel="Strong"
        humanEvidence="Human research strongly associates sleep continuity, emotional salience, attentional systems, repetition, stress burden, and cognition recovery with memory performance outcomes."
        mechanisticEvidence="Mechanistic models commonly involve glutamatergic signaling, cholinergic systems, neuroplasticity pathways, stress-response physiology, and sleep-dependent consolidation systems."
        safetyProfile="Chronic stress overload, sleep disruption, excessive stimulant exposure, burnout, and emotional exhaustion may negatively influence cognition continuity and memory-related systems."
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

      <section className="card-premium p-8 space-y-6">
        <div className="space-y-2 max-w-3xl">
          <p className="eyebrow-label">Systems Biology Context</p>

          <h2 className="text-3xl font-semibold tracking-tight text-ink">
            Memory depends on state-dependent cognition systems
          </h2>

          <p className="text-base leading-8 text-[#46574d]">
            Learning quality, emotional intensity, sleep recovery, stress burden, attentional filtering, environmental context, and nervous-system resilience may all influence memory formation and retrieval outcomes.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-black/5 bg-white/60 p-6 space-y-3">
            <h3 className="text-xl font-semibold text-ink">
              Commonly discussed memory systems
            </h3>

            <ul className="space-y-2 text-sm leading-7 text-[#46574d]">
              <li>• Executive-function continuity</li>
              <li>• Emotional salience systems</li>
              <li>• Sleep-dependent consolidation</li>
              <li>• Neuroplasticity pathways</li>
              <li>• Stress and cognition interaction</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-black/5 bg-white/60 p-6 space-y-3">
            <h3 className="text-xl font-semibold text-ink">
              Major evidence limitations
            </h3>

            <ul className="space-y-2 text-sm leading-7 text-[#46574d]">
              <li>• Human cognition complexity</li>
              <li>• Subjective variability</li>
              <li>• Translational uncertainty</li>
              <li>• Mechanistic oversimplification risk</li>
              <li>• Sleep and stress confounding factors</li>
            </ul>
          </div>
        </div>
      </section>

      <SafetyNotice>
        Persistent memory impairment, major cognitive decline, severe burnout symptoms, chronic sleep disruption, or significant neurological symptoms should be evaluated appropriately. Educational content is not a substitute for individualized medical care.
      </SafetyNotice>

      <ResearchLimitations
        limitations={[
          'Memory systems remain biologically and psychologically complex.',
          'Mechanistic findings may not reliably predict real-world learning outcomes.',
          'Subjective memory experiences are difficult to standardize scientifically.',
          'Online cognition discussions frequently oversimplify neuroscience.',
        ]}
      />

      <section className="space-y-6">
        <div className="space-y-2">
          <p className="eyebrow-label">Educational FAQ</p>

          <h2 className="text-3xl font-semibold tracking-tight text-ink">
            Common memory formation questions
          </h2>
        </div>

        <div className="grid gap-5">
          {faqItems.map((item) => (
            <div key={item.question} className="card-premium p-6 space-y-3">
              <h3 className="text-xl font-semibold tracking-tight text-ink">
                {item.question}
              </h3>

              <p className="text-sm leading-7 text-[#46574d]">
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div className="space-y-2">
          <p className="eyebrow-label">Related Educational Systems</p>

          <h2 className="text-3xl font-semibold tracking-tight text-ink">
            Continue exploring cognition continuity
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
                <p className="eyebrow-label">Related System</p>

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
            title: 'National Institute of Neurological Disorders and Stroke',
            href: 'https://www.ninds.nih.gov/',
            source: 'NINDS',
          },
          {
            title: 'PubMed Memory Research',
            href: 'https://pubmed.ncbi.nlm.nih.gov/',
            source: 'NIH / PubMed',
          },
        ]}
      />
    </main>
  )
}
