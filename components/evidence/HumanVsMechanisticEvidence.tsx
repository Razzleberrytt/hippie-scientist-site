const comparisons = [
  {
    title: 'Human Clinical Evidence',
    description:
      'Human clinical research may provide stronger real-world interpretability regarding cognition systems, emotional regulation, stress resilience, psychoactive effects, or recovery-oriented outcomes.',
  },
  {
    title: 'Mechanistic Evidence',
    description:
      'Mechanistic findings may help explain possible biological interactions involving neurotransmitters, receptors, inflammatory systems, or neuropharmacology, but mechanistic plausibility alone does not confirm meaningful human outcomes.',
  },
  {
    title: 'Animal and Cell Models',
    description:
      'Animal and cellular systems may support exploratory neuroscience research, though translational limitations and species differences may reduce real-world applicability to human cognition or psychology.',
  },
  {
    title: 'Context and Variability',
    description:
      'Sleep quality, stress burden, emotional regulation, environment, trauma exposure, nutrition, medications, and individual nervous-system variability may substantially influence real-world outcomes.',
  },
]

export default function HumanVsMechanisticEvidence() {
  return (
    <section className="card-premium p-8 space-y-8">
      <div className="space-y-3 max-w-3xl">
        <p className="eyebrow-label">Evidence Interpretation</p>

        <h2 className="text-3xl font-semibold tracking-tight text-ink">
          Human Evidence vs Mechanistic Evidence
        </h2>

        <p className="text-base leading-8 text-[#46574d]">
          Neuroscience and neuropharmacology discussions frequently combine human evidence, mechanistic models, animal studies, and theoretical biological explanations. Educational interpretation should distinguish between evidence types rather than treating all findings as equally predictive.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {comparisons.map((comparison) => (
          <div
            key={comparison.title}
            className="rounded-3xl border border-black/5 bg-white/60 p-6 space-y-3"
          >
            <h3 className="text-xl font-semibold text-ink">
              {comparison.title}
            </h3>

            <p className="text-sm leading-7 text-[#46574d]">
              {comparison.description}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-emerald-200/50 bg-emerald-50/60 p-6 space-y-3">
        <h3 className="text-xl font-semibold tracking-tight text-ink">
          Why mechanistic hype spreads online
        </h3>

        <p className="text-sm leading-7 text-[#46574d]">
          Statements like “boosts dopamine,” “increases neuroplasticity,” or “activates receptors” are often presented online as proof of dramatic cognitive or psychological outcomes. In reality, human neurobiology involves interacting systems, contextual variables, biological constraints, and substantial uncertainty regarding real-world effects.
        </p>
      </div>
    </section>
  )
}
