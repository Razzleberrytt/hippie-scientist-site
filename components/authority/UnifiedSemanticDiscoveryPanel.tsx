import Link from 'next/link'

type DiscoveryItem = {
  href: string
  title: string
  rationale?: string
  overlap?: string[]
}

type UnifiedSemanticDiscoveryPanelProps = {
  title?: string
  items?: DiscoveryItem[]
}

export default function UnifiedSemanticDiscoveryPanel({
  title = 'Unified Semantic Discovery',
  items = [],
}: UnifiedSemanticDiscoveryPanelProps) {
  if (!items.length) {
    return null
  }

  return (
    <section className="surface-depth card-spacing">
      <div className="space-y-2">
        <p className="eyebrow-label">Semantic Graph Discovery</p>

        <h2 className="text-balance">
          {title}
        </h2>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="card-premium p-5 transition hover:-translate-y-0.5"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold tracking-tight text-ink">
                  {item.title}
                </h3>

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
