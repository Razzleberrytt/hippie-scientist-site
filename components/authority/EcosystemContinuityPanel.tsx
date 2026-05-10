import Link from 'next/link'

type ContinuityItem = {
  href: string
  title: string
  overlap?: string[]
  rationale?: string
}

type EcosystemContinuityPanelProps = {
  title?: string
  description?: string
  items?: ContinuityItem[]
}

export default function EcosystemContinuityPanel({
  title = 'Ecosystem Continuity',
  description = 'Continue exploring semantically related profiles, pathways, stacks, and comparison systems.',
  items = [],
}: EcosystemContinuityPanelProps) {
  if (!items.length) {
    return null
  }

  return (
    <section className="surface-depth card-spacing">
      <div className="space-y-3">
        <p className="eyebrow-label">Semantic Continuity</p>

        <h2 className="max-w-3xl text-balance">
          {title}
        </h2>

        <p className="max-w-3xl text-sm leading-7 text-[#46574d]">
          {description}
        </p>
      </div>

      <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="card-premium p-5 transition hover:-translate-y-0.5"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-lg font-semibold tracking-tight text-ink">
                  {item.title}
                </p>

                {item.rationale ? (
                  <p className="text-sm leading-7 text-[#46574d]">
                    {item.rationale}
                  </p>
                ) : null}
              </div>

              {item.overlap?.length ? (
                <div className="flex flex-wrap gap-2">
                  {item.overlap.slice(0, 4).map((label) => (
                    <span
                      key={label}
                      className="chip-readable"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
