import Link from 'next/link'
import PathwayVisualChip from './pathway-visual-chip'
import { cleanSummary, formatDisplayLabel, isClean, list, unique } from '@/lib/display-utils'

type EcosystemRailProps = {
  title: string
  description?: string
  records: any[]
  variant?: 'default' | 'evidence' | 'gentle' | 'mechanism'
}

function getSignals(record: any) {
  return unique([
    ...list(record?.primary_effects),
    ...list(record?.effects),
    ...list(record?.mechanisms),
    ...list(record?.pathways),
  ].map(formatDisplayLabel).filter(isClean)).slice(0, 4)
}

function href(record: any) {
  return `/${record?.entityType === 'compound' ? 'compounds' : 'herbs'}/${record.slug}`
}

function variantLabel(variant: string) {
  switch (variant) {
    case 'evidence':
      return 'Evidence-forward'
    case 'gentle':
      return 'Gentler alternatives'
    case 'mechanism':
      return 'Mechanism overlap'
    default:
      return 'Semantic ecosystem'
  }
}

export default function ComparisonEcosystemRail({
  title,
  description,
  records,
  variant = 'default',
}: EcosystemRailProps) {
  if (!records?.length) return null

  return (
    <section className="compact-section section-rhythm-balanced">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="eyebrow-label">Comparison Ecosystem</p>
          <span className="chip-readable">{variantLabel(variant)}</span>
        </div>

        <h2 className="compact-heading">{title}</h2>

        {description ? (
          <p className="compact-copy">{description}</p>
        ) : null}
      </div>

      <div className="semantic-rail">
        {records.map((record) => {
          const signals = getSignals(record)

          return (
            <Link
              key={record.slug}
              href={href(record)}
              className="semantic-rail-card section-rhythm-compact"
            >
              <div className="flex flex-wrap gap-2">
                <span className="identity-kicker">
                  {record?.entityType === 'compound' ? 'Compound' : 'Herb'}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="max-w-none text-base font-semibold leading-tight tracking-tight text-ink">
                  {formatDisplayLabel(record?.displayName || record?.name || record?.slug)}
                </h3>

                <p className="line-clamp-3 text-sm leading-6 text-[#46574d]">
                  {cleanSummary(record?.summary || record?.description || '', record?.entityType === 'compound' ? 'compound' : 'herb')}
                </p>
              </div>

              {signals.length > 0 ? (
                <div className="flex flex-wrap gap-2 border-t border-brand-900/10 pt-3">
                  {signals.map((signal) => (
                    <PathwayVisualChip key={signal} pathway={signal} />
                  ))}
                </div>
              ) : null}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
