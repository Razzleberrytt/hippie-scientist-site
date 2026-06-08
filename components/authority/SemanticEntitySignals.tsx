import { cleanEditorialText, dedupeEditorialItems } from '@/lib/editorial-rendering'

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
  const renderableItems = dedupeEditorialItems(items, 8)

  if (!renderableItems.length) {
    return null
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-[#5c6b63]">
        {title}
      </h3>

      <div className="flex flex-wrap gap-2">
        {renderableItems.map((item) => (
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
  const cleanTitle = cleanEditorialText(title)
  const groups = [effects, mechanisms, pathways, ecosystems].map((items) => dedupeEditorialItems(items, 8))
  const hasSignals = groups.some((items) => items.length > 0)

  if (!hasSignals) {
    return null
  }

  return (
    <section className="surface-depth card-spacing">
      <div className="space-y-2">
        <p className="eyebrow-label">Semantic Entity Graph</p>

        <h2 className="text-balance">
          {cleanTitle || 'Semantic Profile Signals'}
        </h2>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <SignalGroup
          title="Effects"
          items={groups[0]}
        />

        <SignalGroup
          title="Mechanisms"
          items={groups[1]}
        />

        <SignalGroup
          title="Pathways"
          items={groups[2]}
        />

        <SignalGroup
          title="Ecosystems"
          items={groups[3]}
        />
      </div>
    </section>
  )
}
