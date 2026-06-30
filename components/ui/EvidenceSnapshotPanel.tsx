import type { ReactNode } from 'react'

export type EvidenceSnapshotField = {
  label: string
  value: string
  tone?: 'default' | 'caution' | 'best-fit'
}

type Props = {
  title?: string
  subtitle?: string
  badge?: string
  fields: EvidenceSnapshotField[]
  className?: string
  columnsClassName?: string
  footer?: ReactNode
}

function fieldToneClasses(tone: EvidenceSnapshotField['tone']) {
  if (tone === 'caution') return 'border-amber-900/15 bg-amber-50/70'
  if (tone === 'best-fit') return 'border-emerald-900/15 bg-emerald-50/70'
  return 'border-brand-900/10 bg-white/90'
}

export default function EvidenceSnapshotPanel({
  title = 'Evidence snapshot',
  subtitle = 'Scan key decision signals first.',
  badge,
  fields,
  className,
  columnsClassName = 'grid gap-2 sm:grid-cols-2 lg:grid-cols-1',
  footer,
}: Props) {
  const visibleFields = fields.filter(field => field?.label && field?.value)
  const primaryFields = visibleFields.slice(0, 6)
  const secondaryFields = visibleFields.slice(6)
  if (visibleFields.length === 0) return null

  return (
    <aside className={className || 'rounded-[0.9rem] border border-brand-900/10 bg-white/95 p-3 shadow-sm'}>
      <div className="flex items-start justify-between gap-2 border-b border-brand-900/10 pb-2">
        <div>
          <p className="eyebrow-label">Evidence snapshot</p>
          <h2 className="mt-0.5 text-base font-semibold tracking-tight text-ink">{title}</h2>
          <p className="mt-0.5 text-xs leading-5 text-muted">{subtitle}</p>
        </div>
        {badge ? (
          <span className="rounded-full bg-emerald-700/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-900">
            {badge}
          </span>
        ) : null}
      </div>

      <div className={`mt-3 ${columnsClassName}`}>
        {primaryFields.map((field) => (
          <article key={field.label} className={`rounded-[0.7rem] border p-2.5 ${fieldToneClasses(field.tone)}`}>
            <h3 className="text-[0.66rem] font-bold uppercase tracking-[0.14em] text-muted">{field.label}</h3>
            <p className="mt-1 text-sm leading-5 text-muted">{field.value}</p>
          </article>
        ))}
      </div>

      {secondaryFields.length > 0 ? (
        <details className="mt-2 rounded-[0.7rem] border border-brand-900/10 bg-white/70 p-2.5 shadow-none">
          <summary className="text-xs font-bold uppercase tracking-[0.14em] text-brand-800">More context</summary>
          <div className="mt-2 grid gap-2">
            {secondaryFields.map((field) => (
              <article key={field.label} className={`rounded-[0.65rem] border p-2.5 ${fieldToneClasses(field.tone)}`}>
                <h3 className="text-[0.66rem] font-bold uppercase tracking-[0.14em] text-muted">{field.label}</h3>
                <p className="mt-1 text-sm leading-5 text-muted">{field.value}</p>
              </article>
            ))}
          </div>
        </details>
      ) : null}

      {footer ? <div className="mt-3 border-t border-brand-900/10 pt-2">{footer}</div> : null}
    </aside>
  )
}
