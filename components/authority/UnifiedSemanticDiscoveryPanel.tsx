import Link from 'next/link'
import { cleanEditorialText, dedupeEditorialItems, isDuplicateTitleBody, isRenderableText, shouldRenderCard } from '@/lib/editorial-rendering'

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
  const cleanTitle = cleanEditorialText(title) || 'Unified Semantic Discovery'
  const renderableItems = items
    .map((item) => {
      const itemTitle = cleanEditorialText(item.title)
      const rationale = cleanEditorialText(item.rationale)

      return {
        ...item,
        title: itemTitle,
        rationale,
        overlap: dedupeEditorialItems(item.overlap || [], 4),
      }
    })
    .filter((item) => item.href && shouldRenderCard(item.title, item.rationale))

  if (!renderableItems.length) {
    return null
  }

  return (
    <section className="surface-depth card-spacing">
      <div className="space-y-2">
        <p className="eyebrow-label">Semantic Graph Discovery</p>

        <h2 className="text-balance">
          {cleanTitle}
        </h2>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {renderableItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="card-premium p-5 transition motion-safe:hover:-translate-y-0.5"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold tracking-tight text-ink">
                  {item.title}
                </h3>

                {isRenderableText(item.rationale) && !isDuplicateTitleBody(item.title, item.rationale) ? (
                  <p className="text-sm leading-7 text-muted">
                    {item.rationale}
                  </p>
                ) : null}
              </div>

              {item.overlap.length ? (
                <div className="flex flex-wrap gap-2">
                  {item.overlap.map((label) => (
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
