import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import RelatedComparisonSystems from '@/components/comparisons/related-comparison-systems'

const comparisonClusters = [
  {
    title: 'Calm Focus vs Stimulation',
    description:
      'Educational comparison systems exploring differences between calming cognition support, overstimulation risk, attentional continuity, and stimulant-oriented neuropharmacology.',
    href: '/comparisons/calm-focus-vs-stimulation',
  },
  {
    title: 'Rhodiola vs Ashwagandha',
    description:
      'Systems-oriented comparison of stress-response physiology, fatigue systems, emotional regulation, resilience biology, and adaptogenic neuropharmacology.',
    href: '/comparisons/rhodiola-vs-ashwagandha',
  },
  {
    title: 'Stimulating vs Sedating Compounds',
    description:
      'Educational comparison of arousal systems, nervous-system activation, recovery biology, sleep continuity, and cognition-oriented tradeoffs.',
    href: '/comparisons/stimulating-vs-sedating-compounds',
  },
  {
    title: 'Sleep Support Systems',
    description:
      'Educational exploration of sleep-oriented compounds, nervous-system downregulation, recovery continuity, and restorative neurobiology.',
    href: '/comparisons/sleep-support-systems',
  },
]

const relatedSystems = [
  {
    href: '/education/cognitive-resilience-systems',
    title: 'Cognitive Resilience Systems',
    description:
      'Educational authority hub exploring sustainable cognition, stress resilience, and recovery-oriented neuroscience.',
  },
  {
    href: '/education/what-are-adaptogens',
    title: 'What Are Adaptogens?',
    description:
      'Evidence-aware educational framework covering resilience biology, stress-response systems, and adaptogenic neuropharmacology.',
  },
  {
    href: '/education/what-is-a-nootropic',
    title: 'What Is a Nootropic?',
    description:
      'Educational cognition-system overview covering neuropharmacology, attentional continuity, and focus-oriented compounds.',
  },
  {
    href: '/education/scientific-but-human-neuroscience',
    title: 'Scientific But Human Neuroscience',
    description:
      'Contextual neuroscience philosophy emphasizing biological complexity, emotional regulation, and sustainable cognition.',
  },
]

const comparisonTopics = [
  {
    title: 'Stress Regulation',
    body: 'Compare recovery-oriented systems, burnout physiology, autonomic regulation, adaptogenic compounds, emotional resilience, and nervous-system recovery strategies.',
  },
  {
    title: 'Cognition and Attention',
    body: 'Explore differences between calm-focus systems, stimulant neurobiology, executive-function support, attentional filtering, and overstimulation risk management.',
  },
  {
    title: 'Psychoactive Context',
    body: 'Educational comparison systems examining altered-state variability, emotional intensity, perception-oriented neurobiology, contextual interpretation, and harm-reduction framing.',
  },
]

export default function ComparisonsHubPage() {
  return (
    <main className="container-page py-10 space-y-16">
      <AuthorityJsonLd
        title="Neuropharmacology and Compound Comparisons"
        description="Educational comparison systems covering adaptogens, cognition-oriented compounds, stress neurobiology, recovery systems, and psychoactive education."
        url="https://thehippiescientist.net/comparisons"
        type="CollectionPage"
      />

      <section className="space-y-8 max-w-5xl">
        <div className="space-y-4">
          <p className="eyebrow-label">Comparison Authority Hub</p>

          <h1 className="text-6xl font-bold tracking-tight text-ink leading-tight">
            Educational Compound and Neuropharmacology Comparisons
          </h1>
        </div>

        <div className="space-y-5 text-lg leading-9 text-[#46574d] max-w-4xl">
          <p>
            Comparison systems help contextualize differences between compounds, neuropharmacology categories, stress-response systems, cognition-oriented approaches, recovery biology, and psychoactive education frameworks.
          </p>

          <p>
            Educational comparisons throughout The Hippie Scientist emphasize evidence interpretation, systems biology, uncertainty awareness, safety considerations, contextual variability, and tradeoff-oriented neuroscience rather than simplistic “best supplement” narratives.
          </p>
        </div>
      </section>

      <RelatedComparisonSystems
        title="Featured comparison ecosystems"
        systems={comparisonClusters}
      />

      <RelatedComparisonSystems
        title="Connected educational systems"
        systems={relatedSystems}
      />

      <section className="space-y-6">
        <div className="space-y-2 max-w-3xl">
          <p className="eyebrow-label">Systems-Oriented Comparison Philosophy</p>

          <h2 className="text-4xl font-semibold tracking-tight text-ink">
            Tradeoffs matter more than simplistic rankings
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {comparisonTopics.map((topic) => (
            <div key={topic.title} className="card-premium p-6 space-y-4">
              <h3 className="text-2xl font-semibold tracking-tight text-ink">
                {topic.title}
              </h3>

              <p className="text-sm leading-7 text-[#46574d]">
                {topic.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="card-premium p-8 space-y-6">
        <div className="space-y-3 max-w-3xl">
          <p className="eyebrow-label">Editorial Philosophy</p>

          <h2 className="text-3xl font-semibold tracking-tight text-ink">
            Scientific nuance over “best supplement” culture
          </h2>

          <p className="text-base leading-8 text-[#46574d]">
            Many comparison articles online prioritize affiliate rankings, simplistic optimization narratives, or exaggerated mechanistic claims. The Hippie Scientist comparison ecosystem instead emphasizes contextual variability, evidence interpretation, safety framing, systems-oriented neuroscience, and recovery-aware educational exploration.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="rounded-3xl border border-black/5 bg-white/60 p-6 space-y-3">
            <h3 className="text-xl font-semibold text-ink">
              Context Matters
            </h3>

            <p className="text-sm leading-7 text-[#46574d]">
              Stress physiology, sleep continuity, emotional regulation, environment, medications, and nervous-system variability may all influence outcomes.
            </p>
          </div>

          <div className="rounded-3xl border border-black/5 bg-white/60 p-6 space-y-3">
            <h3 className="text-xl font-semibold text-ink">
              Evidence Aware
            </h3>

            <p className="text-sm leading-7 text-[#46574d]">
              Mechanistic plausibility, human evidence quality, translational limitations, and uncertainty awareness are prioritized throughout comparison systems.
            </p>
          </div>

          <div className="rounded-3xl border border-black/5 bg-white/60 p-6 space-y-3">
            <h3 className="text-xl font-semibold text-ink">
              Tradeoff Oriented
            </h3>

            <p className="text-sm leading-7 text-[#46574d]">
              Compounds and neuropharmacology systems may involve tradeoffs related to stimulation, sedation, emotional intensity, sleep continuity, recovery biology, or cognition resilience.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
