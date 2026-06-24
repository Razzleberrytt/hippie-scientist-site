import Link from 'next/link'
import { isClean } from '@/lib/display-utils'
import {
  decisionMetadataClusterClass,
  decisionMicroLabelClass,
  decisionStatusBadgeClass,
} from '@/lib/decision-primitives'

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
        <div className={`${decisionMicroLabelClass} text-brand-700 dark:text-brand-200`}>
          Semantic Discovery
        </div>

        <h2 className="mt-2 text-3xl font-semibold text-ink">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
            {subtitle}
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleItems.map((item) => {
          const strength = Math.min(100, (item.relationship_score || 1) * 15)
          const strengthLabel = strength >= 60 ? 'Strong' : strength >= 30 ? 'Moderate' : 'Exploratory'

          return (
            <Link
              key={item.slug}
              href={`/compounds/${item.slug}`}
              className="card-premium group p-5"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="min-w-0 flex-1 break-words text-lg font-semibold text-ink transition group-hover:text-brand-800 dark:group-hover:text-brand-100">
                    {item.name || item.slug}
                  </h3>

                  <div className={decisionMetadataClusterClass}>
                    <div className={`${decisionStatusBadgeClass} shrink-0 border-brand-900/10 bg-white/80 text-muted dark:border-white/10 dark:bg-white/5`}>
                      {strengthLabel}
                    </div>
                  </div>
                </div>

                <p className="text-sm leading-7 text-muted">
                  {isClean(item.relationship_reason) ? item.relationship_reason : 'Related through shared mechanisms, pathways, or overlapping wellness targets.'}
                </p>

                <div className="h-2 overflow-hidden rounded-full bg-brand-900/10 dark:bg-white/10">
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
