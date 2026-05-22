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
  columnsClassName = 'grid gap-3 sm:grid-cols-2 lg:grid-cols-1',
  footer,
}: Props) {
  const visibleFields = fields.filter(field => field?.label && field?.value)
  if (visibleFields.length === 0) return null

  return (
    <aside className={className || 'rounded-[1.65rem] border border-brand-900/10 bg-white/95 p-4 shadow-[0_18px_45px_rgba(47,64,52,0.12)] sm:p-5'}>
      <div className="flex items-start justify-between gap-3 border-b border-brand-900/10 pb-3">
        <div>
          <p className="eyebrow-label">Evidence snapshot</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-ink">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-[#46574d]">{subtitle}</p>
        </div>
        {badge ? (
          <span className="rounded-full bg-emerald-700/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-900">
            {badge}
          </span>
        ) : null}
      </div>

      <div className={`mt-4 ${columnsClassName}`}>
        {visibleFields.map((field) => (
          <article key={field.label} className={`rounded-2xl border p-4 shadow-sm ${fieldToneClasses(field.tone)}`}>
            <h3 className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-muted">{field.label}</h3>
            <p className="mt-2 text-sm leading-6 text-[#46574d]">{field.value}</p>
          </article>
        ))}
      </div>

      {footer ? <div className="mt-4 border-t border-brand-900/10 pt-3">{footer}</div> : null}
    </aside>
  )
}
