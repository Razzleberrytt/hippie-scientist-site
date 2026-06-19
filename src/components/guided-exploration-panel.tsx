type GuidedExplorationPanelProps = {
  overview: string
  pathways: string
  exploration: string
  prompts?: string[]
}

export default function GuidedExplorationPanel({
  overview,
  pathways,
  exploration,
  prompts = [],
}: GuidedExplorationPanelProps) {
  return (
    <section className="compact-section section-rhythm-balanced overflow-hidden">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="eyebrow-label">Guided Exploration</p>
          <span className="chip-readable">Related topics</span>
        </div>

        <h2 className="compact-heading">
          Continue exploring connected research ecosystems.
        </h2>

        <p className="compact-copy">
          Follow related pathways, mechanism overlap, evidence maturity, and topic relationships for deeper reading.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="compact-card section-rhythm-compact">
          <p className="eyebrow-label">Ecosystem overview</p>

          <p className="text-sm leading-7 text-[#46574d]">
            {overview}
          </p>
        </article>

        <article className="compact-card section-rhythm-compact">
          <p className="eyebrow-label">Pathway continuity</p>

          <p className="text-sm leading-7 text-[#46574d]">
            {pathways}
          </p>
        </article>

        <article className="compact-card section-rhythm-compact">
          <p className="eyebrow-label">Exploration direction</p>

          <p className="text-sm leading-7 text-[#46574d]">
            {exploration}
          </p>
        </article>
      </div>

      {prompts.length > 0 ? (
        <div className="flex flex-wrap gap-2 border-t border-brand-900/10 pt-4">
          {prompts.map((prompt) => (
            <span
              key={prompt}
              className="chip-readable bg-white/[0.92]"
            >
              {prompt}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  )
}
