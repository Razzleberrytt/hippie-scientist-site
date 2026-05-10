type SemanticEntitySignalsProps = {
  title?: string
  effects?: string[]
  mechanisms?: string[]
  pathways?: string[]
  ecosystems?: string[]
}

function SignalGroup({
  title,
  items,
}: {
  title: string
  items: string[]
}) {
  if (!items.length) {
    return null
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-[#5c6b63]">
        {title}
      </h3>

      <div className="flex flex-wrap gap-2">
        {items.slice(0, 8).map((item) => (
          <span
            key={item}
            className="chip-readable"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function SemanticEntitySignals({
  title = 'Semantic Profile Signals',
  effects = [],
  mechanisms = [],
  pathways = [],
  ecosystems = [],
}: SemanticEntitySignalsProps) {
  const hasSignals =
    effects.length ||
    mechanisms.length ||
    pathways.length ||
    ecosystems.length

  if (!hasSignals) {
    return null
  }

  return (
    <section className="surface-depth card-spacing">
      <div className="space-y-2">
        <p className="eyebrow-label">Semantic Entity Graph</p>

        <h2 className="text-balance">
          {title}
        </h2>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <SignalGroup
          title="Effects"
          items={effects}
        />

        <SignalGroup
          title="Mechanisms"
          items={mechanisms}
        />

        <SignalGroup
          title="Pathways"
          items={pathways}
        />

        <SignalGroup
          title="Ecosystems"
          items={ecosystems}
        />
      </div>
    </section>
  )
}
