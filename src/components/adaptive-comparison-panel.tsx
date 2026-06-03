import Link from 'next/link'
import { buildAdaptiveComparisons } from '@/lib/adaptive-comparisons'

type EntityType = 'herb' | 'compound'

type AdaptiveComparisonPanelProps = {
  record: any
  relatedRecords?: any[]
  entityType: EntityType
}

function toneClass(tone?: string) {
  if (tone === 'gentle') {
    return 'border-emerald-700/15 bg-emerald-50/70 text-emerald-950'
  }

  if (tone === 'stimulating') {
    return 'border-amber-700/20 bg-amber-50/80 text-amber-950'
  }

  return 'border-brand-900/10 bg-paper-50/80 text-[#33443a]'
}

function toneLabel(tone?: string) {
  if (tone === 'gentle') return 'Gentler'
  if (tone === 'stimulating') return 'More activating'
  return 'Balanced'
}

export default function AdaptiveComparisonPanel({
  record,
  relatedRecords = [],
  entityType,
}: AdaptiveComparisonPanelProps) {
  const comparisons = buildAdaptiveComparisons(record, relatedRecords, entityType)

  if (comparisons.length === 0) return null

  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <p className="eyebrow-label">Adaptive Comparisons</p>
        <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Better next comparisons based on fit and direction
        </h2>
        <p className="detail-reading max-w-3xl text-[#46574d]">
          Compare nearby profiles by stimulation level, cumulative vs acute feel, and practical fit instead of treating all related profiles equally.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {comparisons.map((comparison) => (
          <Link
            key={`${comparison.label}-${comparison.href}`}
            href={comparison.href || '#'}
            className={`rounded-3xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${toneClass(comparison.tone)}`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold tracking-tight">
                  {comparison.label}
                </h3>

                <span className="rounded-full border border-current/10 px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.16em] opacity-75">
                  {toneLabel(comparison.tone)}
                </span>
              </div>

              <p className="text-sm leading-7 opacity-85">
                {comparison.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
