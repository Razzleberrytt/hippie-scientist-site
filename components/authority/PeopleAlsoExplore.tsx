import Link from 'next/link'
import { cleanEditorialText, isDuplicateTitleBody, isRenderableText, shouldRenderCard } from '@/lib/editorial-rendering'

type ExploreItem = {
  href: string
  title: string
  description?: string
  meta?: string
}

type PeopleAlsoExploreProps = {
  title?: string
  items?: ExploreItem[]
}

export default function PeopleAlsoExplore({
  title = 'People Also Explore',
  items = [],
}: PeopleAlsoExploreProps) {
  const cleanTitle = cleanEditorialText(title) || 'People Also Explore'
  const renderableItems = items
    .map((item) => ({
      ...item,
      title: cleanEditorialText(item.title),
      description: cleanEditorialText(item.description),
      meta: cleanEditorialText(item.meta),
    }))
    .filter((item) => item.href && shouldRenderCard(item.title, item.description))

  if (!renderableItems.length) {
    return null
  }

  return (
    <section className="surface-depth card-spacing">
      <div className="space-y-2">
        <p className="eyebrow-label">Semantic Discovery</p>

        <h2 className="max-w-3xl text-balance">
          {cleanTitle}
        </h2>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {renderableItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="card-premium p-5 transition hover:-translate-y-0.5"
          >
            <div className="space-y-3">
              {isRenderableText(item.meta) ? (
                <p className="eyebrow-label">
                  {item.meta}
                </p>
              ) : null}

              <h3 className="text-lg font-semibold tracking-tight text-ink">
                {item.title}
              </h3>

              {isRenderableText(item.description) && !isDuplicateTitleBody(item.title, item.description) ? (
                <p className="text-sm leading-7 text-[#46574d]">
                  {item.description}
                </p>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
