type TranslationalLimitationsCardProps = {
  title?: string
  examples?: string[]
}

const defaultExamples = [
  'Animal or cell-model findings may not reliably predict human outcomes.',
  'Mechanistic plausibility does not guarantee meaningful real-world effects.',
  'Short-term studies may not reflect long-term nervous-system adaptation.',
  'Human cognition and emotional regulation involve environmental and psychological complexity.',
]

export default function TranslationalLimitationsCard({
  title = 'Why Translational Limitations Matter',
  examples = defaultExamples,
}: TranslationalLimitationsCardProps) {
  return (
    <section className="card-premium p-8 space-y-6">
      <div className="space-y-3 max-w-3xl">
        <p className="eyebrow-label">Scientific Literacy</p>

        <h2 className="text-3xl font-semibold tracking-tight text-ink">
          {title}
        </h2>

        <p className="text-base leading-8 text-muted">
          Translational limitations refer to the challenges involved in applying mechanistic or early-stage scientific findings to complex real-world human outcomes. Neuroscience, cognition systems, emotional regulation, and neuropharmacology are influenced by interacting biological, behavioral, environmental, and psychological factors.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {examples.map((example) => (
          <div
            key={example}
            className="rounded-3xl border border-black/5 bg-white/60 p-6"
          >
            <p className="text-sm leading-7 text-muted">
              {example}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-blue-200/50 bg-blue-50/60 p-6 space-y-3">
        <h3 className="text-xl font-semibold tracking-tight text-ink">
          Why this matters for neuroscience education
        </h3>

        <p className="text-sm leading-7 text-muted">
          Online neuroscience discussions frequently present preliminary mechanistic findings as definitive proof of cognitive enhancement, emotional transformation, or psychoactive outcomes. Systems-oriented scientific interpretation instead requires caution regarding uncertainty, variability, evidence quality, and real-world complexity.
        </p>
      </div>
    </section>
  )
}
