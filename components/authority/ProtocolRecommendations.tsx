import Link from 'next/link'
import { cleanEditorialText, dedupeEditorialItems, isDuplicateTitleBody, isRenderableText, shouldRenderCard } from '@/lib/editorial-rendering'

type ProtocolRecommendation = {
  href: string
  title: string
  summary?: string
  tags?: string[]
}

type ProtocolRecommendationsProps = {
  title?: string
  items?: ProtocolRecommendation[]
}

export default function ProtocolRecommendations({
  title = 'Related Protocol Systems',
  items = [],
}: ProtocolRecommendationsProps) {
  const cleanTitle = cleanEditorialText(title) || 'Related Protocol Systems'
  const renderableItems = items
    .map((item) => ({
      ...item,
      title: cleanEditorialText(item.title),
      summary: cleanEditorialText(item.summary),
      tags: dedupeEditorialItems(item.tags || [], 4),
    }))
    .filter((item) => item.href && shouldRenderCard(item.title, item.summary))

  if (!renderableItems.length) {
    return null
  }

  return (
    <section className="surface-depth card-spacing">
      <div className="space-y-2">
        <p className="eyebrow-label">Protocol Discovery</p>

        <h2 className="text-balance">
          {cleanTitle}
        </h2>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
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

                {isRenderableText(item.summary) && !isDuplicateTitleBody(item.title, item.summary) ? (
                  <p className="text-sm leading-7 text-[#46574d]">
                    {item.summary}
                  </p>
                ) : null}
              </div>

              {item.tags.length ? (
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="chip-readable"
                    >
                      {tag}
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
