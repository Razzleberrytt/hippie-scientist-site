import Link from 'next/link'
import { cleanEditorialText, dedupeEditorialItems, isDuplicateTitleBody, isRenderableText, shouldRenderCard } from '@/lib/editorial-rendering'
import { isBuiltComparisonSlug } from '@/lib/comparison-utils'

// A href is safe to render only if it is a non-compare link, or a /compare/
// link whose target page is actually built. This prevents the component from
// ever emitting a phantom comparison URL that 404s the moment it is crawled.
function isRenderableHref(href: string): boolean {
  if (!href) return false
  if (!href.startsWith('/compare/')) return true
  return isBuiltComparisonSlug(href.replace(/^\/compare\//, '').replace(/\/$/, ''))
}

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

export default function ComparisonRecommendations({
  title = 'Comparison Discovery',
  items = [],
}: UnifiedSemanticDiscoveryPanelProps) {
  const cleanTitle = cleanEditorialText(title) || 'Comparison Discovery'
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
    .filter((item) => isRenderableHref(item.href) && shouldRenderCard(item.title, item.rationale))

  if (!renderableItems.length) {
    return null
  }

  return (
    <section className="surface-depth card-spacing">
      <div className="space-y-2">
        <p className="eyebrow-label">Semantic Comparisons</p>

        <h2 className="text-balance">
          {cleanTitle}
        </h2>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {renderableItems.map((item) => (
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

                {isRenderableText(item.rationale) && !isDuplicateTitleBody(item.title, item.rationale) ? (
                  <p className="text-sm leading-7 text-[#46574d]">
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
