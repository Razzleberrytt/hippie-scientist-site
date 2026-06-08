type EvidenceInterpretationGuideProps = {
  title?: string
}

const evidenceLevels = [
  {
    title: 'Human Clinical Evidence',
    description:
      'Human clinical research generally provides stronger real-world interpretability than isolated mechanistic or animal-only findings, though study quality and methodology still matter substantially.',
  },
  {
    title: 'Mechanistic Evidence',
    description:
      'Mechanistic models may help explain possible biological interactions, but mechanistic plausibility alone does not guarantee meaningful human outcomes.',
  },
  {
    title: 'Translational Limitations',
    description:
      'Findings from cell models, animal systems, or preliminary exploratory studies may not translate reliably into human cognition, emotional regulation, or health outcomes.',
  },
  {
    title: 'Individual Variability',
    description:
      'Stress physiology, sleep quality, genetics, environment, emotional state, medication interactions, and nervous-system variability may substantially influence real-world responses.',
  },
]

export default function EvidenceInterpretationGuide({
  title = 'How to Interpret Neuroscience Evidence',
}: EvidenceInterpretationGuideProps) {
  return (
    <section className="card-premium p-8 space-y-8">
      <div className="space-y-3 max-w-3xl">
        <p className="eyebrow-label">Scientific Literacy</p>

        <h2 className="text-3xl font-semibold tracking-tight text-ink">
          {title}
        </h2>

        <p className="text-base leading-8 text-[#46574d]">
          Neuroscience and neuropharmacology research are biologically complex. Educational interpretation should consider evidence quality, mechanistic limitations, contextual variability, study design, and translational uncertainty rather than relying on simplified optimization narratives.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {evidenceLevels.map((level) => (
          <div
            key={level.title}
            className="rounded-3xl border border-black/5 bg-white/60 p-6 space-y-3"
          >
            <h3 className="text-xl font-semibold text-ink">
              {level.title}
            </h3>

            <p className="text-sm leading-7 text-[#46574d]">
              {level.description}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-amber-200/50 bg-amber-50/70 p-6 space-y-3">
        <h3 className="text-xl font-semibold tracking-tight text-ink">
          Why oversimplified neuroscience spreads easily online
        </h3>

        <p className="text-sm leading-7 text-[#46574d]">
          Simplistic explanations involving single neurotransmitters, “brain hacks,” or deterministic optimization frameworks are often easier to market and easier to understand than systems-oriented neuroscience. However, human cognition, emotional regulation, recovery biology, and psychoactive experiences generally involve interacting biological, psychological, environmental, and contextual systems.
        </p>
      </div>
    </section>
  )
}
