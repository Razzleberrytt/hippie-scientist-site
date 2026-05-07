import Link from 'next/link'
import { isClean } from '@/lib/display-utils'

type Item = {
  slug: string
  name?: string
  relationship_reason?: string
  relationship_score?: number
}

type Props = {
  title: string
  subtitle?: string
  items: Item[]
}

export default function RecommendationRail({ title, subtitle, items }: Props) {
  const visibleItems = items.filter((item) => item.slug && isClean(item.name || item.slug))

  if (!visibleItems.length) return null

  return (
    <section className="space-y-5">
      <div>
        <div className="eyebrow-label">
          Semantic Discovery
        </div>

        <h2 className="mt-2 text-3xl font-semibold text-ink">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#46574d]">
            {subtitle}
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleItems.map((item) => {
          const strength = Math.min(100, (item.relationship_score || 1) * 15)

          return (
            <Link
              key={item.slug}
              href={`/compounds/${item.slug}`}
              className="card-premium group p-5"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold text-ink transition group-hover:text-brand-800">
                    {item.name || item.slug}
                  </h3>

                  <div className="chip-readable text-[10px] uppercase tracking-wide">
                    {strength >= 60 ? 'Strong' : strength >= 30 ? 'Moderate' : 'Exploratory'}
                  </div>
                </div>

                <p className="text-sm leading-7 text-[#46574d]">
                  {isClean(item.relationship_reason) ? item.relationship_reason : 'Related through shared mechanisms, pathways, or overlapping wellness targets.'}
                </p>

                <div className="h-2 overflow-hidden rounded-full bg-brand-900/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-600 to-emerald-500"
                    style={{ width: `${strength}%` }}
                  />
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
