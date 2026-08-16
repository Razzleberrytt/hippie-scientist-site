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
  if (tone === 'caution') return 'border-l-amber-500 bg-amber-50/35 dark:bg-amber-950/12'
  if (tone === 'best-fit') return 'border-l-emerald-600 bg-emerald-50/30 dark:bg-emerald-950/10'
  return 'border-l-transparent'
}

function SnapshotField({ field }: { field: EvidenceSnapshotField }) {
  return (
    <article className={`border-l-2 px-3 py-2.5 ${fieldToneClasses(field.tone)}`}>
      <h3 className="text-[0.66rem] font-bold uppercase tracking-[0.14em] text-[color:var(--hs-body)]">{field.label}</h3>
      <p className="mt-1 text-sm leading-5 text-[color:var(--hs-body)]">{field.value}</p>
    </article>
  )
}

export default function EvidenceSnapshotPanel({
  title = 'Evidence snapshot',
  subtitle = 'Scan key decision signals first.',
  badge,
  fields,
  className,
  columnsClassName = 'grid sm:grid-cols-2 lg:grid-cols-1',
  footer,
}: Props) {
  const visibleFields = fields.filter(field => field?.label && field?.value)
  const primaryFields = visibleFields.slice(0, 6)
  const secondaryFields = visibleFields.slice(6)
  if (visibleFields.length === 0) return null

  return (
    <aside className={className || 'rounded-[0.9rem] border border-[color:var(--hs-hairline-strong)] bg-[color:var(--hs-surface)] p-3 shadow-[var(--hs-lift)]'}>
      <div className="flex items-start justify-between gap-2 border-b border-[color:var(--hs-hairline)] pb-3">
        <div>
          <p className="eyebrow-label">Evidence snapshot</p>
          <h2 className="mt-1 text-base font-semibold tracking-tight text-[color:var(--hs-ink)]">{title}</h2>
          <p className="mt-1 text-xs leading-5 text-[color:var(--hs-body)]">{subtitle}</p>
        </div>
        {badge ? (
          <span className="rounded-full border border-[color:var(--hs-hairline)] bg-[color:var(--hs-surface-2)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--tone-ink)]">
            {badge}
          </span>
        ) : null}
      </div>

      <div className={`mt-2 divide-y divide-[color:var(--hs-hairline)] ${columnsClassName}`}>
        {primaryFields.map((field) => (
          <SnapshotField key={field.label} field={field} />
        ))}
      </div>

      {secondaryFields.length > 0 ? (
        <details className="group mt-2 border-t border-[color:var(--hs-hairline)] !bg-transparent !p-0 !shadow-none">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--tone-ink)] [&::-webkit-details-marker]:hidden">
            More context
            <svg
              className="size-3.5 text-[color:var(--hs-body)] transition-transform group-open:rotate-180"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </summary>
          <div className="divide-y divide-[color:var(--hs-hairline)] border-t border-[color:var(--hs-hairline)]">
            {secondaryFields.map((field) => (
              <SnapshotField key={field.label} field={field} />
            ))}
          </div>
        </details>
      ) : null}

      {footer ? <div className="mt-3 border-t border-[color:var(--hs-hairline)] pt-3">{footer}</div> : null}
    </aside>
  )
}
